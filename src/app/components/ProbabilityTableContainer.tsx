import React from "react";
import { ProbabilityItem, ProbabilityTable } from "../../shared/interfaces/Probability";
import { nextUniqueId } from "../helper/IdHelpers";
import { Editable } from "./common/Editable";
import { IntegerInput } from "./common/IntegerInput";
import { ProbabilityInput } from "./inputs/ProbabilityInput";

interface Props {
    table: ProbabilityTable,
    nextDefaultOptionName: () => string,
    onChange?: (table: ProbabilityTable) => void
}

interface State {
}

export class ProbabilityTableContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
        };
    }
    
    private updateItem(index: number, value: ProbabilityItem) {
        const newItems = [...this.props.table.items];
        newItems[index] = value;
        
        this.props.onChange?.({
            ...this.props.table,
            items: newItems
        });
    }
    
    private deleteItem(item: ProbabilityItem) {
        const newItems = this.props.table.items.filter(x => x !== item);
        
        this.props.onChange?.({
            ...this.props.table,
            items: newItems
        });
    }
    
    render() {
        return (
            <div className="probability-table-component">
                <div>
                    <span>
                        Rolls per iteration: {" "}
                        <Editable
                            initialValue={this.props.table.rollsPerIteration.toString()}
                            onChange={value => {
                                // TODO: Error handling
                                const intValue = parseInt(value);
                                this.setState({
                                    rollsPerIteration: intValue
                                });
                                this.props.onChange?.({
                                    ...this.props.table,
                                    rollsPerIteration: intValue
                                });
                            }}
                        />
                    </span>
                </div>
                {this.props.table.items.length > 0 &&
                <div>
                    {this.props.table.items.map((item, index) => (
                        <ProbabilityInput
                            key={item.id}
                            item={item}
                            onChange={item => this.updateItem(index, item)}
                            onDeleteRequest={() => this.deleteItem(item)}
                        />
                    ))}
                </div>
                }
            </div>
        );
    }
}