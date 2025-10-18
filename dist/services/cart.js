"use strict";
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
const createCartForUser = async ({ userId }) => {
    const cart = await cart_1.cartModel.create({ userId, totalAmount: 0 });
    cart.save();
    return cart;
};
const getActiveCartForUser = async ({ userId, populateProduct, }) => {
    let cart;
    if (populateProduct) {
        cart = await cart_1.cartModel
            .findOne({ userId, status: "active" })
            .populate("items.product");
    }
    else {
        cart = await cart_1.cartModel.findOne({ userId, status: "active" });
    }
    if (!cart) {
        cart = await createCartForUser({ userId });
    }
    return cart;
};
exports.getActiveCartForUser = getActiveCartForUser;
const addItemToCart = async ({ userId, productId, quantity, }) => {
    const cart = await (0, exports.getActiveCartForUser)({ userId });
    const existingProduct = cart.items.find((p) => p.product.toString() === productId);
    if (existingProduct) {
        existingProduct.quantity++;
        cart.totalAmount += existingProduct.unitPrice;
        await cart.save();
        return {
            data: await (0, exports.getActiveCartForUser)({ userId, populateProduct: true }),
            statusCode: 200,
        };
    }
    const product = await product_1.ProductModel.findById(productId);
    if (!product)
        return { data: "Product Not Found", statusCode: 400 };
    if (product.stock < quantity)
        return { data: "low stock for item ", statusCode: 400 };
    cart.items.push({ product: productId, unitPrice: product.price, quantity });
    cart.totalAmount += product.price * quantity;
    await cart.save();
    return {
        data: await (0, exports.getActiveCartForUser)({ userId, populateProduct: true }),
        statusCode: 200,
    };
};
exports.addItemToCart = addItemToCart;
const updateItemInCart = async ({ userId, productId, quantity, }) => {
    const cart = await (0, exports.getActiveCartForUser)({ userId });
    const existingProduct = cart.items.find((p) => p.product.toString() === productId);
    if (!existingProduct) {
        return { data: "item Dose Not Exist In Cart !", statusCode: 400 };
    }
    const product = await product_1.ProductModel.findById(productId);
    if (!product)
        return { data: "Product Not Found", statusCode: 400 };
    if (product.stock < quantity)
        return { data: "low stock for item ", statusCode: 400 };
    const otherCartItems = cart.items.filter((p) => p.product.toString() !== productId);
    let total = calculateCartItemsTotal({ cartItems: otherCartItems });
    existingProduct.quantity = quantity;
    total += existingProduct.quantity * existingProduct.unitPrice;
    cart.totalAmount = total;
    await cart.save();
    return {
        data: await (0, exports.getActiveCartForUser)({ userId, populateProduct: true }),
        statusCode: 200,
    };
};
exports.updateItemInCart = updateItemInCart;
const deleteItemInCart = async ({ userId, productId, }) => {
    let cart = await (0, exports.getActiveCartForUser)({ userId });
    const existsInCart = cart.items.find((p) => p.product.toString() === productId);
    if (!existsInCart)
        return { data: "item Dose Not Exist In Cart !", statusCode: 400 };
    const otherCartItems = cart.items.filter((p) => p.product.toString() !== productId);
    let total = calculateCartItemsTotal({ cartItems: otherCartItems });
    cart.totalAmount = total;
    cart.items = otherCartItems;
    await cart.save();
    return {
        data: await (0, exports.getActiveCartForUser)({ userId, populateProduct: true }),
        statusCode: 200,
    };
};
exports.deleteItemInCart = deleteItemInCart;
const clearCart = async ({ userId }) => {
    const cart = await (0, exports.getActiveCartForUser)({ userId });
    cart.items = [];
    cart.totalAmount = 0;
    const updatedCart = await cart.save();
    return { data: updatedCart, statusCode: 200 };
};
exports.clearCart = clearCart;
const checkout = async ({ userId, address }) => {
    if (!address)
        return { data: "please add the address", statusCode: 400 };
    const cart = await (0, exports.getActiveCartForUser)({ userId });
    const orderItems = [];
    if (!cart.items || cart.items.length === 0)
        return { data: "items dose not include products", statusCode: 400 };
    for (const item of cart.items) {
        const product = await product_1.ProductModel.findById(item.product);
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
    const order = await order_1.orderModel.create({
        userId,
        orderItems,
        address,
        total: cart.totalAmount,
    });
    await order.save();
    cart.status = "completed";
    await cart.save();
    return { data: order, statusCode: 200 };
};
exports.checkout = checkout;
const getOrderByUserId = async ({ userId }) => {
    const order = await order_1.orderModel.find({ userId: userId });
    return { data: order, statusCode: 200 };
};
exports.getOrderByUserId = getOrderByUserId;
