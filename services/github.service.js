const axios = require("axios");
const logger = require("../utils/logger");

const BASE_URL = "https://api.github.com";

async function search(query, { perPage = 5 } = {}) {
  try {
    const headers = { Accept: "application/vnd.github.v3+json" };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const { data } = await axios.get(`${BASE_URL}/search/issues`, {
      params: {
        q: `${query} in:title,body`,
        sort: "reactions",
        order: "desc",
        per_page: perPage,
      },
      headers,
      timeout: 10000,
    });

    return (data.items || []).map((item) => ({
      source: "github",
      title: item.title,
      url: item.html_url,
      body: (item.body || "").slice(0, 2000),
      score: (item.reactions?.["+1"] || 0) + (item.reactions?.heart || 0),
      answerCount: item.comments || 0,
      isAccepted: item.state === "closed",
      createdAt: item.created_at,
      labels: (item.labels || []).map((l) => l.name),
    }));
  } catch (err) {
    logger.error(`GitHub search failed: ${err.message}`);
    return [];
  }
}

module.exports = { search };
