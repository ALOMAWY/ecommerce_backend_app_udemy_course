import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { IUser, userModel } from "../models/user";
import { ExtendsRequest } from "../types/extendedRequest";

const validateJWT = (
  requset: ExtendsRequest,
  response: Response,
  next: NextFunction
) => {
  const authorization = requset.get("authorization");

  if (!authorization) {
    response.status(403).send("authorization header was not provided!");
    return;
  }

  const token = authorization?.split(" ")[1];

  if (!token) {
    response.status(403).send("Bearer Token Not Found !");
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || "", async (err, payload) => {
    if (err) {
      response.status(403).send("invalid token Err");
      return;
    }

    if (!payload) {
      response.status(403).send("invalid token payload");
      return;
    }

    const userPayload = payload as IUser;

    const user = await userModel.findOne({ email: userPayload.email });
    if (!user) {
      response.status(403).send("User not found");
      return;
    }
    requset.user = user;
    next();
  });
};

export default validateJWT;
