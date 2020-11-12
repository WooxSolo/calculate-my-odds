import "./IconContainer.scss";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface Props {
    icon: IconDefinition,
    onClick?: () => void
}

interface State {
    
}

export class IconContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
    }
    
    render() {
        return (
            <FontAwesomeIcon
                className="app-icon"
                icon={this.props.icon}
                onClick={this.props.onClick}
                style={{
                    cursor: this.props.onClick ? "pointer" : undefined
                }}
            />
        );
    }
}