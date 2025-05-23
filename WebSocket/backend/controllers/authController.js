import { asyncWrapper } from "../middlewares/asyncWrapper.js";
import { StatusCodes } from "http-status-codes";
import { registerUser, loginUser } from "../services/authService.js";

export const register = asyncWrapper(async (req, res) => {
  await registerUser(req.body);
  res.status(StatusCodes.CREATED).json({ message: "User registered" });
});

export const login = asyncWrapper(async (req, res) => {
  const { token, user } = await loginUser(req.body);

  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000,
    })
    .json(user);
});
