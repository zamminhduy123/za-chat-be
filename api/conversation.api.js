const express = require("express");
const router = express.Router();

const conversationModel = require("../models/conversation.model");
const { statusCode } = require("../constant");

const { fillDataConversation } = require("../helper/conversationDataFill");

const sortAlgor = (conver_1, conver_2) => {
  if (!conver_1.lastMessage) {
    return 1;
  }
  if (!conver_2.lastMessage) {
    return -1;
  }

  return conver_2.lastMessage.id - conver_1.lastMessage.id;
};

router.get("/", async (req, res) => {
  const username = req.query.username;
  let conversations = [];
  if (!username) {
    //get all
    conversations = await conversationModel.all();
  } else {
    //get by s
    conversations = await conversationModel.getByUsername(username);
  }
  //adding data
  for (const conversation of conversations) {
    await fillDataConversation(conversation, username);
  }
  //console.log(conversations);
  conversations.sort(sortAlgor);
  //send back result
  if (conversations) {
    res.status(statusCode.SUCCESS).json(conversations);
  } else {
    res.status(statusCode.SERVER_ERROR).send("Server Error");
  }
});

router.post("/newConversation", (req, res) => {});

module.exports = router;
