// Test Gemini API Connection
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log('Testing Gemini API...');
console.log('API Key present:', !!API_KEY);
console.log('API Key starts with:', API_KEY?.substring(0, 10) + '...');

const genAI = new GoogleGenerativeAI(API_KEY);

// Try to list available models
async function listModels() {
    try {
        console.log('\n🔍 Attempting to list available models...');

        // The SDK doesn't have a listModels method, so let's try common model names
        const modelsToTry = [
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-1.5-flash-latest',
            'gemini-1.0-pro'
        ];

        for (const modelName of modelsToTry) {
            try {
                console.log(`\nTrying model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hello');
                const response = await result.response;
                console.log(`✅ ${modelName} WORKS!`);
                console.log('Response:', response.text().substring(0, 50) + '...');
                break; // Stop at first working model
            } catch (error) {
                console.log(`❌ ${modelName} failed:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
