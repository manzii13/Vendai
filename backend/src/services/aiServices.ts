import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const generateProductDescription = async (
    productName: string,
    category: string,
    keywords: string
): Promise<{ title: string; description: string; tags: string[] }> => {
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

    const text = (message.content[0] as any).text;
    return JSON.parse(text);
};

export const generateVendorInsights = async (
    storeName: string,
    totalSales: number,
    topProducts: string[],
    recentOrders: number
): Promise<string> => {
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

    return (message.content[0] as any).text;
};

export const generateSmartSearch = async (
    query: string,
    availableCategories: string[]
): Promise<{ keywords: string[]; suggestedCategory: string | null; intent: string }> => {
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

    return JSON.parse((message.content[0] as any).text);
};