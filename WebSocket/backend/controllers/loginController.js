import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/db.js";
import { asyncWrapper } from "../middlewares/asyncWrapper.js";
import { ApiError } from "../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { JWT_SECRET } from "../config.js";


//const JWT_SECRET = process.env.JWT_SECRET;

export const login = asyncWrapper(async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", username);

  const user = await db("users").where({ username }).first();
  if (!user) {
    console.log("User not found");
    throw new ApiError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    console.log("Password mismatch");
    throw new ApiError("Invalid credentials", StatusCodes.UNAUTHORIZED);
  }

  console.log("Login success");

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined!");
    throw new Error("Missing JWT_SECRET");
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

