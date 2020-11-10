import { ResultDisplayType, ResultDisplayTypeEnum } from "../../shared/interfaces/ResultDisplays";

export const resultDisplays: ResultDisplayType[] = [
    {
        type: ResultDisplayTypeEnum.AverageDisplay,
        name: "Average"
    },
    {
        type: ResultDisplayTypeEnum.CumulativeCompletionChartDisplay,
        name: "Cumulative completion chart"
    }
];
