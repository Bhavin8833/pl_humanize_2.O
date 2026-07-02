import fetch from 'node-fetch';

const test = async () => {
    try {
        console.log("Sending request to detector...");
        const response = await fetch("http://127.0.0.1:5000/api/ai-detector", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: "This is a test sentence. It should be processed by the legacy detector."
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Success! Status:", response.status);
            console.log("Data:", JSON.stringify(data, null, 2));
        } else {
            console.log("Error Status:", response.status);
            const text = await response.text();
            console.log("Response Values:", text);
        }
    } catch (e) {
        console.error("Connection Failed:", e.message);
    }
};

test();
