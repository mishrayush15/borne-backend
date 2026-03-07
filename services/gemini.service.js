const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

let genAI = null;

function getClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

async function generateJSON(prompt, { model = DEFAULT_MODEL, temperature = 0.1, maxTokens = 4096 } = {}) {
  const client = getClient();
  const generativeModel = client.getGenerativeModel({
    model,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      responseMimeType: "application/json",
    },
  });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await generativeModel.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (err) {
      logger.warn(`Gemini JSON attempt ${attempt} failed: ${err.message}`);
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function generateText(prompt, { model = DEFAULT_MODEL, temperature = 0.3, maxTokens = 8192 } = {}) {
  const client = getClient();
  const generativeModel = client.getGenerativeModel({
    model,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await generativeModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      logger.warn(`Gemini text attempt ${attempt} failed: ${err.message}`);
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

module.exports = { generateJSON, generateText };
