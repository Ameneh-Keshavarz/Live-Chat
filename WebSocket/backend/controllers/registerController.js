import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/db.js";
import { asyncWrapper } from "../middlewares/asyncWrapper.js";
import dotenv from "dotenv";
import { ApiError } from "../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const register = asyncWrapper(async (req, res) => {
  const { full_name, username, password } = req.body;

  if (!full_name || !username || !password) {
    throw new ApiError("Full name, username, and password are required", StatusCodes.BAD_REQUEST);
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    await db("users").insert({ full_name, username, password: hashed });
    return res.status(StatusCodes.CREATED).json({ message: "User registered" });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      throw new ApiError("Username already exists", StatusCodes.BAD_REQUEST);
    }
    throw err;
  }
});