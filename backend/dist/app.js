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
app.use((0, cors_1.default)({ origin: 'http://localhost:5173', credentials: true }));
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