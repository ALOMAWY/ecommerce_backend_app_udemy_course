"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_1 = require("../services/cart");
const jwt_1 = __importDefault(require("../middlewares/jwt"));
const router = express_1.default.Router();
router.get("/", jwt_1.default, async (req, res) => {
    try {
        const userId = req.user?._id;
        const cart = await (0, cart_1.getActiveCartForUser)({ userId, populateProduct: true });
        res.status(200).send(cart);
    }
    catch (error) {
        console.error("Somthing went wrong !", error);
    }
});
router.post("/items", jwt_1.default, async (req, res) => {
    try {
        const userId = req.user?._id;
        const { productId, quantity } = req.body;
        const response = await (0, cart_1.addItemToCart)({ userId, productId, quantity });
        res.status(response.statusCode).send(response.data);
    }
    catch (error) {
        console.error("Somthing went wrong !", error);
    }
});
router.put("/items", jwt_1.default, async (req, res) => {
    try {
        const userId = req.user?._id;
        const { productId, quantity } = req.body;
        const response = await (0, cart_1.updateItemInCart)({ userId, productId, quantity });
        res.status(response.statusCode).send(response.data);
    }
    catch (error) {
        console.error("Somthing went wrong !", error);
    }
});
router.delete("/items/:id", jwt_1.default, async (req, res) => {
    try {
        const userId = req.user?._id;
        const productId = req.params.id;
        const response = await (0, cart_1.deleteItemInCart)({ userId, productId });
        res.status(response.statusCode).send(response.data);
    }
    catch (error) {
        console.error("Somthing went wrong !", error);
    }
});
router.delete("/", jwt_1.default, async (req, res) => {
    try {
        const userId = req.user?.id;
        const response = await (0, cart_1.clearCart)({ userId });
        res.status(response.statusCode).send(response.data);
    }
    catch (error) {
        console.error("Somthing went wrong !", error);
    }
});
router.post("/checkout", jwt_1.default, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { address } = req.body;
        const response = await (0, cart_1.checkout)({ userId, address });
        res.status(response?.statusCode).send(response.data);
    }
    catch (error) {
        console.error("Somthing went wrong !", error);
    }
});
router.get("/orders", jwt_1.default, async (req, res) => {
    try {
        const userId = req.user?.id;
        const response = await (0, cart_1.getOrderByUserId)({ userId });
        res.status(response?.statusCode).send(response.data);
    }
    catch (error) {
        console.error("Somthing went wrong");
    }
});
exports.default = router;
