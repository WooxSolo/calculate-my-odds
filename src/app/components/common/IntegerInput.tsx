import React from "react";
import { Input } from "./Input";

interface Props {
    value?: number,
    onChange: (value?: number) => void,
    placeholder?: string,
    autoFocus?: boolean,
    min?: number,
    max?: number,
    markError?: boolean,
    onlyMarkErrorOnBlur?: boolean,
    onFocus?: () => void,
    onBlur?: () => void,
    width?: string | number
}

interface State {
    
}

export class IntegerInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        return (
            <Input
                type="text"
                placeholder={this.props.placeholder}
                value={this.props.value ?? ""}
                onChange={e => {
                    const digits = e.target.value.replace(/[^0-9]/g, "");
                    if (digits.length === 0) {
                        this.props.onChange(undefined);
                    }
                    else {
                        this.props.onChange(parseInt(digits));
                    }
                }}
                autoFocus={this.props.autoFocus}
                min={this.props.min}
                max={this.props.max}
                markError={this.props.markError}
                onlyMarkErrorOnBlur={this.props.onlyMarkErrorOnBlur}
                onFocus={this.props.onFocus}
                onBlur={this.props.onBlur}
                style={{
                    width: this.props.width
                }}
            />
        );
    }
}