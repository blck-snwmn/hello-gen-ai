import OpenAI, { toFile } from "openai";
import { readFile, writeFile } from "fs/promises";

const client = new OpenAI();

const prompt = await readFile("input/prompt.txt", "utf-8");
const imageBuffer = await readFile("input/image.png");

console.log("Generating image with gpt-image-1.5...");
console.log(`Prompt: ${prompt.slice(0, 100)}...`);

const response = await client.images.edit({
  model: "gpt-image-1.5",
  image: await toFile(imageBuffer, "image.png", { type: "image/png" }),
  prompt,
  size: "1024x1024",
});

const imageData = response.data?.[0];

if (!imageData) {
  console.error("No image data received");
  process.exit(1);
}

if (imageData.b64_json) {
  const buffer = Buffer.from(imageData.b64_json, "base64");
  const filename = `output/${Bun.randomUUIDv7()}.png`;
  await writeFile(filename, buffer);
  console.log(`Image saved to ${filename}`);
} else if (imageData.url) {
  console.log("Image URL:", imageData.url);
} else {
  console.log("No image data in response");
}
