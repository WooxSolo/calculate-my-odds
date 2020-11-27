import "./ButtonWithDropdown.scss";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button } from "./Button";
import { ContextMenu, ContextMenuItem } from "./ContextMenu";

interface Props {
    content: React.ReactNode,
    icon?: IconProp,
    onClick?: () => void,
    dropdownItems: ContextMenuItem[],
    dropdownWidth?: string | number
}

interface State {
    showDropdown: boolean
}

export class ButtonWithDropdown extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            showDropdown: false
        };
    }
    
    render() {
        return (
            <div className="button-with-dropdown-component">
                <Button
                    className="main-button"
                    content={this.props.content}
                    icon={this.props.icon}
                    onClick={this.props.onClick}
                />
                <div className="dropdown-container">
                    <Button
                        className="dropdown-button"
                        content={<FontAwesomeIcon icon={faAngleDown} />}
                        onClick={() => {
                            // TODO: Find a better solution than setTimeout
                            const newValue = !this.state.showDropdown;
                            setTimeout(() => {
                                this.setState({
                                    showDropdown: newValue
                                });
                            }, 0);
                        }}
                    />
                    <ContextMenu
                        show={this.state.showDropdown}
                        items={this.props.dropdownItems}
                        onRequestClose={() => this.setState({ showDropdown: false })}
                        width={this.props.dropdownWidth}
                    />
                </div>
            </div>
        );
    }
}