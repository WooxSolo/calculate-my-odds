import React from "react";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { nextUniqueId } from "../helper/IdHelpers";
import { Button } from "./common/Button";
import { ProbabilityInput } from "./inputs/ProbabilityInput";

interface Props {
    onChange: (probabilities: ProbabilityItem[]) => void
}

interface State {
    probabilities: ProbabilityItem[]
}

export class ProbabilityInputContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            probabilities: []
        };
    }
    
    private addNewItem() {
        const newItem: ProbabilityItem = {
            id: nextUniqueId().toString(),
            name: `Option ${this.state.probabilities.length + 1}`,
            probabilityDisplay: ""
        };
        const newProbabilities = [...this.state.probabilities, newItem];
        
        this.setState({
            probabilities: newProbabilities
        });
        this.props.onChange(newProbabilities);
    }
    
    private updateProbability(index: number, value: ProbabilityItem) {
        const newProbabilities = [...this.state.probabilities];
        newProbabilities[index] = value;
        
        this.setState({
            probabilities: newProbabilities
        });
        this.props.onChange(newProbabilities);
    }
    
    private deleteProbability(item: ProbabilityItem) {
        const newProbabilities = this.state.probabilities.filter(x => x !== item);
        
        this.setState({
            probabilities: newProbabilities
        });
        this.props.onChange(newProbabilities);
    }
    
    render() {
        return (
            <div>
                {this.state.probabilities.map((p, index) => (
                    <ProbabilityInput
                        key={p.id}
                        item={p}
                        onChange={item => this.updateProbability(index, item)}
                        onDeleteRequest={() => this.deleteProbability(p)}
                    />
                ))}
                <Button
                    content="Add item"
                    onClick={() => this.addNewItem()}
                />
            </div>
        );
    }
}