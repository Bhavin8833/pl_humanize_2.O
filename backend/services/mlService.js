import natural from 'natural';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel, the filesystem is read-only except for /tmp
const IS_VERCEL = !!process.env.VERCEL;
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(__dirname, '../data');
const MODEL_PATH = path.join(DATA_DIR, 'ml_model.json');
const TRAINING_DATA_PATH = IS_VERCEL ? '/tmp/training_data.json' : path.join(__dirname, '../data/training_data.json');
// Original (bundled) training data path for read-only access
const BUNDLED_TRAINING_DATA_PATH = path.join(__dirname, '../data/training_data.json');

class MLService {
    constructor() {
        this.classifier = new natural.BayesClassifier();
        this.isTrained = false;
        this.loadModel();
    }

    loadModel() {
        try {
            this.loadTrainingData();
        } catch (e) {
            console.error("Failed to load ML model, using seed data:", e);
            this.seedData();
        }
    }

    seedData() {
        try {
            this.addDocument("It is important to note that this is a complex issue.", "AI");
            this.addDocument("In conclusion, the results are significant.", "AI");
            this.addDocument("Furthermore, we must consider the implications.", "AI");
            this.addDocument("Hey, just wanted to check in on this.", "Human");
            this.addDocument("I think that's pretty cool, right?", "Human");
            this.addDocument("Nah, I don't really get it.", "Human");
            this.train();
        } catch (e) {
            console.error("Seed data training failed:", e);
        }
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
        if (IS_VERCEL) {
            console.log("Running on Vercel - skipping saving model to disk.");
            return;
        }
        try {
            this.classifier.save(MODEL_PATH, (err) => {
                if (err) console.error("Error saving model:", err);
            });
        } catch (e) {
            console.error("Could not save model:", e);
        }
    }

    async loadTrainingData() {
        // Try to read from /tmp first (on Vercel, user-submitted training), then fall back to bundled data
        const pathToRead = (IS_VERCEL && fs.existsSync(TRAINING_DATA_PATH))
            ? TRAINING_DATA_PATH
            : BUNDLED_TRAINING_DATA_PATH;

        if (fs.existsSync(pathToRead)) {
            try {
                const data = JSON.parse(fs.readFileSync(pathToRead, 'utf8'));
                const newClassifier = new natural.BayesClassifier();
                data.forEach(item => {
                    newClassifier.addDocument(item.text, item.label);
                });
                this.classifier = newClassifier;
                await this.train();
            } catch (e) {
                console.error("Error loading training data:", e);
                this.seedData();
            }
        } else {
            this.seedData();
        }
    }

    async saveTrainingInput(text, label) {
        try {
            let data = [];
            const pathToRead = (IS_VERCEL && fs.existsSync(TRAINING_DATA_PATH))
                ? TRAINING_DATA_PATH
                : BUNDLED_TRAINING_DATA_PATH;
            if (fs.existsSync(pathToRead)) {
                data = JSON.parse(fs.readFileSync(pathToRead, 'utf8'));
            }
            data.push({ text, label });
            // Write to /tmp on Vercel, or the data folder locally
            fs.writeFileSync(TRAINING_DATA_PATH, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error("Could not persist training data:", e);
        }

        // Update live model in memory regardless
        this.addDocument(text, label);
        await this.train();
    }

    // Returns a score from 0 to 1 representing "Human-ness"
    getHumanScore(text) {
        if (!this.isTrained) return 0.5; // Neutral if not trained

        try {
            const classifications = this.classifier.getClassifications(text);
            const humanClass = classifications.find(c => c.label === 'Human');
            const aiClass = classifications.find(c => c.label === 'AI');
            if (!humanClass || !aiClass) return 0.5;
            return humanClass.value;
        } catch (e) {
            console.error("Classification error:", e);
            return 0.5;
        }
    }
}

export const mlService = new MLService();

