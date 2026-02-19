import { join } from "node:path";
import { GoogleGenAI } from "@google/genai";

const dir = import.meta.dir;

const ai = new GoogleGenAI({});
const model = "veo-3.1-generate-preview";

const prompt = await Bun.file(join(dir, "input/prompt.txt")).text();
console.log(`Prompt: ${prompt.slice(0, 100)}`);

console.log("Generating video with Veo...");
let operation = await ai.models.generateVideos({
  model,
  prompt,
  config: {
    aspectRatio: "16:9",
    numberOfVideos: 1,
  },
});

// Poll until completion
while (!operation.done) {
  console.log("Waiting for video generation...");
  await new Promise((resolve) => setTimeout(resolve, 10_000));
  operation = await ai.operations.getVideosOperation({
    operation,
  });
}

const generatedVideos = operation.response?.generatedVideos;
if (!generatedVideos || generatedVideos.length === 0) {
  console.error("No video generated");
  process.exit(1);
}

const video = generatedVideos[0]!;
const uri = video.video?.uri;
if (!uri) {
  console.error("No video URI in response");
  process.exit(1);
}

const filename = join(dir, `output/${Bun.randomUUIDv7()}.mp4`);

console.log("Downloading video...");
try {
  await ai.files.download({ file: video, downloadPath: filename });
} catch {
  console.log("ai.files.download failed, falling back to fetch...");
  const res = await fetch(uri);
  if (!res.ok) {
    console.error(`Failed to download video: ${res.status}`);
    process.exit(1);
  }
  await Bun.write(filename, await res.arrayBuffer());
}

console.log(`Video saved to ${filename}`);
console.log("Done!");
