
/*
1000000 -> 1m
10000 -> 10k
1100000 -> 1.1m
*/

export function toMaximumFraction(value: number, maxFractionDigits: number) {
    const mul = Math.pow(10, maxFractionDigits);
    return Math.round(value * mul) / mul;
}

export function abbreviateValue(value: number, alwaysShowFraction?: boolean) {
    const toFixedFunc = alwaysShowFraction ?
        (value: number) => value.toFixed(1) :
        (value: number) => toMaximumFraction(value, 1).toString();
    if (value < 1000) {
        return `${toFixedFunc(value)}`;
    }
    if (value < 1000000) {
        return `${toFixedFunc(value / 1000)}K`;
    }
    if (value < 1000000000) {
        return `${toFixedFunc(value / 1000000)}M`;
    }
    return `${toFixedFunc(value / 1000000000)}B`;
}
