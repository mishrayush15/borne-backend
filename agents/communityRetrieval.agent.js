const stackoverflowService = require("../services/stackoverflow.service");
const githubService = require("../services/github.service");
const redditService = require("../services/reddit.service");
const googleSearchService = require("../services/googleSearch.service");
const logger = require("../utils/logger");

async function retrieve(queries, errorAnalysis) {
  logger.info("Community Retrieval Agent: starting", { queryCount: queries.length });

  const primaryQuery = queries[0] || "";
  const tagged = errorAnalysis?.language || "";

  const searchPromises = [
    stackoverflowService.search(primaryQuery, { tagged }).catch(() => []),
    githubService.search(primaryQuery).catch(() => []),
    redditService.search(primaryQuery).catch(() => []),
    googleSearchService.search(primaryQuery).catch(() => []),
  ];

  if (queries.length > 1) {
    searchPromises.push(
      stackoverflowService.search(queries[1], { tagged }).catch(() => [])
    );
  }
  if (queries.length > 2) {
    searchPromises.push(
      githubService.search(queries[2]).catch(() => [])
    );
  }

  const settled = await Promise.allSettled(searchPromises);

  const allResults = [];
  const sourceStats = {};

  for (const result of settled) {
    if (result.status === "fulfilled" && Array.isArray(result.value)) {
      for (const item of result.value) {
        allResults.push(item);
        sourceStats[item.source] = (sourceStats[item.source] || 0) + 1;
      }
    }
  }

  const deduped = deduplicateByUrl(allResults);

  logger.info("Community Retrieval Agent: complete", {
    totalResults: deduped.length,
    sources: sourceStats,
  });

  return deduped;
}

function deduplicateByUrl(results) {
  const seen = new Set();
  return results.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}

module.exports = { retrieve };
