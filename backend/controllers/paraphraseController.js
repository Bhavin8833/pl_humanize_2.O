import fetch from 'node-fetch';
import { detectAIContent } from './aiDetectorController.js';


function offlineParaphrase(text) {
    // Simple word replacements for paraphrase
    let result = text;

    const replacements = {
        "happy": "glad",
        "sad": "unhappy",
        "hard": "difficult",
        "easy": "simple",
        "use": "utilize",
        "say": "state",
        "think": "believe",
        "want": "desire",
        "need": "require",
        "get": "obtain",
        "make": "create",
        "good": "excellent",
        "bad": "poor",
        "important": "crucial",
        "help": "assist",
    };

    Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        result = result.replace(regex, value);
    });

    return result;
}

export const paraphraseText = async (req, res) => {
    try {
        const { text, mode = "general", strength = "balanced" } = req.body;
        const apiKey = process.env.LOVABLE_API_KEY;

        if (!text) throw new Error("Text is required");

        const validKey = apiKey && apiKey !== "YOUR_API_KEY_HERE";
        let paraphrasedText = text;
        let aiScore = 100;
        let attempts = 0;
        const MAX_RETRIES = 4; // Increased retries slightly for better quality

        console.log(`Starting humanization. Mode: ${mode}, Strength: ${strength}`);

        if (!validKey) {
            console.log("No API key for paraphrase. Using offline mode.");
            paraphrasedText = offlineParaphrase(text);
        } else {
            // Self-Correction Loop
            while (attempts <= MAX_RETRIES) {
                attempts++;
                console.log(`Attempt ${attempts}/${MAX_RETRIES + 1}...`);

                let systemPrompt = `You are a punchy, opinionated human writer.
Rules:
0. **CRITICAL: ABSOLUTELY NO FILLER WORDS**:
   - DO NOT USE: "Basically", "Sort of", "Kind of", "You see", "Look", "To be clear", "Honestly", "I think", "I believe".
   - BANNED.
1. **RHYTHM & FRAGMENTS**:
   - Write like a human blogger.
   - Use fragments for impact. "Big mistake." "100% transparency."
2. **VIVID LANGUAGE**:
   - Avoid boring words. Use "mediocre mush", "horse manure".
3. **NO RUN-ON SENTENCES**:
   - Do NOT string together multiple phrases. Keep it punchy.
4. **Natural Flow**:
   - Talk to the reader directly.
   - Transitions like "Indeed," "In that sense," "Despite having" are good (See Style B).

**STYLE REFERENCE 1 (OPINIONATED/BLOGGER)**:
"We need writers who are free to express the concerns of their own heart. AI takes horrible writing and morphs it into bland, mediocre mush. It takes high quality writing and brings it down a peg. Probably a lot of writers would take an article like this and say, 'clean this up'. Big mistake. The ensuing result would be a nice dainty pile of horse manure. Do I use ChatGPT? 100% transparency. Yes."

**STYLE REFERENCE 2 (INFORMATIVE/ANALYTICAL)**:
"Previously, knowledge of such technologies as HTML was required to publish content. As of the 2010s, the majority are interactive Web 2.0 websites. Indeed, bloggers not only produce content but also build social relations. Despite having a market capitalization of about 10 percent of Bitcoin, stablecoins are growing in influence because of the interconnections with mainstream financial markets. Indeed, their use has surged."

**INSTRUCTIONS**:
- **DETECT THE TONE**: If the input is casual, use Style 1 (Fragments, Punchy). If formal, use Style 2 (Complex sentences, "Indeed", "Despite").
- **MATCH THE RHYTHM**: Notice how Style 2 uses long, flowing sentences ("Despite having... stemming from..."). This is allowed for formal text.
- **NO FILLER**: The ban on "Basically/Sort of" applies to BOTH styles.
`;

                if (mode === "academic") {
                    systemPrompt += `\nSPECIAL ACADEMIC RULES:
                    - Maintain formal vocabulary but BREAK the sentence rhythm.
                    - Do not use "In conclusion". Use "Ultimately," or "The findings suggest".`;
                }

                if (attempts > 1) {
                    systemPrompt += `\n\nNote: The previous version was too robotic. Please try to be slightly more conversational, but do NOT add unnecessary fluff words like "basically" or long chains of words. Just focus on simple sentence variety.`;
                }

                const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "google/gemini-2.5-flash",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: `Rewrite this text to be 100% human-like:\n\n${text}` },
                        ],
                    }),
                });

                if (!response.ok) {
                    if (response.status === 429 || response.status === 402) {
                        console.warn("Rate limited/Quota exceeded. Falling back to offline.");
                        paraphrasedText = offlineParaphrase(text);
                        break;
                    } else {
                        throw new Error("AI gateway error: " + response.statusText);
                    }
                }

                const data = await response.json();
                let newText = data.choices?.[0]?.message?.content || text;

                // --- AGGRESSIVE RECURSIVE CLEANER ---
                // fillers list (case insensitive)
                const junkPhrases = [
                    "basically", "sort of", "kind of", "pretty much", "honestly",
                    "you see", "look", "probably", "actually", "to be clear",
                    "the thing is", "truth be told", "in fact", "literally",
                    "i think", "i believe", "to be honest"
                ];

                // Recursive Cleaning Loop: Keep cleaning until text stops changing
                let previousText = "";
                let safetyLoop = 0;
                while (newText !== previousText && safetyLoop < 5) {
                    previousText = newText;
                    safetyLoop++;

                    // 1. Remove fillers at START of sentences
                    const startRegex = new RegExp(`(^|[.!?]\\s*)(${junkPhrases.join('|')})([, ]+\\s*(${junkPhrases.join('|')}))*`, 'gim');
                    newText = newText.replace(startRegex, "$1");

                    // 2. Remove chained fillers mid-sentence (e.g. "probably sort of")
                    // Matches: " probably sort of" or ", basically, honestly"
                    // We look for a filler, followed by a separator (space or comma+space), followed by another filler
                    const chainRegex = new RegExp(`(${junkPhrases.join('|')})([, ]+(\\s*${junkPhrases.join('|')}))+`, 'gim');
                    newText = newText.replace(chainRegex, "$1"); // Keep the first filler, discard the rest of the chain

                    // 3. Clean up double separators
                    newText = newText.replace(/,\s*,/g, ",");
                    newText = newText.replace(/\s+,/g, ",");
                    newText = newText.replace(/^[,\s]+/, "");
                }

                // Check AI Score locally
                const detectionResult = detectAIContent(newText);
                aiScore = detectionResult.aiScore;
                paraphrasedText = newText;

                console.log(` Attempt ${attempts} Result: ${aiScore}% AI detected.`);

                if (aiScore === 0) {
                    console.log("Success! 0% AI detection reached.");
                    break;
                }
            }
        }

        return res.json({
            text: paraphrasedText,
            aiScore: aiScore,
            attempts: attempts,
            warning: !validKey ? "Offline Mode: Basic paraphrasing only." : undefined
        });
    } catch (error) {
        console.error("Paraphrase error:", error);
        return res.status(500).json({ error: error.message || "Unknown error" });
    }
};
