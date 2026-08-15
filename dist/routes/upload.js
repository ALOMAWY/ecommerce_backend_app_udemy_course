"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const adminJwt_1 = __importDefault(require("../middlewares/adminJwt"));
const uploadDir = path_1.default.resolve(__dirname, "../../uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
        if (allowed.test(path_1.default.extname(file.originalname))) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image files (jpg, jpeg, png, gif, webp, svg) are allowed"));
        }
    },
});
const router = express_1.default.Router();
router.post("/", adminJwt_1.default, upload.array("images", 10), (req, res) => {
    const files = req.files;
    const urls = files.map((f) => `/uploads/${f.filename}`);
    res.json({ urls });
});
router.post("/single", adminJwt_1.default, upload.single("image"), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
    }
    res.json({ url: `/uploads/${req.file.filename}` });
});
exports.default = router;
