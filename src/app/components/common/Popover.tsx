import "./Popover.scss";
import React from "react";

interface Props {
    
}

interface State {
    
}

export class Popover extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        return (
            <div className="popover-component">
                <div className="popover-content">
                    {this.props.children}
                </div>
            </div>
        );
    }
}