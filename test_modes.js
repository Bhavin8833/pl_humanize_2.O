const text = "Artificial intelligence is a branch of computer science that aims to create intelligent machines. It has become an essential part of the technology industry. Furthermore, it plays a crucial role in modern applications.";

async function testMode(mode, strength) {
  const response = await fetch("http://localhost:5000/api/humanize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, mode, strength })
  });
  const data = await response.json();
  console.log(`\n=== Mode: ${mode}, Strength: ${strength} ===\n${data.humanizedText}`);
}

async function run() {
  await testMode("general", "balanced");
  await testMode("academic", "balanced");
  await testMode("casual", "aggressive");
}
run();
