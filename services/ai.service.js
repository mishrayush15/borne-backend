const logger = require("../utils/logger");

const AI_PROVIDER = (process.env.AI_PROVIDER || "gemini").toLowerCase();

let provider;

if (AI_PROVIDER === "bedrock" || AI_PROVIDER === "aws") {
  provider = require("./bedrock.service");
  logger.info(`AI provider: AWS Bedrock (model: ${process.env.BEDROCK_MODEL || "claude-3.5-haiku"})`);
} else {
  provider = require("./gemini.service");
  logger.info(`AI provider: Google Gemini (model: ${process.env.GEMINI_MODEL || "gemini-1.5-flash"})`);
}

module.exports = {
  generateJSON: provider.generateJSON,
  generateText: provider.generateText,
};
