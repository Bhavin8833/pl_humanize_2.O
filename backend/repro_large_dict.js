import fetch from 'node-fetch';

const text = `
We will abrogate the treaty.
The aberration was minor.
We must ameliorate the conditions.
The abundant resources were helpful.
He will absolve the prisoner.
The adversary was defeated.
The large amount will accrue interest.
We will accumulate the data.
`;

async function test() {
    console.log("Testing Large Dictionary Integration...");
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

        // Verification Checks - Focus on REMOVAL of complex words
        const checks = [
            { bad: "abrogate", good: "cancel" },
            { bad: "aberration", good: "mistake" },
            { bad: "ameliorate", good: "improve" },
            { bad: "abundant", good: "plenty" },
            { bad: "absolve", good: "forgive" },
            { bad: "adversary", good: "enemy" },
            { bad: "accumulate", "good": "gather" }
        ];

        let passCount = 0;
        const lowerText = data.humanizedText.toLowerCase();

        checks.forEach(check => {
            const badExists = lowerText.includes(check.bad);
            const goodExists = lowerText.includes(check.good);

            if (!badExists) {
                console.log(`PASS: Removed '${check.bad}' (Found '${goodExists ? check.good : "alternative simplification"}')`);
                passCount++;
            } else {
                console.log(`FAIL: Still contains '${check.bad}'. Output: ...${lowerText.substring(Math.max(0, lowerText.indexOf(check.bad) - 10), lowerText.indexOf(check.bad) + 20)}...`);
            }
        });

        console.log(`\nPassed ${passCount}/${checks.length} checks.`);

    } catch (e) {
        console.error("Error:", e);
    }
}

test();
