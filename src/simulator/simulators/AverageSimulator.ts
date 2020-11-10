import { Simulation } from "../../shared/interfaces/simulation/Simulation";
import { AverageSimulationResult, SimulationResultType } from "../../shared/interfaces/simulation/SimulationResult";
import { simulationLoop } from "../helpers/LoopHelper";
import { checkGoalCompletion, groupGoals } from "../helpers/SimulationHelpers";
import { Simulator } from "./Simulator";

export class AverageSimulator implements Simulator {
    private isRunning = false;
    private simulation: Simulation;
    private result: AverageSimulationResult;
    
    constructor(simulation: Simulation) {
        this.simulation = simulation;
        this.result = {
            type: SimulationResultType.AverageResult,
            iterations: 0,
            totalAttempts: 0
        };
    }
    
    private simulateAverage() {
        const probabilities = this.simulation.probabilities;
        const goals = this.simulation.goals;
        
        let fulfilledGoals = 0;
        const counts = new Int32Array(probabilities.length);
        for (const goal of goals) {
            if (checkGoalCompletion(0, goal)) {
                fulfilledGoals++;
            }
        }
        const groupedGoals = groupGoals(probabilities, goals);
        
        while (fulfilledGoals < goals.length) {
            const roll = Math.random();
            let nextCheckBase = 0;
            for (let i = 0; i < probabilities.length; i++) {
                const item = probabilities[i];
                const check = nextCheckBase + item.probability!;
                if (roll < check) {
                    for (const goal of groupedGoals[i]) {
                        const completedBefore = checkGoalCompletion(counts[i], goal);
                        const completedAfter = checkGoalCompletion(counts[i] + 1, goal);
                        if (!completedBefore && completedAfter) {
                            fulfilledGoals++;
                        }
                        else if (completedBefore && !completedAfter) {
                            // TODO: Notify that the simulation will never finish
                            throw new Error();
                        }
                    }
                    counts[i]++;
                    break;
                }
                nextCheckBase = check;
            }
            
            this.result.totalAttempts++;
        }
        
        this.result.iterations++;
    }

    async start() {
        this.isRunning = true;
        
        simulationLoop(() => {
            this.simulateAverage();
            return this.isRunning;
        });
    }
    
    pause() {
        this.isRunning = false;
    }
    
    getResult() {
        return this.result;
    }
}
