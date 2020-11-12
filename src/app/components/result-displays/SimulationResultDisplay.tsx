import "./SimulationResultDisplay.scss";
import React from "react";
import { SimulationDataPoint } from "../../../shared/interfaces/simulation/SimulationResult";
import { CumulativeSuccessChart } from "./CumulativeSuccessChart";
import { abbreviateValue } from "../../helper/NumberHelpers";
import { InfoBox } from "../info/InfoBox";
import { SpaceContainer } from "../common/SpaceContainer";
import { IconContainer } from "../common/IconContainer";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../common/Button";

interface Props {
    iterations: number,
    attempts: number,
    dataPoints: SimulationDataPoint[],
    isSimulationRunning: boolean,
    onRequestPlay?: () => void,
    onRequestPause?: () => void,
    onRequestPercentageCompletion?: () => void,
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
    
    render() {
        const average = this.props.iterations === 0 ? undefined :
            this.props.attempts / this.props.iterations;
        return (
            <div className="simulation-result-display-component">
                <SpaceContainer className="result-info">
                    <div>
                        <InfoBox
                            label="Iterations"
                            content={(
                                <div className="iterations-content-container">
                                    <div
                                        className="iterations-content"
                                        title={this.props.iterations.toLocaleString()}
                                    >
                                        {abbreviateValue(this.props.iterations, true)}
                                    </div>
                                    <div
                                        className="iterations-icon"
                                        title={this.props.isSimulationRunning ? "Pause" : "Play"}
                                    >
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
                                    </div>
                                </div>
                            )}
                        />
                    </div>
                    <div>
                        {average !== undefined &&
                        <InfoBox
                            label="Average rolls per completion"
                            content={average.toLocaleString(undefined, {
                                maximumFractionDigits: 2
                            })}
                        />
                        }
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