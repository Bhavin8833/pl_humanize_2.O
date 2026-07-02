import fetch from 'node-fetch';

const text = `This reduced the availability of credit to the private sector and slowed short-term lending activities.
According to Keynes’ Liquidity Preference Theory, I think during periods of economic uncertainty, individuals and institutions prefer to hold liquid assets rather than investing in long-term or risky financial instruments.
The Central Bank of Nigeria (CBN) played a critical role in stabilizing the money market during this period. The CBN used different monetary tools to manage liquidity and maintain confidence in the financial system.
These measures helped prevent too much volatility in interest rates and ensured that the banking system remained stable despite global financial stress.
Interest rates in Nigeria were influenced by both domestic monetary policy decisions and global financial conditions. During the crisis period, interest rates remained relatively firm as the CBN aimed to control inflation and maintain financial stability. While higher interest rates helped curb inflationary pressures and discourage speculative capital outflows, they also increased borrowing costs for businesses and households. This had a moderate dampening effect on investment and consumption in the short term.
The Central Bank of Nigeria’s proactive liquidity management and monetary interventions helped stabilize the money market and prevent systemic financial risks. But, the episode highlighted the sensitivity of Nigeria’s financial system to global economic developments and the importance of effective monetary regulation.`;

async function test() {
    console.log("Testing with text:", text.substring(0, 50) + "...");

    // 1. Detect Initial Score
    try {
        const detectRes = await fetch("http://localhost:5000/api/ai-detector", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });
        const detectData = await detectRes.json();
        console.log("Initial Detection Score:", detectData);
    } catch (e) {
        console.error("Detection failed:", e.message);
    }

    // 2. Humanize
    try {
        const humanizeRes = await fetch("http://localhost:5000/api/humanize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                mode: "general", // User is probably using default
                strength: "aggressive" // Trying aggressive to see if it helps
            })
        });
        const humanizeData = await humanizeRes.json();
        console.log("Humanized Text:\n", humanizeData.humanizedText);

        // 3. Detect New Score
        const newDetectRes = await fetch("http://localhost:5000/api/ai-detector", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: humanizeData.humanizedText })
        });
        const newDetectData = await newDetectRes.json();
        console.log("New Detection Score:", newDetectData);

    } catch (e) {
        console.error("Humanization failed:", e.message);
    }
}

test();
