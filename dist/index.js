"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const pino_http_1 = __importDefault(require("pino-http"));
const pino_1 = __importDefault(require("pino"));
const user_1 = __importDefault(require("./routes/user"));
const products_1 = __importDefault(require("./routes/products"));
const cart_1 = __importDefault(require("./routes/cart"));
const admin_1 = __importDefault(require("./routes/admin"));
const upload_1 = __importDefault(require("./routes/upload"));
const product_1 = require("./services/product");
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const logger = (0, pino_1.default)({ level: process.env.LOG_LEVEL || "info" });
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : "http://localhost:5173";
app.use((0, cors_1.default)({
    origin: corsOrigin,
    credentials: true,
}));
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use((0, pino_http_1.default)({ logger }));
app.use("/api/v1/user", user_1.default);
app.use("/api/v1/product", products_1.default);
app.use("/api/v1/cart", cart_1.default);
app.use("/api/v1/admin", admin_1.default);
app.use("/api/v1/upload", upload_1.default);
app.get("/api/v1/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use(errorHandler_1.errorHandler);
mongoose_1.default
    .connect(process.env.MONGO_URL || "")
    .then(() => {
    logger.info("MongoDB Is Connected");
    (0, product_1.seedInitialProducts)();
    app.listen(port, () => logger.info(`Server running on PORT: ${port} http://localhost:${port}`));
})
    .catch((err) => {
    logger.error(err, "Cannot Connect To MongoDB");
    process.exit(1);
});
