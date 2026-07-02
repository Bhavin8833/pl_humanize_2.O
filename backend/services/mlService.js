import natural from 'natural';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODEL_PATH = path.join(__dirname, '../data/ml_model.json');
const TRAINING_DATA_PATH = path.join(__dirname, '../data/training_data.json');

class MLService {
    constructor() {
        this.classifier = new natural.BayesClassifier();
        this.isTrained = false;
        this.loadModel();
    }

    loadModel() {
        if (fs.existsSync(MODEL_PATH)) {
            try {
                // natural.BayesClassifier.load is async or callback-based in some versions, 
                // but for simplicity and stability we often rebuild from data or use restore.
                // Let's try to load the raw JSON if possible, or just re-train from data.
                // Re-training from JSON data is often more robust across versions.
                this.loadTrainingData();
            } catch (e) {
                console.error("Failed to load ML model:", e);
            }
        } else {
            // Initial seed data if nothing exists
            this.seedData();
        }
    }

    seedData() {
        // Add some basic initial knowledge
        this.addDocument("It is important to note that this is a complex issue.", "AI");
        this.addDocument("In conclusion, the results are significant.", "AI");
        this.addDocument("Furthermore, we must consider the implications.", "AI");
        this.addDocument("Hey, just wanted to check in on this.", "Human");
        this.addDocument("I think that's pretty cool, right?", "Human");
        this.addDocument("Nah, I don't really get it.", "Human");
        this.train();
    }

    addDocument(text, label) {
        this.classifier.addDocument(text, label);
    }

    train() {
        return new Promise((resolve, reject) => {
            try {
                this.classifier.train();
                this.isTrained = true;
                this.saveModel();
                console.log("ML Model trained successfully.");
                resolve();
            } catch (e) {
                console.error("Training failed:", e);
                reject(e);
            }
        });
    }

    saveModel() {
        // We will save the classifier state. 
        // Note: natural's save method creates a file.
        this.classifier.save(MODEL_PATH, (err) => {
            if (err) console.error("Error saving model:", err);
        });
    }

    async loadTrainingData() {
        if (fs.existsSync(TRAINING_DATA_PATH)) {
            const data = JSON.parse(fs.readFileSync(TRAINING_DATA_PATH, 'utf8'));
            // Re-add all documents
            // A new classifier instance might be needed to avoid duplicates if we are reloading
            const newClassifier = new natural.BayesClassifier();
            data.forEach(item => {
                newClassifier.addDocument(item.text, item.label);
            });
            this.classifier = newClassifier;
            await this.train();
        } else {
            this.seedData();
        }
    }

    async saveTrainingInput(text, label) {
        // Appending to the persistent training data file
        let data = [];
        if (fs.existsSync(TRAINING_DATA_PATH)) {
            data = JSON.parse(fs.readFileSync(TRAINING_DATA_PATH, 'utf8'));
        }
        data.push({ text, label });
        fs.writeFileSync(TRAINING_DATA_PATH, JSON.stringify(data, null, 2));

        // Update live model
        this.addDocument(text, label);
        await this.train();
    }

    // Returns a score from 0 to 1 representing "Human-ness"
    getHumanScore(text) {
        if (!this.isTrained) return 0.5; // Neutral if not trained

        // getClassifications returns array of { label, value }
        // value is essentially a probability/score (implementation dependent in natural)
        const classifications = this.classifier.getClassifications(text);

        // Find the "Human" score
        const humanClass = classifications.find(c => c.label === 'Human');
        const aiClass = classifications.find(c => c.label === 'AI');

        if (!humanClass || !aiClass) return 0.5;

        // Normalizing: natural returns raw values which sums to 1 usually
        return humanClass.value;
    }
}

export const mlService = new MLService();
