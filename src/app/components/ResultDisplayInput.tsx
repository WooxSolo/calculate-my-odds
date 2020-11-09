import React from "react";
import { CalculationMethod } from "../../shared/interfaces/CalculationMethods";
import { AnyProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { ResultDisplayType } from "../../shared/interfaces/ResultDisplays";
import { calculationMethods } from "../helper/CalculationMethodHelpers";
import { resultDisplays } from "../helper/ResultDisplayHelpers";
import { Button } from "./common/Button";
import { Select } from "./common/Select";
import SimulatorWorker from "worker-loader!../../simulator/Simulator.worker";
import SimulatorWorker2 from "worker-loader!../../simulator/Simulator2.worker";
import SimulatorWorker3 from "worker-loader!../../simulator/Simulator3.worker";
import { RequestResultSimulationEvent, SimulationMainEvent, SimulationResult, StartSimulationEvent, StopSimulationEvent } from "../../shared/interfaces/Simulation";
import { AverageResultDisplay } from "./result-displays/AverageResultDisplay";

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

export class ResultDisplay extends React.PureComponent<Props, State> {
    private worker: SimulatorWorker3 | undefined;
    
    constructor(props: Props) {
        super(props);
        
        this.state = {
            displayType: resultDisplays[0],
            calculationMethod: calculationMethods[0],
            isRunning: false
        };
        
        this.calculateResult = this.calculateResult.bind(this);
    }
    
    private calculateResult() {
        const worker = this.worker = new SimulatorWorker3();
        
        worker.onmessage = (e: MessageEvent<SimulationMainEvent>) => {
            const data = e.data;
            console.log("main thread received", data);
            if (data.type === "RECEIVED_RESULT") {
                if (data.result) {
                    this.setState({
                        simulationResult: data.result
                    });
                }
            }
        };
        
        const startMessage: StartSimulationEvent = {
            type: "START_SIMULATION",
            simulation: {
                calculationMethod: this.state.calculationMethod,
                probabilities: this.props.probabilities,
                goals: this.props.goals
            }
        };
        worker.postMessage(startMessage);
        
        this.setState({
            isRunning: true
        });
        
        setInterval(() => {
            const message: RequestResultSimulationEvent = {
                type: "REQUEST_RESULT"
            };
            worker.postMessage(message);
        }, 10);
    }
    
    private pauseSimulation() {
        const worker = this.worker;
        if (!worker) {
            return;
        }
        
        const message: StopSimulationEvent = {
            type: "STOP_SIMULATION"
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
                    onChange={x => this.setState({ calculationMethod: x! })}
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
                    {this.state.simulationResult.type === "AVERAGE_RESULT" &&
                    <div>
                        <AverageResultDisplay
                            iterations={this.state.simulationResult.iterations}
                            attempts={this.state.simulationResult.totalAttempts}
                        />
                    </div>
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