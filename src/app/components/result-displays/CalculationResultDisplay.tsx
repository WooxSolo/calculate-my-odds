import "./CalculationResultDisplay.scss";
import React from "react";
import { CalculationDataPoint } from "../../../shared/interfaces/calculator/CalculationResult";
import { CumulativeSuccessChart } from "./CumulativeSuccessChart";
import { SpaceContainer } from "../common/SpaceContainer";
import { InfoBox } from "../info/InfoBox";
import { Button } from "../common/Button";
import { Editable } from "../common/Editable";

interface Props {
    totalIterations?: number,
    maximumErrorRange: number,
    average: number,
    dataPoints: CalculationDataPoint[],
    probabilityAtIterations?: number,
    iterationsAtProbability?: number,
    onRequestProbabilityAtIterations?: (iterations: number) => void,
    onRequestIterationsAtProbability?: (probability: number) => void,
    onRequestNewCalculation?: () => void,
}

interface State {

}

export class CalculationResultDisplay extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {

        };
    }
    
    private getIterationsAtProbabilityContent() {
        if (this.props.totalIterations === undefined) {
            return undefined;
        }
        if (this.props.iterationsAtProbability === undefined) {
            return undefined;
        }
        if (this.props.iterationsAtProbability >= this.props.totalIterations) {
            return `>${(this.props.totalIterations - 1).toLocaleString()}`;
        }
        return this.props.iterationsAtProbability.toLocaleString();
    }
    
    private getProbabilityAtIterationsContent() {
        if (this.props.probabilityAtIterations === undefined) {
            return undefined;
        }
        if (this.props.probabilityAtIterations > 0.999) {
            return ">99.9%";
        }
        return (this.props.probabilityAtIterations * 100).toFixed(1) + "%";
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
                            label="Average iterations per completion"
                            content={this.props.average.toLocaleString(undefined, {
                                maximumFractionDigits: 2
                            })}
                        />
                    </div>
                    <div>
                        <InfoBox
                            label={(
                                <span>
                                    Iterations until {" "}
                                    <Editable
                                        initialValue={"50"}
                                        append="%"
                                        onChange={value => {
                                            this.setState({ percentageValue: value });
                                            // TODO: Error handling
                                            const probability = parseFloat(value) / 100;
                                            this.props.onRequestIterationsAtProbability?.(probability);
                                        }}
                                    />
                                    {" "} chance of completion
                                </span>
                            )}
                            content={this.getIterationsAtProbabilityContent()}
                        />
                    </div>
                    <div>
                        <InfoBox
                            label={(
                                <span>
                                    Chance of completion at {" "}
                                    <Editable
                                        initialValue={"73"}
                                        onChange={value => {
                                            this.setState({ iterationsValue: value });
                                            // TODO: Error handling
                                            const iterations = parseInt(value);
                                            this.props.onRequestProbabilityAtIterations?.(iterations);
                                        }}
                                    />
                                    {" "} iterations
                                </span>
                            )}
                            content={this.getProbabilityAtIterationsContent()}
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