import React from "react";

interface Props {
    iterations: number,
    attempts: number
}

interface State {
    
}

export class AverageResultDisplay extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        if (this.props.iterations === 0) {
            return null;
        }
        
        const average = this.props.attempts / this.props.iterations;
            
        return (
            <div>
                <div>
                    Total iterations: {this.props.iterations}
                </div>
                <div>
                    Average rolls per iteration: {average}
                </div>
            </div>
        );
    }
}