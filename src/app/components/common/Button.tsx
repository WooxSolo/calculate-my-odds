import "./Button.scss";
import React from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { ButtonIcon } from "./ButtonIcon";

export enum ButtonSize {
    Medium,
    Large
}

interface Props {
    className?: string,
    icon?: IconProp,
    content: React.ReactNode,
    onClick?: () => void,
    size?: ButtonSize
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
        let fontSize = undefined;
        if (this.props.size === ButtonSize.Large) {
            fontSize = "1.6em";
        }
        
        return (
            <button
                className={`button ${this.props.className ?? ""}`}
                onClick={this.props.onClick}
                style={{
                    fontSize: fontSize 
                }}
            >
                {this.props.icon &&
                <ButtonIcon icon={this.props.icon} />
                }
                {this.props.content}
            </button>
        );
    }
}