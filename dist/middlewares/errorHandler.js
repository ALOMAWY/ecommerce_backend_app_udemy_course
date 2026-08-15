"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const zod_1 = require("zod");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof zod_1.ZodError) {
        const zodErr = err;
        res.status(400).json({
            error: "Validation Error",
            details: zodErr.issues.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            })),
        });
        return;
    }
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : err.message,
    });
};
exports.errorHandler = errorHandler;
