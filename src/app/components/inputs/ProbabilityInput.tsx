import React from "react";
import { ProbabilityItem } from "../../../shared/interfaces/Probability";
import { parseProbability } from "../../helper/ProbabilityHelper";
import { Button } from "../common/Button";

interface Props {
    item: ProbabilityItem,
    onChange: (item: ProbabilityItem) => void,
    onDeleteRequest?: () => void
}

interface State {
    
}

export class ProbabilityInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        return (
            <div>
                <input
                    type="text"
                    value={this.props.item.name}
                    onChange={e => this.props.onChange({
                        ...this.props.item,
                        name: e.target.value
                    })}
                />
                <input
                    type="text"
                    value={this.props.item.probabilityDisplay}
                    onChange={e => this.props.onChange({
                        ...this.props.item,
                        probabilityDisplay: e.target.value,
                        probability: parseProbability(e.target.value)
                    })}
                />
                <Button
                    content="Remove"
                    onClick={this.props.onDeleteRequest}
                />
            </div>
        );
    }
}