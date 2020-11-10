import React from "react";
import { CalculationMethod } from "../../shared/interfaces/CalculationMethods";
import { AnyProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { ResultDisplayType, ResultDisplayTypeEnum } from "../../shared/interfaces/ResultDisplays";
import { calculationMethods } from "../helper/CalculationMethodHelpers";
import { resultDisplays } from "../helper/ResultDisplayHelpers";
import { Button } from "./common/Button";
import { Select } from "./common/Select";
import SimulatorWorker from "worker-loader!../../simulator/Simulator.worker";
import { SimulationType } from "../../shared/interfaces/simulation/Simulation";
import { AverageResultDisplay } from "./result-displays/AverageResultDisplay";
import { CumulativeSuccessChart } from "./result-displays/CumulativeSuccessChart";
import { SimulationResult, SimulationResultType } from "../../shared/interfaces/simulation/SimulationResult";
import { ReceivedResultSimulationEvent, SimulationMainEvent, SimulationMainEventTypes } from "../../shared/interfaces/simulation/SimulationMainEvents";
import { RequestDataResultSimulationEvent, RequestResultSimulationEvent, SimulationWorkerEventType, StartSimulationEvent, StopSimulationEvent } from "../../shared/interfaces/simulation/SimulationWorkerEvents";

interface Props {
    probabilities: ProbabilityItem[],
    goals: AnyProbabilityGoal[]
}

interface State {
    displayType: ResultDisplayType,
    calculationMethod: CalculationMethod,
    simulationResult?: SimulationResult,
    isRunning: boolean
}

export class ResultDisplayContainer extends React.PureComponent<Props, State> {
    private worker: SimulatorWorker | undefined;
    
    constructor(props: Props) {
        super(props);
        
        this.state = {
            displayType: resultDisplays[0],
            calculationMethod: calculationMethods[0],
            isRunning: false
        };
        
        this.calculateResult = this.calculateResult.bind(this);
    }
    
    private async calculateResult() {
        const worker = this.worker = new SimulatorWorker();
        
        worker.onmessage = (e: MessageEvent<SimulationMainEvent>) => {
            const data = e.data;
            if (data.type === SimulationMainEventTypes.ReceivedResult) {
                if (data.result) {
                    this.setState({
                        simulationResult: data.result
                    });
                }
            }
        };
        
        let simulationType: SimulationType | undefined = undefined;
        if (this.state.displayType.type === ResultDisplayTypeEnum.AverageDisplay) {
            simulationType = SimulationType.AverageSimulation;
        }
        else if (this.state.displayType.type === ResultDisplayTypeEnum.CumulativeCompletionChartDisplay) {
            simulationType = SimulationType.CumulativeCompletionSimulation;
        }
        if (!simulationType) {
            throw new Error("SimulationType not found");
        }
        
        const startMessage: StartSimulationEvent = {
            type: SimulationWorkerEventType.StartSimulation,
            simulationType: simulationType,
            simulation: {
                calculationMethod: this.state.calculationMethod,
                probabilities: this.props.probabilities,
                goals: this.props.goals
            }
        };
        worker.postMessage(startMessage);
        
        await this.setState({
            isRunning: true
        });
        
        const requestResult = () => {
            if (simulationType === SimulationType.CumulativeCompletionSimulation) {
                const message: RequestDataResultSimulationEvent = {
                    type: SimulationWorkerEventType.RequestDataResult,
                    maxDataPoints: 50,
                    minimumDistance: 0.01
                };
                worker.postMessage(message);
            }
            else {
                const message: RequestResultSimulationEvent = {
                    type: SimulationWorkerEventType.RequestResult
                };
                worker.postMessage(message);
            }
            
            if (this.state.isRunning) {
                requestAnimationFrame(requestResult);
            }
        };
        requestResult();
    }
    
    private pauseSimulation() {
        const worker = this.worker;
        if (!worker) {
            return;
        }
        
        const message: StopSimulationEvent = {
            type: SimulationWorkerEventType.StopSimulation
        };
        worker.postMessage(message);
        
        this.setState({
            isRunning: false
        });
    }
    
    render() {
        return (
            <div>
                <Select
                    options={resultDisplays}
                    getOptionLabel={x => x.name}
                    getOptionValue={x => x.type}
                    value={this.state.displayType}
                    onChange={x => this.setState({ displayType: x! })}
                />
                <Select
                    options={calculationMethods}
                    getOptionLabel={x => x.name}
                    getOptionValue={x => x.type}
                    value={this.state.calculationMethod}
                    onChange={x => this.setState({ calculationMethod: x! })}
                />
                <Button
                    content="Calculate"
                    onClick={this.calculateResult}
                />
                
                {this.state.simulationResult &&
                <>
                    {this.state.simulationResult.type === SimulationResultType.AverageResult ?
                    <div>
                        <AverageResultDisplay
                            iterations={this.state.simulationResult.iterations}
                            attempts={this.state.simulationResult.totalAttempts}
                        />
                    </div>
                    : this.state.simulationResult.type === SimulationResultType.DataResult ?
                    <div>
                        <CumulativeSuccessChart
                            iterations={this.state.simulationResult.iterations}
                            dataPoints={this.state.simulationResult.dataPoints}
                        />
                    </div>
                    : null
                    }
                </>
                }
                
                {this.state.isRunning &&
                <div>
                    <Button
                        content="Stop"
                        onClick={() => this.pauseSimulation()}
                    />
                </div>
                }
            </div>
        );
    }
}