import fetch from 'node-fetch';

const text = `In the rapidly evolving landscape of digital technology, it is imperative to understand the multifaceted implications of artificial intelligence. Furthermore, the integration of deep learning algorithms facilitates a more streamlined approach to data analysis. Consequently, organizations must prioritize the implementation of robust cybersecurity measures to mitigate potential risks. In conclusion, the synergy between human innovation and machine learning will undoubtedly shape the future of our society in profound ways.`;

async function test() {
    console.log("Testing with ZeroGPT flagged text...");
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

        console.log("--- Humanized Output ---");
        console.log("--- Humanized Output ---");
        console.log(JSON.stringify(humanizeData.humanizedText, null, 2));

        const detectRes = await fetch("http://localhost:5000/api/ai-detector", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: humanizeData.humanizedText })
        });
        const detectData = await detectRes.json();

        console.log(`\nScore: ${detectData.aiScore.toFixed(2)}%`);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
