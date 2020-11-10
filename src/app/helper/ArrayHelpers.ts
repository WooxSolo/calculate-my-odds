
export function createArraySequence(length: number) {
    const array = new Array(length + 1);
    for (let i = 0; i < array.length; i++) {
        array[i] = i;
    }
    return array;
}
