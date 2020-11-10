import React from "react";
import Chart from "chart.js";
import { SimulationDataPoint } from "../../../shared/interfaces/simulation/SimulationResult";

interface Props {
    iterations: number,
    dataPoints: SimulationDataPoint[]
}

interface State {
    
}

export class CumulativeSuccessChart extends React.PureComponent<Props, State> {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private chart?: Chart;
    
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    componentDidMount() {
        this.chart = new Chart(this.canvasRef.current!, {
            type: "scatter",
            options: {
                showLines: true,
                tooltips: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        label: x => `${x.xLabel} ${x.xLabel === 1 ? "roll" : "rolls"}: ${((x.yLabel as number) * 100).toFixed(1)}%`
                    }
                },
                hover: {
                    mode: "nearest",
                    intersect: true,
                    animationDuration: 0
                },
                animation: {
                    duration: 0
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            suggestedMax: 1,
                            callback: value => `${Math.round((value as number) * 100)}%`
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Cumulative probability of reaching goal"
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            beginAtZero: true,
                            suggestedMax: Math.max(1, ...this.props.dataPoints.map(x => x.completions))
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Rolls"
                        }
                    }]
                }
            },
            data: {
                datasets: [{
                    label: "Some data",
                    data: this.props.dataPoints.map(p => ({
                        x: p.completions,
                        y: p.probability
                    }))
                }]
            }
        });
    }
    
    componentDidUpdate(prevProps: Props) {
        const changed = this.props.dataPoints !== prevProps.dataPoints;
        if (changed && this.chart) {
            this.chart.options.scales?.xAxes?.forEach(axis => {
                console.log("max", Math.max(...this.props.dataPoints.map(x => x.completions)));
                axis.ticks!.suggestedMax = Math.max(...this.props.dataPoints.map(x => x.completions));
            });
            
            this.chart.data.datasets![0].data = this.props.dataPoints.map(p => ({
                x: p.completions,
                y: p.probability
            }));
            this.chart.update();
        }
    }
    
    render() {
        return (
            <div>
                <canvas ref={this.canvasRef}>
                    
                </canvas>
            </div>
        );
    }
}