import React from "react";
import ReactSelect, { ValueType } from "react-select";

interface Props<T> {
    options: T[],
    value?: T,
    onChange?: (value?: T) => void,
    getOptionLabel: (value: T) => string,
    getOptionValue: (value: T) => string | number
}

interface State {
    
}

export class Select<T> extends React.PureComponent<Props<T>, State> {
    constructor(props: Props<T>) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        return (
            <ReactSelect
                options={this.props.options}
                value={this.props.value}
                onChange={x => this.props.onChange?.((x ?? undefined) as T | undefined)}
                getOptionLabel={this.props.getOptionLabel}
                getOptionValue={x => {
                    const value = this.props.getOptionValue(x);
                    if (typeof value === "string") {
                        return value;
                    }
                    return value.toString();
                }}
            />
        );
    }
}