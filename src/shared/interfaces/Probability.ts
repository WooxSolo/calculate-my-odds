
export interface ProbabilityTable {
    id: string,
    name: string,
    items: ProbabilityItem[],
    rollsPerIteration: number
}

export interface ProbabilityItem {
    id: string,
    name: string,
    probabilityDisplay: string,
    probability?: number,
}
