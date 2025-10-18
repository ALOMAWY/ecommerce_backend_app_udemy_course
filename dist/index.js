"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_1 = __importDefault(require("./routes/user"));
const products_1 = __importDefault(require("./routes/products"));
const cart_1 = __importDefault(require("./routes/cart"));
const product_1 = require("./services/product");
const app = (0, express_1.default)();
const port = 5000;
dotenv_1.default.config();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
mongoose_1.default
    .connect(process.env.DATABASE_URL || "")
    .then(() => console.log("📲 MongoDB Atlas Is Connected !"))
    .catch(() => console.log(" ❌❌ Cannot Connect To Connect !"));
app.use("/user", user_1.default);
app.use("/product", products_1.default);
app.use("/cart", cart_1.default);
(0, product_1.seedInitialProducts)();
app.listen(port, () => console.log(`🚀 Server Is Running On PORT : ${port}`, `http://localhost:${port}`));
