const { db, pgp } = require("../db/db.config");

const schema = "public";
const tbName = "conversation";
const tbFileds = {
  id: "id",
  name: "name", // Primary Key
  type: "type",
  created_at: "created_at",
  lastMessage: "lastMessage",
};
const table = new pgp.helpers.TableName({
  table: tbName,
  schema: schema,
});
// generic way to skip NULL/undefined values for strings/boolean
function isSkipCol(col) {
  return {
    name: col,
    skip: function () {
      var val = this[col];
      return val === null || val === undefined;
    },
  };
}
// Creating a reusable ColumnSet for all updates:
var csGeneric = new pgp.helpers.ColumnSet(
  [
    isSkipCol(tbFileds.id),
    isSkipCol(tbFileds.name),
    isSkipCol(tbFileds.type),
    isSkipCol(tbFileds.lastMessage),
    isSkipCol(tbFileds.created_at),
  ],
  { table: tbName }
);

module.exports = {
  all: async () => {
    const queryStr = pgp.as.format(`SELECT * FROM $1`, table);
    try {
      const res = await db.any(queryStr);
      return res;
    } catch (e) {
      console.log("Error account.mode/all", e);
    }
  },
  get: async (id) => {
    const queryStr = pgp.as.format(
      `SELECT * FROM ${tbName}
      where "${tbName}".${tbFileds.id} = '${id}'
      `
    );
    try {
      // one: trả về 1 kết quả
      const res = await db.oneOrNone(queryStr);
      return res;
    } catch (e) {
      console.log("Error account.model/get", e);
    }
  },
  getByUsername: async (username) => {
    const queryStr = pgp.as.format(
      `SELECT * FROM ${tbName}
      where "${tbName}".${tbFileds.id} in (select conversation_id from "member" where "member".username = '${username}')
      `
    );
    try {
      // one: trả về 1 kết quả
      const res = await db.manyOrNone(queryStr);
      return res;
    } catch (e) {
      console.log("Error account.model/getByUsername", e);
    }
  },
  createConversationWithUsers: async (users, name) => {
    try {
      let conversation = "";
      await db.tx("add-new-conversation", async (t) => {
        conversation = await t.one(
          `INSERT INTO "${tbName}"("${tbFileds.name}") values ('${name}') RETURNING *`
        );
        for (const user of users) {
          await t.one(
            `INSERT INTO "member"("conversation_id","username") values ('${conversation.id}','${user}') RETURNING *`
          );
        }
      });
      return conversation;
    } catch (error) {
      throw error;
    }
  },
  createGroupConversation: async (group) => {
    try {
      let conversation = "";
      await db.tx("add-new-conversation", async (t) => {
        conversation = await t.one(
          `INSERT INTO "${tbName}"("${tbFileds.name}") values ('${group.name}') RETURNING *`
        );
        for (const user of group.users) {
          await t.one(
            `INSERT INTO "member"("conversation_id","username") values ('${conversation.id}','${user}') RETURNING *`
          );
        }
      });
      return conversation;
    } catch (error) {
      throw error;
    }
  },
  getDirectConversation: async (user_1, user_2) => {
    const queryStr = pgp.as.format(
      `SELECT * FROM "${tbName}" 
      where ${tbFileds.id} in (
      select "m1"."conversation_id" from "member" m1, "member" m2 
      where "m1".username = '${user_1}' and "m2".username='${user_2}' 
      and m1.conversation_id = m2.conversation_id)`
    );
    try {
      // one: trả về 1 kết quả
      const res = await db.oneOrNone(queryStr);
      return res;
    } catch (e) {
      console.log("Error account.model/getByUsername", e);
    }
  },
};
