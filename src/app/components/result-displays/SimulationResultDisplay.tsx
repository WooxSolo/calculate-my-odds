import React from "react";
import { SimulationDataPoint } from "../../../shared/interfaces/simulation/SimulationResult";
import { CumulativeSuccessChart } from "./CumulativeSuccessChart";

interface Props {
    iterations: number,
    attempts: number,
    dataPoints: SimulationDataPoint[]
}

interface State {
    
}

export class SimulationResultDisplay extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        console.log("checkpoint 1", this.props.attempts, this.props.iterations);
        const average = this.props.iterations === 0 ? undefined :
            this.props.attempts / this.props.iterations;
        return (
            <div>
                <div>
                    Iterations: {this.props.iterations}
                </div>
                <div>
                    {average !== undefined &&
                    <>
                        Average rolls per completion: {average}
                    </>
                    }
                </div>
                <CumulativeSuccessChart
                    dataPoints={this.props.dataPoints}
                />
            </div>
        );
    }
}