const axios = require("axios");
const logger = require("../utils/logger");

const BASE_URL = "https://api.stackexchange.com/2.3";

async function search(query, { tagged, pageSize = 5 } = {}) {
  try {
    const params = {
      order: "desc",
      sort: "relevance",
      q: query,
      site: "stackoverflow",
      filter: "withbody",
      pagesize: pageSize,
    };
    if (tagged) params.tagged = tagged;

    const { data } = await axios.get(`${BASE_URL}/search/advanced`, {
      params,
      timeout: 10000,
    });

    return (data.items || []).map((item) => ({
      source: "stackoverflow",
      title: item.title,
      url: item.link,
      body: (item.body || "").slice(0, 2000),
      score: item.score || 0,
      answerCount: item.answer_count || 0,
      isAccepted: item.is_answered || false,
      createdAt: new Date(item.creation_date * 1000).toISOString(),
      tags: item.tags || [],
    }));
  } catch (err) {
    logger.error(`StackOverflow search failed: ${err.message}`);
    return [];
  }
}

module.exports = { search };
