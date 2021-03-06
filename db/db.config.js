require("dotenv").config();

const pgp = require("pg-promise")({
  capSQL: true,
});

const isProduction = process.env.NODE_ENV === "production";

const connection = {
  user: "postgres",
  host: "localhost",
  database: "za-chat",
  password: "password",
  port: 5432,
  max: 30,
};

const productionConnection = {
  connectionString: `${process.env.DATABASE_URL}?sslmode=require`,
  max: 30,
};

exports.db = pgp(productionConnection);
// exports.db = pgp(isProduction ? productionConnection : connection);
exports.pgp = pgp;
