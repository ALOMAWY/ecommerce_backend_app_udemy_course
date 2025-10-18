"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../models/user");
const validateJWT = (requset, response, next) => {
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
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "", async (err, payload) => {
        if (err) {
            response.status(403).send("invalid token Err");
            return;
        }
        if (!payload) {
            response.status(403).send("invalid token payload");
            return;
        }
        const userPayload = payload;
        const user = await user_1.userModel.findOne({ email: userPayload.email });
        requset.user = user;
        next();
    });
};
exports.default = validateJWT;
