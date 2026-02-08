import { join } from "node:path";
import { Glob } from "bun";
import { GoogleGenAI } from "@google/genai";

const dir = import.meta.dir;
const inputDir = join(dir, "input");

const mimeTypes: Record<string, string> = {
  ".mp3": "audio/mp3",
  ".mp4": "video/mp4",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".webm": "video/webm",
};

const glob = new Glob("*.{mp3,mp4,m4a,wav,webm}");
const files = Array.from(glob.scanSync(inputDir));

if (files.length === 0) {
  console.error("No media files found in input/");
  process.exit(1);
}

const ai = new GoogleGenAI({});

for (const file of files) {
  const ext = file.slice(file.lastIndexOf("."));
  const mime = mimeTypes[ext] ?? "application/octet-stream";
  const filePath = join(inputDir, file);
  const buffer = await Bun.file(filePath).bytes();
  const base64 = Buffer.from(buffer).toString("base64");

  const isVideo = mime.startsWith("video/");
  const mediaType = isVideo ? "動画" : "音声";
  const prompt = `この${mediaType}の音声をSRT字幕形式で文字起こししてください。
以下のフォーマットで出力してください。コードブロックや説明文は不要です。SRTの内容だけを出力してください。

1
00:00:00,000 --> 00:00:03,000
字幕テキスト

2
00:00:03,000 --> 00:00:06,000
字幕テキスト`;

  console.log(`Transcribing ${file} with Gemini...`);

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mime,
              data: base64,
            },
          },
        ],
      },
    ],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error(`No transcription result for ${file}`);
    continue;
  }

  console.log("Transcription result:");
  console.log(text);

  const baseName = file.slice(0, file.lastIndexOf("."));
  const outputPath = join(dir, `output/${baseName}-${Bun.randomUUIDv7()}.srt`);
  await Bun.write(outputPath, text);
  console.log(`Saved to ${outputPath}\n`);
}
