import "./ContextMenu.scss";
import React from "react";

interface Props {
    show?: boolean,
    items: ContextMenuItem[],
    onRequestClose?: () => void,
    width?: number | string
}

interface State {
    
}

export interface ContextMenuItem {
    name: string,
    onClick?: () => void
}

export class ContextMenu extends React.PureComponent<Props, State> {
    private containerRef = React.createRef<HTMLDivElement>();
    
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
        
        this.onDocumentClick = this.onDocumentClick.bind(this);
    }
    
    componentDidMount() {
        document.addEventListener("click", this.onDocumentClick);
    }
    
    componentWillUnmount() {
        document.removeEventListener("click", this.onDocumentClick);
    }
    
    private onDocumentClick(e: MouseEvent) {
        if (this.props.show && !this.containerRef.current!.contains(e.target as Node)) {
            this.props.onRequestClose?.();
        }
    }
    
    render() {
        if (!this.props.show) {
            return null;
        }
        
        return (
            <div
                ref={this.containerRef}
                className="context-menu-component"
                style={{
                    width: this.props.width
                }}
            >
                {this.props.items.map((item, index) => (
                    <div key={index} className="context-menu-item" onClick={() => {
                        item.onClick?.();
                        this.props.onRequestClose?.();
                    }}>
                        {item.name}
                    </div>
                ))}
            </div>
        );
    }
}