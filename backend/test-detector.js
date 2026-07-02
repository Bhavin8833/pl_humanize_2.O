import { detectAIContent } from './controllers/aiDetectorController.js';

console.log("Testing AI Detector...");
try {
    const result = detectAIContent("This is a simple test sentence to verify the detector is working.");
    console.log("Success:", result);
} catch (error) {
    console.error("Test Failed:", error);
}
