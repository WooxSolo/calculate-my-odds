import "./App.scss";
import React from "react";
import { AppContainer } from "./components/AppContainer";

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
            <AppContainer />
        );
    }
}