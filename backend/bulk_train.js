import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { mlService } from './services/mlService.js';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CORPUS_DIR = path.join(__dirname, 'training_corpus');

const trainFromCorpus = async () => {
    if (!fs.existsSync(CORPUS_DIR)) {
        console.log(`Creating corpus directory at: ${CORPUS_DIR}`);
        fs.mkdirSync(CORPUS_DIR);
        console.log("Please place your human-written .txt or .pdf files in this directory and run the script again.");
        return;
    }

    const files = fs.readdirSync(CORPUS_DIR).filter(file => file.endsWith('.txt') || file.endsWith('.pdf'));

    if (files.length === 0) {
        console.log("No .txt or .pdf files found in training_corpus. Please add some files.");
        return;
    }

    console.log(`Found ${files.length} files. Starting training...`);

    let count = 0;
    for (const file of files) {
        const filePath = path.join(CORPUS_DIR, file);
        let content = '';

        try {
            if (file.endsWith('.pdf')) {
                process.stdout.write(`Reading PDF ${file}... `);
                const dataBuffer = fs.readFileSync(filePath);
                const pdfData = await pdf(dataBuffer);
                content = pdfData.text;
                console.log(`Extracted ${content.length} characters.`);
            } else {
                content = fs.readFileSync(filePath, 'utf-8');
            }
        } catch (err) {
            console.error(`\nError reading ${file}:`, err.message);
            continue;
        }

        if (!content || content.trim().length < 50) {
            console.log(`Skipping ${file} - too short or empty.`);
            continue;
        }

        // We assume these are HUMAN written texts as per user request
        // Use saveTrainingInput to persist and train
        process.stdout.write(`Training on ${file}... `);
        await mlService.saveTrainingInput(content, 'Human');
        console.log("Done.");
        count++;
    }

    console.log(`\nSuccessfully trained on ${count} documents.`);
    console.log("The AI Humanizer detection logic will now favor this style.");
};

trainFromCorpus();
