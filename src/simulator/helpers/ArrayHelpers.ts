import { ArrayItem } from "../../shared/interfaces/Array";

export function getTruncatedArrayItems(array: Float64Array, maxItems: number, highIndex?: number): ArrayItem[] {
    if (highIndex === undefined) {
        highIndex = array.length - 1;
    }
    
    if (maxItems >= highIndex) {
        return [...array.slice(0, highIndex + 1)].map((x, index) => ({
            index: index,
            value: x
        }));
    }
    if (maxItems <= 0) {
        return [];
    }
    if (maxItems === 1) {
        // TODO
        throw new Error();
    }
    
    const step = highIndex / (maxItems - 1);
    const result: ArrayItem[] = [];
    for (let i = 0; i < maxItems; i++) {
        const pos = Math.round(i * step);
        result.push({
            index: pos,
            value: array[pos]
        });
    }
    return result;
}
