import { join } from "node:path";
import { Glob } from "bun";
import OpenAI, { toFile } from "openai";

const dir = import.meta.dir;
const inputDir = join(dir, "input");

const mimeTypes: Record<string, string> = {
  ".mp3": "audio/mpeg",
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

const client = new OpenAI();

for (const file of files) {
  const ext = file.slice(file.lastIndexOf("."));
  const mime = mimeTypes[ext] ?? "application/octet-stream";
  const filePath = join(inputDir, file);
  const inputFile = Bun.file(filePath);
  const fileSize = inputFile.size;
  const maxSize = 25 * 1024 * 1024; // 25MB

  if (fileSize > maxSize) {
    console.error(`Skipping ${file}: ${(fileSize / 1024 / 1024).toFixed(1)}MB exceeds Whisper's 25MB limit`);
    console.error("Tip: extract audio first with `ffmpeg -i ${file} -vn -acodec aac output.m4a`\n");
    continue;
  }

  const buffer = await inputFile.bytes();

  console.log(`Transcribing ${file} (${(fileSize / 1024 / 1024).toFixed(1)}MB) with whisper-1...`);

  const srt = await client.audio.transcriptions.create({
    file: await toFile(buffer, file, { type: mime }),
    model: "whisper-1",
    language: "ja",
    response_format: "srt",
  });

  console.log("SRT result:");
  console.log(srt);

  const baseName = file.slice(0, file.lastIndexOf("."));
  const outputPath = join(dir, `output/${baseName}-${Bun.randomUUIDv7()}.srt`);
  await Bun.write(outputPath, srt);
  console.log(`Saved to ${outputPath}\n`);
}
