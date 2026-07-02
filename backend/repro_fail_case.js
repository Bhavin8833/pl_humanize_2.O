import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { humanizeText } from './controllers/humanizeController.js';

const problemText = `From a young age, he was taught by his father to always do his best in whatever task he undertook. This advice stayed with him throughout his life and became the guiding principle of his professional journey. His mother's patience and care, along with the challenges of supporting his mentally challenged brother, helped him develop emotional strength and calmness while dealing with difficult situations.

Sudheer chose a different career path from his father and focused on technical education. After completing his studies in engineering and gaining international exposure, basically he returned to India and worked with reputed organizations such as Siemens. During this phase, he constantly upgraded his knowledge by reading management journals and learning from his seniors.`;

const req = {
    body: {
        text: problemText,
        mode: 'general',
        strength: 'aggressive'
    }
};

const res = {
    json: (data) => {
        console.log("--- OUTPUT START ---");
        console.log(data.humanizedText);
        console.log("--- OUTPUT END ---");

        const check1 = data.humanizedText.includes("whatever task he undertook");
        const check2 = data.humanizedText.includes("guiding principle");
        const check3 = data.humanizedText.includes("mentally challenged");

        console.log(`Contains 'whatever task he undertook': ${check1}`);
        console.log(`Contains 'guiding principle': ${check2}`);
        console.log(`Contains 'mentally challenged': ${check3}`);

        if (!check1 && !check2 && !check3) {
            console.log("PASS: All phrases replaced.");
        } else {
            console.log("FAIL: Some phrases remain.");
        }
    },
    status: (code) => {
        console.log("Status Code:", code);
        return {
            json: (err) => console.error("Error JSON:", err)
        };
    }
};

console.log("Running Repro with Problem Text...");
humanizeText(req, res);
