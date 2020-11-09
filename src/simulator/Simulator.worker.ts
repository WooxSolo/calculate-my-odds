import { ProbabilityGoal } from "../shared/interfaces/Goals";
import { ProbabilityItem } from "../shared/interfaces/Probability";
import { ReceivedResultSimulationEvent, Simulation, SimulationMainEvent, SimulationResult, SimulationWorkerEvent, StartSimulationEvent } from "../shared/interfaces/Simulation";
import { groupBy, xor } from "lodash";

const ctx: Worker = self as any;

let counter = 0;
let currentSimulation: Simulation | undefined;
let currentSimulationResult: SimulationResult | undefined;

function wait() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

function checkGoalCompletion(count: number, goal: ProbabilityGoal) {
    const target = goal.targetCount!;
    switch (goal.comparator!.name) {
        case "<": return count < target;
        case ">": return count > target;
        case "<=": return count <= target;
        case ">=": return count >= target;
        case "=": return count === target;
        case "!=": return count !== target;
    }
    throw new Error(`Unhandled comparator operator: ${goal.comparator!.name}`);
}

function groupGoals(probabilities: ProbabilityItem[], goals: ProbabilityGoal[]) {
    const groupedByProbability = groupBy(goals, x => x.item!.id);
    
    const result = new Array(probabilities.length);
    for (let i = 0; i < probabilities.length; i++) {
        const item = probabilities[i];
        result[i] = groupedByProbability[item.id] ?? [];
    }
    return result;
}

function simulateAverage(probabilities: ProbabilityItem[], goals: ProbabilityGoal[]) {
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
        
        currentSimulationResult!.totalAttempts++;
    }
    
    currentSimulationResult!.iterations++;
}

async function startSimulation() {
    currentSimulationResult = {
        type: "AVERAGE_RESULT",
        iterations: 0,
        totalAttempts: 0
    };
    let lastWaitTime = Date.now();
    let nextCheck = 0;
    while (currentSimulation && currentSimulationResult) {
        simulateAverage(currentSimulation.probabilities, currentSimulation.goals);
        
        if (currentSimulationResult.iterations >= nextCheck) {
            const time = Date.now();
            const elapsedTime = time - lastWaitTime;
            if (elapsedTime >= 10) {
                await wait();
                lastWaitTime = time;
            }
            
            // TODO: Estimate how many iterations until the next check
            // based on how long this check took.
            nextCheck += 1000;
        }
    }
}

ctx.onmessage = (event: MessageEvent<SimulationWorkerEvent>) => {
    const data = event.data;
    console.log("received data", data);
    if (data.type === "START_SIMULATION") {
        const se = data as StartSimulationEvent;
        currentSimulation = se.simulation;
        startSimulation();
    }
    else if (data.type === "STOP_SIMULATION") {
        currentSimulation = undefined;
        currentSimulationResult = undefined;
    }
    else if (data.type === "REQUEST_RESULT") {
        const message: ReceivedResultSimulationEvent = {
            type: "RECEIVED_RESULT",
            result: currentSimulationResult
        }
        ctx.postMessage(message);
    }
};

console.log("Started worker");
