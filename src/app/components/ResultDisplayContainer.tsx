import React from "react";
import { CalculationMethod, CalculationMethodType } from "../../shared/interfaces/CalculationMethods";
import { AnyProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { calculationMethods } from "../helper/CalculationMethodHelpers";
import { Button } from "./common/Button";
import { Select } from "./common/Select";
import SimulatorWorker from "worker-loader!../../simulator/Simulator.worker";
import CalculationWorker from "worker-loader!../../calculator/Calculator.worker";
import { AverageResultDisplay } from "./result-displays/AverageResultDisplay";
import { CumulativeSuccessChart } from "./result-displays/CumulativeSuccessChart";
import { SimulationResult, SimulationResultType } from "../../shared/interfaces/simulation/SimulationResult";
import { ReceivedResultSimulationEvent, SimulationMainEvent, SimulationMainEventTypes } from "../../shared/interfaces/simulation/SimulationMainEvents";
import { RequestDataResultSimulationEvent, RequestSimpleResultSimulationEvent, SimulationWorkerEventType, StartSimulationEvent, StopSimulationEvent } from "../../shared/interfaces/simulation/SimulationWorkerEvents";
import { CalculationMainEvent, CalculationMainEventTypes } from "../../shared/interfaces/calculator/CalculationMainEvents";
import { CalculationResult, CalculationResultType } from "../../shared/interfaces/calculator/CalculationResult";
import { CalculationWorkerEventType, RequestDataResultCalculationEvent, StartCalculationEvent, StopCalculationEvent } from "../../shared/interfaces/calculator/CalculationWorkerEvents";
import { SimulationResultDisplay } from "./result-displays/SimulationResultDisplay";
import { CalculationResultDisplay } from "./result-displays/CalculationResultDisplay";

interface Props {
    probabilities: ProbabilityItem[],
    goals: AnyProbabilityGoal[]
}

interface State {
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
        
        const startMessage: StartSimulationEvent = {
            type: SimulationWorkerEventType.StartSimulation,
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
            
            const message: RequestDataResultSimulationEvent = {
                type: SimulationWorkerEventType.RequestDataResult,
                maxDataPoints: 50,
                minimumDistance: 0.01
            };
            worker.postMessage(message);
            
            if (this.state.isRunning) {
                requestAnimationFrame(requestResult);
            }
        };
        requestResult();
    }
    
    private async startCalculation() {
        const worker = this.calculationWorker;
        
        const startMessage: StartCalculationEvent = {
            type: CalculationWorkerEventType.StartCalculation,
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
            
            const message: RequestDataResultCalculationEvent = {
                type: CalculationWorkerEventType.RequestDataResult,
                maxDataPoints: 50,
                minimumDistance: 0.01
            };
            worker.postMessage(message);
            
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
                    {this.state.simulationResult.type === SimulationResultType.DataResult ?
                    <div>
                        <SimulationResultDisplay
                            iterations={this.state.simulationResult.iterations}
                            attempts={this.state.simulationResult.attempts}
                            dataPoints={this.state.simulationResult.dataPoints}
                        />
                    </div>
                    : null
                    }
                </>
                }
                
                {this.state.calculationResult &&
                <>
                    {this.state.calculationResult.type === CalculationResultType.DataResult ?
                    <div>
                        <CalculationResultDisplay
                            maximumErrorRange={this.state.calculationResult.maximumErrorRange}
                            average={this.state.calculationResult.average}
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