const axios = require("axios");
const logger = require("../utils/logger");

const BASE_URL = "https://www.reddit.com";

const PROGRAMMING_SUBREDDITS = [
  "programming",
  "webdev",
  "javascript",
  "reactjs",
  "node",
  "python",
  "learnprogramming",
  "coding",
];

async function search(query, { limit = 5 } = {}) {
  try {
    const subredditFilter = PROGRAMMING_SUBREDDITS.map((s) => `subreddit:${s}`).join(" OR ");

    const { data } = await axios.get(`${BASE_URL}/search.json`, {
      params: {
        q: `${query} (${subredditFilter})`,
        sort: "relevance",
        t: "all",
        limit,
        restrict_sr: false,
      },
      headers: {
        "User-Agent": "Airborne/1.0 (debugging assistant)",
      },
      timeout: 10000,
    });

    const posts = data?.data?.children || [];
    return posts.map((child) => {
      const post = child.data;
      return {
        source: "reddit",
        title: post.title,
        url: `https://www.reddit.com${post.permalink}`,
        body: (post.selftext || "").slice(0, 2000),
        score: post.score || 0,
        answerCount: post.num_comments || 0,
        isAccepted: false,
        createdAt: new Date(post.created_utc * 1000).toISOString(),
        subreddit: post.subreddit,
      };
    });
  } catch (err) {
    logger.error(`Reddit search failed: ${err.message}`);
    return [];
  }
}

module.exports = { search };
