const { generateJSON } = require("../services/ai.service");
const logger = require("../utils/logger");

const SYSTEM_PROMPT = `You are a Solution Synthesis Agent — an expert developer who reads community discussions about an error and produces a clear, actionable debugging guide.

Given the original error context and the top community results (from StackOverflow, GitHub, Reddit, etc.), do the following:

1. For each community discussion provided, write a short 2-3 sentence summary of what the discussion says and how it relates to the error.
2. Write a combined summary that merges the key insights from ALL discussions into one paragraph.
3. Produce a step-by-step fix based on the collective knowledge from these discussions.

Return a JSON object with this exact structure:
{
  "discussionSummaries": [
    {
      "index": 1,
      "title": "Title of the discussion",
      "url": "URL to the discussion",
      "source": "stackoverflow | github | reddit | etc",
      "summary": "2-3 sentence summary of what this discussion says and how it helps solve the error"
    }
  ],
  "combinedSummary": "A paragraph summarizing the collective insights from all discussions — what the community consensus is on this error and how to fix it",
  "problemExplanation": "A clear explanation of what the error means and when it typically occurs",
  "rootCause": "The underlying reason why this error happens",
  "stepByStepFix": [
    {
      "step": 1,
      "title": "Short title for this step",
      "description": "Detailed explanation of what to do",
      "code": "code snippet if applicable, or null"
    }
  ],
  "codeExample": "A complete corrected code example showing the fix in context",
  "additionalTips": ["tip 1", "tip 2"],
  "confidence": "low | medium | high"
}

Rules:
- You MUST provide a summary for EVERY discussion provided, not just some of them.
- The combined summary should synthesize all discussions, not just repeat them.
- Always provide at least 2-3 step-by-step fix items.
- The step-by-step fix should be derived from the solutions discussed across all the community discussions.
- Code examples should be syntactically correct and in the detected language.
- Set confidence based on how consistent and high-quality the community answers are.
- Return ONLY valid JSON.`;

async function synthesize(rankedResults, errorAnalysis) {
  logger.info("Solution Synthesis Agent: starting");

  const discussionContext = rankedResults.map((r, i) => ({
    index: i + 1,
    source: r.source,
    title: r.title,
    url: r.url,
    content: (r.body || "").slice(0, 1500),
    score: r.score,
    isAccepted: r.isAccepted,
  }));

  const prompt = `${SYSTEM_PROMPT}

Original Error:
- Type: ${errorAnalysis.errorType}
- Message: ${errorAnalysis.errorMessage}
- Language: ${errorAnalysis.language}
- Framework: ${errorAnalysis.framework || "none"}
- Keywords: ${(errorAnalysis.keywords || []).join(", ")}

Top Community Discussions:
${JSON.stringify(discussionContext, null, 2)}`;

  const solution = await generateJSON(prompt, {
    temperature: 0.2,
    maxTokens: 8192,
  });

  logger.info("Solution Synthesis Agent: complete", {
    confidence: solution.confidence,
    steps: solution.stepByStepFix?.length,
    discussions: solution.discussionSummaries?.length,
  });

  return solution;
}

module.exports = { synthesize };
