import React from "react";

interface Props {
    className?: string,
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
            <button className={`btn ${this.props.className ?? ""}`} onClick={this.props.onClick}>
                {this.props.content}
            </button>
        );
    }
}