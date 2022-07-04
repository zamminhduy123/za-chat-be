const { db, pgp } = require("../db/db.config");

const schema = "public";
const tbName = "friend";
const tbFileds = {
  id: "id", // Primary Key
  user_1: "user_1",
  user_2: "user_2",
  status: "status",
  created_at: "created_at",
};
const table = new pgp.helpers.TableName({
  table: tbName,
  schema: schema,
});

module.exports = {
  get: async (username) => {
    const getByUsername = pgp.as.format(
      `SELECT * FROM "${tbName}" where 
      ("${tbFileds.user_1}"='${username}' OR  "${tbFileds.user_2}"='${username}')`
    );
    try {
      // one: trả về 1 kết quả
      const res = await db.manyOrNone(getByUsername);
      return res;
    } catch (e) {
      console.log("Error account.model/get", e);
    }
  },
  insert: async (user1, user2) => {
    const entity = {
      user_1: user1,
      user_2: user2,
      status: 0,
    };
    const qStr = pgp.helpers.insert(entity, null, table) + "RETURNING *";
    try {
      const res = await db.one(qStr);
      return res;
    } catch (error) {
      console.log("error friend.model/insert:", error);
    }
  },
  request: async (user1, user2) => {
    const checkFriendQuery = pgp.as.format(
      `SELECT * FROM "${tbName}" where 
      ("${tbFileds.user_1}"='${user1}' AND "${tbFileds.user_2}"='${user2}')
      OR
      ("${tbFileds.user_1}"='${user2}' AND "${tbFileds.user_2}"='${user1}')`
    );
    try {
      let res = await db.oneOrNone(checkFriendQuery);
      if (res) {
        return res; //already friend
      } else {
        //insert new request
        return await this.insert(user1, user2);
      }
    } catch (error) {
      console.log("error account.model/acc_create:", error);
    }
  },
  accept: async (id) => {
    const updateQuery = pgp.as.format(
      `update "friend" set "status" = 1 where "${tbFileds.id}" = '${id}' returning *`
    );
    try {
      let res = await db.one(updateQuery);
      return res;
    } catch (error) {
      console.log("error account.model/acc_create:", error);
    }
  },
};
