const logger = require("../utils/logger");

const SEVERITY_BADGES = {
  low: { label: "Low", color: "#22c55e" },
  medium: { label: "Medium", color: "#eab308" },
  high: { label: "High", color: "#f97316" },
  critical: { label: "Critical", color: "#ef4444" },
};

const SOURCE_ICONS = {
  stackoverflow: "https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico",
  github: "https://github.com/favicon.ico",
  reddit: "https://www.reddit.com/favicon.ico",
  "dev.to": "https://dev.to/favicon.ico",
  "hashnode.com": "https://hashnode.com/favicon.ico",
  "medium.com": "https://medium.com/favicon.ico",
  "quora.com": "https://quora.com/favicon.ico",
};

function format(solution, errorAnalysis, metadata) {
  logger.info("Output Formatting Agent: starting");

  const severityKey = (errorAnalysis.severity || "medium").toLowerCase();
  const badge = SEVERITY_BADGES[severityKey] || SEVERITY_BADGES.medium;

  const solutionCard = {
    title: `Fix: ${errorAnalysis.errorType || "Error"}`,
    subtitle: errorAnalysis.errorMessage || "",
    severity: {
      level: severityKey,
      ...badge,
    },
    language: errorAnalysis.language,
    framework: errorAnalysis.framework,
  };

  const topDiscussions = (solution.discussionSummaries || []).map((d) => ({
    title: d.title,
    url: d.url,
    source: d.source,
    icon: SOURCE_ICONS[d.source] || null,
    summary: d.summary,
  }));

  const debuggingSteps = (solution.stepByStepFix || []).map((step, i) => ({
    number: step.step || i + 1,
    title: step.title,
    description: step.description,
    code: step.code
      ? {
          language: errorAnalysis.language || "text",
          content: step.code,
        }
      : null,
  }));

  const output = {
    solutionCard,
    topDiscussions,
    combinedSummary: solution.combinedSummary || null,
    problemExplanation: solution.problemExplanation,
    rootCause: solution.rootCause,
    debuggingSteps,
    codeExample: solution.codeExample
      ? {
          language: errorAnalysis.language || "text",
          content: solution.codeExample,
        }
      : null,
    additionalTips: solution.additionalTips || [],
    confidence: solution.confidence || "medium",
    metadata: {
      totalProcessingTime: metadata.totalTime,
      agentTimings: metadata.agentTimings,
      sourcesConsulted: metadata.sourcesConsulted,
      timestamp: new Date().toISOString(),
    },
  };

  logger.info("Output Formatting Agent: complete");

  return output;
}

module.exports = { format };
