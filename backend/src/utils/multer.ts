import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path.join(__dirname, '../../src/uploads/products');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check extension only — Windows sometimes sends wrong MIME types
    const allowedExtensions = /\.(jpeg|jpg|png|webp|gif)$/i;
    const extOk = allowedExtensions.test(path.extname(file.originalname));

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
    } else {
        console.log('❌ Rejected file:', file.originalname, 'MIME:', file.mimetype);
        cb(null, false); // reject silently instead of throwing error
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // increased to 10MB
});