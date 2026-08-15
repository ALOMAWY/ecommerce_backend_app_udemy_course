"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cart_1 = require("../services/cart");
const jwt_1 = __importDefault(require("../middlewares/jwt"));
const validators_1 = require("../validators");
const errorHandler_1 = require("../middlewares/errorHandler");
const router = express_1.default.Router();
router.get("/", jwt_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || "");
        const cart = yield (0, cart_1.getActiveCartForUser)({ userId, populateProduct: true });
        res.status(200).send(cart);
    }
    catch (err) {
        next(err);
    }
}));
router.post("/items", jwt_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || "");
        const { productId, quantity } = validators_1.addItemSchema.parse(req.body);
        const response = yield (0, cart_1.addItemToCart)({ userId, productId, quantity });
        if (response.statusCode >= 400)
            throw new errorHandler_1.AppError(response.data, response.statusCode);
        res.status(response.statusCode).send(response.data);
    }
    catch (err) {
        next(err);
    }
}));
router.put("/items", jwt_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || "");
        const { productId, quantity } = validators_1.updateItemSchema.parse(req.body);
        const response = yield (0, cart_1.updateItemInCart)({ userId, productId, quantity });
        if (response.statusCode >= 400)
            throw new errorHandler_1.AppError(response.data, response.statusCode);
        res.status(response.statusCode).send(response.data);
    }
    catch (err) {
        next(err);
    }
}));
router.delete("/items/:id", jwt_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || "");
        const productId = String(req.params.id);
        const response = yield (0, cart_1.deleteItemInCart)({ userId, productId });
        if (response.statusCode >= 400)
            throw new errorHandler_1.AppError(response.data, response.statusCode);
        res.status(response.statusCode).send(response.data);
    }
    catch (err) {
        next(err);
    }
}));
router.delete("/", jwt_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || "");
        const response = yield (0, cart_1.clearCart)({ userId });
        res.status(response.statusCode).send(response.data);
    }
    catch (err) {
        next(err);
    }
}));
router.post("/checkout", jwt_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || "");
        const { address } = validators_1.checkoutSchema.parse(req.body);
        const response = yield (0, cart_1.checkout)({ userId, address });
        if ((response === null || response === void 0 ? void 0 : response.statusCode) && response.statusCode >= 400)
            throw new errorHandler_1.AppError(response.data, response.statusCode);
        res.status(response === null || response === void 0 ? void 0 : response.statusCode).send(response.data);
    }
    catch (err) {
        next(err);
    }
}));
router.get("/orders", jwt_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a._id) || "");
        const response = yield (0, cart_1.getOrderByUserId)({ userId });
        res.status(response === null || response === void 0 ? void 0 : response.statusCode).send(response.data);
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
