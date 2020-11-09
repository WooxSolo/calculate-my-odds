import React from "react";

interface Props {
    content: React.ReactNode,
    onClick?: () => void
}

interface State {
    
}

export class Button extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        return (
            <button className="btn" onClick={this.props.onClick}>
                {this.props.content}
            </button>
        );
    }
}