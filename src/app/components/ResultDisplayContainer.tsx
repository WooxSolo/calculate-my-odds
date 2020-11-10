import React from "react";
import { CalculationMethod, CalculationMethodType } from "../../shared/interfaces/CalculationMethods";
import { AnyProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { ResultDisplayType, ResultDisplayTypeEnum } from "../../shared/interfaces/ResultDisplays";
import { calculationMethods } from "../helper/CalculationMethodHelpers";
import { resultDisplays } from "../helper/ResultDisplayHelpers";
import { Button } from "./common/Button";
import { Select } from "./common/Select";
import SimulatorWorker from "worker-loader!../../simulator/Simulator.worker";
import CalculationWorker from "worker-loader!../../calculator/Calculator.worker";
import { SimulationType } from "../../shared/interfaces/simulation/Simulation";
import { AverageResultDisplay } from "./result-displays/AverageResultDisplay";
import { CumulativeSuccessChart } from "./result-displays/CumulativeSuccessChart";
import { SimulationResult, SimulationResultType } from "../../shared/interfaces/simulation/SimulationResult";
import { ReceivedResultSimulationEvent, SimulationMainEvent, SimulationMainEventTypes } from "../../shared/interfaces/simulation/SimulationMainEvents";
import { RequestDataResultSimulationEvent, RequestSimpleResultSimulationEvent, SimulationWorkerEventType, StartSimulationEvent, StopSimulationEvent } from "../../shared/interfaces/simulation/SimulationWorkerEvents";
import { CalculationMainEvent, CalculationMainEventTypes } from "../../shared/interfaces/calculator/CalculationMainEvents";
import { CalculationResult, CalculationResultType } from "../../shared/interfaces/calculator/CalculationResult";
import { CalculationType } from "../../shared/interfaces/calculator/Calculation";
import { CalculationWorkerEventType, RequestDataResultCalculationEvent, RequestSimpleResultCalculationEvent, StartCalculationEvent, StopCalculationEvent } from "../../shared/interfaces/calculator/CalculationWorkerEvents";

interface Props {
    probabilities: ProbabilityItem[],
    goals: AnyProbabilityGoal[]
}

interface State {
    displayType: ResultDisplayType,
    calculationMethod: CalculationMethod,
    // TODO: Merge SimulationResult and CalculationResult into one type
    simulationResult?: SimulationResult,
    calculationResult?: CalculationResult,
    isRunning: boolean
}

export class ResultDisplayContainer extends React.PureComponent<Props, State> {
    // TODO: Merge simulationWorker and calculationWorker into one worker
    private simulationWorker: SimulatorWorker;
    private calculationWorker: CalculationWorker;
    private cancelFunc?: () => void;
    
    constructor(props: Props) {
        super(props);
        
        this.simulationWorker = new SimulatorWorker();
        this.calculationWorker = new CalculationWorker();
        
        this.setupSimulationWorkerMessageEvent();
        this.setupCalculationWorkerMessageEvent();
        
        this.state = {
            displayType: resultDisplays[0],
            calculationMethod: calculationMethods[0],
            isRunning: false
        };
        
        this.calculateResult = this.calculateResult.bind(this);
    }
    
    private setupSimulationWorkerMessageEvent() {
        this.simulationWorker.onmessage = (e: MessageEvent<SimulationMainEvent>) => {
            const data = e.data;
            if (data.type === SimulationMainEventTypes.ReceivedResult) {
                if (data.result) {
                    this.setState({
                        simulationResult: data.result
                    });
                }
            }
        };
    }
    
    private setupCalculationWorkerMessageEvent() {
        this.calculationWorker.onmessage = (e: MessageEvent<CalculationMainEvent>) => {
            const data = e.data;
            if (data.type === CalculationMainEventTypes.ReceivedResult) {
                if (data.result) {
                    if (Math.random() < 0.01) {
                        console.log("result", data.result);
                    }
                    this.setState({
                        calculationResult: data.result
                    });
                }
            }
        };
    }
    
    private cancelRunningCalculation() {
        this.cancelFunc?.();
        this.cancelFunc = undefined;
    }
    
    private async startSimulation() {
        const worker = this.simulationWorker;
        
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
                probabilities: this.props.probabilities,
                goals: this.props.goals
            }
        };
        worker.postMessage(startMessage);
        
        await this.setState({
            isRunning: true
        });
        
        let finished = false;
        this.cancelFunc = () => finished = true;
        const requestResult = () => {
            if (finished) return;
            
            if (simulationType === SimulationType.CumulativeCompletionSimulation) {
                const message: RequestDataResultSimulationEvent = {
                    type: SimulationWorkerEventType.RequestDataResult,
                    maxDataPoints: 50,
                    minimumDistance: 0.01
                };
                worker.postMessage(message);
            }
            else {
                const message: RequestSimpleResultSimulationEvent = {
                    type: SimulationWorkerEventType.RequestSimpleResult
                };
                worker.postMessage(message);
            }
            
            if (this.state.isRunning) {
                requestAnimationFrame(requestResult);
            }
        };
        requestResult();
    }
    
    private async startCalculation() {
        const worker = this.calculationWorker;
        
        let calculationType: CalculationType | undefined = undefined;
        if (this.state.displayType.type === ResultDisplayTypeEnum.AverageDisplay) {
            calculationType = CalculationType.Average;
        }
        else if (this.state.displayType.type === ResultDisplayTypeEnum.CumulativeCompletionChartDisplay) {
            calculationType = CalculationType.CumulativeCompletion;
        }
        if (!calculationType) {
            throw new Error("CalculationType not found");
        }
        
        const startMessage: StartCalculationEvent = {
            type: CalculationWorkerEventType.StartCalculation,
            calculationType: calculationType,
            calculation: {
                probabilities: this.props.probabilities,
                goals: this.props.goals
            }
        };
        worker.postMessage(startMessage);
        
        await this.setState({
            isRunning: true
        });
        
        let finished = false;
        this.cancelFunc = () => finished = true;
        const requestResult = () => {
            if (finished) return;
            
            if (calculationType === CalculationType.CumulativeCompletion) {
                const message: RequestDataResultCalculationEvent = {
                    type: CalculationWorkerEventType.RequestDataResult,
                    maxDataPoints: 50,
                    minimumDistance: 0.01
                };
                worker.postMessage(message);
            }
            else {
                const message: RequestSimpleResultCalculationEvent = {
                    type: CalculationWorkerEventType.RequestSimpleResult
                };
                worker.postMessage(message);
            }
            
            if (this.state.isRunning) {
                requestAnimationFrame(requestResult);
            }
        };
        requestResult();
    }
    
    private async calculateResult() {
        this.cancelRunningCalculation();
        
        if (this.state.calculationMethod.type === CalculationMethodType.Simulation) {
            this.startSimulation();
        }
        else if (this.state.calculationMethod.type === CalculationMethodType.Calculation) {
            this.startCalculation();
        }
    }
    
    private pauseSimulation() {
        if (this.simulationWorker) {
            const message: StopSimulationEvent = {
                type: SimulationWorkerEventType.StopSimulation
            };
            this.simulationWorker.postMessage(message);
        }
        if (this.calculationWorker) {
            const message: StopCalculationEvent = {
                type: CalculationWorkerEventType.StopCalculation
            };
            this.calculationWorker.postMessage(message);
        }
        
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
                            dataPoints={this.state.simulationResult.dataPoints}
                        />
                    </div>
                    : null
                    }
                </>
                }
                
                {this.state.calculationResult &&
                <>
                    {this.state.calculationResult.type === CalculationResultType.AverageResult ?
                    <div>
                        TODO: Display result
                    </div>
                    : this.state.calculationResult.type === CalculationResultType.DataResult ?
                    <div>
                        <CumulativeSuccessChart
                            dataPoints={this.state.calculationResult.dataPoints}
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