import "./Editable.scss";
import React from "react";

interface Props {
    initialValue?: string,
    append?: string,
    onChange?: (value: string) => void
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
                className="editable-component"
                onClick={() => this.setState({ isEditingValue: true })}
            >
                <span
                    className="editable-input"
                    onInput={e => this.props.onChange?.((e.target as HTMLSpanElement).innerText)}
                    contentEditable="true"
                    ref={this.inputRef}
                    onPaste={e => {
                        // TODO
                    }}
                    onKeyPress={e => {
                        // TODO
                    }}
                ></span>
                <span>
                    {this.props.append}
                </span>
            </span>
        );
    }
}