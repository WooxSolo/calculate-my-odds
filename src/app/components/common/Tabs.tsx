import "./Tabs.scss";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCross, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

interface Props {
    tabs: Tab[],
    selectedIndex: number,
    onTabSelected?: (index: number) => void,
    onTabRemovalRequest?: (index: number) => void,
    onRequestNewTab?: () => void
}

interface State {
    hideLeftFade: boolean,
    hideRightFade: boolean
}

export interface Tab {
    id: string,
    name: string,
    content: React.ReactNode
}

export class Tabs extends React.PureComponent<Props, State> {
    private isComponentMounted: boolean;
    private headerContainerRef = React.createRef<HTMLDivElement>();
    
    constructor(props: Props) {
        super(props);
        
        this.isComponentMounted = false;
        this.state = {
            hideLeftFade: true,
            hideRightFade: true
        };
        
        this.updateFadeState = this.updateFadeState.bind(this);
    }
    
    componentDidMount() {
        this.isComponentMounted = true;
        
        this.updateFadeState();
    }
    
    componentWillUnmount() {
        this.isComponentMounted = false;
    }
    
    private updateFadeState() {
        if (!this.isComponentMounted) {
            return;
        }
        
        const hideFadeMargin = 5;
        const { scrollWidth, clientWidth } = this.headerContainerRef.current!;
        
        this.setState({
            hideLeftFade: this.headerContainerRef.current!.scrollLeft <= hideFadeMargin,
            hideRightFade: this.headerContainerRef.current!.scrollLeft >= scrollWidth - clientWidth - hideFadeMargin
        });
        
        // TODO: Fix hack to be smarter instead of running every frame
        requestAnimationFrame(this.updateFadeState);
    }
    
    render() {
        return (
            <div className="tabs-component">
                <div className="tabs-header-effects">
                    <div className={`tab-header-fade-left ${this.state.hideLeftFade ? "tab-fade-hidden" : ""}`}></div>
                    <div className={`tab-header-fade-right ${this.state.hideRightFade ? "tab-fade-hidden" : ""}`}></div>
                </div>
                <div
                    ref={this.headerContainerRef}
                    className="tab-header-container"
                    onWheel={e => {
                        const direction = e.deltaY < 0 ? -1 : e.deltaY > 0 ? 1 : 0;
                        this.headerContainerRef.current!.scrollLeft += direction * 20;
                        e.preventDefault();
                    }}
                >
                    {this.props.tabs.map((tab, index) => (
                        <div
                            key={tab.id}
                            className={`tab-header ${this.props.selectedIndex === index ? "tab-selected" : ""}`}
                            onClick={() => this.props.onTabSelected?.(index)}
                        >
                            <div className="tab-header-name">
                                {tab.name}
                            </div>
                            {this.props.tabs.length >= 2 &&
                            <div className="tab-header-actions">
                                <div
                                    className="tab-header-remove"
                                    onClick={e => {
                                        e.stopPropagation();
                                        this.props.onTabRemovalRequest?.(index);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </div>
                            </div>
                            }
                        </div>
                    ))}
                    <div
                        className="tab-header"
                        onClick={() => this.props.onRequestNewTab?.()}
                    >
                        <FontAwesomeIcon icon={faPlus} className="new-tab-icon" />
                    </div>
                </div>
                {this.props.selectedIndex >= 0 && this.props.selectedIndex < this.props.tabs.length &&
                <div className="tab-content-container">
                    {this.props.tabs[this.props.selectedIndex].content}
                </div>
                }
            </div>
        );
    }
}