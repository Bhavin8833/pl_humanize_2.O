import fetch from 'node-fetch';

const text = `3. Transparent pricing means Prusa publishes the detailed bill of materials and pricing information associated with each product manufactured within the facility through their blog as a means to have customers feel confident that they are being treated fairly by Prusa as a company. 
4. Upgrade pricing model allows customers to upgrade their original purchase without having to repurchase another complete machine. Prusa offers upgrade kits to customers to upgrade their original machines to the latest model (e.g., MK3 to MK3S to MK4). By doing so, customers save money while being loyal to Prusa. 
5. Community value pricing is justified by customers believing they are receiving more value from their use of PrusaSlicer and Printables.com, in addition to the strong response from Prusa toward supporting customers. 
Overall, Prusa Research has developed pricing strategies that combine cost-based, transparent, competitive prices and focus on providing upgrades to customers in order to retain them, rather than forcing them into repurchasing new products`;

async function test(mode, strength) {
    console.log(`\n--- Testing Mode: ${mode} / Strength: ${strength} ---`);
    try {
        const res = await fetch("http://localhost:5000/api/humanize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, mode, strength })
        });
        const data = await res.json();
        console.log("Humanized Text:\n" + data.humanizedText);

        // Quality Checks
        const hasSlang = /givin'|wanna|sort of|basically/i.test(data.humanizedText);
        const hasDashes = data.humanizedText.includes(" - ");

        console.log(`\n[Audit] Slang Found? ${hasSlang}`);
        console.log(`[Audit] Dashes Found? ${hasDashes}`);

    } catch (e) {
        console.error("Error:", e);
    }
}

async function run() {
    await test("professional", "balanced");
    // Comparison (optional)
    // await test("casual", "balanced");
}

run();
