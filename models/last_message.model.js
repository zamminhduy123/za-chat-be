const { db, pgp } = require("../db/db.config");

const schema = "public";
const tbName = "last_message";
const tbFileds = {
  message_id: "message_id",
  conversation_id: "conversation_id", // Primary Key
};
const table = new pgp.helpers.TableName({
  table: tbName,
  schema: schema,
});

const get = async (conversation_id) => {
  const queryStr = pgp.as.format(
    `SELECT * FROM $1 WHERE "${tbFileds.conversation_id}"='${conversation_id}'`,
    table
  );
  try {
    // one: trả về 1 kết quả
    const res = await db.oneOrNone(queryStr);
    return res;
  } catch (e) {
    console.log("Error lastMessage.model/get", e);
  }
};
const insert = async (entity) => {
  const qStr = pgp.helpers.insert(entity, null, table) + "RETURNING *";
  try {
    const res = await db.one(qStr);
    return res;
  } catch (error) {
    console.log("error account.model/acc_create:", error);
  }
};

const update = async (conversation_id, message_id) => {
  let last_message = await get(conversation_id),
    qStr;
  if (last_message) {
    last_message.message_id = message_id;
    const condition = pgp.as.format(
      ` WHERE ${tbFileds.conversation_id} = ${conversation_id}`
    );
    qStr =
      pgp.helpers.update(last_message, ["message_id"], table) +
      condition +
      "RETURNING *";
    try {
      const res = await db.one(qStr);
      return res;
    } catch (error) {
      console.log("error account.model/acc_create:", error);
    }
  } else {
    return insert({ conversation_id, message_id });
  }
};
module.exports = { get: get, insert: insert, update };
