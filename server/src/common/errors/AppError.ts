export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: unknown[];
  readonly isOperational = true;

  constructor(statusCode: number, code: string, message: string, details: unknown[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details: unknown[] = []) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "AUTHENTICATION_ERROR", message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(403, "AUTHORIZATION_ERROR", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(409, "CONFLICT", message);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(422, "BUSINESS_RULE_ERROR", message);
  }
}
