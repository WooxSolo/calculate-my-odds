import "./SimulationResultDisplay.scss";
import React from "react";
import { SimulationObjectiveResult, SimulationResult } from "../../../shared/interfaces/simulation/SimulationResult";
import { CumulativeSuccessChart, DataSet } from "./CumulativeSuccessChart";
import { abbreviateValue } from "../../helper/NumberHelpers";
import { InfoBox } from "../info/InfoBox";
import { SpaceContainer } from "../common/SpaceContainer";
import { IconContainer } from "../common/IconContainer";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../common/Button";
import { TooltipContainer, TooltipSide } from "../info/TooltipContainer";
import { EditableInteger } from "../common/EditableInteger";
import { EditableNumber } from "../common/EditableNumber";
import { ProbabilityTable } from "../../../shared/interfaces/Probability";
import { FullCompletionGoal } from "../../../shared/interfaces/Goals";
import { FullCompletionFailure } from "../../../shared/interfaces/Failures";
import { SimulatorHandler } from "../../handlers/SimulatorHandler";
import { Tabs } from "../common/Tabs";
import { WarningDisplay } from "../common/WarningDisplay";

interface Props {
    tables: ProbabilityTable[],
    rootGoal: FullCompletionGoal,
    rootFailure: FullCompletionFailure,
    onRequestNewCalculation?: () => void
}

interface State {
    currentSimulationFailureRoot: FullCompletionFailure,
    simulationResult?: SimulationResult,
    isRunning: boolean,
    highestIteration?: number,
    selectedResultIndex: number
}

const initialIterationsAtProbability = 0.5;
const initialProbabilityAtIterations = 73;

export class SimulationResultDisplay extends React.PureComponent<Props, State> {
    private simulationHandler: SimulatorHandler;
    private cancelResultRequestingFunc?: () => void;
    
    constructor(props: Props) {
        super(props);
        
        this.simulationHandler = new SimulatorHandler({
            onReceivedResult: result => this.setState({
                simulationResult: result
            }),
            onReceivedIterationsAtProbability: (successIterations, failureIterations, drawIterations) => this.setState({
                simulationResult: {
                    ...this.state.simulationResult!,
                    successResult: {
                        ...this.state.simulationResult!.successResult,
                        iterationsAtProbability: successIterations
                    },
                    failureResult: {
                        ...this.state.simulationResult!.failureResult,
                        iterationsAtProbability: failureIterations
                    },
                    drawResult: {
                        ...this.state.simulationResult!.drawResult,
                        iterationsAtProbability: drawIterations
                    }
                }
            }),
            onReceivedProbabilityAtIterations: (successProbability, failureProbability, drawProbability) => this.setState({
                simulationResult: {
                    ...this.state.simulationResult!,
                    successResult: {
                        ...this.state.simulationResult!.successResult,
                        probabilityAtIterations: successProbability
                    },
                    failureResult: {
                        ...this.state.simulationResult!.failureResult,
                        probabilityAtIterations: failureProbability
                    },
                    drawResult: {
                        ...this.state.simulationResult!.drawResult,
                        probabilityAtIterations: drawProbability
                    }
                }
            })
        });
        
        this.state = {
            isRunning: false,
            currentSimulationFailureRoot: this.props.rootFailure,
            selectedResultIndex: 0
        };
    }
    
    componentDidMount() {
        this.startSimulation();
    }
    
    componentWillUnmount() {
        this.cancelResultRequestingFunc?.();
        this.simulationHandler.destroy();
    }
    
    private async startSimulation() {
        this.simulationHandler.startSimulation({
            tables: this.props.tables,
            rootGoal: this.props.rootGoal,
            rootFailure: this.props.rootFailure
        }, initialIterationsAtProbability, initialProbabilityAtIterations);
        
        this.setState({
            isRunning: true
        }, () => {
            this.startRequestingSimulationResult();
        });
    }
    
    private requestSimulationResult() {
        if (this.simulationHandler.isAwaitingResult()) {
            return;
        }
        
        this.simulationHandler.requestResult();
    }
    
    private startRequestingSimulationResult() {
        let finished = false;
        this.cancelResultRequestingFunc = () => {
            finished = true;
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
    
    private async resumeSimulation() {
        this.simulationHandler.resumeSimulation();
        
        await this.setState({
            isRunning: true
        });
        
        this.startRequestingSimulationResult();
    }
    
    private pauseSimulation() {
        this.simulationHandler.pauseSimulation();
        
        this.setState({
            isRunning: false
        });
    }
    
    private getAverageIterationsPerCompletionContent(result?: SimulationObjectiveResult) {
        if (!result) {
            return "-";
        }
        if (result.successfulRounds === 0) {
            return "-";
        }
        
        const average = result.totalAttempts / result.successfulRounds;
        return average.toLocaleString(undefined, {
            maximumFractionDigits: 2
        });
    }
    
    private getIterationsAtProbabilityContent(result?: SimulationObjectiveResult) {
        if (!result) {
            return "-";
        }
        if (result.iterationsAtProbability === undefined) {
            return "-";
        }
        
        return result.iterationsAtProbability.toLocaleString();
    }
    
    private getProbabilityAtIterationsContent(result?: SimulationObjectiveResult) {
        if (!result) {
            return "-";
        }
        
        if (result.probabilityAtIterations > 0.999) {
            return "> 99.9%";
        }
        return (result.probabilityAtIterations * 100).toFixed(1) + "%";
    }
    
    private getProbabilityOfCompletingGoalContent(result?: SimulationObjectiveResult) {
        const simResult = this.state.simulationResult;
        if (!simResult || !result) {
            return undefined;
        }
        if (simResult.totalRounds === 0) {
            return undefined;
        }
        
        const successRate = result.successfulRounds / simResult.totalRounds;
        return `${(successRate * 100).toFixed(1)}%`;
    }
    
    private getUnknownResultsContent() {
        const simResult = this.state.simulationResult;
        if (!simResult) {
            return undefined;
        }
        if (simResult.totalRounds === 0) {
            return undefined;
        }
        
        const unknowns = simResult.unknownResults / simResult.totalRounds;
        return `${(unknowns * 100).toFixed(1)}%`;
    }
    
    private getTabs() {
        if (!this.state.simulationResult) {
            return undefined;
        }
        
        const tabs = [{
            name: "Success",
            result: this.state.simulationResult.successResult,
            probabilityOfCompletionText: "Probability of completing goal",
            averageText: "Average iterations to complete goals",
            appendIterationsUntilProbabilityText: "chance of completing goals",
            prependProbabilityUntilIterationsText: "Chance of completing goals after"
        }];
        if (this.state.currentSimulationFailureRoot.failures.length > 0) {
            tabs.push({
                name: "Failure",
                result: this.state.simulationResult.failureResult,
                probabilityOfCompletionText: "Probability of failing",
                averageText: "Average iterations until failure",
                appendIterationsUntilProbabilityText: "chance of failing",
                prependProbabilityUntilIterationsText: "Chance of failing after"
            });
        }
        if (this.state.simulationResult.drawResult.successfulRounds > 0) {
            tabs.push({
                name: "Draw",
                result: this.state.simulationResult.drawResult,
                probabilityOfCompletionText: "Probablity of a draw",
                averageText: "Average iterations for a draw",
                appendIterationsUntilProbabilityText: "chance of a draw",
                prependProbabilityUntilIterationsText: "Chance of a draw after"
            });
        }
        return tabs;
    }
    
    private getDataSets() {
        const result = this.state.simulationResult;
        if (!result) {
            return [] as DataSet[];
        }
        
        const dataSets: DataSet[] = [{
            name: "Success",
            dataPoints: result.successResult.dataPoints.map(x => ({
                x: x.completions,
                y: x.probability
            })),
            pointColor: "#2E6FEC80",
            lineColor: "#2E6FEC40",
            labelAppendText: "success"
        }];
        if (this.state.currentSimulationFailureRoot.failures.length > 0) {
            dataSets.push({
                name: "Failure",
                dataPoints: result.failureResult.dataPoints.map(x => ({
                    x: x.completions,
                    y: x.probability
                })),
                pointColor: "#d2252580",
                lineColor: "#d2252540",
                labelAppendText: "failure"
            });
        }
        if (result.drawResult.dataPoints.length > 0) {
            dataSets.push({
                name: "Draw",
                dataPoints: result.drawResult.dataPoints.map(x => ({
                    x: x.completions,
                    y: x.probability
                })),
                pointColor: "#d2cf2580",
                lineColor: "#d2cf2540",
                labelAppendText: "draw"
            });
        }
        return dataSets;
    }
    
    render() {
        const result = this.state.simulationResult;
        const tabs = this.getTabs();
        
        const renderProbabilityOfCompletionInfoBox = (label: string, result?: SimulationObjectiveResult) => (
            <InfoBox
                label={label}
                content={this.getProbabilityOfCompletingGoalContent(result)}
            />
        );
        
        const renderAverageInfoBox = (label: string, result?: SimulationObjectiveResult) => (
            <InfoBox
                label={label}
                content={this.getAverageIterationsPerCompletionContent(result)}
            />
        );
        
        const renderIterationsUntilProbabilityInfoBox = (appendLabel: string, result?: SimulationObjectiveResult) => (
            <InfoBox
                label={(
                    <span>
                        Iterations until {" "}
                        <EditableNumber
                            initialValue={initialIterationsAtProbability * 100}
                            append="%"
                            onChange={value => this.simulationHandler.requestIterationsAtProbability(value / 100)}
                            validate={value => value >= 0 && value <= 100}
                        />
                        {" "} {appendLabel}
                    </span>
                )}
                content={this.getIterationsAtProbabilityContent(result)}
            />
        );
        
        const renderProbabilityUntilIterationsInfoBox = (prependLabel: string, result?: SimulationObjectiveResult) => (
            <InfoBox
                label={(
                    <span>
                        {prependLabel} {" "}
                        <EditableInteger
                            initialValue={initialProbabilityAtIterations}
                            onChange={value => this.simulationHandler.requestProbabilityAtIterations(value)}
                            validate={value => value >= 0}
                        />
                        {" "} iterations
                    </span>
                )}
                content={this.getProbabilityAtIterationsContent(result)}
            />
        );
        
        return (
            <div className="simulation-result-display-component">
                <SpaceContainer className="result-info">
                    {(this.state.simulationResult?.unknownResults ?? 0) > 0 &&
                    <div style={{textAlign: "center"}}>
                        <WarningDisplay>
                            Total amount of iterations exceeded {abbreviateValue(this.state.simulationResult!.maxIterations)} in some of the rounds.
                            The simulator does not simulate past that, so the results may be inaccurate.
                        </WarningDisplay>
                    </div>
                    }
                    <InfoBox
                        label="Simulated rounds"
                        content={(
                            <div className="iterations-content-container">
                                <TooltipContainer tooltipContent={result?.totalRounds.toLocaleString()} showOnHover={result !== undefined}>
                                    <div className="iterations-content">
                                        {result ? abbreviateValue(result.totalRounds, true, true) : "-"}
                                    </div>
                                </TooltipContainer>
                                <div className="iterations-icon">
                                    <TooltipContainer tooltipContent={this.state.isRunning ? "Pause" : "Play"} showOnHover>
                                        <IconContainer
                                            icon={this.state.isRunning ? faPause : faPlay}
                                            onClick={() => {
                                                if (this.state.isRunning) {
                                                    this.pauseSimulation();
                                                }
                                                else {
                                                    this.resumeSimulation();
                                                }
                                            }}
                                        />
                                    </TooltipContainer>
                                </div>
                            </div>
                        )}
                    />
                    {(this.state.simulationResult?.unknownResults ?? 0) > 0 &&
                        <InfoBox
                            label="Unknown results"
                            content={(
                                <div className="unknowns-content-container">
                                    <TooltipContainer
                                        tooltipContent={this.state.simulationResult!.unknownResults.toLocaleString()}
                                        side={TooltipSide.Top}
                                        showOnHover
                                    >
                                        {this.getUnknownResultsContent()}
                                    </TooltipContainer>
                                </div>
                            )}
                        />
                    }
                    {this.state.currentSimulationFailureRoot.failures.length === 0 ?
                    <>
                        {renderAverageInfoBox("Average iterations to complete goals", this.state.simulationResult?.successResult)}
                        {renderIterationsUntilProbabilityInfoBox("chance of completing goals", this.state.simulationResult?.successResult)}
                        {renderProbabilityUntilIterationsInfoBox("Chance of completing goals after", this.state.simulationResult?.successResult)}
                    </>
                    :
                    tabs ?
                    <Tabs
                        selectedIndex={this.state.selectedResultIndex}
                        onTabSelected={index => this.setState({ selectedResultIndex: index })}
                        tabs={tabs.map(tab => ({
                            id: tab.name,
                            name: tab.name,
                            content: (
                                <SpaceContainer>
                                    {renderProbabilityOfCompletionInfoBox(tab.probabilityOfCompletionText, tab.result)}
                                    {renderAverageInfoBox(tab.averageText, tab.result)}
                                    {renderIterationsUntilProbabilityInfoBox(tab.appendIterationsUntilProbabilityText, tab.result)}
                                    {renderProbabilityUntilIterationsInfoBox(tab.prependProbabilityUntilIterationsText, tab.result)}
                                </SpaceContainer>
                            )
                        }))}
                    />
                    : null
                    }
                    <div>
                        <Button
                            content="Clear result"
                            onClick={this.props.onRequestNewCalculation}
                        />
                    </div>
                </SpaceContainer>
                <div className="result-chart">
                    <CumulativeSuccessChart
                        dataSets={this.getDataSets()}
                    />
                </div>
            </div>
        );
    }
}