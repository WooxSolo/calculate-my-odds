import "./CalculationResultDisplay.scss";
import React from "react";
import { CalculationObjectiveResult, CalculationResult } from "../../../shared/interfaces/calculator/CalculationResult";
import { CumulativeSuccessChart, DataSet } from "./CumulativeSuccessChart";
import { SpaceContainer } from "../common/SpaceContainer";
import { InfoBox } from "../info/InfoBox";
import { Button } from "../common/Button";
import { EditableInteger } from "../common/EditableInteger";
import { EditableNumber } from "../common/EditableNumber";
import { CalculatorHandler } from "../../handlers/CalculatorHandler";
import { ProbabilityTable, ProbabilityType } from "../../../shared/interfaces/Probability";
import { FullCompletionGoal } from "../../../shared/interfaces/Goals";
import { FullCompletionFailure } from "../../../shared/interfaces/Failures";
import { Tabs } from "../common/Tabs";
import { ButtonContainer } from "../common/ButtonContainer";
import { TooltipContainer, TooltipSide } from "../info/TooltipContainer";

interface Props {
    tables: ProbabilityTable[],
    rootGoal: FullCompletionGoal,
    rootFailure: FullCompletionFailure,
    onRequestNewCalculation?: () => void,
}

interface State {
    currentSimulationFailureRoot: FullCompletionFailure,
    calculationResult?: CalculationResult,
    isRunning: boolean,
    hasFinished: boolean,
    totalCalculationIterations?: number,
    selectedResultIndex: number
}

const initialIterationsAtProbability = 0.5;
const initialProbabilityAtIterations = 73;

export class CalculationResultDisplay extends React.PureComponent<Props, State> {
    private calculatorHandler: CalculatorHandler;
    private cancelResultRequestingFunc?: () => void;
    
    constructor(props: Props) {
        super(props);
        
        this.state = {
            isRunning: false,
            hasFinished: false,
            currentSimulationFailureRoot: this.props.rootFailure,
            selectedResultIndex: 0
        };
        
        this.calculatorHandler = new CalculatorHandler({
            onReceivedResult: result => this.setState({
                calculationResult: result
            }),
            onReceivedIterationsAtProbability: (successIterations, failureIterations, drawIterations) => this.setState({
                calculationResult: {
                    ...this.state.calculationResult!,
                    successResult: {
                        ...this.state.calculationResult!.successResult,
                        iterationsAtProbability: successIterations
                    },
                    failureResult: {
                        ...this.state.calculationResult!.failureResult,
                        iterationsAtProbability: failureIterations
                    },
                    drawResult: {
                        ...this.state.calculationResult!.drawResult,
                        iterationsAtProbability: drawIterations
                    }
                }
            }),
            onReceivedProbabilityAtIterations: (successProbability, failureProbability, drawProbability) => this.setState({
                calculationResult: {
                    ...this.state.calculationResult!,
                    successResult: {
                        ...this.state.calculationResult!.successResult,
                        probabilityAtIterations: successProbability
                    },
                    failureResult: {
                        ...this.state.calculationResult!.failureResult,
                        probabilityAtIterations: failureProbability
                    },
                    drawResult: {
                        ...this.state.calculationResult!.drawResult,
                        probabilityAtIterations: drawProbability
                    }
                }
            }),
            onFinishedCalculation: () => {
                this.setState({
                    isRunning: false,
                    hasFinished: true
                });
                this.calculatorHandler.requestResult();
            }
        });
    }
    
    componentDidMount() {
        this.startCalculation();
    }
    
    componentWillUnmount() {
        this.cancelResultRequestingFunc?.();
        this.calculatorHandler.destroy();
    }
    
    private startCalculation() {
        this.calculatorHandler.startCalculation({
            tables: this.props.tables,
            rootGoal: this.props.rootGoal,
            rootFailure: this.props.rootFailure
        }, initialIterationsAtProbability, initialProbabilityAtIterations);
        
        this.setState({
            isRunning: true,
            totalCalculationIterations: 0,
            calculationResult: undefined
        }, () => {
            this.startRequestingCalculationResult();
        });
        
    }
    
    private requestCalculationResult() {
        if (this.calculatorHandler.isAwaitingResult()) {
            return;
        }
        
        this.calculatorHandler.requestResult();
    }
    
    private startRequestingCalculationResult() {
        let finished = false;
        this.cancelResultRequestingFunc = () => {
            finished = true;
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
    
    private pauseCalculation() {
        if (this.cancelResultRequestingFunc) {
            this.cancelResultRequestingFunc();
            this.cancelResultRequestingFunc = undefined;
        }
        
        this.calculatorHandler.pauseCalculation();
        
        this.setState({
            isRunning: false
        });
    }
    
    private async resumeCalculation() {
        this.calculatorHandler.resumeCalculation();
        
        this.setState({
            isRunning: true
        });
        
        this.startRequestingCalculationResult();
    }
    
    private getProgressTooltipContent() {
        const result = this.state.calculationResult;
        if (!result) {
            return "-";
        }
        
        const iterations = result.totalIterations;
        return `${iterations.toLocaleString()} ${iterations === 1 ? "iteration" : "iterations"}`;
    }
    
    private getProgressContent() {
        const result = this.state.calculationResult;
        if (!result) {
            return "-";
        }
        
        const progress = result.successResult.completionRate +
            result.failureResult.completionRate +
            result.drawResult.completionRate;
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
    
    private getAverageGoalContent(result?: CalculationObjectiveResult) {
        if (!result) {
            return "-";
        }
        if (result.completionRate === 0) {
            return "-";
        }
        
        const average = result.average / result.completionRate;
        return average.toLocaleString(undefined, {
            maximumFractionDigits: 2
        });
    }
    
    private getProbabilityOfCompletingGoalContent(result?: CalculationObjectiveResult) {
        if (!result) {
            return "-";
        }
        
        return `${(result.completionRate * 100).toFixed(1)}%`;
    }
    
    private getIterationsAtProbabilityContent(result?: CalculationObjectiveResult) {
        const calcResult = this.state.calculationResult;
        if (!calcResult || !result) {
            return "-";
        }
        if (result.iterationsAtProbability === undefined) {
            return "-";
        }
        
        if (result.iterationsAtProbability >= calcResult.totalIterations) {
            return `>= ${(calcResult.totalIterations).toLocaleString()}`;
        }
        return result.iterationsAtProbability.toLocaleString();
    }
    
    private getProbabilityAtIterationsContent(result?: CalculationObjectiveResult) {
        const calcResult = this.state.calculationResult;
        if (!calcResult || !result) {
            return "-";
        }
        if (result.probabilityAtIterations === undefined) {
            return "-";
        }
        
        const progress = calcResult.successResult.completionRate +
            calcResult.failureResult.completionRate +
            calcResult.drawResult.completionRate;
        if (result.probabilityAtIterations > 0.999 && progress < 1) {
            return "> 99.9%";
        }
        return (result.probabilityAtIterations * 100).toFixed(1) + "%";
    }
    
    private getTabs() {
        if (!this.state.calculationResult) {
            return undefined;
        }
        
        const tabs = [{
            name: "Success",
            result: this.state.calculationResult.successResult,
            probabilityOfCompletionText: "Probability of completing goal",
            averageText: "Average iterations to complete goals",
            appendIterationsUntilProbabilityText: "chance of completing goals",
            prependProbabilityUntilIterationsText: "Chance of completing goals after"
        }];
        if (this.state.currentSimulationFailureRoot.failures.length > 0) {
            tabs.push({
                name: "Failure",
                result: this.state.calculationResult.failureResult,
                probabilityOfCompletionText: "Probability of failing",
                averageText: "Average iterations until failure",
                appendIterationsUntilProbabilityText: "chance of failing",
                prependProbabilityUntilIterationsText: "Chance of failing after"
            });
        }
        if (this.state.calculationResult.drawResult.completionRate > 0) {
            tabs.push({
                name: "Draw",
                result: this.state.calculationResult.drawResult,
                probabilityOfCompletionText: "Probablity of a draw",
                averageText: "Average iterations for a draw",
                appendIterationsUntilProbabilityText: "chance of a draw",
                prependProbabilityUntilIterationsText: "Chance of a draw after"
            });
        }
        return tabs;
    }
    
    private getDataSets() {
        const result = this.state.calculationResult;
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
        if (result.drawResult.completionRate > 0) {
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
        const result = this.state.calculationResult;
        const tabs = this.getTabs();
        
        const renderProbabilityOfCompletionInfoBox = (label: string, result?: CalculationObjectiveResult) => (
            <InfoBox
                label={label}
                content={this.getProbabilityOfCompletingGoalContent(result)}
            />
        );
        
        const renderAverageInfoBox = (label: string, result?: CalculationObjectiveResult) => (
            <InfoBox
                label={label}
                content={this.getAverageGoalContent(result)}
            />
        );
        
        const renderIterationsUntilProbabilityInfoBox = (appendLabel: string, result?: CalculationObjectiveResult) => (
            <InfoBox
                label={(
                    <span>
                        Iterations until {" "}
                        <EditableNumber
                            initialValue={initialIterationsAtProbability * 100}
                            append="%"
                            onChange={value => this.calculatorHandler.requestIterationsAtProbability(value / 100)}
                            validate={value => value >= 0 && value <= 100}
                        />
                        {" "} {appendLabel}
                    </span>
                )}
                content={this.getIterationsAtProbabilityContent(result)}
            />
        );
        
        const renderProbabilityUntilIterationsInfoBox = (prependLabel: string, result?: CalculationObjectiveResult) => (
            <InfoBox
                label={(
                    <span>
                        {prependLabel} {" "}
                        <EditableInteger
                            initialValue={initialProbabilityAtIterations}
                            onChange={value => this.calculatorHandler.requestProbabilityAtIterations(value)}
                            validate={value => value >= 0}
                        />
                        {" "} iterations
                    </span>
                )}
                content={this.getProbabilityAtIterationsContent(result)}
            />
        );
        
        return (
            <div className="calculation-result-display-component">
                <SpaceContainer className="result-info">
                    <InfoBox
                        label="Progress"
                        content={(
                            <div className="progress-content-container">
                                <TooltipContainer
                                    tooltipContent={this.getProgressTooltipContent()}
                                    showOnHover
                                    side={TooltipSide.Top}
                                >
                                    {this.getProgressContent()}
                                </TooltipContainer>
                            </div>
                        )}
                    />
                    {this.state.currentSimulationFailureRoot.failures.length === 0 ?
                    <>
                        {renderAverageInfoBox("Average iterations to complete goals", this.state.calculationResult?.successResult)}
                        {renderIterationsUntilProbabilityInfoBox("chance of completing goals", this.state.calculationResult?.successResult)}
                        {renderProbabilityUntilIterationsInfoBox("Chance of completing goals after", this.state.calculationResult?.successResult)}
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
                    <ButtonContainer>
                        <Button
                            content="Clear result"
                            onClick={this.props.onRequestNewCalculation}
                        />
                    </ButtonContainer>
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