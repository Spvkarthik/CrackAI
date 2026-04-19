const path = require("path");
const fs = require("fs");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });

const file = path.join(dataDir, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter, {
  users: [],
  history: [],
  results: [],
});

async function initDb() {
  await db.read();
  db.data ||= { users: [], history: [], results: [] };
  db.data.users ||= [];
  db.data.history ||= [];
  db.data.results ||= [];
  await db.write();
}

module.exports = { db, initDb };

