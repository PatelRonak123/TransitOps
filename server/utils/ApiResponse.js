export class ApiResponse {
  constructor(statusCode, message = "Success", data = null, meta = null) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  send(res) {
    return res.status(this.statusCode).json(this);
  }
}