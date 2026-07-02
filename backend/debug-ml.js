import { mlService } from './services/mlService.js';

try {
    console.log("Testing ML Service...");
    const score = mlService.getHumanScore("This is a test sentence.");
    console.log("Score:", score);
    console.log("ML Service is working.");
} catch (error) {
    console.error("ML Service failed:", error);
}
