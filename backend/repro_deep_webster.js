import fetch from 'node-fetch';

const text = `
I will enumerate the items in close proximity to the dwelling.
We must utilize the new innovation to ameliorate the situation.
It is clearly evident that the final outcome was beneficial.
The basic fundamentals of the plan were to consolidate the assets.
We should merge together the two teams to facilitate better work.
Please reply back to my letter at your earliest convenience.
The past history of the project shows a lack of sufficient funding.
I anticipate that we will commence the project soon.
`;

async function test() {
    console.log("Testing Deep Webster's Integration...");
    try {
        const res = await fetch("http://localhost:5000/api/humanize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                mode: "professional",
                strength: "balanced"
            })
        });
        const data = await res.json();

        console.log("--- Humanized Output ---");
        console.log(data.humanizedText);

        const checks = [
            { bad: "enumerate", good: "list" },
            { bad: "close proximity", good: "proximity" },
            { bad: "dwelling", good: "home" },
            { bad: "utilize", good: "use" },
            { bad: "new innovation", good: "innovation" },
            { bad: "ameliorate", good: "improve" },
            { bad: "clearly evident", good: "evident" },
            { bad: "final outcome", good: "outcome" },
            { bad: "basic fundamentals", good: "fundamentals" },
            { bad: "consolidate", good: "join" },
            { bad: "merge together", good: "merge" },
            { bad: "facilitate", good: "help" },
            { bad: "reply back", good: "reply" },
            { bad: "past history", good: "history" },
            { bad: "sufficient", good: "enough" },
            { bad: "commence", good: "start" },
            { bad: "anticipate", good: "expect" }
        ];

        let passCount = 0;
        const lowerText = data.humanizedText.toLowerCase();

        checks.forEach(check => {
            if (lowerText.includes(check.good) && !lowerText.includes(check.bad)) {
                console.log(`PASS: Fixed '${check.bad}' -> '${check.good}'`);
                passCount++;
            } else {
                console.log(`FAIL: Did not fix '${check.bad}'. Output was: ...${lowerText.substring(Math.max(0, lowerText.indexOf(check.bad.split(' ')[0]) - 10), lowerText.indexOf(check.bad.split(' ')[0]) + 20)}...`);
            }
        });

        console.log(`\nPassed ${passCount}/${checks.length} checks.`);

    } catch (e) {
        console.error("Error:", e);
    }
}

test();
