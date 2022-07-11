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
  // //console.log(conversations);
  conversations.sort(sortAlgor);
  //send back result
  if (conversations) {
    res.status(statusCode.SUCCESS).json(conversations);
  } else {
    res.status(statusCode.SERVER_ERROR).send("Server Error");
  }
});

router.post("/newGroup", async (req, res) => {
  const newGroupConversation = req.body;
  if (!newGroupConversation) {
    return res.status(statusCode.BAD_REQUEST).send("Need users");
  } else {
    if (newGroupConversation.users.length <= 1) {
      return res
        .status(statusCode.BAD_REQUEST)
        .send("Group members need to be bigger than 2");
    }
    try {
      //create conversation
      const newConversation =
        await conversationModel.createConversationWithUsers(
          [
            ...newGroupConversation.users.map((user) => user.username),
            res.locals.username,
          ],
          newGroupConversation.name
        );
      await fillDataConversation(newConversation, res.locals.username);
      console.log("GROUP CREATED ============================ ");
      console.log(newConversation);
      res.status(statusCode.CREATED).json(newConversation);
    } catch (err) {
      console.log(err);
      // emit error to user
      res.status(statusCode.SERVER_ERROR).send(err);
    }
  }
});

module.exports = router;
