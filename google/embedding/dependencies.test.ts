import { afterAll, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GoogleGenAI } from "@google/genai";
import * as lancedb from "@lancedb/lancedb";

const temporaryDirectories: string[] = [];

afterAll(async () => {
  await Promise.all(temporaryDirectories.map((path) => rm(path, { recursive: true, force: true })));
});

test("Google Gen AI SDK entry points load without network access", () => {
  const google = new GoogleGenAI({ apiKey: "test-api-key" });

  expect(typeof google.models.generateContent).toBe("function");
  expect(typeof google.models.embedContent).toBe("function");
});

test("LanceDB native binding creates and queries a local vector table", async () => {
  const databasePath = await mkdtemp(join(tmpdir(), "hello-gen-ai-lancedb-"));
  temporaryDirectories.push(databasePath);

  const database = await lancedb.connect(databasePath);
  const table = await database.createTable("items", [
    { source: "first", vector: [1, 0, 0] },
    { source: "second", vector: [0, 1, 0] },
  ]);
  const rows = await table.vectorSearch([1, 0, 0]).limit(1).toArray();

  expect(await table.countRows()).toBe(2);
  expect(rows).toHaveLength(1);
  expect(rows[0]?.source).toBe("first");
});
