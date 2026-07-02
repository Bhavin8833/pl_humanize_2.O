import { mlService } from './services/mlService.js';

async function runTest() {
    console.log("Initial State:");
    // "Hello world" might be neutral
    console.log("'Hello world' Human Score:", mlService.getHumanScore("Hello world"));

    console.log("\nTraining with specific data...");
    await mlService.saveTrainingInput("My unique human phrase that is definitely human.", "Human");
    await mlService.saveTrainingInput("My unique robotic phrase that is definitely AI.", "AI");

    console.log("\nTesting after training:");
    const humanScore = mlService.getHumanScore("My unique human phrase that is definitely human.");
    const aiScore = mlService.getHumanScore("My unique robotic phrase that is definitely AI.");

    console.log(`'Human' phrase score: ${humanScore} (Should be high)`);
    console.log(`'AI' phrase score: ${aiScore} (Should be low)`);

    if (humanScore > 0.6 && aiScore < 0.4) {
        console.log("\nSUCCESS: Model learned correctly.");
    } else {
        console.log("\nWARNING: Model might not be differentiating well enough with this small dataset.");
    }
}

runTest();
