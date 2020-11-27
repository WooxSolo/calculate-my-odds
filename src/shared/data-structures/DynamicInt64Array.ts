import { BigintArrayItem } from "../interfaces/Array";

export class DynamicInt64Array {
    private data: BigInt64Array;
    private count: number;
    
    constructor() {
        this.data = new BigInt64Array(1);
        this.count = 0;
    }
    
    get length() {
        return this.count;
    }
    
    private resize(newSize: number) {
        const newData = new BigInt64Array(newSize);
        for (let i = 0; i < Math.min(newSize, this.data.length); i++) {
            newData[i] = this.data[i];
        }
        this.data = newData;
    }
    
    push(value: bigint) {
        this.count++;
        if (this.count >= this.data.length) {
            this.resize(this.data.length * 2);
        }
        this.data[this.count - 1] = value;
    }
    
    ensureMinimumSize(size: number) {
        if (this.count >= size) {
            return;
        }
        
        let mul = 1;
        while (size > this.data.length * mul) {
            mul *= 2;
        }
        this.resize(this.data.length * mul);
        this.count = size;
    }
    
    get(index: number) {
        if (index < 0 || index >= this.count) {
            throw new Error("Out of bounds");
        }
        
        return this.data[index];
    }
    
    set(index: number, value: bigint) {
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
        const result: BigintArrayItem[] = [];
        
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
