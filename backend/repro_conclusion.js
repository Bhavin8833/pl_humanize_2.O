import fetch from 'node-fetch';

const text = `7. Conclusion and Recommendations
7.1 Conclusion

The 2010 Eurozone Debt Crisis was a major global economic event that had widespread effects beyond Europe. Although Nigeria was not directly involved in the crisis, it experienced indirect economic impacts due to its integration with the global economy. The crisis affected Nigeria mainly through reduced global demand for crude oil, financial market volatility, and changes in international capital flows.

Nigeria entered the period of the crisis with strong economic fundamentals, including high GDP growth and a growing non-oil sector. These factors helped the economy remain resilient and avoid recession. However, the crisis led to a moderation in economic growth, pressure on external earnings, and increased uncertainty in financial markets. Inflationary pressures and exchange rate volatility further highlighted Nigeria’s exposure to external shocks.

The government’s supportive fiscal policy and the Central Bank of Nigeria’s proactive monetary measures played a crucial role in maintaining macroeconomic stability. Low public debt levels provided fiscal space, while effective monetary management helped control inflation and stabilize the financial system. Overall, Nigeria successfully absorbed the shock of the Eurozone Debt Crisis without experiencing severe economic disruption.

7.2 Recommendations

Based on the analysis of Nigeria’s experience during the Eurozone Debt Crisis, the following recommendations are suggested to strengthen economic resilience against future global shocks:

Economic Diversification:
Nigeria should further reduce its dependence on crude oil by promoting growth in manufacturing, agriculture, and services to ensure stable income generation.

Strengthening Fiscal Buffers:
Building larger fiscal reserves during periods of high oil prices will help stabilize government revenue during global downturns.

Enhancing Non-Oil Exports:
Expanding non-oil exports can improve foreign exchange earnings and reduce vulnerability to global commodity price fluctuations.

Prudent Monetary Management:
Continued focus on price stability and financial sector regulation is essential to manage inflation and maintain investor confidence.

Improved Policy Coordination:
Strong coordination between fiscal and monetary authorities can improve the effectiveness of macroeconomic policy responses during external crises.

In conclusion, Nigeria’s experience during the 2010 Eurozone Debt Crisis highlights the importance of sound macroeconomic management, diversification, and policy preparedness in protecting emerging economies from global economic shocks.`;

async function test() {
    console.log("Testing Report Conclusion text...");
    try {
        // Test with Professional Mode since it's a report
        const res = await fetch("http://localhost:5000/api/humanize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                mode: "professional",
                strength: "aggressive"
            })
        });
        const data = await res.json();

        console.log("--- Humanized Output (Professional) ---");
        // console.log(data.humanizedText); // Too long
        console.log(data.humanizedText.substring(0, 500));

        if (data.humanizedText.toLowerCase().includes("final thoughts")) {
            console.log("\nPASS: Found 'final thoughts' replacement!");
        } else {
            console.log("\nFAIL: Did NOT find 'final thoughts' replacement.");
        }

        const detectRes = await fetch("http://localhost:5000/api/ai-detector", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: data.humanizedText })
        });
        const detectData = await detectRes.json();

        console.log(`\nScore: ${detectData.aiScore.toFixed(2)}%`);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
