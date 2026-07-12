export class ApiError extends Error {
  constructor(statusCode, message, errorCode = "API_ERROR", errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = Array.isArray(errors) ? errors : [];

    Error.captureStackTrace(this, this.constructor);
  }
}