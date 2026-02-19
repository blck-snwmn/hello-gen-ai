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
  const prompt = `この${mediaType}の音声を話者分離（speaker diarization）付きで文字起こししてください。
以下のJSON形式で出力してください。コードブロックや説明文は不要です。JSONの内容だけを出力してください。

{
  "segments": [
    {
      "speaker": "話者のラベル（例: Speaker A, Speaker B）",
      "start": "開始タイムスタンプ（例: 00:00:01.200）",
      "end": "終了タイムスタンプ（例: 00:00:03.500）",
      "text": "発話内容"
    }
  ]
}

注意事項:
- 話者が変わるたびに新しいセグメントを作成してください
- 同じ話者が連続して話している場合でも、意味のある区切りでセグメントを分けてください
- タイムスタンプはできるだけ正確にしてください
- 話者ラベルは一貫して使用してください（同じ人物には同じラベル）`;

  console.log(`Transcribing ${file} with Gemini (speaker diarization)...`);

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

  let parsed: { segments: Array<{ speaker: string; start: string; end: string; text: string }> };
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error(`Failed to parse JSON response for ${file}`);
    console.error("Raw response:");
    console.error(text);
    continue;
  }

  console.log(`\nSegments: ${parsed.segments.length}\n`);

  for (const seg of parsed.segments) {
    console.log(`[${seg.start} -> ${seg.end}] ${seg.speaker}: ${seg.text}`);
  }

  const baseName = file.slice(0, file.lastIndexOf("."));
  const outputPath = join(dir, `output/${baseName}-${Bun.randomUUIDv7()}.json`);
  await Bun.write(outputPath, JSON.stringify(parsed, null, 2));
  console.log(`\nSaved to ${outputPath}\n`);
}
