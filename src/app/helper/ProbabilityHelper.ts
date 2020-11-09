
export function parseProbability(probabilityString: string) {
    const match = probabilityString.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (!match) {
        return undefined;
    }
    
    const numerator = parseFloat(match[1]);
    const denominator = parseFloat(match[2]);
    if (denominator === 0) {
        return undefined;
    }
    
    return numerator / denominator;
}
