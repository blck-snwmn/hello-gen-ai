import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const prompt = await Bun.file("input/prompt.txt").text();
const imageBuffer = await Bun.file("input/banana.jpeg").bytes();
const base64Image = Buffer.from(imageBuffer).toString("base64");

console.log("Generating image with gemini-3-pro-image-preview...");
console.log(`Prompt: ${prompt.slice(0, 100)}...`);

const response = await ai.models.generateContent({
  model: "gemini-3-pro-image-preview",
  contents: [
    { text: prompt },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    },
  ],
  config: {
    responseModalities: ["IMAGE"],
  },
});

const parts = response.candidates?.[0]?.content?.parts;

if (!parts) {
  console.error("No response parts received");
  process.exit(1);
}

for (const part of parts) {
  if (part.text) {
    console.log("Response text:", part.text);
  } else if (part.inlineData) {
    const buffer = Buffer.from(part.inlineData.data!, "base64");
    const filename = `output/${Bun.randomUUIDv7()}.png`;
    await Bun.write(filename, buffer);
    console.log(`Image saved to ${filename}`);
  }
}
