import "./ResultDisplayContainer.scss";
import React from "react";
import { CalculationMethod, CalculationMethodType } from "../../shared/interfaces/CalculationMethods";
import { AnyProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem, ProbabilityTable } from "../../shared/interfaces/Probability";
import { calculationMethods } from "../helper/CalculationMethodHelpers";
import { Button, ButtonSize } from "./common/Button";
import { Select } from "./common/Select";
import SimulatorWorker from "worker-loader!../../simulator/Simulator.worker";
import CalculationWorker from "worker-loader!../../calculator/Calculator.worker";
import { SimulationResult, SimulationResultType } from "../../shared/interfaces/simulation/SimulationResult";
import { SimulationMainEvent, SimulationMainEventTypes } from "../../shared/interfaces/simulation/SimulationMainEvents";
import { RequestDataResultSimulationEvent, SimulationWorkerEventType, StartSimulationEvent, PauseSimulationEvent, ResumeSimulationEvent, CancelSimulationEvent, RequestProbabilityAtIterations, RequestIterationsAtProbability } from "../../shared/interfaces/simulation/SimulationWorkerEvents";
import { CalculationMainEvent, CalculationMainEventTypes } from "../../shared/interfaces/calculator/CalculationMainEvents";
import { CalculationResult, CalculationResultType } from "../../shared/interfaces/calculator/CalculationResult";
import { CalculationWorkerEventType, RequestDataResultCalculationEvent, StartCalculationEvent, PauseCalculationEvent, ResumeCalculationEvent, CancelCalculationEvent } from "../../shared/interfaces/calculator/CalculationWorkerEvents";
import { SimulationResultDisplay } from "./result-displays/SimulationResultDisplay";
import { CalculationResultDisplay } from "./result-displays/CalculationResultDisplay";
import { SpaceContainer } from "./common/SpaceContainer";
import { nextUniqueId } from "../helper/IdHelpers";

interface Props {
    tables: ProbabilityTable[],
    goals: AnyProbabilityGoal[]
}

interface State {
    calculationMethod: CalculationMethod,
    // TODO: Merge SimulationResult and CalculationResult into one type
    simulationResult?: SimulationResult,
    calculationResult?: CalculationResult,
    isRunning: boolean,
    totalCalculationIterations?: number,
    probabilityAtIterations?: number,
    iterationsAtProbability?: number,
    highestIteration?: number
}

export class ResultDisplayContainer extends React.PureComponent<Props, State> {
    // TODO: Merge simulationWorker and calculationWorker into one worker
    // or maybe move them into the SimulationResultDisplay/CalculationResultDisplay
    private simulationWorker: SimulatorWorker;
    private calculationWorker: CalculationWorker;
    private awaitingResultId?: number;
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
                if (data.requestId === this.awaitingResultId && data.result) {
                    this.setState({
                        simulationResult: data.result,
                        probabilityAtIterations: data.result.probabilityAtIterations,
                        iterationsAtProbability: data.result.iterationsAtProbability,
                        highestIteration: data.result.highestIteration
                    });
                    this.awaitingResultId = undefined;
                }
            }
            else if (data.type === SimulationMainEventTypes.ReceivedIterationsAtProbability) {
                this.setState({
                    iterationsAtProbability: data.iterations
                });
            }
            else if (data.type === SimulationMainEventTypes.ReceivedProbabilityAtIterations) {
                this.setState({
                    probabilityAtIterations: data.probability
                })
            }
        };
    }
    
    private setupCalculationWorkerMessageEvent() {
        this.calculationWorker.onmessage = (e: MessageEvent<CalculationMainEvent>) => {
            const data = e.data;
            if (data.type === CalculationMainEventTypes.ReceivedResult) {
                if (data.requestId === this.awaitingResultId && data.result) {
                    this.setState({
                        calculationResult: data.result,
                        totalCalculationIterations: data.result.totalIterations,
                        iterationsAtProbability: data.result.iterationsAtProbability,
                        probabilityAtIterations: data.result.probabilityAtIterations
                    });
                    this.awaitingResultId = undefined;
                }
            }
            else if (data.type === CalculationMainEventTypes.ReceivedIterationsAtProbability) {
                this.setState({
                    iterationsAtProbability: data.iterations
                });
            }
            else if (data.type === CalculationMainEventTypes.ReceivedProbabilityAtIterations) {
                this.setState({
                    probabilityAtIterations: data.probability
                })
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
                tables: this.props.tables,
                goals: this.props.goals
            },
            initialIterationsAtProbability: 0.5,
            initialProbabilityAtIterations: 73
        };
        worker.postMessage(startMessage);
        
        await this.setState({
            isRunning: true,
            simulationResult: undefined,
            calculationResult: undefined
        });
        
        this.startRequestingSimulationResult();
    }
    
    private requestSimulationResult() {
        if (this.awaitingResultId) {
            return;
        }
        
        this.awaitingResultId = nextUniqueId();
        const message: RequestDataResultSimulationEvent = {
            type: SimulationWorkerEventType.RequestDataResult,
            requestId: this.awaitingResultId,
            maxDataPoints: 50,
            minimumDistance: 0.01
        };
        this.simulationWorker.postMessage(message);
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
            
            this.requestSimulationResult();
            
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
                tables: this.props.tables,
                goals: this.props.goals
            },
            initialIterationsAtProbability: 0.5,
            initialProbabilityAtIterations: 73
        };
        worker.postMessage(startMessage);
        
        await this.setState({
            isRunning: true,
            totalCalculationIterations: 0,
            calculationResult: undefined,
            simulationResult: undefined
        });
        
        this.startRequestingCalculationResult();
    }
    
    private requestCalculationResult() {
        if (this.awaitingResultId) {
            return;
        }
        
        this.awaitingResultId = nextUniqueId();
        const message: RequestDataResultCalculationEvent = {
            type: CalculationWorkerEventType.RequestDataResult,
            requestId: this.awaitingResultId,
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
        this.awaitingResultId = undefined;
        
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
        this.awaitingResultId = undefined;
        this.cancelRunningCalculation();
        
        this.setState({
            simulationResult: undefined,
            calculationResult: undefined,
            isRunning: false
        });
    }
    
    private getStartButtonText() {
        if (this.state.calculationMethod.type === CalculationMethodType.Simulation) {
            return "Simulate";
        }
        if (this.state.calculationMethod.type === CalculationMethodType.Calculation) {
            return "Calculate";
        }
        throw new Error();
    }
    
    render() {        
        return (
            <div className="result-display-container-component">
                {(this.state.calculationResult || this.state.simulationResult) &&
                <div className="result-display-result">
                    {/*
                    TODO: Probably reuse some code in calculator display and simulation display
                    instead of both having rather similar code
                    */}
                    
                    {this.state.simulationResult &&
                    <>
                        {this.state.simulationResult.type === SimulationResultType.DataResult ?
                        <SimulationResultDisplay
                            iterations={this.state.simulationResult.iterations}
                            attempts={this.state.simulationResult.attempts}
                            successfulIterations={this.state.simulationResult.successfulIterations}
                            iterationsAtProbability={this.state.iterationsAtProbability}
                            probabilityAtIterations={this.state.probabilityAtIterations}
                            highestIteration={this.state.highestIteration}
                            dataPoints={this.state.simulationResult.dataPoints}
                            isSimulationRunning={this.state.isRunning}
                            onRequestPlay={() => this.resumeSimulation()}
                            onRequestPause={() => this.pauseSimulation()}
                            onRequestNewCalculation={() => this.clearResult()}
                            onRequestIterationsAtProbability={probability => {
                                const message: RequestIterationsAtProbability = {
                                    type: SimulationWorkerEventType.RequestIterationsAtProbability,
                                    probability: probability
                                };
                                this.simulationWorker.postMessage(message);
                            }}
                            onRequestProbabilityAtIterations={iterations => {
                                const message: RequestProbabilityAtIterations = {
                                    type: SimulationWorkerEventType.RequestProbabilityAtIterations,
                                    iterations: iterations
                                };
                                this.simulationWorker.postMessage(message);
                            }}
                        />
                        : null
                        }
                    </>
                    }
                    
                    {this.state.calculationResult &&
                    <>
                        {this.state.calculationResult.type === CalculationResultType.DataResult ?
                        <div>
                            <CalculationResultDisplay
                                totalIterations={this.state.totalCalculationIterations}
                                average={this.state.calculationResult.average}
                                completionRate={this.state.calculationResult.completionRate}
                                failureRate={this.state.calculationResult.failureRate}
                                dataPoints={this.state.calculationResult.dataPoints}
                                iterationsAtProbability={this.state.iterationsAtProbability}
                                probabilityAtIterations={this.state.probabilityAtIterations}
                                onRequestNewCalculation={() => this.clearResult()}
                                onRequestIterationsAtProbability={probability => {
                                    const message: RequestIterationsAtProbability = {
                                        type: SimulationWorkerEventType.RequestIterationsAtProbability,
                                        probability: probability
                                    };
                                    this.calculationWorker.postMessage(message);
                                }}
                                onRequestProbabilityAtIterations={iterations => {
                                    const message: RequestProbabilityAtIterations = {
                                        type: SimulationWorkerEventType.RequestProbabilityAtIterations,
                                        iterations: iterations
                                    };
                                    this.calculationWorker.postMessage(message);
                                }}
                            />
                        </div>
                        : null
                        }
                    </>
                    }
                </div>
                }
                
                {(!this.state.simulationResult && !this.state.calculationResult) &&
                <SpaceContainer className="result-display-start-container">
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
                    <div className="result-display-button-container">
                        <Button
                            content={this.getStartButtonText()}
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