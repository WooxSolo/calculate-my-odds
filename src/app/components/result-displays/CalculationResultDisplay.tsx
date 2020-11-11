import React from "react";
import { CalculationDataPoint } from "../../../shared/interfaces/calculator/CalculationResult";
import { CumulativeSuccessChart } from "./CumulativeSuccessChart";

interface Props {
    maximumErrorRange: number,
    average: number,
    dataPoints: CalculationDataPoint[]
}

interface State {

}

export class CalculationResultDisplay extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {

        };
    }

    render() {
        return (
            <div>
                <div>
                    Maximum error range: {this.props.maximumErrorRange}
                </div>
                <div>
                    Average rolls per completion: {this.props.average}
                </div>
                <div>
                    <CumulativeSuccessChart
                        dataPoints={this.props.dataPoints}
                    />
                </div>
            </div>
        );
    }
}