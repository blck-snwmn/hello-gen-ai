import { join } from "node:path";
import OpenAI from "openai";

const dir = import.meta.dir;

const client = new OpenAI();
const model = "sora-2";

const prompt = await Bun.file(join(dir, "input/prompt.txt")).text();
console.log(`Prompt: ${prompt.slice(0, 100)}`);

console.log("Generating video with Sora...");
let response = await client.videos.create({
  model,
  prompt,
  seconds: "4",
  size: "1280x720",
});

// Poll until completion
while (response.status !== "completed") {
  if (response.status === "failed") {
    console.error("Video generation failed:", response.error);
    process.exit(1);
  }
  const progress = response.progress ?? 0;
  console.log(`Waiting for video generation... (${(progress * 100).toFixed(0)}%)`);
  await new Promise((resolve) => setTimeout(resolve, 10_000));
  response = await client.videos.retrieve(response.id);
}

console.log("Downloading video...");
const videoResponse = await client.videos.downloadContent(response.id);
const videoBuffer = await videoResponse.arrayBuffer();

const filename = join(dir, `output/${Bun.randomUUIDv7()}.mp4`);
await Bun.write(filename, videoBuffer);
console.log(`Video saved to ${filename}`);
console.log("Done!");
