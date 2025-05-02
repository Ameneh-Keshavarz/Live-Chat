import { db } from "../db/db.js";

const createTables = async () => {
  const hasUsers = await db.schema.hasTable("users");
  if (!hasUsers) {
    await db.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("username").unique().notNullable();
      table.string("password").notNullable();
    });
  }

  const hasMessages = await db.schema.hasTable("messages");
  if (!hasMessages) {
    await db.schema.createTable("messages", (table) => {
      table.uuid("id").primary();
      table.string("username").notNullable();
      table.text("text").notNullable();
      table.timestamp("timestamp").defaultTo(db.fn.now());
      table.integer("likes").defaultTo(0);
      table.integer("dislikes").defaultTo(0);
    });
  }

  console.log("Tables created");
  process.exit();
};

createTables().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
