export declare const generateProductDescription: (productName: string, category: string, keywords: string) => Promise<{
    title: string;
    description: string;
    tags: string[];
}>;
export declare const generateVendorInsights: (storeName: string, totalSales: number, topProducts: string[], recentOrders: number) => Promise<string>;
export declare const generateSmartSearch: (query: string, availableCategories: string[]) => Promise<{
    keywords: string[];
    suggestedCategory: string | null;
    intent: string;
}>;
//# sourceMappingURL=aiServices.d.ts.map