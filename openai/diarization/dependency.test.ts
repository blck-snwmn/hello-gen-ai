import { expect, test } from "bun:test";
import OpenAI, { toFile } from "openai";

test("OpenAI SDK entry points load without network access", async () => {
  const openai = new OpenAI({ apiKey: "test-api-key" });
  const file = await toFile(new Uint8Array([1, 2, 3]), "sample.bin");

  expect(typeof openai.audio.transcriptions.create).toBe("function");
  expect(typeof openai.images.edit).toBe("function");
  expect(typeof openai.videos.create).toBe("function");
  expect(file.name).toBe("sample.bin");
});
