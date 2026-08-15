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
const node_cache_1 = __importDefault(require("node-cache"));
const product_1 = require("../models/product");
const validators_1 = require("../validators");
const errorHandler_1 = require("../middlewares/errorHandler");
const adminJwt_1 = __importDefault(require("../middlewares/adminJwt"));
const router = express_1.default.Router();
const cache = new node_cache_1.default({ stdTTL: 300, checkperiod: 60 });
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const query = validators_1.productQuerySchema.parse(req.query);
        const cacheKey = `products:${JSON.stringify(query)}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }
        const filter = {};
        if (query.category)
            filter.category = query.category;
        if (query.minPrice || query.maxPrice) {
            filter.price = {};
            if (query.minPrice)
                filter.price.$gte = query.minPrice;
            if (query.maxPrice)
                filter.price.$lte = query.maxPrice;
        }
        if (query.inStock !== undefined) {
            if (query.inStock)
                filter.stock = { $gt: 0 };
            else
                filter.stock = 0;
        }
        const sortDir = ((_a = query.sort) === null || _a === void 0 ? void 0 : _a.startsWith("-")) ? -1 : 1;
        const sortField = ((_b = query.sort) === null || _b === void 0 ? void 0 : _b.replace(/^-/, "")) || "createdAt";
        const skip = (query.page - 1) * query.limit;
        const [products, total] = yield Promise.all([
            product_1.ProductModel.find(filter)
                .sort({ [sortField]: sortDir })
                .skip(skip)
                .limit(query.limit)
                .lean(),
            product_1.ProductModel.countDocuments(filter),
        ]);
        const result = {
            data: products,
            pagination: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
                hasNextPage: query.page * query.limit < total,
                hasPrevPage: query.page > 1,
            },
        };
        cache.set(cacheKey, result);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}));
router.get("/all", (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cached = cache.get("products:all");
        if (cached) {
            res.json(cached);
            return;
        }
        const products = yield product_1.ProductModel.find().lean();
        cache.set("products:all", products);
        res.json(products);
    }
    catch (err) {
        next(err);
    }
}));
router.post("/", adminJwt_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, image, images, description, category, price, stock } = req.body;
        if (!title || price === undefined || stock === undefined) {
            throw new errorHandler_1.AppError("Title, price, and stock are required", 400);
        }
        const product = yield product_1.ProductModel.create({
            title,
            image: image || (Array.isArray(images) && images.length > 0 ? images[0] : ""),
            images: images || [],
            description: description || "",
            category: category || "other",
            price,
            stock,
        });
        cache.flushAll();
        res.status(201).json(product);
    }
    catch (err) {
        next(err);
    }
}));
router.put("/:id", adminJwt_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, image, images, description, category, price, stock } = req.body;
        const update = {};
        if (title !== undefined)
            update.title = title;
        if (image !== undefined)
            update.image = image;
        if (images !== undefined)
            update.images = images;
        if (description !== undefined)
            update.description = description;
        if (category !== undefined)
            update.category = category;
        if (price !== undefined)
            update.price = price;
        if (stock !== undefined)
            update.stock = stock;
        const product = yield product_1.ProductModel.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        if (!product)
            throw new errorHandler_1.AppError("Product not found", 404);
        cache.flushAll();
        res.json(product);
    }
    catch (err) {
        next(err);
    }
}));
router.delete("/:id", adminJwt_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_1.ProductModel.findByIdAndDelete(req.params.id);
        if (!product)
            throw new errorHandler_1.AppError("Product not found", 404);
        cache.flushAll();
        res.json({ message: "Product deleted successfully" });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
