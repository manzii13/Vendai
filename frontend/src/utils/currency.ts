export const formatRWF = (amount: number): string => {
    return `RWF ${amount.toLocaleString('en-RW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

export const toRWF = (usdAmount: number): number => {
    // 1 USD ≈ 1,300 RWF — change this rate as needed
    const RATE = 1300;
    return Math.round(usdAmount * RATE);
};