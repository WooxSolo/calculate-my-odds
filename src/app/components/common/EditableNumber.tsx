import React from "react";
import { parseAbbreviatedNumber } from "../../helper/NumberHelpers";
import { Editable } from "./Editable";

type Props = {
    initialValue?: number,
    append?: string,
    onChange?: (value: number) => void,
    min?: number,
    max?: number
}

interface State {
    showError: boolean
}

export class EditableNumber extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            showError: false
        };
    }
    
    private parseValue(valueString: string) {
        const value = parseAbbreviatedNumber(valueString);
        if (value === undefined) {
            return undefined;
        }
        
        if (this.props.max !== undefined && value > this.props.max) {
            return undefined;
        }
        if (this.props.min !== undefined && value < this.props.min) {
            return undefined;
        }
        
        return value;
    }
    
    render() {
        return (
            <Editable
                initialValue={this.props.initialValue?.toString()}
                append={this.props.append}
                className={`${this.state.showError ? "input-error" : ""}`}
                onChange={valueString => {
                    const value = this.parseValue(valueString);
                    this.setState({
                        showError: value === undefined
                    });
                    console.log("parse", value, valueString);
                    if (value !== undefined) {
                        this.props.onChange?.(value);
                    }
                }}
            />
        );
    }
}