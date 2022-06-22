const memberModel = require("../models/member.model");
const messageModel = require("../models/message.model");
const userModel = require("../models/user.model");
const lastMessageModel = require("../models/last_message.model");

const fillDataConversation = async (conversation, username) => {
  const members = await memberModel.getMemberByConversationId(conversation.id);
  conversation.users = [];
  for (const member of members) {
    const userMember = await userModel.get(member.username);
    userMember.password = "";
    if (members.length == 2) {
      if (username != userMember.username) {
        conversation.name = userMember.name;
        conversation.avatar = userMember.avatar;
      }
    }
    conversation.users.push(userMember);
  }
  await fillLastMessage(conversation);
};

const fillLastMessage = async (conversation) => {
  const last_message = await lastMessageModel.get(conversation.id);
  if (last_message) {
    const message = await messageModel.get(last_message.message_id);
    if (message)
      conversation.lastMessage = {
        ...message,
      };
  }
  return conversation;
};
module.exports = { fillDataConversation, fillLastMessage };
