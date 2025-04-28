import { StatusCodes } from "http-status-codes";
import { ApiError } from "../errors/ApiError.js";

export const errorHandlerMiddleware = (err, req, res, next) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong. Please try again later.";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  console.error(`[Error] ${err.name}: ${err.message}`);

  res.status(statusCode).json({ error: message });
};
