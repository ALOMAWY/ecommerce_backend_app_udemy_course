"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateAdminJWT = (request, response, next) => {
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
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "", (err, payload) => {
        if (err) {
            response.status(403).send("Invalid token");
            return;
        }
        if (!payload || typeof payload === "string" || !payload.isAdmin) {
            response.status(403).send("Admin access required");
            return;
        }
        request.user = null;
        next();
    });
};
exports.default = validateAdminJWT;
