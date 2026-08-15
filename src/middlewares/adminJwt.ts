import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { ExtendsRequest } from "../types/extendedRequest";

const validateAdminJWT = (
  request: ExtendsRequest,
  response: Response,
  next: NextFunction
) => {
  const authorization = request.get("authorization");

  if (!authorization) {
    response.status(403).send("Authorization header was not provided!");
    return;
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    response.status(403).send("Bearer token not found!");
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || "", (err, payload) => {
    if (err) {
      response.status(403).send("Invalid token");
      return;
    }

    if (!payload || typeof payload === "string" || !(payload as any).isAdmin) {
      response.status(403).send("Admin access required");
      return;
    }

    request.user = null;
    next();
  });
};

export default validateAdminJWT;
