import { GoogleGenerativeAI } from "@google/generative-ai";

const key = "AIzaSyArOGHqpbQ5xU2C18BTxTPasyefjEAzWso";
const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function run() {
    try {
        console.log("Testing Gemini API connection...");
        const result = await model.generateContent("Hello!");
        console.log("Response:", result.response.text());
        console.log("SUCCESS: API Key is working!");
    } catch (error) {
        console.error("ERROR: API connection failed.");
        console.error(error.message);
    }
}
run();
