import mongoose from "mongoose";
import type { Logger } from "../config/logger.js";

export async function connectDatabase(uri: string, logger: Logger): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  logger.info("MongoDB connected");
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
