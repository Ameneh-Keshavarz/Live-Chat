import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/db.js";
import { asyncWrapper } from "../middlewares/asyncWrapper.js";

const JWT_SECRET = "secretkey"; 

export const register = asyncWrapper(async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  try {
    await db("users").insert({ username, password: hashed });
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      return res.status(400).json({ error: "Username already exists" });
    }
    throw err;
  }
});

export const login = asyncWrapper(async (req, res) => {
  const { username, password } = req.body;
  const user = await db("users").where({ username }).first();

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});
