
function parseFraction(probabilityString: string) {
    const match = probabilityString.match(/^\s*(\d*(?:[,.]\d*)?)\s*\/\s*(\d*(?:[,.]\d*)?)\s*$/);
    if (!match) {
        return undefined;
    }
    if (!/\d/.test(match[1])) {
        return undefined;
    }
    if (!/\d/.test(match[2])) {
        return undefined;
    }
    
    const numerator = parseFloat(match[1].replace(",", "."));
    const denominator = parseFloat(match[2].replace(",", "."));
    if (denominator === 0) {
        return undefined;
    }
    
    const value = numerator / denominator;
    if (value < 0 || value > 1) {
        return undefined;
    }
    return value;
}

function parsePercentage(probabilityString: string) {
    const match = probabilityString.match(/^\s*(\d*(?:[,.]\d*)?)\s*%\s*$/);
    if (!match) {
        return undefined;
    }
    if (!/\d/.test(match[1])) {
        return undefined;
    }
    
    const value = parseFloat(match[1].replace(",", ".")) / 100;
    if (value < 0 || value > 1) {
        return undefined;
    }
    return value;
}

function parseValue(probabilityString: string) {
    const match = probabilityString.match(/^\s*(\d*(?:[,.]\d*)?)\s*$/);
    if (!match) {
        return undefined;
    }
    if (!/\d/.test(match[1])) {
        return undefined;
    }
    
    const value = parseFloat(match[1].replace(",", "."));
    if (value < 0 || value > 1) {
        return undefined;
    }
    return value;
}

export function parseProbability(probabilityString: string) {
    return parseFraction(probabilityString)
        ?? parsePercentage(probabilityString)
        ?? parseValue(probabilityString);
}
