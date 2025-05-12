import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/db.js";
import { asyncWrapper } from "../middlewares/asyncWrapper.js";
import dotenv from "dotenv";
import { ApiError } from "../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const login = asyncWrapper(async (req, res) => {
  const { username, password } = req.body;
  const user = await db("users").where({ username }).first();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({
    token,
    userId: user.id,
    username: user.username,
    full_name: user.full_name, 
  });
});
