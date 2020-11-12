import "./ResultDisplayContainer.scss";
import React from "react";
import { CalculationMethod, CalculationMethodType } from "../../shared/interfaces/CalculationMethods";
import { AnyProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { calculationMethods } from "../helper/CalculationMethodHelpers";
import { Button, ButtonSize } from "./common/Button";
import { Select } from "./common/Select";
import SimulatorWorker from "worker-loader!../../simulator/Simulator.worker";
import CalculationWorker from "worker-loader!../../calculator/Calculator.worker";
import { SimulationResult, SimulationResultType } from "../../shared/interfaces/simulation/SimulationResult";
import { ReceivedResultSimulationEvent, SimulationMainEvent, SimulationMainEventTypes } from "../../shared/interfaces/simulation/SimulationMainEvents";
import { RequestDataResultSimulationEvent, RequestSimpleResultSimulationEvent, SimulationWorkerEventType, StartSimulationEvent, PauseSimulationEvent, ResumeSimulationEvent, CancelSimulationEvent } from "../../shared/interfaces/simulation/SimulationWorkerEvents";
import { CalculationMainEvent, CalculationMainEventTypes } from "../../shared/interfaces/calculator/CalculationMainEvents";
import { CalculationResult, CalculationResultType } from "../../shared/interfaces/calculator/CalculationResult";
import { CalculationWorkerEventType, RequestDataResultCalculationEvent, StartCalculationEvent, PauseCalculationEvent, ResumeCalculationEvent, CancelCalculationEvent } from "../../shared/interfaces/calculator/CalculationWorkerEvents";
import { SimulationResultDisplay } from "./result-displays/SimulationResultDisplay";
import { CalculationResultDisplay } from "./result-displays/CalculationResultDisplay";
import { SpaceContainer } from "./common/SpaceContainer";

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
    private acceptingResults: boolean;
    private cancelFunc?: () => void;
    
    constructor(props: Props) {
        super(props);
        
        this.acceptingResults = false;
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
                if (this.acceptingResults && data.result) {
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
                if (this.acceptingResults && data.result) {
                    this.setState({
                        calculationResult: data.result
                    });
                }
            }
            else if (data.type === CalculationMainEventTypes.FinishedCalculation) {
                this.cancelRunningCalculation();
                this.setState({
                    isRunning: false
                });
                
                this.requestCalculationResult();
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
        
        this.acceptingResults = true;
        await this.setState({
            isRunning: true,
            simulationResult: undefined,
            calculationResult: undefined
        });
        
        this.startRequestingSimulationResult();
    }
    
    private startRequestingSimulationResult() {
        let finished = false;
        this.cancelFunc = () => {
            finished = true;
            
            const message: CancelSimulationEvent = {
                type: SimulationWorkerEventType.CancelSimulation
            };
            this.simulationWorker.postMessage(message);
        };
        const requestResult = () => {
            if (finished) return;
            
            const message: RequestDataResultSimulationEvent = {
                type: SimulationWorkerEventType.RequestDataResult,
                maxDataPoints: 50,
                minimumDistance: 0.01
            };
            this.simulationWorker.postMessage(message);
            
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
        
        this.acceptingResults = true;
        await this.setState({
            isRunning: true,
            calculationResult: undefined,
            simulationResult: undefined
        });
        
        this.startRequestingCalculationResult();
    }
    
    private requestCalculationResult() {
        const message: RequestDataResultCalculationEvent = {
            type: CalculationWorkerEventType.RequestDataResult,
            maxDataPoints: 50,
            minimumDistance: 0.01
        };
        this.calculationWorker.postMessage(message);
    }
    
    private startRequestingCalculationResult() {
        let finished = false;
        this.cancelFunc = () => {
            finished = true;
            
            const message: CancelCalculationEvent = {
                type: CalculationWorkerEventType.CancelCalculation
            };
            this.simulationWorker.postMessage(message);
        };
        const requestResult = () => {
            if (finished) return;
            
            this.requestCalculationResult();
            
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
    
    private async resumeSimulation() {
        if (this.simulationWorker) {
            const message: ResumeSimulationEvent = {
                type: SimulationWorkerEventType.ResumeSimulation
            };
            this.simulationWorker.postMessage(message);
        }
        if (this.calculationWorker) {
            const message: ResumeCalculationEvent = {
                type: CalculationWorkerEventType.ResumeCalculation
            };
            this.calculationWorker.postMessage(message);
        }
        
        await this.setState({
            isRunning: true
        });
        
        this.startRequestingSimulationResult();
    }
    
    private pauseSimulation() {
        if (this.simulationWorker) {
            const message: PauseSimulationEvent = {
                type: SimulationWorkerEventType.PauseSimulation
            };
            this.simulationWorker.postMessage(message);
        }
        if (this.calculationWorker) {
            const message: PauseCalculationEvent = {
                type: CalculationWorkerEventType.PauseCalculation
            };
            this.calculationWorker.postMessage(message);
        }
        
        this.setState({
            isRunning: false
        });
    }
    
    private clearResult() {
        this.acceptingResults = false;
        this.cancelRunningCalculation();
        
        this.setState({
            simulationResult: undefined,
            calculationResult: undefined,
            isRunning: false
        });
    }
    
    render() {
        return (
            <div className="result-display-container-component">
                <>
                    {this.state.simulationResult &&
                    <>
                        {this.state.simulationResult.type === SimulationResultType.DataResult ?
                        <div>
                            <SimulationResultDisplay
                                iterations={this.state.simulationResult.iterations}
                                attempts={this.state.simulationResult.attempts}
                                dataPoints={this.state.simulationResult.dataPoints}
                                isSimulationRunning={this.state.isRunning}
                                onRequestPlay={() => this.resumeSimulation()}
                                onRequestPause={() => this.pauseSimulation()}
                                onRequestNewCalculation={() => this.clearResult()}
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
                                onRequestNewCalculation={() => this.clearResult()}
                            />
                        </div>
                        : null
                        }
                    </>
                    }
                </>
                
                {(!this.state.simulationResult && !this.state.calculationResult) &&
                <SpaceContainer>
                    <div>
                        <label>Method</label>
                        <Select
                            options={calculationMethods}
                            getOptionLabel={x => x.name}
                            getOptionValue={x => x.type}
                            value={this.state.calculationMethod}
                            onChange={x => this.setState({ calculationMethod: x! })}
                            width="14em"
                        />
                    </div>
                    <div>
                        <Button
                            content="Calculate"
                            onClick={this.calculateResult}
                            size={ButtonSize.Large}
                        />
                    </div>
                </SpaceContainer>
                }
            </div>
        );
    }
}