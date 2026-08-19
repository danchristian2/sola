import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../errors/AppError.js";
import type { Logger } from "../../config/logger.js";

export function errorHandler(logger: Logger) {
  return (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      const mapped = new ValidationError(
        "Validation failed",
        err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      );
      return sendError(res, mapped);
    }

    if (err instanceof AppError) {
      if (err.statusCode >= 500) {
        logger.error({ err }, err.message);
      }
      return sendError(res, err);
    }

    logger.error({ err }, "Unhandled error");
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        details: []
      }
    });
  };
}

function sendError(res: Response, err: AppError) {
  return res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.code,
      message: err.message,
      details: err.details
    }
  });
}
