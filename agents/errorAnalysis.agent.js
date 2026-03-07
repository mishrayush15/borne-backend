const { generateJSON } = require("../services/gemini.service");
const logger = require("../utils/logger");

const SYSTEM_PROMPT = `You are an expert Error Analysis Agent. Given a raw error message or stack trace from a developer, analyze it and return a structured JSON object with the following fields:

{
  "language": "the programming language (e.g. javascript, python, java)",
  "framework": "the framework or library if detectable (e.g. react, express, django), or null",
  "errorType": "the type of error (e.g. TypeError, SyntaxError, NullPointerException)",
  "errorMessage": "the core error message string",
  "keywords": ["array", "of", "important", "keywords", "for", "searching"],
  "stackSummary": "a brief one-line summary of where in the code the error originated",
  "severity": "low | medium | high | critical"
}

Rules:
- Always detect the language even if the stack trace is ambiguous.
- Extract 5-8 meaningful keywords that would help find solutions online.
- If no framework is detected, set framework to null.
- Severity: syntax errors are low, runtime type errors are medium, unhandled exceptions/crashes are high, security or data loss are critical.
- Return ONLY valid JSON, no explanation.`;

async function analyze(errorInput, context) {
  logger.info("Error Analysis Agent: starting");

  const userPrompt = context
    ? `Error:\n${errorInput}\n\nAdditional context:\n${context}`
    : `Error:\n${errorInput}`;

  const prompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

  const analysis = await generateJSON(prompt, { temperature: 0.1 });

  logger.info("Error Analysis Agent: complete", {
    language: analysis.language,
    errorType: analysis.errorType,
  });

  return analysis;
}

module.exports = { analyze };
