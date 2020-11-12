import "./CalculationResultDisplay.scss";
import React from "react";
import { CalculationDataPoint } from "../../../shared/interfaces/calculator/CalculationResult";
import { CumulativeSuccessChart } from "./CumulativeSuccessChart";
import { SpaceContainer } from "../common/SpaceContainer";
import { InfoBox } from "../info/InfoBox";
import { Button } from "../common/Button";

interface Props {
    maximumErrorRange: number,
    average: number,
    dataPoints: CalculationDataPoint[],
    onRequestNewCalculation?: () => void
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
            <div className="calculation-result-display-component">
                <SpaceContainer className="result-info">
                    <div>
                        <InfoBox
                            label="Max point error range"
                            content={`${(this.props.maximumErrorRange * 100).toFixed(4)}%`}
                        />
                    </div>
                    <div>
                        <InfoBox
                            label="Average rolls per completion"
                            content={this.props.average.toLocaleString(undefined, {
                                maximumFractionDigits: 2
                            })}
                        />
                    </div>
                    <div>
                        <Button
                            content="New calculation"
                            onClick={this.props.onRequestNewCalculation}
                        />
                    </div>
                </SpaceContainer>
                <div className="result-chart">
                    <CumulativeSuccessChart
                        dataPoints={this.props.dataPoints}
                    />
                </div>
            </div>
        );
    }
}