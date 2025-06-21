import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { ApiError } from "../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const authenticate = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    console.warn("Authentication failed: No token found in cookies");
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.warn("Authentication failed: Invalid or expired token");
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required"));
  }
};
