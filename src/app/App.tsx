import "./App.scss";
import React from "react";

interface Props {
    
}

interface State {
    
}

export class App extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
    }
    
    render() {
        return (
            <h1>
                Hello chat!
            </h1>
        );
    }
}