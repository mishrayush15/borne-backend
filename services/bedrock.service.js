const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const logger = require("../utils/logger");

const DEFAULT_MODEL =
  process.env.BEDROCK_MODEL || "anthropic.claude-3-5-haiku-20241022-v1:0";

let client = null;

function getClient() {
  if (!client) {
    const config = { region: process.env.AWS_REGION || "us-east-1" };
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }
    client = new BedrockRuntimeClient(config);
  }
  return client;
}

function isAnthropic(id) {
  return id.includes("anthropic.");
}

function isNova(id) {
  return id.includes("amazon.nova");
}

function isLlama(id) {
  return id.includes("meta.llama");
}

function buildPayload(prompt, { temperature, maxTokens, wantJSON }) {
  const modelId = DEFAULT_MODEL;

  if (isAnthropic(modelId)) {
    return {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: "user", content: prompt }],
      ...(wantJSON && {
        system:
          "You must respond with ONLY valid JSON. No markdown fences, no explanation, no text outside the JSON object.",
      }),
    };
  }

  if (isNova(modelId)) {
    return {
      inferenceConfig: { max_new_tokens: maxTokens, temperature },
      messages: [{ role: "user", content: [{ text: prompt }] }],
    };
  }

  if (isLlama(modelId)) {
    return { prompt, max_gen_len: maxTokens, temperature };
  }

  return {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: "user", content: prompt }],
  };
}

function extractText(modelId, responseBody) {
  if (isAnthropic(modelId)) {
    return (responseBody.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
  }

  if (isNova(modelId)) {
    return responseBody.output?.message?.content?.[0]?.text || "";
  }

  if (isLlama(modelId)) {
    return responseBody.generation || "";
  }

  return responseBody.content?.[0]?.text || JSON.stringify(responseBody);
}

async function invoke(prompt, { temperature = 0.1, maxTokens = 4096, wantJSON = false } = {}) {
  const bedrockClient = getClient();
  const modelId = DEFAULT_MODEL;
  const payload = buildPayload(prompt, { temperature, maxTokens, wantJSON });

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return extractText(modelId, responseBody);
}

async function generateJSON(prompt, { temperature = 0.1, maxTokens = 4096 } = {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const text = await invoke(prompt, { temperature, maxTokens, wantJSON: true });
      const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      return JSON.parse(cleaned);
    } catch (err) {
      logger.warn(`Bedrock JSON attempt ${attempt} failed: ${err.message}`);
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

async function generateText(prompt, { temperature = 0.3, maxTokens = 8192 } = {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await invoke(prompt, { temperature, maxTokens, wantJSON: false });
    } catch (err) {
      logger.warn(`Bedrock text attempt ${attempt} failed: ${err.message}`);
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

module.exports = { generateJSON, generateText };
