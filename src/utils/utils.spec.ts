import { HttpException, InternalServerErrorException } from "@nestjs/common";
import {
  checkApiResponse,
  handleApiResponse,
  isApiError,
  isApiNotFoundError,
  prepareRequestInit,
  prepareRequestUrl,
  prepareUrlWithQueryParams,
} from "./api.utils";
import * as bcrypt from "bcrypt";
import { password } from "./password.utils";
import { addDotEveryThreeChars } from "./functions.utils";
import { generateUUID } from "./functions.utils";
import { uuid as uuidv4 } from "uuidv4";

jest.mock("uuidv4");
jest.mock("bcrypt");

describe("Password Utils", () => {
  describe("hashPassword", () => {
    it("should hash the password", async () => {
      const passwordToHash = "myPassword";
      const hashedPassword = "hashedPassword";
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await password.hash(passwordToHash);

      expect(bcrypt.hash).toHaveBeenCalledWith(passwordToHash, 10);
      expect(result).toEqual(hashedPassword);
    });
  });

  describe("comparePassword", () => {
    it("should compare the password and return true if it matches", async () => {
      const passwordToCompare = "myPassword";
      const hashedPassword = "hashedPassword";
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await password.verify(passwordToCompare, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        passwordToCompare,
        hashedPassword
      );
      expect(result).toEqual(true);
    });

    it("should compare the password and return false if it does not match", async () => {
      const passwordToCompare = "myPassword";
      const hashedPassword = "hashedPassword";
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await password.verify(passwordToCompare, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        passwordToCompare,
        hashedPassword
      );
      expect(result).toEqual(false);
    });
  });
});

describe("API Utils", () => {
  describe("prepareRequestUrl", () => {
    it("should return the URL string if info is a string", () => {
      const url = "https://example.com/api";
      const result = prepareRequestUrl(url);
      expect(result).toEqual(url);
    });

    it("should return the href property if info has href", () => {
      const info = { href: "https://example.com/api" };
      const result = prepareRequestUrl(info);
      expect(result).toEqual(info.href);
    });
  });

  describe("prepareRequestInit", () => {
    it("should add Content-Type header to the request init", () => {
      const init = { headers: { "X-Header": "value" } };
      const result = prepareRequestInit(init);
      expect(result.headers).toEqual({
        "X-Header": "value",
        "Content-Type": "application/json",
      });
    });

    it("should set Content-Type header if headers is undefined", () => {
      const init = {};
      const result = prepareRequestInit(init);
      expect(result.headers).toEqual({
        "Content-Type": "application/json",
      });
    });
  });

  describe("handleApiResponse", () => {
    it("should parse the response body as JSON", async () => {
      const response = { json: jest.fn().mockResolvedValue({ data: "test" }) };
      const result = await handleApiResponse(response as any);
      expect(response.json).toHaveBeenCalled();
      expect(result).toEqual({ data: "test" });
    });
  });

  describe("checkApiResponse", () => {
    it("should throw InternalServerErrorException for status codes >= 500", () => {
      const response = {
        statusCode: 500,
        error: "Internal Server Error",
        message: "Something went wrong",
      };
      expect(() => checkApiResponse(response)).toThrow(
        InternalServerErrorException
      );
    });

    it("should throw the mapped exception based on status code", () => {
      const errorMapper = {
        404: () => new HttpException("Not Found", 404),
      };
      const response = {
        statusCode: 404,
        error: "Not Found",
        message: "Not found",
      };
      expect(() => checkApiResponse(response, errorMapper)).toThrow(
        HttpException
      );
    });
  });

  describe("isApiError", () => {
    it("should return true if the response matches the ApiError structure", () => {
      const response = {
        statusCode: 404,
        error: "Not Found",
        message: "Resource not found",
      };
      const result = isApiError(response);
      expect(result).toEqual(true);
    });

    it("should return false if the response does not match the ApiError structure", () => {
      const response = { status: 404, errorMessage: "Not Found" };
      const result = isApiError(response);
      expect(result).toEqual(false);
    });
  });

  describe("isApiNotFoundError", () => {
    it("should return true if the response is an ApiError with status code 404", () => {
      const response = {
        statusCode: 404,
        error: "Not Found",
        message: "Resource not found",
      };
      const result = isApiNotFoundError(response);
      expect(result).toEqual(true);
    });

    it("should return false if the response is not an ApiError", () => {
      const response = {
        statusCode: 500,
        error: "Internal Server Error",
        message: "Something went wrong",
      };
      const result = isApiNotFoundError(response);
      expect(result).toEqual(false);
    });

    it("should return false if the response is an ApiError with a different status code", () => {
      const response = {
        statusCode: 403,
        error: "Forbidden",
        message: "Access denied",
      };
      const result = isApiNotFoundError(response);
      expect(result).toEqual(false);
    });
  });

  describe("prepareUrlWithQueryParams", () => {
    it("should append query parameters to the URL", () => {
      const url = "https://example.com/api";
      const params = { page: 1, limit: 10 };
      const expectedUrl = "https://example.com/api?page=1&limit=10";
      const result = prepareUrlWithQueryParams(url, params);
      expect(result).toEqual(expectedUrl);
    });

    it("should handle array values for query parameters", () => {
      const url = "https://example.com/api";
      const params = { ids: [1, 2, 3] };
      const expectedUrl = "https://example.com/api?ids=1&ids=2&ids=3";
      const result = prepareUrlWithQueryParams(url, params);
      expect(result).toEqual(expectedUrl);
    });

    it("should handle Date objects as query parameters", () => {
      const url = "https://example.com/api";
      const date = new Date("2022-01-01");
      const params = { fromDate: date };
      const expectedUrl = `https://example.com/api?fromDate=${date.toISOString()}`;
      const result = prepareUrlWithQueryParams(url, params);
      expect(result).toEqual(expectedUrl);
    });

    it("should ignore undefined or null values for query parameters", () => {
      const url = "https://example.com/api";
      const params = { name: "John", age: undefined, occupation: null };
      const expectedUrl = "https://example.com/api?name=John";
      const result = prepareUrlWithQueryParams(url, params);
      expect(result).toEqual(expectedUrl);
    });

    it("should return the URL without query parameters if params is an empty object", () => {
      const url = "https://example.com/api";
      const params = {};
      const result = prepareUrlWithQueryParams(url, params);
      expect(result).toEqual(url);
    });
  });
});

describe("addDotEveryThreeChars", () => {
  it("should add dots every three characters in a string", () => {
    const input = "1234567890";
    const expectedOutput = "1.234.567.890";

    const result = addDotEveryThreeChars(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should not add dots if the string length is less than or equal to three", () => {
    const input = "123";
    const expectedOutput = "123";

    const result = addDotEveryThreeChars(input);

    expect(result).toEqual(expectedOutput);
  });

  it("should handle an empty string", () => {
    const input = "";
    const expectedOutput = "";

    const result = addDotEveryThreeChars(input);

    expect(result).toEqual(expectedOutput);
  });
});

describe("UUID Utils", () => {
  describe("generateUUID", () => {
    it("should generate a UUID", () => {
      const generatedUUID = "generatedUUID";
      (uuidv4 as jest.Mock).mockReturnValue(generatedUUID);

      const result = generateUUID();

      expect(uuidv4).toHaveBeenCalled();
      expect(result).toEqual(generatedUUID);
    });
  });
});
