import { Request, Response } from 'express';
export declare const getVendors: (_req: Request, res: Response) => Promise<void>;
export declare const getVendor: (req: Request, res: Response) => Promise<void>;
export declare const getVendorStats: (req: Request & {
    user?: any;
}, res: Response) => Promise<void>;
export declare const getAIInsights: (req: Request & {
    user?: any;
}, res: Response) => Promise<void>;
//# sourceMappingURL=vendorController.d.ts.map