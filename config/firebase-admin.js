const path = require("path");
const admin = require("firebase-admin");
const logger = require("../utils/logger");

let initialized = false;

function initFirebase() {
  if (initialized) return;

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const saPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      const serviceAccount = require(saPath);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      admin.initializeApp({ credential: admin.credential.applicationDefault() });
    }
    initialized = true;
    logger.info("Firebase Admin initialized");
  } catch (err) {
    logger.warn(`Firebase Admin init failed: ${err.message}. Auth middleware will pass through.`);
  }
}

function getAdmin() {
  return initialized ? admin : null;
}

module.exports = { initFirebase, getAdmin };
