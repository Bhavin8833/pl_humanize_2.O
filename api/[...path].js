import app from '../backend/server.js';

// Top-level error handler to prevent raw crashes in the serverless function
export default async function handler(req, res) {
    try {
        await new Promise((resolve, reject) => {
            app(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    } catch (err) {
        console.error('[Serverless] Unhandled error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
        }
    }
}
