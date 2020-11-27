import React from "react";
import { parseAbbreviatedNumber } from "../../helper/NumberHelpers";
import { Editable } from "./Editable";

type Props = {
    initialValue?: number,
    append?: string,
    onEdited?: () => void,
    onChange?: (value: number) => void,
    validate?: (value: number) => boolean,
    validationCallback?: (isValid: boolean) => void
}

interface State {
    showError: boolean
}

export class EditableInteger extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            showError: false
        };
        
        if (this.props.initialValue !== undefined && this.props.validationCallback) {
            this.props.validationCallback(this.props.validate?.(this.props.initialValue) ?? true);
        }
    }
    
    private parseValue(valueString: string) {
        const value = parseAbbreviatedNumber(valueString);
        if (value === undefined) {
            this.props.validationCallback?.(false);
            return undefined;
        }
        if (!Number.isInteger(value)) {
            this.props.validationCallback?.(false);
            return undefined;
        }
        
        if (this.props.validate) {
            if (!this.props.validate(value)) {
                this.props.validationCallback?.(false);
                return undefined;
            }
        }
        
        this.props.validationCallback?.(true);
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
                    this.props.onEdited?.();
                    if (value !== undefined) {
                        this.props.onChange?.(value);
                    }
                }}
            />
        );
    }
}