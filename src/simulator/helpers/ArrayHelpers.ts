
export function calculatePrefixSum(array: number[]) {
    const result: number[] = new Array(array.length);
    let curr = 0;
    for (let i = 0; i < array.length; i++) {
        curr += array[i];
        result[i] = curr;
    }
    return result;
}

export function getTruncatedArrayItems(array: any[], maxItems: number) {
    if (maxItems >= array.length) {
        return [...array];
    }
    if (maxItems <= 0) {
        return [];
    }
    if (maxItems === 1) {
        // TODO
        throw new Error();
    }
    
    const step = (array.length - 1) / (maxItems - 1);
    const result: any[] = [];
    for (let i = 0; i < maxItems; i++) {
        const pos = Math.round(i * step);
        result.push(array[pos]);
    }
    return result;
}
