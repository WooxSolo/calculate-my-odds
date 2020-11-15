import "./ButtonIcon.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import React from "react";

interface Props {
    icon: IconProp
}

interface State {
    
}

export class ButtonIcon extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        return (
            <FontAwesomeIcon
                icon={this.props.icon}
                className="button-icon-component"
            />
        );
    }
}