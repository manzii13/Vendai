"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSmartSearch = exports.generateVendorInsights = exports.generateProductDescription = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const client = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
const generateProductDescription = async (productName, category, keywords) => {
    const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
            {
                role: 'user',
                content: `You are a professional e-commerce copywriter. Generate a compelling product listing.

Product Name: ${productName}
Category: ${category}
Keywords/Features: ${keywords}

Respond ONLY with valid JSON in this exact format, no markdown:
{
  "title": "improved product title (max 60 chars)",
  "description": "compelling 2-3 sentence product description",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`
            }
        ]
    });
    const text = message.content[0].text;
    return JSON.parse(text);
};
exports.generateProductDescription = generateProductDescription;
const generateVendorInsights = async (storeName, totalSales, topProducts, recentOrders) => {
    const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [
            {
                role: 'user',
                content: `You are an AI business analyst for an e-commerce platform.

Store: ${storeName}
Total Sales: $${totalSales}
Recent Orders (30 days): ${recentOrders}
Top Products: ${topProducts.join(', ') || 'None yet'}

Give 3 short, actionable business insights in plain text. Each insight on a new line starting with "•". Be specific and data-driven. Max 150 words total.`
            }
        ]
    });
    return message.content[0].text;
};
exports.generateVendorInsights = generateVendorInsights;
const generateSmartSearch = async (query, availableCategories) => {
    const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [
            {
                role: 'user',
                content: `Parse this product search query for an e-commerce marketplace.

Query: "${query}"
Available categories: ${availableCategories.join(', ') || 'None'}

Respond ONLY with valid JSON, no markdown:
{
  "keywords": ["keyword1", "keyword2"],
  "suggestedCategory": "category name or null",
  "intent": "one sentence describing what the user wants"
}`
            }
        ]
    });
    return JSON.parse(message.content[0].text);
};
exports.generateSmartSearch = generateSmartSearch;
//# sourceMappingURL=aiServices.js.map