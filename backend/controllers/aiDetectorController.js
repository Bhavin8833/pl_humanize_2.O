import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// AI detection algorithm based on ZeroGPT principles (Statistical NLP Mode)

export const detectAIContent = (text) => {
    // 1. Pre-processing
    // Split into sentences using a robust regex that handles decimals and abbreviations slightly better
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    if (words.length < 10) {
        return {
            aiScore: 0,
            humanScore: 100,
            sentenceBreakdown: sentences.map(s => ({ text: s.trim(), score: 0 })),
            details: { mode: "zerogpt-statistical", message: "Not enough text to analyze accurately." }
        };
    }

    // 2. Burstiness (Sentence Length Variance)
    // Human text has high variance in sentence length. AI has low variance (highly structured).
    const sentenceLengths = sentences.map(s => (s.match(/\b\w+\b/g) || []).length);
    const meanLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((a, b) => a + Math.pow(b - meanLength, 2), 0) / sentenceLengths.length;
    const stdDev = Math.sqrt(variance); // This is our Burstiness metric

    let burstinessAiScore = 0;
    // Lower standard deviation = more robotic/AI-like
    if (stdDev < 4.5) burstinessAiScore = 45;
    else if (stdDev < 6.0) burstinessAiScore = 25;
    else if (stdDev < 8.0) burstinessAiScore = 10;

    // 3. Perplexity / Lexical Predictability
    // Type-Token Ratio (TTR) - measures vocabulary richness
    const uniqueWords = new Set(words);
    const ttr = uniqueWords.size / words.length;
    
    // Average Word Length - AI often averages 4.5 to 5.5
    const avgWordLength = words.reduce((a, b) => a + b.length, 0) / words.length;
    
    // Lexical Heuristics (Common AI phraseology)
    const aiWords = [
        "furthermore", "moreover", "however", "therefore", "consequently",
        "utilize", "implement", "facilitate", "leverage", "optimize",
        "in conclusion", "it is important to note", "in summary", 
        "delve", "tapestry", "underscores", "showcases", "testament",
        "crucial", "significant", "pivotal", "landscape", "realm", "foster"
    ];
    let buzzwordCount = 0;
    aiWords.forEach(word => {
        if (text.toLowerCase().includes(word)) buzzwordCount++;
    });

    // 4. Sentence Level Scoring (for the UI breakdown)
    let totalAIScore = 0;
    const sentenceBreakdown = [];

    sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (!trimmed) return;

        const sWords = trimmed.match(/\b\w+\b/g) || [];
        if (sWords.length === 0) return;
        
        let sentenceScore = 0;
        
        // Penalize sentences that are exactly average length (low burstiness contribution)
        if (sWords.length >= meanLength - 2 && sWords.length <= meanLength + 2) {
            sentenceScore += 25;
        }

        // Penalize very long predictable words (high perplexity score proxy)
        const sAvgLength = sWords.reduce((a, b) => a + b.length, 0) / sWords.length;
        if (sAvgLength > 5.2) {
            sentenceScore += 15;
        }

        // Check for AI buzzwords in this specific sentence
        const lowerSentence = trimmed.toLowerCase();
        aiWords.forEach(word => {
            if (lowerSentence.includes(word)) sentenceScore += 35;
        });
        
        // AI starts sentences predictably
        if (/^(The |This |It |There |In |As |For |With )/i.test(trimmed)) {
            sentenceScore += 10;
        }

        // Lack of contractions is a strong AI signal in English
        const contractionPattern = /(n't|'s|'re|'ve|'ll|'d|'m)/g;
        if (!contractionPattern.test(trimmed) && sWords.length > 8) {
            sentenceScore += 15;
        }

        // Combine base sentence score with global text burstiness penalty
        sentenceScore = Math.min(sentenceScore + burstinessAiScore, 100);
        
        totalAIScore += sentenceScore;
        sentenceBreakdown.push({
            text: trimmed,
            score: sentenceScore
        });
    });

    // 5. Final Score Calculation
    let finalAiScore = sentenceBreakdown.length > 0 ? (totalAIScore / sentenceBreakdown.length) : 0;
    
    // Global Modifiers
    if (buzzwordCount >= 2) finalAiScore += 15;
    if (buzzwordCount >= 4) finalAiScore += 15; // Stack penalty
    
    // High burstiness strongly indicates human writer
    if (stdDev > 9.0) finalAiScore -= 25; 
    if (stdDev > 12.0) finalAiScore -= 20;

    // Format boundaries
    finalAiScore = Math.max(0, Math.min(Math.round(finalAiScore), 100));

    return {
        aiScore: finalAiScore,
        humanScore: 100 - finalAiScore,
        sentenceBreakdown,
        details: { 
            mode: "zerogpt-statistical",
            metrics: {
                burstiness_stdDev: stdDev.toFixed(2),
                lexical_ttr: ttr.toFixed(2),
                avgWordLength: avgWordLength.toFixed(2),
                aiBuzzwordsDetected: buzzwordCount
            }
        }
    };
};

export const detectAI = (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text required" });

        console.log(`Analyzing (ZeroGPT Statistical Mode)... Length: ${text.length} chars`);
        const result = detectAIContent(text);

        console.log(`Final Report Result: ${result.aiScore}% AI | ${result.humanScore}% Human`);
        console.log(`Metrics -> Burstiness: ${result.details.metrics.burstiness_stdDev} | TTR: ${result.details.metrics.lexical_ttr}`);

        res.json(result);
    } catch (e) {
        console.error("Detector Error:", e);
        res.status(500).json({ error: e.message });
    }
};
