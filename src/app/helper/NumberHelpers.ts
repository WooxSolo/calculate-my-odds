
/*
1000000 -> 1m
10000 -> 10k
1100000 -> 1.1m
*/

export function toMaximumFraction(value: number, maxFractionDigits: number) {
    const mul = Math.pow(10, maxFractionDigits);
    return Math.round(value * mul) / mul;
}

export function abbreviateValue(value: number, alwaysShowFraction?: boolean, isInteger?: boolean) {
    const toFixedFunc = alwaysShowFraction ?
        (value: number) => value.toFixed(1) :
        (value: number) => toMaximumFraction(value, 1).toString();
    if (value < 1000) {
        return isInteger ? value.toString() : `${toFixedFunc(value)}`;
    }
    if (value < 1000000) {
        return `${toFixedFunc(value / 1000)}K`;
    }
    if (value < 1000000000) {
        return `${toFixedFunc(value / 1000000)}M`;
    }
    return `${toFixedFunc(value / 1000000000)}B`;
}

export function getAbbreviatedMultiplier(value: string) {
    switch (value.toLowerCase()) {
        case "k": return 1000;
        case "m": return 1000000;
        case "b": return 1000000000;
    }
    return undefined;
}

export function parseAbbreviatedNumber(valueString: string) {
    const match = valueString.match(/^\s*(-)?(\d*(?:[,.]\d*)?)([kmb])?\s*?$/i);
    if (!match) {
        return undefined;
    }
    if (!/\d/.test(match[2])) {
        return undefined;
    }
    
    const sign = match[1] === "-" ? -1 : 1;
    const digits = parseFloat(match[2].replace(",", "."));
    const magnitude = getAbbreviatedMultiplier(match[3] ?? "") ?? 1;
    const value = sign * digits * magnitude;
    return value;
}
