import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT || 3000;
export const HOST = process.env.HOST || "0.0.0.0"; 
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

