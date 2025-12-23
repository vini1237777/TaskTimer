export class AppError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number, message?: string) {
    super(message || code);
    this.code = code;
    this.status = status;
  }
}

export const ERR = {
  unauth: () => new AppError("UNAUTHENTICATED", 401),
  badInput: (msg = "INVALID_INPUT") => new AppError("INVALID_INPUT", 400, msg),
  notFound: () => new AppError("NOT_FOUND", 404),
  conflict: (msg = "CONFLICT") => new AppError("CONFLICT", 409, msg),
};
