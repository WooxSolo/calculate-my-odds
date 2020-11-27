import "./ResultDisplayContainer.scss";
import React from "react";
import { CalculationMethod, CalculationMethodType } from "../../../shared/interfaces/CalculationMethods";
import { FullCompletionGoal } from "../../../shared/interfaces/Goals";
import { ProbabilityTable } from "../../../shared/interfaces/Probability";
import { calculationMethods } from "../../helper/CalculationMethodHelpers";
import { Button, ButtonSize } from "../common/Button";
import { Select } from "../common/Select";
import { SimulationResultDisplay } from "../result-displays/SimulationResultDisplay";
import { CalculationResultDisplay } from "../result-displays/CalculationResultDisplay";
import { SpaceContainer } from "../common/SpaceContainer";
import { Validator } from "../../data-structures/Validator";
import { FullCompletionFailure } from "../../../shared/interfaces/Failures";
import { Input } from "../common/Input";
import { IntegerInput } from "../common/IntegerInput";

interface Props {
    tables: ProbabilityTable[],
    rootGoal: FullCompletionGoal,
    rootFailure: FullCompletionFailure,
    validator: Validator
}

interface State {
    calculationMethod: CalculationMethod,
    hasStarted: boolean,
    simulationRounds?: number
}

export class ResultDisplayContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            calculationMethod: calculationMethods[0],
            hasStarted: false
        };
        
        this.start = this.start.bind(this);
    }
    
    private start() {
        if (!this.props.validator.validate()) {
            return;
        }
        
        this.setState({
            hasStarted: true
        });
    }
    
    private stop() {
        this.setState({
            hasStarted: false
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
                {this.state.hasStarted &&
                <div className="result-display-result">
                    {/*
                    TODO: Probably reuse some code in calculator display and simulation display
                    instead of both having rather similar code
                    */}
                    
                    {this.state.calculationMethod.type === CalculationMethodType.Simulation &&
                    <SimulationResultDisplay
                        tables={this.props.tables}
                        rootGoal={this.props.rootGoal}
                        rootFailure={this.props.rootFailure}
                        onRequestNewCalculation={() => this.stop()}
                        simulationRounds={this.state.simulationRounds}
                    />
                    }
                    
                    {this.state.calculationMethod.type === CalculationMethodType.Calculation &&
                    <CalculationResultDisplay
                        tables={this.props.tables}
                        rootGoal={this.props.rootGoal}
                        rootFailure={this.props.rootFailure}
                        onRequestNewCalculation={() => this.stop()}
                    />
                    }
                </div>
                }
                
                {!this.state.hasStarted &&
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
                    
                    {this.state.calculationMethod.type === CalculationMethodType.Simulation &&
                    <div>
                        <label>Simulation rounds</label>
                        <IntegerInput
                            value={this.state.simulationRounds}
                            onChange={x => this.setState({ simulationRounds: x })}
                            placeholder="Unlimited"
                            width="14em"
                        />
                    </div>
                    }
                    
                    <div className="result-display-button-container">
                        <Button
                            content={this.getStartButtonText()}
                            onClick={this.start}
                            size={ButtonSize.Large}
                        />
                    </div>
                </SpaceContainer>
                }
            </div>
        );
    }
}