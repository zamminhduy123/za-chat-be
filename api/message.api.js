const express = require("express");
const router = express.Router();
const messageModel = require("../models/message.model");
const { statusCode } = require("../constant");
const { allNewMessageOfUsername } = require("../models/message.model");

router.get("/", async (req, res) => {
  const { conversation_id, lastMessageId } = req.query;
  if (conversation_id) {
    const messages = await messageModel.getByConversationId(
      conversation_id,
      lastMessageId
    );
    res.status(statusCode.SUCCESS).json(messages);
  } else {
    const messages = await allNewMessageOfUsername(
      res.locals.username,
      lastMessageId
    );
    res.status(statusCode.SUCCESS).json(messages);
    // res.status(statusCode.BAD_REQUEST).send("Need Conversation ID");
  }
});

module.exports = router;
