import "./CalculationResultDisplay.scss";
import React from "react";
import { CalculationDataPoint } from "../../../shared/interfaces/calculator/CalculationResult";
import { CumulativeSuccessChart } from "./CumulativeSuccessChart";
import { SpaceContainer } from "../common/SpaceContainer";
import { InfoBox } from "../info/InfoBox";
import { Button } from "../common/Button";
import { Editable } from "../common/Editable";
import { EditableInteger } from "../common/EditableInteger";
import { EditableNumber } from "../common/EditableNumber";

interface Props {
    totalIterations?: number,
    average: number,
    completionRate: number,
    failureRate: number
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
            return `>= ${(this.props.totalIterations).toLocaleString()}`;
        }
        return this.props.iterationsAtProbability.toLocaleString();
    }
    
    private getProbabilityAtIterationsContent() {
        if (this.props.probabilityAtIterations === undefined) {
            return undefined;
        }
        const progress = this.props.completionRate + this.props.failureRate;
        if (this.props.probabilityAtIterations > 0.999 && progress < 1) {
            return "> 99.9%";
        }
        return (this.props.probabilityAtIterations * 100).toFixed(1) + "%";
    }
    
    private getProgress() {
        const completionRate = this.props.completionRate;
        const failureRate = this.props.failureRate;
        const progress = completionRate + failureRate;
        let fractionDigits = 1;
        if (progress < 1) {
            for (let i = 3; i < 16; i++) {
                if (progress > 1 - Math.pow(10, -i)) {
                    fractionDigits++;
                }
            }
        }
        return `${(progress * 100).toFixed(fractionDigits)}%`;
    }
    
    render() {
        const average = this.props.completionRate === 0 ? 0 :
            this.props.average / this.props.completionRate;
        return (
            <div className="calculation-result-display-component">
                <SpaceContainer className="result-info">
                    <div>
                        <InfoBox
                            label="Progress"
                            content={this.getProgress()}
                        />
                    </div>
                    <div>
                        <InfoBox
                            label="Probability of completing goal"
                            content={`${(this.props.completionRate * 100).toFixed(1)}%`}
                        />
                    </div>
                    <div>
                        <InfoBox
                            label="Average iterations per completion"
                            content={average.toLocaleString(undefined, {
                                maximumFractionDigits: 2
                            })}
                        />
                    </div>
                    <div>
                        <InfoBox
                            label={(
                                <span>
                                    Iterations until {" "}
                                    <EditableNumber
                                        initialValue={50}
                                        append="%"
                                        onChange={value => this.props.onRequestIterationsAtProbability?.(value / 100)}
                                        min={0}
                                        max={100}
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
                                    Chance of completion after {" "}
                                    <EditableInteger
                                        initialValue={73}
                                        onChange={value => this.props.onRequestProbabilityAtIterations?.(value)}
                                        min={0}
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
                        dataPoints={this.props.dataPoints.map(x => ({
                            completions: x.completions,
                            probability: this.props.completionRate === 0 ? 0 : x.probability / this.props.completionRate
                        }))}
                    />
                </div>
            </div>
        );
    }
}