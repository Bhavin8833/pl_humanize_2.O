import { humanizeText } from './controllers/humanizeController.js';

// Mock Req/Res
const req = {
    body: {
        text: "This is a test sentence that needs to be humanized.",
        mode: "general",
        strength: "balanced"
    }
};

const res = {
    status: (code) => {
        console.log("Status:", code);
        return res;
    },
    json: (data) => {
        console.log("JSON Response:", JSON.stringify(data, null, 2));
        return res;
    }
};

console.log("Running Humanize Controller Test...");
humanizeText(req, res).then(() => {
    console.log("Test Finished.");
}).catch(err => {
    console.error("Test Crashed:", err);
});
