import "./ErrorDisplay.scss";
import React from "react";

interface Props {
    
}

interface State {
    
}

export class ErrorDisplay extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
    }
    
    render() {
        return (
            <div className="error-display-component">
                {this.props.children}
            </div>
        );
    }
}