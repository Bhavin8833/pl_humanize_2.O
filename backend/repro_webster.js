import fetch from 'node-fetch';

const text = `
I am writing to you irregardless of the previous issues.
The team is comprised of five members.
The reason is because we wanted to be sure.
We will try and finish this by Friday.
This approach is different than the one we used before.
There are less items on the list now.
At this point in time, we are ready.
In spite of the fact that it rained, we went out.
`;

async function test() {
    console.log("Testing Webster's Usage Fixes...");
    try {
        const res = await fetch("http://localhost:5000/api/humanize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                mode: "professional", // Should trigger fixes
                strength: "balanced"
            })
        });
        const data = await res.json();

        console.log("--- Humanized Output ---");
        console.log(data.humanizedText);

        // Verification Checks
        const checks = [
            { bad: "irregardless", good: "regardless" },
            { bad: "comprised of", good: "composed of" },
            { bad: "reason is because", good: "reason is that" },
            { bad: "try and", good: "try to" },
            { bad: "different than", good: "different from" },
            { bad: "less items", good: "fewer items" },
            { bad: "at this point in time", good: "now" },
            { bad: "in spite of the fact that", good: "although" }
        ];

        let passCount = 0;
        const lowerText = data.humanizedText.toLowerCase();
        checks.forEach(check => {
            if (lowerText.includes(check.good) && !lowerText.includes(check.bad)) {
                console.log(`PASS: Fixed '${check.bad}' -> '${check.good}'`);
                passCount++;
            } else {
                console.log(`FAIL: Did not fix '${check.bad}'`);
                console.log(`Context: ...${data.humanizedText.substring(data.humanizedText.indexOf("spite") - 10, data.humanizedText.indexOf("spite") + 20)}...`);
            }
        });

        console.log(`\nPassed ${passCount}/${checks.length} checks.`);

    } catch (e) {
        console.error("Error:", e);
    }
}

test();
