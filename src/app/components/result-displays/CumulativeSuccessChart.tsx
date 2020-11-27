import "./CumulativeSuccessChart.scss";
import React from "react";
import Chart from "chart.js";
import { abbreviateValue } from "../../helper/NumberHelpers";
import { flatten } from "lodash";

interface Props {
    dataSets: DataSet[]
}

interface State {
}

export interface DataSet {
    name: string,
    dataPoints: DataPoint[],
    pointColor: string,
    lineColor: string,
    labelAppendText?: string
}

export interface DataPoint {
    x: number,
    y: number
}

export class CumulativeSuccessChart extends React.PureComponent<Props, State> {
    private containerRef = React.createRef<HTMLDivElement>();
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private chart?: Chart;
    private mounted: boolean;
    
    constructor(props: Props) {
        super(props);
        
        this.state = {
        };
        
        this.mounted = false;
        this.updateCanvasSize = this.updateCanvasSize.bind(this);
    }
    
    componentDidMount() {
        this.chart = new Chart(this.canvasRef.current!, {
            type: "scatter",
            options: {
                showLines: true,
                responsive: false,
                maintainAspectRatio: false,
                tooltips: {
                    mode: "index",
                    intersect: false,
                    callbacks: {
                        beforeTitle: x => {
                            if (this.props.dataSets.length >= 2) {
                                const labelString = x[0].xLabel?.toLocaleString();
                                const name = x[0].xLabel === 1 ? "iteration" : "iterations";
                                return `${labelString} ${name}`;
                            }
                            return "";
                        },
                        label: x => {
                            const value = x.yLabel as number;
                            const percentage = value > 0.999 ? ">99.9%" : `${(value * 100).toFixed(1)}%`;
                            if (this.props.dataSets.length >= 2) {
                                const appendText = this.props.dataSets[x.datasetIndex!].labelAppendText;
                                const append = appendText ? ` ${this.props.dataSets[x.datasetIndex!].labelAppendText}` : "";
                                return `${percentage}${append}`;
                            }
                            const labelString = x.xLabel?.toLocaleString();
                            const name = x.xLabel === 1 ? "iteration" : "iterations";
                            return `${labelString} ${name}: ${percentage}`;
                        }
                    },
                    displayColors: false
                },
                legend: {
                    display: false
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
                            labelString: "Cumulative probability"
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            beginAtZero: true,
                            max: Math.max(1, ...flatten(this.props.dataSets.map(x => x.dataPoints.map(y => y.x)))),
                            callback: x => Number.isInteger(x as number) ? abbreviateValue(x as number, false, true) : ""
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Iterations"
                        },
                        afterTickToLabelConversion: x => {
                            // A hack to fix digits on top of each other at the end of the chart
                            x.ticks.pop();
                        }
                    }]
                }
            },
            data: {
                datasets: this.props.dataSets.map(dataSet => ({
                    label: dataSet.name,
                    data: dataSet.dataPoints,
                    pointBackgroundColor: dataSet.pointColor,
                    borderColor: dataSet.lineColor,
                    lineTension: 0,
                    fill: false
                }))
            }
        });
        
        this.mounted = true;
        this.updateCanvasSize();
    }
    
    componentWillUnmount() {
        this.mounted = false;
    }
    
    private updateCanvasSize() {
        if (!this.mounted) {
            return;
        }
        
        const inputContainers = document.getElementsByClassName("app-input-container");
        const inputContainer = inputContainers.length === 0 ? undefined : inputContainers[0];
        
        const fontSize = 14; // TODO
        const width = (window.innerWidth - 6 * fontSize) * 0.75;
        const height = Math.max(300, window.innerHeight * 0.5, window.innerHeight - (inputContainer?.clientHeight ?? 0) - 4 * fontSize) - 1;
        
        const container = this.containerRef.current!;
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
        this.chart?.resize();
        
        requestAnimationFrame(this.updateCanvasSize);
    }
    
    componentDidUpdate(prevProps: Props) {
        const changed = this.props.dataSets !== prevProps.dataSets;
        if (changed && this.chart) {
            this.chart.options.scales?.xAxes?.forEach(axis => {
                axis.ticks!.max = Math.max(...flatten(this.props.dataSets.map(x => x.dataPoints.map(y => y.x))));
            });
            
            this.chart.data.datasets = this.props.dataSets.map(dataSet => ({
                label: dataSet.name,
                data: dataSet.dataPoints,
                pointBackgroundColor: dataSet.pointColor,
                borderColor: dataSet.lineColor,
                lineTension: 0,
                fill: false
            }));
            this.chart.update();
        }
    }
    
    render() {
        return (
            <div
                className="cumulative-success-chart-component"
                ref={this.containerRef}
            >
                <canvas
                    className="cumulative-success-chart-canvas"
                    ref={this.canvasRef}
                ></canvas>
            </div>
        );
    }
}