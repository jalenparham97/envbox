import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

type ApiErrorDef = {
  status: ContentfulStatusCode;
  code: string;
  message: string;
};

export const apiErrors = {
  routeNotFound: {
    status: 404,
    code: "ROUTE_NOT_FOUND",
    message: "We couldn't find an API route for this request. Check the URL and HTTP method.",
  },
  invalidJsonBody: {
    status: 400,
    code: "INVALID_JSON_BODY",
    message: "The request body must be valid JSON.",
  },
  invalidProjectPayload: {
    status: 400,
    code: "INVALID_PROJECT_PAYLOAD",
    message: "Send a project name and optional defaultProfile in the request body.",
  },
  projectNameRequired: {
    status: 400,
    code: "PROJECT_NAME_REQUIRED",
    message: "Project name is required.",
  },
  invalidProfileName: {
    status: 400,
    code: "INVALID_PROFILE_NAME",
    message: "Profile names must start with a letter and use letters, numbers, underscores, or dashes.",
  },
  projectEnvNotFound: {
    status: 404,
    code: "PROJECT_ENV_NOT_FOUND",
    message: "We couldn't find environment data for this project. Check the project id and try again.",
  },
  internalServerError: {
    status: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong on our side. Please try again.",
  },
} as const satisfies Record<string, ApiErrorDef>;

type ApiErrorKey = keyof typeof apiErrors;

export class ApiError extends HTTPException {
  readonly code: string;

  constructor({ status, code, message }: ApiErrorDef, cause?: unknown) {
    super(status, { message, cause });
    this.code = code;
  }
}

export function apiError(key: ApiErrorKey, cause?: unknown): ApiError {
  return new ApiError(apiErrors[key], cause);
}

export function formatApiError(error: unknown, path: string) {
  let def: ApiErrorDef;

  if (error instanceof ApiError) {
    def = { status: error.status, code: error.code, message: error.message };
  } else if (error instanceof HTTPException) {
    def = {
      status: error.status as ContentfulStatusCode,
      code: "HTTP_ERROR",
      message: error.message || "The API couldn't complete this request.",
    };
  } else {
    def = apiErrors.internalServerError;
  }

  return {
    status: def.status,
    body: { error: { code: def.code, message: def.message, path } },
  };
}