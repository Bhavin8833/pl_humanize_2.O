import fetch from 'node-fetch';
import fs from 'fs';

const text = `I express my sincere gratitude to St. Kabir Institute of Professional Studies (SKIPS) for providing me with the chance to undertake this project as part of the Advanced Marketing Management (CC204) course.
I'm deeply thankful to Dr. Vaishali Trivedi and Ms. Khushboo Sharma for their valuable guidance, continuous support. And constructive feedback throughout the process. Their insights and teaching have helped me understand the practical application of marketing concepts in real-world business scenarios.`;

async function test() {
    let bestScore = 100;

    for (let i = 0; i < 10; i++) {
        process.stdout.write(`Attempt ${i + 1}... `);
        try {
            const humanizeRes = await fetch("http://localhost:5000/api/humanize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    mode: "casual",
                    strength: "aggressive"
                })
            });
            const humanizeData = await humanizeRes.json();

            const detectRes = await fetch("http://localhost:5000/api/ai-detector", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: humanizeData.humanizedText })
            });
            const detectData = await detectRes.json();

            console.log(`Score: ${detectData.aiScore.toFixed(2)}%`);

            if (detectData.aiScore < bestScore) {
                bestScore = detectData.aiScore;
                fs.writeFileSync("best_humanization.txt", humanizeData.humanizedText);
                fs.writeFileSync("best_score.json", JSON.stringify(detectData, null, 2));
            }
        } catch (e) {
            console.error("Error:", e);
        }
    }
    console.log(`Best Score: ${bestScore.toFixed(2)}%`);
}

test();
