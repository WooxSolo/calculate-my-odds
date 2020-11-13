import "./ProbabilityInput.scss";
import React from "react";
import { ProbabilityItem } from "../../../shared/interfaces/Probability";
import { parseProbability } from "../../helper/ProbabilityHelper";
import { Button } from "../common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { IconContainer } from "../common/IconContainer";
import { Input } from "../common/Input";

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
            isProbabilityInputFocused: false
        };
    }
    
    private shouldMarkError(inputValue?: string) {
        if (inputValue === undefined || inputValue.length === 0) {
            return false;
        }
        return parseProbability(inputValue) === undefined;
    }
    
    render() {
        return (
            <div className="probability-input-component">
                <div className="probability-name">
                    <Input
                        type="text"
                        placeholder="Name"
                        value={this.props.item.name}
                        onChange={e => this.props.onChange({
                            ...this.props.item,
                            name: e.target.value
                        })}
                    />
                </div>
                <div className="probability-chance">
                    <Input
                        type="text"
                        placeholder="Probability"
                        value={this.props.item.probabilityDisplay}
                        onChange={e => this.props.onChange({
                            ...this.props.item,
                            probabilityDisplay: e.target.value,
                            probability: parseProbability(e.target.value)
                        })}
                        markError={this.shouldMarkError(this.props.item.probabilityDisplay)}
                        onlyMarkErrorOnBlur
                    />
                </div>
                <div className="probability-remove">
                    <IconContainer 
                        icon={faTrash}
                        onClick={this.props.onDeleteRequest}
                    />
                </div>
            </div>
        );
    }
}