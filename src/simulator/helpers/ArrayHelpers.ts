import { DynamicInt64Array } from "../../shared/data-structures/DynamicInt64Array";
import { ArrayItem } from "../../shared/interfaces/Array";

export function getTruncatedArrayItems(array: DynamicInt64Array, maxItems: number,
        highIndex: number, transformValue: (value: number) => number): ArrayItem[] {
    if (maxItems >= highIndex) {
        return [...array.toArray().slice(0, highIndex + 1)].map((x, index) => ({
            index: index,
            value: transformValue(Number(x))
        }));
    }
    if (maxItems <= 0 || array.length === 0) {
        return [];
    }
    if (maxItems === 1) {
        // TODO
        throw new Error();
    }
    
    const step = highIndex / (maxItems - 1);
    const result: ArrayItem[] = [];
    for (let i = 0; i < maxItems; i++) {
        const pos = Math.min(Math.round(i * step), array.length - 1);
        result.push({
            index: pos,
            value: transformValue(Number(array.get(pos)))
        });
    }
    return result;
}
