const { db, pgp } = require("../db/db.config");

const schema = "public";
const tbName = "member";
const tbFileds = {
  id: "id",
  conversation_id: "conversation_id", // Primary Key
  username: "username",
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
  getMemberByConversationId: async (id) => {
    const queryStr = pgp.as.format(
      `SELECT * FROM $1 WHERE "${tbFileds.conversation_id}"='${id}'`,
      table
    );
    try {
      // one: trả về 1 kết quả
      const res = await db.any(queryStr);
      return res;
    } catch (e) {
      console.log("Error member.model/getMemberByConversationId", e);
    }
  },
  insert: async (entity) => {
    const qStr = pgp.helpers.insert(entity, null, table) + "RETURNING *";
    try {
      const res = await db.one(qStr);
      return res;
    } catch (error) {
      console.log("error account.model/acc_create:", error);
    }
  },
};
