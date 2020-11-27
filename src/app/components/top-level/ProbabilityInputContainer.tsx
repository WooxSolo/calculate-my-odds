import "./ProbabilityInputContainer.scss";
import React from "react";
import { ProbabilityTableContainer } from "./ProbabilityTableContainer";
import { ProbabilityItem, ProbabilityTable } from "../../../shared/interfaces/Probability";
import { NameChange } from "../../interfaces/NamingInterfaces";
import { Validator } from "../../data-structures/Validator";
import { nextUniqueId } from "../../helper/IdHelpers";
import { SpaceContainer } from "../common/SpaceContainer";
import { Tabs } from "../common/Tabs";

interface Props {
    onChange: (tables: ProbabilityTable[], nameChange?: NameChange) => void,
    validator: Validator
}

interface State {
    tables: ProbabilityTable[],
    selectedTableIndex: number
}

export class ProbabilityInputContainer extends React.PureComponent<Props, State> {
    private nextTableValue = 1;
    private nextOptionValue = 1;
    
    constructor(props: Props) {
        super(props);
        
        this.state = {
            tables: [this.createNewTable()],
            selectedTableIndex: 0
        };
        
        this.nextDefaultOptionName = this.nextDefaultOptionName.bind(this);
    }
    
    componentDidMount() {
        this.props.onChange(this.state.tables);
    }
    
    private nextDefaultTableName() {
        return `Table ${this.nextTableValue++}`;
    }
    
    private nextDefaultOptionName() {
        return `Option ${this.nextOptionValue++}`;
    }
    
    private createNewTable() {
        const newTable: ProbabilityTable = {
            id: nextUniqueId().toString(),
            name: this.nextDefaultTableName(),
            rollsPerIteration: 1,
            items: [this.createNewItem()]
        };
        return newTable;
    }
    
    private createNewItem() {
        const item: ProbabilityItem = {
            id: nextUniqueId().toString(),
            name: this.nextDefaultOptionName(),
            probabilityDisplay: ""
        };
        return item;
    }
    
    private addNewTable() {
        const newTables = [...this.state.tables, this.createNewTable()];
        this.setState({
            tables: newTables,
            selectedTableIndex: newTables.length - 1
        });
        this.props.onChange?.(newTables);
    }
    
    render() {
        return (
            <SpaceContainer className="probability-input-container-component">
                {this.state.tables.length > 0 &&
                <div>
                    <Tabs
                        selectedIndex={this.state.selectedTableIndex}
                        tabs={this.state.tables.map((table, index) => ({
                            id: table.id,
                            name: table.name,
                            content: (
                                <ProbabilityTableContainer
                                    key={table.id}
                                    nextDefaultOptionName={this.nextDefaultOptionName}
                                    table={table}
                                    onChange={(table, nameChange) => {
                                        const newTables = [...this.state.tables];
                                        newTables[index] = table;
                                        this.setState({
                                            tables: newTables
                                        });
                                        this.props.onChange?.(newTables, nameChange);
                                    }}
                                    requestTabFocus={() => this.setState({
                                        selectedTableIndex: index
                                    })}
                                    validator={this.props.validator}
                                />
                            )
                        }))}
                        onTabSelected={index => this.setState({ selectedTableIndex: index })}
                        onTabRemovalRequest={index => {
                            const newTables = this.state.tables.filter((x, ix) => ix !== index);
                            const newIndex = Math.min(newTables.length - 1, this.state.selectedTableIndex);
                            this.setState({
                                tables: newTables,
                                selectedTableIndex: newIndex
                            });
                            this.props.onChange?.(newTables);
                        }}
                        onRequestNewTab={() => this.addNewTable()}
                    />
                </div>
                }
            </SpaceContainer>
        );
    }
}