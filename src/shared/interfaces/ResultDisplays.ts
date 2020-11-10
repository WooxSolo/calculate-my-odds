
export enum ResultDisplayTypeEnum {
    AverageDisplay,
    CumulativeCompletionChartDisplay
}

export interface ResultDisplayType {
    type: ResultDisplayTypeEnum,
    name: string
}
