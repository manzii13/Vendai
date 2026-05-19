import { Request, Response } from 'express';
export declare const getPlatformStats: (_req: Request, res: Response) => Promise<void>;
export declare const getAllVendors: (_req: Request, res: Response) => Promise<void>;
export declare const approveVendor: (req: Request, res: Response) => Promise<void>;
export declare const rejectVendor: (req: Request, res: Response) => Promise<void>;
export declare const getAllUsers: (_req: Request, res: Response) => Promise<void>;
export declare const getAllOrders: (_req: Request, res: Response) => Promise<void>;
export declare const deleteUser: (req: Request, res: Response) => Promise<void>;
export declare const makeAdmin: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map