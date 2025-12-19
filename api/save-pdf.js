/* global process */
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'ai-bidv-reports';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    if (!MONGODB_URI) {
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    const client = await MongoClient.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = client.db(DB_NAME);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('reports');

        const { pdfBase64, tenderId, evaluatorId, metadata } = req.body;

        if (!pdfBase64 || !tenderId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await collection.insertOne({
            tenderId,
            evaluatorId, // Optional
            pdfBase64, // Storing base64 directly for hackathon simplicity. GridFS is better for large files.
            createdAt: new Date(),
            metadata: metadata || {}
        });

        return res.status(200).json({
            success: true,
            message: 'Report saved to MongoDB',
            id: result.insertedId
        });

    } catch (error) {
        console.error('Error saving to MongoDB:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
