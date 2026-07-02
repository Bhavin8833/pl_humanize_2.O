import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Mock the huge synonyms load if needed, or just import the controller logic directly if possible.
// Since controller uses 'import', we can import it.
// But we need to mock the request/response objects to test the controller function, 
// OR we can copy the logic we want to test.
// Importing the controller is better to test the actual code.

import { humanizeText } from './controllers/humanizeController.js';

const text = `Sudheer Tilloo's life story shows how strong values, continuous learning. And hard work can shape a successful manager. From a young age, he was taught by his father to always do his best in whatever task he undertook. This advice stayed with him throughout his life and became the guiding principle of his professional journey. His mother's patience and care, along with the challenges of supporting his mentally challenged brother, helped him develop emotional strength and calmness while dealing with difficult situations.`;

// Mock Req/Res
const req = {
    body: {
        text: text,
        mode: 'general',
        strength: 'aggressive'
    }
};

const res = {
    json: (data) => {
        console.log("--- HUMANIZED OUTPUT ---");
        console.log(data.humanizedText);
        console.log("------------------------");

        // specific checks
        if (data.humanizedText.includes("whatever task he undertook")) {
            console.log("FAIL: 'whatever task he undertook' was NOT replaced.");
        } else {
            console.log("SUCCESS: 'whatever task he undertook' WAS replaced.");
        }

        if (data.humanizedText.includes("guiding principle")) {
            console.log("FAIL: 'guiding principle' was NOT replaced.");
        } else {
            console.log("SUCCESS: 'guiding principle' WAS replaced.");
        }
    },
    status: (code) => {
        return {
            json: (err) => console.error("Error:", err)
        }
    }
};

console.log("Testing Humanizer...");
humanizeText(req, res);
