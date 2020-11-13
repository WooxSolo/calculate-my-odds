import "./Input.scss";
import React from "react";

type Props = {
    markError?: boolean,
    onlyMarkErrorOnBlur?: boolean
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

interface State {
    isFocused: boolean
}

export class Input extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            isFocused: false
        };
    }
    
    render() {
        const { markError, onlyMarkErrorOnBlur, onFocus, onBlur, ...props } = this.props;
        const shouldMarkError = (!onlyMarkErrorOnBlur || !this.state.isFocused) && markError;
        return (
            <input
                {...props}
                onFocus={e => {
                    this.setState({
                        isFocused: true
                    });
                    onFocus?.(e);
                }}
                onBlur={e => {
                    this.setState({
                        isFocused: false
                    });
                    onBlur?.(e);
                }}
                className={`input ${shouldMarkError ? "input-error" : ""} ${this.props.className ?? ""}`}
            />
        );
    }
}