export const ApiErrorCode = {
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  TODO_NOT_FOUND: "TODO_NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export type ApiErrorResponse = {
  message: string;
  code: ApiErrorCode;
};
