"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../services/user");
const router = express_1.default.Router();
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const { statusCode, data } = await (0, user_1.register)({
            firstName,
            lastName,
            email,
            password,
        });
        res.status(statusCode).json(data);
    }
    catch (error) {
        console.error("Somthing went wrong !", error);
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const { statusCode, data } = await (0, user_1.login)({
            email,
            password,
        });
        res.status(statusCode).json(data);
    }
    catch (error) {
        console.error("Somthing went wrong !", error);
    }
});
exports.default = router;
