const axios = require("axios");
const logger = require("../utils/logger");

const BASE_URL = "https://www.googleapis.com/customsearch/v1";

const SITE_TARGETS = ["dev.to", "hashnode.com", "medium.com", "quora.com"];

async function search(query, { numResults = 5 } = {}) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !engineId) {
    logger.warn("Google Custom Search not configured — skipping");
    return [];
  }

  try {
    const siteQuery = SITE_TARGETS.map((s) => `site:${s}`).join(" OR ");
    const fullQuery = `${query} (${siteQuery})`;

    const { data } = await axios.get(BASE_URL, {
      params: {
        key: apiKey,
        cx: engineId,
        q: fullQuery,
        num: Math.min(numResults, 10),
      },
      timeout: 10000,
    });

    return (data.items || []).map((item) => {
      const hostname = new URL(item.link).hostname.replace("www.", "");
      return {
        source: hostname,
        title: item.title,
        url: item.link,
        body: (item.snippet || "").slice(0, 2000),
        score: 0,
        answerCount: 0,
        isAccepted: false,
        createdAt: null,
      };
    });
  } catch (err) {
    logger.error(`Google Custom Search failed: ${err.message}`);
    return [];
  }
}

module.exports = { search };
