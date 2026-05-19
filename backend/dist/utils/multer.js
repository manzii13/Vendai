"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path_1.default.join(__dirname, '../../src/uploads/products');
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path_1.default.extname(file.originalname)}`);
    }
});
const fileFilter = (_req, file, cb) => {
    // Check extension only — Windows sometimes sends wrong MIME types
    const allowedExtensions = /\.(jpeg|jpg|png|webp|gif)$/i;
    const extOk = allowedExtensions.test(path_1.default.extname(file.originalname));
    // Also accept common image MIME types
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/octet-stream' // Windows sometimes sends this
    ];
    const mimeOk = allowedMimes.includes(file.mimetype);
    if (extOk || mimeOk) {
        cb(null, true);
    }
    else {
        console.log('❌ Rejected file:', file.originalname, 'MIME:', file.mimetype);
        cb(null, false); // reject silently instead of throwing error
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // increased to 10MB
});
//# sourceMappingURL=multer.js.map