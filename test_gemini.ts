import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ override: true });

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("No API key found in process.env.GEMINI_API_KEY");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: key });

async function testCall() {
  console.log("Testing Gemini API call with key suffix:", key.substring(key.length - 4));
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello",
    });
    console.log("SUCCESS!", response.text);
  } catch (error: any) {
    console.error("API CALL FAILED!");
    console.error("Status:", error.status);
    console.error("Message:", error.message);
  }
}

testCall();
