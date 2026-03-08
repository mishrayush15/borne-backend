const { generateJSON } = require("../services/ai.service");
const logger = require("../utils/logger");

function computeHeuristicScore(result) {
  let score = 0;

  score += Math.min(result.score || 0, 100) / 100 * 40;

  if (result.isAccepted) score += 20;

  score += Math.min(result.answerCount || 0, 20) / 20 * 15;

  if (result.createdAt) {
    const ageInDays = (Date.now() - new Date(result.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays < 30) score += 15;
    else if (ageInDays < 180) score += 10;
    else if (ageInDays < 365) score += 5;
  }

  if (result.source === "stackoverflow") score += 10;
  else if (result.source === "github") score += 5;

  return Math.round(score * 100) / 100;
}

async function rank(communityResults, errorAnalysis) {
  logger.info("Ranking & Filtering Agent: starting", { resultCount: communityResults.length });

  const withHeuristic = communityResults.map((r) => ({
    ...r,
    heuristicScore: computeHeuristicScore(r),
  }));

  withHeuristic.sort((a, b) => b.heuristicScore - a.heuristicScore);
  const topCandidates = withHeuristic.slice(0, 20);

  if (topCandidates.length === 0) {
    logger.warn("Ranking & Filtering Agent: no results to rank");
    return [];
  }

  let relevanceScores;
  try {
    const summaries = topCandidates.map((r, i) => ({
      index: i,
      title: r.title,
      source: r.source,
      snippet: (r.body || "").slice(0, 300),
    }));

    const prompt = `You are a Ranking Agent. Given an error and a list of community discussion summaries, rate each one's relevance to solving the error on a scale of 0-100.

Error: ${errorAnalysis.errorType}: ${errorAnalysis.errorMessage}
Language: ${errorAnalysis.language}
Framework: ${errorAnalysis.framework || "none"}

Discussions:
${JSON.stringify(summaries, null, 2)}

Return JSON: { "scores": [{"index": 0, "relevance": 85}, ...] }
Only return valid JSON.`;

    const result = await generateJSON(prompt, { temperature: 0.1 });
    relevanceScores = result.scores || [];
  } catch (err) {
    logger.warn(`Relevance scoring failed, using heuristics only: ${err.message}`);
    relevanceScores = [];
  }

  const relevanceMap = new Map();
  for (const s of relevanceScores) {
    relevanceMap.set(s.index, s.relevance);
  }

  const finalRanked = topCandidates.map((r, i) => {
    const relevance = relevanceMap.get(i) ?? 50;
    const combinedScore = r.heuristicScore * 0.4 + relevance * 0.6;
    return { ...r, relevanceScore: relevance, combinedScore: Math.round(combinedScore * 100) / 100 };
  });

  finalRanked.sort((a, b) => b.combinedScore - a.combinedScore);
  const topResults = finalRanked.slice(0, 5);

  logger.info("Ranking & Filtering Agent: complete", { rankedCount: topResults.length });

  return topResults;
}

module.exports = { rank };
