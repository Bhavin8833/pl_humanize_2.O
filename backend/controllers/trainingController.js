import { mlService } from '../services/mlService.js';

export const submitTrainingData = async (req, res) => {
    try {
        const { text, label } = req.body;

        if (!text || !label) {
            return res.status(400).json({ error: "Text and label ('Human' or 'AI') are required." });
        }

        if (label !== 'Human' && label !== 'AI') {
            return res.status(400).json({ error: "Label must be either 'Human' or 'AI'." });
        }

        await mlService.saveTrainingInput(text, label);

        res.json({ message: "Training data received and model updated." });
    } catch (error) {
        console.error("Training error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getModelStatus = (req, res) => {
    res.json({
        isTrained: mlService.isTrained,
        message: mlService.isTrained ? "Model is trained and active." : "Model is initializing or has no data."
    });
};
