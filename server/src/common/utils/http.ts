import type { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "OK",
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
}

export function sendCreated<T>(res: Response, data: T, message = "Created") {
  return sendSuccess(res, data, message, 201);
}
