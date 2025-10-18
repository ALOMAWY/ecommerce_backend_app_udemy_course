"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_1 = require("../services/product");
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    try {
        const products = await (0, product_1.getAllProducts)();
        res.status(200).send(products);
    }
    catch (error) {
        console.error("Somthing went wrong !", error);
    }
});
exports.default = router;
