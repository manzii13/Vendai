"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const orders_1 = __importDefault(require("./routes/orders"));
const admin_1 = __importDefault(require("./routes/admin"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const corsOrigins = new Set([
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.FRONTEND_URL,
].filter((o) => Boolean(o)));
function isAllowedOrigin(origin) {
    if (!origin)
        return true;
    if (corsOrigins.has(origin))
        return true;
    // Vite may use the next free port (5174, 5175, …) when 5173 is taken
    return /^https?:\/\/localhost(:\d+)?$/.test(origin);
}
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            callback(null, origin ?? true);
        }
        else {
            callback(new Error(`CORS blocked origin: ${origin}`));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/orders', orders_1.default);
app.use('/api/admin', admin_1.default);
// Serve uploaded images as static files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../src/uploads')));
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const vendors_1 = __importDefault(require("./routes/vendors"));
app.use('/api/auth', auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/vendors', vendors_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', message: 'VendAIX API running ' });
});
exports.default = app;
//# sourceMappingURL=app.js.map