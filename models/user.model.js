const { db, pgp } = require("../db/db.config");

const schema = "public";
const tbName = "user";
const tbFileds = {
  username: "username", // Primary Key
  password: "password",
  name: "name",
  gender: "gender",
  avatar: "avatar",
  phone: "phone",
  created_at: "created_at",
  lastOnline: "lastOnline",
  hashKey: "hashKey",
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
      console.log("Error account.mode/all", e);
    }
  },
  get: async (username) => {
    const queryStr = pgp.as.format(
      `SELECT * FROM $1 WHERE "${tbFileds.username}"='${username}'`,
      table
    );
    try {
      // one: trả về 1 kết quả
      const res = await db.oneOrNone(queryStr);
      return res;
    } catch (e) {
      console.log("Error account.model/get", e);
    }
  },
  getByPhone: async (phone) => {
    const queryStr = pgp.as.format(
      `SELECT * FROM $1 WHERE "${tbFileds.phone}"='${phone}'`,
      table
    );
    try {
      // one: trả về 1 kết quả
      const res = await db.oneOrNone(queryStr);
      return res;
    } catch (e) {
      console.log("Error account.model/getByPhone", e);
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
  updateLastOnline: async (lastOnlineTime) => {
    const qStr =
      pgp.helpers.update(lastOnlineTime, [tbFileds.lastOnline], table) +
      "RETURNING *";
    try {
      const res = await db.one(qStr);
      return res;
    } catch (error) {
      console.log("error account.model/acc_update_lastOnline:", error);
    }
  },
};
