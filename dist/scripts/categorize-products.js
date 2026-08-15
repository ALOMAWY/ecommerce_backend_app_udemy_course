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
const mongoose_1 = __importDefault(require("mongoose"));
const product_1 = require("../models/product");
const CATEGORY_MAP = {
    "airpods": "mobile-accessories",
    "buds": "mobile-accessories",
    "iphone": "mobile-accessories",
    "galaxy s": "mobile-accessories",
    "galaxy tab": "mobile-accessories",
    "pixel": "mobile-accessories",
    "oneplus": "mobile-accessories",
    "ipad": "mobile-accessories",
    "watch": "tech-tools",
    "headphone": "tech-tools",
    "headset": "tech-tools",
    "gopro": "tech-tools",
    "dji": "tech-tools",
    "drone": "tech-tools",
    "mouse": "pc-accessories",
    "keyboard": "pc-accessories",
    "monitor": "pc-accessories",
    "laptop": "pc-accessories",
    "notebook": "pc-accessories",
    "macbook": "pc-accessories",
    "victus": "pc-accessories",
    "nitro": "pc-accessories",
    "katana": "pc-accessories",
    "tuf": "pc-accessories",
    "legion": "pc-accessories",
    "blade": "pc-accessories",
    "xps": "pc-accessories",
};
function categorizeProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(process.env.MONGO_URL || "");
        const products = yield product_1.ProductModel.find();
        for (const product of products) {
            const title = product.title.toLowerCase();
            let category = "other";
            for (const [keyword, cat] of Object.entries(CATEGORY_MAP)) {
                if (title.includes(keyword)) {
                    category = cat;
                    break;
                }
            }
            if (product.category !== category) {
                yield product_1.ProductModel.findByIdAndUpdate(product._id, { category });
                console.log(`Updated "${product.title}" -> ${category}`);
            }
        }
        console.log(`Done. ${products.length} products processed.`);
        yield mongoose_1.default.disconnect();
    });
}
categorizeProducts().catch(console.error);
