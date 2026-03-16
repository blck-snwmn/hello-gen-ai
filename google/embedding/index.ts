import { join } from "node:path";
import * as lancedb from "@lancedb/lancedb";
import { GoogleGenAI } from "@google/genai";

const dir = import.meta.dir;
const DIMENSIONS = 768;
const TABLE_NAME = "items";

const ai = new GoogleGenAI({});
const model = "gemini-embedding-2-preview";

// --- Usage ---
const files = process.argv.slice(2);
if (files.length === 0) {
  console.log("Usage: bun run google/embedding/index.ts <file1> [file2] ...");
  console.log("");
  console.log("Supported file types:");
  console.log("  .json  - JSON array of text strings");
  console.log("  .txt   - Single text string");
  console.log("  .png   - PNG image");
  console.log("  .jpg   - JPEG image");
  console.log("  .mp3   - MP3 audio (max 80s)");
  console.log("  .wav   - WAV audio (max 80s)");
  console.log("  .mp4   - MP4 video (max 128s)");
  console.log("  .mov   - MOV video (max 128s)");
  console.log("");
  console.log("Embeddings are saved to output/lancedb/.");
  console.log("Re-running with the same file skips already-embedded sources.");
  process.exit(1);
}

// --- DB setup ---
const dbPath = join(dir, "output/lancedb");
const db = await lancedb.connect(dbPath);

const tableNames = await db.tableNames();
const tableExists = tableNames.includes(TABLE_NAME);
let table: lancedb.Table | null = tableExists ? await db.openTable(TABLE_NAME) : null;

// --- Helpers ---
const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

async function embedContent(parts: Array<Record<string, unknown>>): Promise<number[]> {
  const res = await ai.models.embedContent({
    model,
    contents: [{ parts }],
    config: { taskType: "RETRIEVAL_DOCUMENT", outputDimensionality: DIMENSIONS },
  });
  const values = res.embeddings?.[0]?.values;
  if (!values) {
    throw new Error("No embedding returned");
  }
  return values;
}

async function sourceExists(source: string): Promise<boolean> {
  if (!table) return false;
  const results = await table
    .query()
    .where(`source = '${source.replace(/'/g, "''")}'`)
    .toArray();
  return results.length > 0;
}

async function insertItem(contentType: string, source: string, vector: number[]): Promise<void> {
  const row = { content_type: contentType, source, vector };
  if (table) {
    await table.add([row]);
  } else {
    table = await db.createTable(TABLE_NAME, [row]);
  }
}

// --- Process each file ---
for (const filePath of files) {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();

  if (ext === ".json") {
    const texts: string[] = await Bun.file(filePath).json();
    console.log(`Embedding ${texts.length} texts from ${filePath}...`);
    for (const text of texts) {
      if (await sourceExists(text)) {
        console.log(`  [skip] ${text.slice(0, 60)}`);
        continue;
      }
      const vector = await embedContent([{ text }]);
      await insertItem("text", text, vector);
      console.log(`  [text] ${text.slice(0, 60)}`);
    }
  } else if (ext === ".txt") {
    const text = (await Bun.file(filePath).text()).trim();
    if (await sourceExists(text)) {
      console.log(`[skip] ${filePath}`);
    } else {
      console.log(`Embedding text from ${filePath}...`);
      const vector = await embedContent([{ text }]);
      await insertItem("text", text, vector);
      console.log(`  [text] ${text.slice(0, 60)}`);
    }
  } else {
    const mimeType = MIME_TYPES[ext];
    if (!mimeType) {
      console.error(`Unsupported file type: ${ext} (${filePath})`);
      continue;
    }
    if (await sourceExists(filePath)) {
      console.log(`[skip] ${filePath}`);
      continue;
    }
    const contentType = mimeType.split("/")[0] ?? "unknown";
    console.log(`Embedding ${contentType} from ${filePath}...`);
    const data = Buffer.from(await Bun.file(filePath).bytes()).toString("base64");
    const vector = await embedContent([{ inlineData: { mimeType, data } }]);
    await insertItem(contentType, filePath, vector);
    console.log(`  [${contentType}] ${filePath}`);
  }
}

console.log("\nDone!");
