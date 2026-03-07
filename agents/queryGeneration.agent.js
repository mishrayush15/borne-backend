const { generateJSON } = require("../services/gemini.service");
const logger = require("../utils/logger");

const SYSTEM_PROMPT = `You are a Query Generation Agent. Given a structured error analysis object, generate 4-5 diverse search queries that a developer would use to find solutions online.

Return a JSON object with this shape:
{
  "queries": [
    "query 1 — generic (language + error message)",
    "query 2 — framework-specific if applicable",
    "query 3 — solution-oriented (includes words like fix, solve, resolve)",
    "query 4 — StackOverflow-optimized (concise, keyword-dense)",
    "query 5 — alternative phrasing or related issue"
  ]
}

Rules:
- Each query should be 5-15 words.
- Queries should be diverse — don't just rephrase the same thing.
- If a framework is present, at least one query must include it.
- Include the error type and key error message in most queries.
- Return ONLY valid JSON, no explanation.`;

async function generate(errorAnalysis) {
  logger.info("Query Generation Agent: starting");

  const prompt = `${SYSTEM_PROMPT}\n\nError analysis:\n${JSON.stringify(errorAnalysis, null, 2)}`;

  const result = await generateJSON(prompt, { temperature: 0.3 });

  const queries = result.queries || [];
  logger.info(`Query Generation Agent: generated ${queries.length} queries`);

  return queries;
}

module.exports = { generate };
