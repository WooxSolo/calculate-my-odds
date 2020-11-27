import "./WarningDisplay.scss";
import React from "react";

interface Props {
    
}

interface State {
    
}

export class WarningDisplay extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
    }
    
    render() {
        return (
            <div className="warning-display-component">
                {this.props.children}
            </div>
        );
    }
}