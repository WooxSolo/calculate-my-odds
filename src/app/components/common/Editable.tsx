import "./Editable.scss";
import React from "react";

interface Props {
    initialValue?: string,
    append?: string,
    onChange?: (value: string) => void,
    className?: string
}

interface State {
    isEditingValue: boolean
}

export class Editable extends React.PureComponent<Props, State> {
    private inputRef = React.createRef<HTMLSpanElement>();
    
    constructor(props: Props) {
        super(props);
        
        this.state = {
            isEditingValue: false
        };
    }
    
    componentDidMount() {
        this.inputRef.current!.innerText = this.props.initialValue ?? "";
    }
    
    render() {
        return (
            <span
                className={`editable-component ${this.state.isEditingValue ? "editable-focused" : ""} ${this.props.className ?? ""}`}
                onClick={() => this.inputRef.current!.focus()}
            >
                <span
                    className={`editable-input`}
                    onInput={e => this.props.onChange?.((e.target as HTMLSpanElement).innerText)}
                    contentEditable="true"
                    ref={this.inputRef}
                    onPaste={e => {
                        // TODO
                    }}
                    onKeyPress={e => {
                        // TODO
                    }}
                    onFocus={e => {
                        this.setState({
                            isEditingValue: true
                        });
                        
                        const range = document.createRange();
                        const selection = window.getSelection();
                        range.setStart(e.target, 0);
                        range.setEndAfter(e.target);
                        selection?.removeAllRanges();
                        selection?.addRange(range);
                    }}
                    onBlur={() => this.setState({ isEditingValue: false })}
                ></span>
                <span>
                    {this.props.append}
                </span>
            </span>
        );
    }
}