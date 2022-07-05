const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { Server } = require("socket.io");
const fs = require("fs");
const mkdirp = require("mkdirp");

const bodyParser = require("body-parser");

const userSocketMap = new Map([]);
const socketUserMap = new Map([]);
const typingListen = new Map([]);

//handle http
let http = require("http");
require("dotenv").config();

const app = express();
app.use(cookieParser());

app.use(bodyParser.json({ limit: "10000kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10000kb", extended: true }));
app.use(bodyParser.raw({ type: "application/octet-stream", limit: "100mb" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  //To allow requests from client
  origin: ["*", "http://localhost:3000"],
  credentials: true,
  secure: true,
};

app.use(cors(corsOptions));
//passport
require("./middlewares/passport")(app);

app.get("/", (req, res) => {
  res.send("Hello!!");
});

const checkAuth = require("./middlewares/checkAuth");
app.use("/authentication", require("./api/auth.api"));
app.use("/file", require("./api/file.api"));
app.use("/user", checkAuth, require("./api/user.api"));
app.use("/conversation", checkAuth, require("./api/conversation.api"));
app.use("/message", checkAuth, require("./api/message.api"));

const port = process.env.PORT || 3001;
let server = http.createServer(app);
// socket
const io = new Server(server, {
  cors: { ...corsOptions, methods: ["GET", "POST"] },
  pingInterval: 2 * 60 * 1000, // 2 mins
});

const userModel = require("./models/user.model");
const sendMessageHandler = require("./socket/sendMessageHandler");
const conversationModel = require("./models/conversation.model");
const memberModel = require("./models/member.model");
const messageModel = require("./models/message.model");

const disconnectClient = (socket) => {
  console.log("Client disconnect", socket.id);
  const username = socketUserMap.get(socket);
  userSocketMap.delete(username);
  socketUserMap.delete(socket);
};

//authorize
io.use(async (socket, next) => {
  if (
    !socket.handshake ||
    !socket.handshake.headers ||
    !socket.handshake.headers.cookie
  ) {
    socket.disconnect();
  } else {
    const cookie = socket.handshake.headers.cookie.slice(4);
    const tokenData = require("jsonwebtoken").decode(cookie, true);
    // console.log(tokenData);
    const user = await userModel.get(tokenData.username);
    if (user) {
      const existedSocket = userSocketMap.get(user.username);
      if (existedSocket) {
        existedSocket.emit("ERROR", 409);
        disconnectClient(existedSocket);
      }
      userSocketMap.set(tokenData.username, socket);
      socketUserMap.set(socket, tokenData.username);
      next();
    }
  }
});

io.on("connection", async (socket) => {
  console.log("User connected", socket.id);

  //PING
  socket.on("PING", (callback) => {
    callback({
      status: "PONG",
    });
  });

  socket.on("SEND_MESSAGE", async (newMessage) => {
    await sendMessageHandler.invoke(userSocketMap, newMessage);
  });
  socket.on("NEW_MESSAGE_RECEIVED", async (sentMessage) => {
    sentMessage.status = 2;
    try {
      const message = await messageModel.updateStatus(sentMessage);
      const socket = await userSocketMap.get(message.sender);
      if (socket) socket.emit("MESSAGE_SENT_RECEIVED", message);
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("TYPING_REGISTER", async (data) => {
    typingListen.set(data.sender, data.conversation_id);
  });
  socket.on("TYPING_SEND", async (data) => {
    const conversation_id = typingListen.get(data);
    if (conversation_id) {
      const members = await memberModel.getMemberByConversationId(
        conversation_id
      );
      for (const member of members) {
        const socket = await userSocketMap.get(member.username);
        if (socket) {
          if (member.username != data) {
            const sender = await userModel.get(data);
            socket.emit("TYPING_RECEIVE", {
              conversation_id,
              senderName: sender.name,
            });
          }
        }
      }
    }
  });
  socket.on("disconnect", () => {
    disconnectClient(socket);
  });
});

server.listen(port, function () {
  console.log("Deploy on " + process.env.NODE_ENV || "Development");
  console.log("HTTPS Express server is up on port " + port);
});
