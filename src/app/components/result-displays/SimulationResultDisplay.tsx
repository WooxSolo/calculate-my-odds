import "./SimulationResultDisplay.scss";
import React from "react";
import { SimulationDataPoint } from "../../../shared/interfaces/simulation/SimulationResult";
import { CumulativeSuccessChart } from "./CumulativeSuccessChart";
import { abbreviateValue, toMaximumFraction } from "../../helper/NumberHelpers";
import { InfoBox } from "../info/InfoBox";
import { SpaceContainer } from "../common/SpaceContainer";
import { IconContainer } from "../common/IconContainer";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../common/Button";
import { Editable } from "../common/Editable";
import { TooltipContainer } from "../info/TooltipContainer";

interface Props {
    iterations: number,
    attempts: number,
    successfulIterations: number,
    probabilityAtIterations?: number,
    iterationsAtProbability?: number,
    highestIteration?: number,
    dataPoints: SimulationDataPoint[],
    isSimulationRunning: boolean,
    onRequestPlay?: () => void,
    onRequestPause?: () => void,
    onRequestProbabilityAtIterations?: (iterations: number) => void,
    onRequestIterationsAtProbability?: (probability: number) => void,
    onRequestNewCalculation?: () => void
}

interface State {
}

export class SimulationResultDisplay extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
        };
    }
    
    private getIterationsAtProbabilityContent() {
        if (this.props.iterationsAtProbability === undefined) {
            return undefined;
        }
        if (this.props.iterationsAtProbability === this.props.highestIteration) {
            // TODO: Change >= to an actual &ge; symbol
            return `>= ${this.props.iterationsAtProbability}`;
        }
        return this.props.iterationsAtProbability.toLocaleString();
    }
    
    private getProbabilityAtIterationsContent() {
        if (this.props.probabilityAtIterations === undefined) {
            return undefined;
        }
        if (this.props.probabilityAtIterations > 0.999) {
            return "> 99.9%";
        }
        return (this.props.probabilityAtIterations * 100).toFixed(1) + "%";
    }
    
    render() {
        const average = this.props.successfulIterations === 0 ? undefined :
            this.props.attempts / this.props.successfulIterations;
        const successRate = this.props.iterations === 0 ? undefined :
            this.props.successfulIterations / this.props.iterations;
        return (
            <div className="simulation-result-display-component">
                <SpaceContainer className="result-info">
                    <div>
                        <InfoBox
                            label="Simulated goal completions"
                            content={(
                                <div className="iterations-content-container">
                                    <TooltipContainer tooltipContent={this.props.iterations.toLocaleString()} showOnHover>
                                        <div className="iterations-content">
                                            {abbreviateValue(this.props.iterations, true, true)}
                                        </div>
                                    </TooltipContainer>
                                    <div className="iterations-icon">
                                        <TooltipContainer tooltipContent={this.props.isSimulationRunning ? "Pause" : "Play"} showOnHover>
                                            <IconContainer
                                                icon={this.props.isSimulationRunning ? faPause : faPlay}
                                                onClick={() => {
                                                    if (this.props.isSimulationRunning) {
                                                        this.props.onRequestPause?.();
                                                    }
                                                    else {
                                                        this.props.onRequestPlay?.();
                                                    }
                                                }}
                                            />
                                        </TooltipContainer>
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                    <div>
                        <InfoBox
                            label="Probability of completing goal"
                            content={successRate === undefined ? undefined : `${(successRate * 100).toFixed(1)}%`}
                        />
                    </div>
                    <div>
                        {average !== undefined &&
                        <InfoBox
                            label="Average iterations per completion"
                            content={average.toLocaleString(undefined, {
                                maximumFractionDigits: 2
                            })}
                        />
                        }
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