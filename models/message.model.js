const { db, pgp } = require("../db/db.config");

const schema = "public";
const tbName = "message";
const tbFileds = {
  id: "id",
  conversation_id: "conversation_id", // Primary Key
  sender: "sender",
  type: "type",
  content: "content",
  created_at: "created_at",
};
const table = new pgp.helpers.TableName({
  table: tbName,
  schema: schema,
});

module.exports = {
  all: async () => {
    const queryStr = pgp.as.format(`SELECT * FROM $1`, table);
    try {
      const res = await db.any(queryStr);
      return res;
    } catch (e) {
      console.log("Error member.mode/all", e);
    }
  },
  allNewMessageOfUsername: async (username, lastMessageId) => {
    const queryStr = pgp.as.format(
      `select *
      from "${tbName}"
      where "${tbFileds.id}" > ${lastMessageId} and "${tbFileds.conversation_id}" in 
      (select conversation_id from "member" where "member".username = '${username}')`
    );
    try {
      const res = await db.any(queryStr);
      return res;
    } catch (e) {
      console.log("Error member.mode/all", e);
    }
  },
  get: async (id) => {
    const queryStr = pgp.as.format(
      `SELECT * FROM $1 WHERE "${tbFileds.id}"='${id}'`,
      table
    );
    try {
      // one: trả về 1 kết quả
      const res = await db.one(queryStr);
      return res;
    } catch (e) {
      console.log("Error message.model/get", e);
    }
  },
  getByConversationId: async (conversationId, lastMessageId) => {
    const extraCondition = lastMessageId
      ? ` AND "${tbFileds.id}">${lastMessageId}`
      : "";
    const queryStr = pgp.as.format(
      `SELECT * FROM $1 WHERE "${tbFileds.conversation_id}"='${conversationId}'${extraCondition}
        ORDER BY "create_at" ASC`,
      table
    );
    try {
      // one: trả về 1 kết quả
      const res = await db.manyOrNone(queryStr);
      return res;
    } catch (e) {
      console.log("Error message.model/getByConversationId", e);
    }
  },
  insert: async (entity) => {
    const qStr = pgp.helpers.insert(entity, null, table) + "RETURNING *";
    try {
      const res = await db.one(qStr);
      return res;
    } catch (error) {
      console.log("error message.model/insert:", error);
    }
  },
  updateStatus: async (entity) => {
    const condition = pgp.as.format(` WHERE ${tbFileds.id} = ${entity.id}`);
    const qStr =
      pgp.helpers.update(entity, ["status"], table) + condition + "RETURNING *";
    try {
      const res = await db.one(qStr);
      return res;
    } catch (error) {
      console.log("error message.model/update:", error);
    }
  },
};
