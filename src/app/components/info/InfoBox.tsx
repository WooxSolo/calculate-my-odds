import "./InfoBox.scss";
import React from "react";

interface Props {
    label: React.ReactNode,
    content: React.ReactNode
}

interface State {
    
}

export class InfoBox extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        return (
            <div className="info-box-component">
                <div className="info-box-label">
                    {this.props.label}
                </div>
                <div className="info-box-content">
                    {this.props.content}
                </div>
            </div>
        );
    }
}