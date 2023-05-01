import { HttpException, InternalServerErrorException } from "@nestjs/common";
import { RequestInfo, RequestInit, Response } from "node-fetch";

export type Fetch = (url: RequestInfo, init?: RequestInit) => Promise<Response>;

type URLLike = { href: string };
type Request = { url: string };

export function prepareRequestUrl(info: RequestInfo): string {
  return typeof info === "string"
    ? info
    : info.hasOwnProperty("href")
      // @ts-ignore
      ? (info as URLLike).href
      : (info as Request).url;
}

export function prepareRequestInit(init: RequestInit = {}): RequestInit {
  return {
    ...init,
    headers: {
      ...init.headers,
      "Content-Type": "application/json",
    },
  };
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

export type ApiResponse<T> = T | ApiError;

export function handleApiResponse<T>(
  response: Response,
): Promise<ApiResponse<T>> {
  return response.json() as Promise<ApiResponse<T>>;
}

type ExceptionFactory = (error: ApiError) => HttpException;
type ErrorMapper = { [key: string]: ExceptionFactory };

/**
 * Checks if the response is an API error and throws the appropriate exception.
 *
 * @param response
 * @param errorMapper
 */
export function checkApiResponse<T>(
  response: ApiResponse<T>,
  errorMapper?: ErrorMapper,
): asserts response is T {
  if (isApiError(response)) {
    console.log("API ERROR STATUS", response.statusCode);

    if (response.statusCode >= 500) {
      throw new InternalServerErrorException(response);
    }
    if (errorMapper && errorMapper[response.statusCode]) {
      throw errorMapper[response.statusCode](response);
    }
    throw response;
  }
}

export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
  return (
    response &&
    response.hasOwnProperty("statusCode") &&
    response.hasOwnProperty("error") &&
    response.hasOwnProperty("message")
  );
}

export function isApiNotFoundError(response: ApiResponse<unknown>): boolean {
  return isApiError(response) && response.statusCode === 404;
}

export function prepareUrlWithQueryParams<T extends Record<string, unknown>>(
  url: string,
  params: T,
): string {
  const queryParams = prepareQueryParams(params);
  return `${url}${queryParams ? `?${queryParams}` : ""}`;
}

function prepareQueryParams(params: Record<string, unknown>): string {
  return Object.entries(params).reduce((previous, current) => {
    const [key, value] = current;

    if (value !== undefined && value !== null) {
      let queryParam = "";
      if (Array.isArray(value)) {
        queryParam = value.length ? `${key}=${value.join(`&${key}=`)}` : "";
      } else if (value instanceof Date) {
        queryParam = `${key}=${value.toISOString()}`;
      } else {
        queryParam = `${key}=${value}`;
      }

      return `${!previous ? "" : `${previous}&`}${queryParam}`;
    }

    return previous;
  }, "");
}
