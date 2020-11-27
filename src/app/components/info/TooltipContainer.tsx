import "./TooltipContainer.scss";
import React from "react";

interface Props {
    tooltipContent: React.ReactNode,
    side?: TooltipSide,
    show?: boolean,
    showOnHover?: boolean,
    maxWidth?: number | string,
    inlineContainer?: boolean
}

interface State {
    visible: boolean,
    isMouseInside: boolean
}

export enum TooltipSide {
    Left,
    Right,
    Top,
    Bottom
}

export class TooltipContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            visible: this.props.show ?? false,
            isMouseInside: false
        };
        
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }
    
    componentDidUpdate() {
        this.updateVisibility();
    }
    
    private getSideClass() {
        const side = this.props.side ?? TooltipSide.Top;
        switch (side) {
            case TooltipSide.Top: return "tooltip-container-top";
            case TooltipSide.Bottom: return "tooltip-container-bottom";
            case TooltipSide.Left: return "tooltip-container-left";
            case TooltipSide.Right: return "tooltip-container-right";
        }
        throw new Error();
    }
    
    private onMouseEnter() {
        this.setState({
            isMouseInside: true
        });
        this.updateVisibility();
    }
    
    private onMouseLeave() {
        this.setState({
            isMouseInside: false
        });
        this.updateVisibility();
    }
    
    private updateVisibility() {
        const visible = this.props.show === true || (this.props.showOnHover === true && this.state.isMouseInside);
        this.setState({
            visible: visible
        });
    }
    
    render() {
        return (
            <div
                className="tooltip-container-component"
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                style={{
                    display: this.props.inlineContainer ? "inline" : "block"
                }}
            >
                {this.props.children}
                <div
                    className={`tooltip-container ${this.getSideClass()} ${this.state.visible ? "tooltip-visible" : ""}`}
                    style={{
                        width: this.props.maxWidth
                    }}
                >
                    <div className="tooltip">
                        <div className="tooltip-direction-icon"></div>
                        {this.props.tooltipContent}
                    </div>
                </div>
            </div>
        );
    }
}