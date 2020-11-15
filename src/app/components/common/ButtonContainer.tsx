import "./ButtonContainer.scss";
import React from "react";

interface Props {
    
}

interface State {
    
}

export class ButtonContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        return (
            <div className="button-container-component">
                {this.props.children}
            </div>
        );
    }
}