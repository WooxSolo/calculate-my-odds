
// TODO: Allow parsing of e.g. ".2"

function parseFraction(probabilityString: string) {
    const match = probabilityString.match(/^\s*(\d+(?:[,.]\d*)?)\s*\/\s*(\d+(?:[,.]\d*)?)\s*$/);
    if (!match) {
        return undefined;
    }
    
    const numerator = parseFloat(match[1].replace(",", "."));
    const denominator = parseFloat(match[2].replace(",", "."));
    if (denominator === 0) {
        return undefined;
    }
    
    return numerator / denominator;
}

function parsePercentage(probabilityString: string) {
    const match = probabilityString.match(/^\s*(\d+(?:[,.]\d*)?)\s*%\s*$/);
    if (!match) {
        return undefined;
    }
    
    const value = parseFloat(match[1].replace(",", "."));
    return value / 100;
}

function parseValue(probabilityString: string) {
    const match = probabilityString.match(/^\s*(\d+(?:[,.]\d*)?)\s*$/);
    if (!match) {
        return undefined;
    }
    
    const value = parseFloat(match[1].replace(",", "."));
    return value;
}

export function parseProbability(probabilityString: string) {
    return parseFraction(probabilityString)
        ?? parsePercentage(probabilityString)
        ?? parseValue(probabilityString);
}
