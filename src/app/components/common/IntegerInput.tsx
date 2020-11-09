import React from "react";

interface Props {
    value?: number,
    onChange: (value: number) => void
}

interface State {
    
}

export class IntegerInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        return (
            <input
                type="text"
                value={this.props.value ?? ""}
                onChange={e => this.props.onChange(parseInt(e.target.value))}
            />
        );
    }
}