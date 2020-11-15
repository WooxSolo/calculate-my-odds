import "./ProbabilityInputContainer.scss";
import React from "react";
import { ProbabilityItem, ProbabilityTable } from "../../shared/interfaces/Probability";
import { nextUniqueId } from "../helper/IdHelpers";
import { Button } from "./common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { SpaceContainer } from "./common/SpaceContainer";
import { ProbabilityTableContainer } from "./ProbabilityTableContainer";
import { Tabs } from "./common/Tabs";
import { ButtonContainer } from "./common/ButtonContainer";
import { ButtonIcon } from "./common/ButtonIcon";

interface Props {
    onChange: (tables: ProbabilityTable[]) => void
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
            items: [{
                id: nextUniqueId().toString(),
                name: this.nextDefaultOptionName(),
                probabilityDisplay: ""
            }]
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
    
    private addNewItem() {
        const newTables = [...this.state.tables];
        const selectedTable = newTables[this.state.selectedTableIndex];
        selectedTable.items = [...selectedTable.items, this.createNewItem()];
        this.setState({
            tables: newTables
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
                                    onChange={table => {
                                        const newTables = [...this.state.tables];
                                        newTables[index] = table;
                                        this.setState({
                                            tables: newTables
                                        });
                                        this.props.onChange?.(newTables);
                                    }}
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
                <ButtonContainer>
                    <Button
                        content={(
                            <>
                                <ButtonIcon icon={faPlus} />
                                Add item
                            </>
                        )}
                        onClick={() => this.addNewItem()}
                    />
                </ButtonContainer>
            </SpaceContainer>
        );
    }
}