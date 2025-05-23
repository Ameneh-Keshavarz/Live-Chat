import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/db.js";
import { ApiError } from "../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { JWT_SECRET } from "../config.js";

export const registerUser = async ({ full_name, username, password }) => {
  if (!full_name || !username || !password) {
    throw new ApiError("Full name, username, and password are required", StatusCodes.BAD_REQUEST);
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    await db("users").insert({ full_name, username, password: hashed });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      throw new ApiError("Username already exists", StatusCodes.BAD_REQUEST);
    }
    throw err;
  }
};

export const loginUser = async ({ username, password }) => {
  const user = await db("users").where({ username }).first();
  if (!user) {
    throw new ApiError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new ApiError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET");
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });

  return {
    token,
    user: {
      userId: user.id,
      username: user.username,
      full_name: user.full_name,
    },
  };
};
