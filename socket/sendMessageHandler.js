const messageModel = require("../models/message.model");
const userModel = require("../models/user.model");
const memberModel = require("../models/member.model");
const conversationModel = require("../models/conversation.model");
const {
  fillLastMessage,
  fillDataConversation,
} = require("../helper/conversationDataFill");
const last_messageModel = require("../models/last_message.model");

const { event } = require("../constant");

const imageFileHandler = require("../helper/imageFileHandler");

module.exports = {
  invoke: async (userSocketMap, data) => {
    console.log("Message receive from", data);
    const userSocket = userSocketMap.get(data.sender);

    const users = data.to;
    const messageError = {
      ...data,
      status: 4,
    };

    let updatedConversation;
    if (data.conversation_id) {
      updatedConversation = await conversationModel.get(data.conversation_id);
    } else {
      updatedConversation = await conversationModel.getDirectConversation(
        users[0],
        data.sender
      );
      console.log("EXISTED", updatedConversation);
      if (!updatedConversation) {
        try {
          //create conversation
          updatedConversation =
            await conversationModel.createConversationWithUsers([
              ...users,
              data.sender,
            ]);
        } catch (err) {
          console.log(err);
          // emit error to user
          userSocket.emit(event.MESSAGE_SENT, messageError);
          return;
        }
      }
    }
    console.log("updated conversation", updatedConversation);
    const newMessage = {
      sender: data.sender,
      type: data.type,
      content: data.content,
      conversation_id: updatedConversation.id,
    };

    let messageInserted;
    try {
      //insert into DB
      messageInserted = await messageModel.insert(newMessage);
      console.log(
        await last_messageModel.update(
          updatedConversation.id,
          messageInserted.id
        )
      );
    } catch (err) {
      // emit error to user
      userSocket.emit(event.MESSAGE_SENT, messageError);
      return;
    }

    await fillDataConversation(updatedConversation, data.sender);
    // console.log(updatedConversation);
    //server receive user message
    console.log("Message inserted", messageInserted, data.clientId);
    userSocket.emit(event.MESSAGE_SENT, {
      ...messageInserted,
      clientId: data.clientId,
    });

    //send message to people in conversation ID
    const members = await memberModel.getMemberByConversationId(
      updatedConversation.id
    );
    for (const member of members) {
      const socket = await userSocketMap.get(member.username);
      if (socket) {
        if (member.username != data.sender) {
          socket.emit(event.RECEIVE_MESSAGE, messageInserted);
        }
        await fillDataConversation(updatedConversation, member.username);
        socket.emit(event.CONVERSATION_CHANGE, updatedConversation);
      }
    }
  },
};
