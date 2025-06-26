import knex from "knex";
import sqlite3 from "sqlite3";

export const db = knex({
  client: "sqlite3",
  connection: {
    filename: "./chat.db",
  },
  useNullAsDefault: true,
  pool: {
    afterCreate: (conn, done) => {
      conn.run("PRAGMA foreign_keys = ON", done);
    },
  },
});
