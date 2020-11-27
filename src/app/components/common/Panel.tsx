import "./Panel.scss";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface Props {
    className?: string,
    title?: string,
    onCloseRequest?: () => void,
    backgroundColor?: string
}

interface State {
    
}

export class Panel extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        return (
            <div className={`panel-component ${this.props.className ?? ""}`}>
                {this.props.title &&
                <div className="panel-title" style={{
                    backgroundColor: this.props.backgroundColor
                }}>
                    {this.props.title}
                </div>
                }
                {this.props.onCloseRequest &&
                <div className="panel-close-container" onClick={this.props.onCloseRequest} style={{
                    backgroundColor: this.props.backgroundColor
                }}>
                    <FontAwesomeIcon icon={faTimes} />
                </div>
                }
                {this.props.children}
            </div>
        );
    }
}