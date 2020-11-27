
export function binarySearchIntegerInc(min: number, max: number, testFunc: (mid: number) => boolean) {
    while (min <= max) {
        const mid = (min + max) >> 1;
        if (testFunc(mid)) {
            max = mid - 1;
        }
        else {
            min = mid + 1;
        }
    }
    return min;
}

export function binarySearchIntegerDec(min: number, max: number, testFunc: (mid: number) => boolean) {
    while (min <= max) {
        const mid = (min + max) >> 1;
        if (testFunc(mid)) {
            min = mid + 1;
        }
        else {
            max = mid - 1;
        }
    }
    return max;
}
