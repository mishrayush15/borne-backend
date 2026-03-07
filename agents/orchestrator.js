const errorAnalysisAgent = require("./errorAnalysis.agent");
const queryGenerationAgent = require("./queryGeneration.agent");
const communityRetrievalAgent = require("./communityRetrieval.agent");
const rankingFilteringAgent = require("./rankingFiltering.agent");
const solutionSynthesisAgent = require("./solutionSynthesis.agent");
const outputFormattingAgent = require("./outputFormatting.agent");
const logger = require("../utils/logger");

const AGENT_STEPS = [
  { name: "Error Analysis", key: "errorAnalysis" },
  { name: "Query Generation", key: "queryGeneration" },
  { name: "Community Retrieval", key: "communityRetrieval" },
  { name: "Ranking & Filtering", key: "rankingFiltering" },
  { name: "Solution Synthesis", key: "solutionSynthesis" },
  { name: "Output Formatting", key: "outputFormatting" },
];

/**
 * Runs the full multi-agent debugging pipeline.
 *
 * @param {string} errorInput - Raw error / stack trace
 * @param {string|null} context - Optional additional context
 * @param {function|null} onProgress - Callback: (stepIndex, stepName, status, data?) => void
 * @returns {object} { formattedOutput, sessionData }
 */
async function run(errorInput, context = null, onProgress = null) {
  const pipelineStart = Date.now();
  const agentTimings = {};
  const sessionData = { errorInput, context };

  function emitProgress(stepIndex, status, data = null) {
    const step = AGENT_STEPS[stepIndex];
    if (onProgress) {
      onProgress({
        step: stepIndex + 1,
        totalSteps: AGENT_STEPS.length,
        name: step.name,
        status,
        ...(data && { data }),
      });
    }
  }

  function timeAgent(key, fn) {
    return async (...args) => {
      const start = Date.now();
      const result = await fn(...args);
      agentTimings[key] = Date.now() - start;
      return result;
    };
  }

  try {
    // Agent 1: Error Analysis
    emitProgress(0, "running");
    const analysis = await timeAgent("errorAnalysis", errorAnalysisAgent.analyze)(errorInput, context);
    sessionData.analysis = analysis;
    emitProgress(0, "completed", { language: analysis.language, errorType: analysis.errorType });

    // Agent 2: Query Generation
    emitProgress(1, "running");
    const queries = await timeAgent("queryGeneration", queryGenerationAgent.generate)(analysis);
    sessionData.queries = queries;
    emitProgress(1, "completed", { queryCount: queries.length });

    // Agent 3: Community Retrieval
    emitProgress(2, "running");
    const communityResults = await timeAgent("communityRetrieval", communityRetrievalAgent.retrieve)(queries, analysis);
    sessionData.communityResults = communityResults;
    emitProgress(2, "completed", { resultCount: communityResults.length });

    // Agent 4: Ranking & Filtering
    emitProgress(3, "running");
    const rankedResults = await timeAgent("rankingFiltering", rankingFilteringAgent.rank)(communityResults, analysis);
    sessionData.rankedResults = rankedResults;
    emitProgress(3, "completed", { topCount: rankedResults.length });

    // Agent 5: Solution Synthesis
    emitProgress(4, "running");
    const solution = await timeAgent("solutionSynthesis", solutionSynthesisAgent.synthesize)(rankedResults, analysis);
    sessionData.solution = solution;
    emitProgress(4, "completed", { confidence: solution.confidence });

    // Agent 6: Output Formatting
    emitProgress(5, "running");
    const metadata = {
      totalTime: Date.now() - pipelineStart,
      agentTimings,
      sourcesConsulted: communityResults.length,
    };
    const formattedOutput = outputFormattingAgent.format(solution, analysis, metadata);
    sessionData.formattedOutput = formattedOutput;
    sessionData.metadata = metadata;
    emitProgress(5, "completed");

    logger.info("Pipeline complete", {
      totalTime: metadata.totalTime,
      agentTimings,
    });

    return { formattedOutput, sessionData };
  } catch (err) {
    logger.error(`Pipeline failed: ${err.message}`, { stack: err.stack });
    throw err;
  }
}

module.exports = { run, AGENT_STEPS };
