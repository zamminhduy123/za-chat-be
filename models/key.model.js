const { db, pgp } = require("../db/db.config");

const schema = "public";
const tbName = "publicKey";
const tbFileds = {
  username: "username",
  publicKey: "publicKey",
  deviceKey: "deviceKey",
  create_at: "create_at",
};
const table = new pgp.helpers.TableName({
  table: tbName,
  schema: schema,
});

module.exports = {
  get: async (deviceKey) => {
    const getByDeviceKey = pgp.as.format(
      `SELECT * FROM "${tbName}" where "${tbFileds.deviceKey}"='${deviceKey}'`
    );
    try {
      // one: trả về 1 kết quả
      const res = await db.oneOrNone(getByDeviceKey);
      return res;
    } catch (e) {
      console.log("Error key.model/get", e);
    }
  },
  getByUsername: async (username) => {
    const getByUsername = pgp.as.format(
      `SELECT * FROM "${tbName}" where "${tbFileds.username}"='${username}' ORDER BY ${tbFileds.create_at} DESC LIMIT 1`
    );
    try {
      // one: trả về 1 kết quả
      const res = await db.oneOrNone(getByUsername);
      return res;
    } catch (e) {
      console.log("Error key.model/get", e);
    }
  },
  insert: async (username, publicKey, deviceKey) => {
    const entity = {
      username,
      publicKey,
      deviceKey,
    };
    const qStr = pgp.helpers.insert(entity, null, table) + "RETURNING *";
    try {
      const res = await db.one(qStr);
      return res;
    } catch (error) {
      console.log("error key.model/insert:", error);
    }
  },
  update: async (key) => {
    const entity = {
      key,
      create_at: Date.now(),
    };
    const qStr =
      pgp.helpers.update(entity, null, table) +
      ` WHERE "${tbFileds.username}"='${username}' ` +
      "RETURNING *";
    try {
      const res = await db.one(qStr);
      return res;
    } catch (error) {
      console.log("error key.model/update:", error);
    }
  },
};
