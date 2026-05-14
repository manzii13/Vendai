import { Request, Response } from 'express';
export declare const getProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProduct: (req: Request, res: Response) => Promise<void>;
export declare const createProduct: (req: Request & {
    user?: any;
}, res: Response) => Promise<void>;
export declare const updateProduct: (req: Request & {
    user?: any;
}, res: Response) => Promise<void>;
export declare const deleteProduct: (req: Request & {
    user?: any;
}, res: Response) => Promise<void>;
export declare const getMyProducts: (req: Request & {
    user?: any;
}, res: Response) => Promise<void>;
export declare const aiGenerateDescription: (req: Request, res: Response) => Promise<void>;
export declare const aiSmartSearch: (req: Request, res: Response) => Promise<void>;
export declare const getCategories: (_req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=productController.d.ts.map