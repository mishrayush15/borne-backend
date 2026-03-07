const orchestrator = require("../agents/orchestrator");
const DebugSession = require("../models/debugSession.model");
const logger = require("../utils/logger");

async function createDebugSession(req, res, next) {
  const { error: errorInput, context } = req.body || {};

  if (!errorInput || typeof errorInput !== "string" || !errorInput.trim()) {
    return res.status(400).json({
      status: "error",
      message: "The 'error' field is required and must be a non-empty string.",
    });
  }

  const acceptsSSE = req.headers.accept === "text/event-stream";

  if (acceptsSSE) {
    return handleSSE(req, res, errorInput, context);
  }

  try {
    const session = await DebugSession.create({
      errorInput,
      context: context || null,
      status: "processing",
    });

    const { formattedOutput, sessionData } = await orchestrator.run(errorInput, context);

    session.analysis = sessionData.analysis;
    session.queries = sessionData.queries;
    session.communityResults = sessionData.communityResults;
    session.rankedResults = sessionData.rankedResults;
    session.solution = sessionData.solution;
    session.formattedOutput = formattedOutput;
    session.metadata = sessionData.metadata;
    session.status = "completed";
    await session.save();

    res.status(200).json({
      status: "success",
      sessionId: session._id,
      data: formattedOutput,
    });
  } catch (err) {
    logger.error(`Debug session failed: ${err.message}`);
    next(err);
  }
}

async function handleSSE(req, res, errorInput, context) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  function sendEvent(eventName, data) {
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  let session;
  try {
    session = await DebugSession.create({
      errorInput,
      context: context || null,
      status: "processing",
    });

    sendEvent("session", { sessionId: session._id });

    const onProgress = (progress) => {
      sendEvent("progress", progress);
    };

    const { formattedOutput, sessionData } = await orchestrator.run(
      errorInput,
      context,
      onProgress
    );

    session.analysis = sessionData.analysis;
    session.queries = sessionData.queries;
    session.communityResults = sessionData.communityResults;
    session.rankedResults = sessionData.rankedResults;
    session.solution = sessionData.solution;
    session.formattedOutput = formattedOutput;
    session.metadata = sessionData.metadata;
    session.status = "completed";
    await session.save();

    sendEvent("result", { sessionId: session._id, data: formattedOutput });
    sendEvent("done", { sessionId: session._id });
    res.end();
  } catch (err) {
    logger.error(`SSE debug session failed: ${err.message}`);
    if (session) {
      session.status = "failed";
      session.errorMessage = err.message;
      await session.save().catch(() => {});
    }
    sendEvent("error", { message: err.message });
    res.end();
  }
}

async function getDebugSession(req, res, next) {
  try {
    const session = await DebugSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Debug session not found.",
      });
    }

    res.status(200).json({
      status: "success",
      data: session,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createDebugSession, getDebugSession };
