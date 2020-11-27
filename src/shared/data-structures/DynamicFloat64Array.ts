import { ArrayItem } from "../interfaces/Array";

export class DynamicFloat64Array {
    private data: Float64Array;
    private count: number;
    
    constructor() {
        this.data = new Float64Array(1);
        this.count = 0;
    }
    
    get length() {
        return this.count;
    }
    
    private resize(newSize: number) {
        const newData = new Float64Array(newSize);
        for (let i = 0; i < Math.min(this.data.length, newSize); i++) {
            newData[i] = this.data[i];
        }
        this.data = newData;
    }
    
    push(value: number) {
        this.count++;
        if (this.count >= this.data.length) {
            this.resize(this.data.length * 2);
        }
        this.data[this.count - 1] = value;
    }
    
    get(index: number) {
        if (index < 0 || index >= this.count) {
            throw new Error("Out of bounds");
        }
        
        return this.data[index];
    }
    
    set(index: number, value: number) {
        if (index < 0 || index >= this.count) {
            throw new Error("Out of bounds");
        }
        
        this.data[index] = value;
    }
    
    toFloat64Array() {
        return new Float64Array(this.data);
    }
    
    toArray() {
        return [...this.data];
    }
    
    getTruncatedArray(maxItems: number, highIndex?: number) {
        const result: ArrayItem[] = [];
        
        const step = (highIndex ?? this.count - 1) / (maxItems - 1);
        for (let i = 0; i < maxItems; i++) {
            const pos = Math.round(i * step);
            result.push({
                index: pos,
                value: this.data[pos]
            });
        }
        return result;
    }
}
