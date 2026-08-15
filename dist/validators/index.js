"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productQuerySchema = exports.checkoutSchema = exports.updateItemSchema = exports.addItemSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2, "First name must be at least 2 characters"),
    lastName: zod_1.z.string().min(2, "Last name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.addItemSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, "Product ID is required"),
    quantity: zod_1.z.number().int().positive("Quantity must be positive"),
});
exports.updateItemSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, "Product ID is required"),
    quantity: zod_1.z.number().int().min(1, "Quantity must be at least 1"),
});
exports.checkoutSchema = zod_1.z.object({
    address: zod_1.z.string().min(5, "Address must be at least 5 characters"),
});
exports.productQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(12),
    category: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().positive().optional(),
    maxPrice: zod_1.z.coerce.number().positive().optional(),
    inStock: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
    sort: zod_1.z
        .string()
        .optional()
        .default("createdAt")
        .refine((val) => ["price", "-price", "title", "-title", "createdAt", "-createdAt"].includes(val), { message: "Invalid sort parameter" }),
});
