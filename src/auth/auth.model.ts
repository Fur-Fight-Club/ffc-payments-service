import { Request } from "express";

export interface JWTServicePayload {
  iss: string; // Issuer
  aud: string; // Audience
  sub: "ffc-analytics-service" | "ffc-auth-service" | "ffc-main-service" | "ffc-notifications-service" | "ffc-payments-service"; // Authorized services 
}

export interface JWTServiceRequest extends Request {
  service: JWTServicePayload;
}