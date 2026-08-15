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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderByUserId = exports.checkout = exports.clearCart = exports.deleteItemInCart = exports.updateItemInCart = exports.addItemToCart = exports.getActiveCartForUser = void 0;
const cart_1 = require("../models/cart");
const order_1 = require("../models/order");
const product_1 = require("../models/product");
const calculateCartItemsTotal = ({ cartItems }) => {
    let total = cartItems.reduce((sum, product) => {
        sum += product.quantity * product.unitPrice;
        return sum;
    }, 0);
    return total;
};
const createCartForUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
    const cart = yield cart_1.cartModel.create({ userId, totalAmount: 0 });
    return cart;
});
const getActiveCartForUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, populateProduct, }) {
    let cart;
    if (populateProduct) {
        cart = yield cart_1.cartModel
            .findOne({ userId, status: "active" })
            .populate("items.product");
    }
    else {
        cart = yield cart_1.cartModel.findOne({ userId, status: "active" });
    }
    if (!cart) {
        cart = yield createCartForUser({ userId });
    }
    return cart;
});
exports.getActiveCartForUser = getActiveCartForUser;
const addItemToCart = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, productId, quantity, }) {
    const cart = yield (0, exports.getActiveCartForUser)({ userId });
    const existingProduct = cart.items.find((p) => p.product.toString() === productId);
    if (existingProduct) {
        existingProduct.quantity += quantity;
        cart.totalAmount += existingProduct.unitPrice * quantity;
        yield cart.save();
        return {
            data: yield (0, exports.getActiveCartForUser)({ userId, populateProduct: true }),
            statusCode: 200,
        };
    }
    const product = yield product_1.ProductModel.findById(productId);
    if (!product)
        return { data: "Product Not Found", statusCode: 400 };
    if (product.stock < quantity)
        return { data: "low stock for item ", statusCode: 400 };
    cart.items.push({ product: productId, unitPrice: product.price, quantity });
    cart.totalAmount += product.price * quantity;
    yield cart.save();
    return {
        data: yield (0, exports.getActiveCartForUser)({ userId, populateProduct: true }),
        statusCode: 200,
    };
});
exports.addItemToCart = addItemToCart;
const updateItemInCart = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, productId, quantity, }) {
    if (quantity < 1) {
        return { data: "quantity must be at least 1", statusCode: 400 };
    }
    const cart = yield (0, exports.getActiveCartForUser)({ userId });
    const existingProduct = cart.items.find((p) => p.product.toString() === productId);
    if (!existingProduct) {
        return { data: "item Dose Not Exist In Cart !", statusCode: 400 };
    }
    const product = yield product_1.ProductModel.findById(productId);
    if (!product)
        return { data: "Product Not Found", statusCode: 400 };
    if (product.stock < quantity)
        return { data: "low stock for item ", statusCode: 400 };
    const otherCartItems = cart.items.filter((p) => p.product.toString() !== productId);
    let total = calculateCartItemsTotal({ cartItems: otherCartItems });
    existingProduct.quantity = quantity;
    total += existingProduct.quantity * existingProduct.unitPrice;
    cart.totalAmount = total;
    yield cart.save();
    return {
        data: yield (0, exports.getActiveCartForUser)({ userId, populateProduct: true }),
        statusCode: 200,
    };
});
exports.updateItemInCart = updateItemInCart;
const deleteItemInCart = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, productId, }) {
    let cart = yield (0, exports.getActiveCartForUser)({ userId });
    const existsInCart = cart.items.find((p) => p.product.toString() === productId);
    if (!existsInCart)
        return { data: "item Dose Not Exist In Cart !", statusCode: 400 };
    const otherCartItems = cart.items.filter((p) => p.product.toString() !== productId);
    let total = calculateCartItemsTotal({ cartItems: otherCartItems });
    cart.totalAmount = total;
    cart.items = otherCartItems;
    yield cart.save();
    return {
        data: yield (0, exports.getActiveCartForUser)({ userId, populateProduct: true }),
        statusCode: 200,
    };
});
exports.deleteItemInCart = deleteItemInCart;
const clearCart = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
    const cart = yield (0, exports.getActiveCartForUser)({ userId });
    cart.items = [];
    cart.totalAmount = 0;
    const updatedCart = yield cart.save();
    return { data: updatedCart, statusCode: 200 };
});
exports.clearCart = clearCart;
const checkout = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, address }) {
    if (!address)
        return { data: "please add the address", statusCode: 400 };
    const cart = yield (0, exports.getActiveCartForUser)({ userId });
    const orderItems = [];
    if (!cart.items || cart.items.length === 0)
        return { data: "items dose not include products", statusCode: 400 };
    for (const item of cart.items) {
        const product = yield product_1.ProductModel.findById(item.product);
        if (!product)
            return { data: "Product not found", statusCode: 400 };
        const orderItem = {
            productTitle: product.title,
            productImage: product.image,
            quantity: item.quantity,
            unitprice: item.unitPrice,
        };
        orderItems.push(orderItem);
    }
    const order = yield order_1.orderModel.create({
        userId,
        orderItems,
        address,
        total: cart.totalAmount,
    });
    cart.status = "completed";
    yield cart.save();
    return { data: order, statusCode: 200 };
});
exports.checkout = checkout;
const getOrderByUserId = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
    const order = yield order_1.orderModel.find({ userId: userId });
    return { data: order, statusCode: 200 };
});
exports.getOrderByUserId = getOrderByUserId;
