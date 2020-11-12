import "./SpaceContainer.scss";
import React from "react";

interface Props {
    className?: string
}

interface State {
    
}

export class SpaceContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        return (
            <div className={`space-container-component ${this.props.className}`}>
                {this.props.children}
            </div>
        );
    }
}