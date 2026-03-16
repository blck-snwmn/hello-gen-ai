import { existsSync } from "node:fs";
import { join } from "node:path";
import * as lancedb from "@lancedb/lancedb";
import { GoogleGenAI } from "@google/genai";

const dir = import.meta.dir;
const DIMENSIONS = 768;
const TABLE_NAME = "items";

const ai = new GoogleGenAI({});
const model = "gemini-embedding-2-preview";

// --- Usage ---
const queryText = process.argv.slice(2).join(" ");
if (!queryText) {
  console.log("Usage: bun run google/embedding/search.ts <query text>");
  console.log("");
  console.log('Example: bun run google/embedding/search.ts "How does RAG improve AI?"');
  process.exit(1);
}

// --- DB setup ---
const dbPath = join(dir, "output/lancedb");
if (!existsSync(dbPath)) {
  console.error("Database not found. Run index.ts first to embed some content.");
  process.exit(1);
}

const db = await lancedb.connect(dbPath);

const tableNames = await db.tableNames();
if (!tableNames.includes(TABLE_NAME)) {
  console.error("Database is empty. Run index.ts first to embed some content.");
  process.exit(1);
}

const table = await db.openTable(TABLE_NAME);
const count = await table.countRows();
console.log(`Database contains ${count} items.`);

// --- Query ---
console.log(`Query: ${queryText}`);

const res = await ai.models.embedContent({
  model,
  contents: [{ parts: [{ text: queryText }] }],
  config: { taskType: "RETRIEVAL_QUERY", outputDimensionality: DIMENSIONS },
});
const values = res.embeddings?.[0]?.values;
if (!values) {
  throw new Error("No embedding returned");
}

const results = await table.vectorSearch(values).limit(5).toArray();

console.log("\n--- Top 5 similar items ---");
for (const row of results) {
  const preview = row.content_type === "text" ? row.source.slice(0, 80) : row.source;
  console.log(`  [${row.content_type}] distance=${Number(row._distance).toFixed(4)} | ${preview}`);
}

console.log("\nDone!");
