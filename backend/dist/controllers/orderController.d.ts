import { Request, Response } from 'express';
export declare const createOrder: (req: Request & {
    user?: any;
}, res: Response) => Promise<void>;
export declare const getMyOrders: (req: Request & {
    user?: any;
}, res: Response) => Promise<void>;
export declare const getOrder: (req: Request & {
    user?: any;
}, res: Response) => Promise<void>;
export declare const getVendorOrders: (req: Request & {
    user?: any;
}, res: Response) => Promise<void>;
export declare const updateOrderStatus: (req: Request & {
    user?: any;
}, res: Response) => Promise<void>;
//# sourceMappingURL=orderController.d.ts.map