import "./Input.scss";
import React from "react";

type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

interface State {
    
}

export class Input extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        return (
            <input
                {...this.props}
                className={`input ${this.props.className ?? ""}`}
            />
        );
    }
}