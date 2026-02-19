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
    console.error(`Skipping ${file}: ${(fileSize / 1024 / 1024).toFixed(1)}MB exceeds 25MB limit`);
    console.error("Tip: extract audio first with `ffmpeg -i ${file} -vn -acodec aac output.m4a`\n");
    continue;
  }

  const buffer = await inputFile.bytes();

  console.log(
    `Transcribing ${file} (${(fileSize / 1024 / 1024).toFixed(1)}MB) with gpt-4o-transcribe-diarize...`,
  );

  const result = await client.audio.transcriptions.create({
    file: await toFile(buffer, file, { type: mime }),
    model: "gpt-4o-transcribe-diarize",
    language: "ja",
    response_format: "diarized_json",
    chunking_strategy: "auto",
  });

  const diarized = result as OpenAI.Audio.Transcriptions.TranscriptionDiarized;

  console.log(`\nFull text:\n${diarized.text}\n`);
  console.log(`Duration: ${diarized.duration}s`);
  console.log(`Segments: ${diarized.segments.length}\n`);

  for (const seg of diarized.segments) {
    const start = formatTime(seg.start);
    const end = formatTime(seg.end);
    console.log(`[${start} -> ${end}] ${seg.speaker}: ${seg.text}`);
  }

  const baseName = file.slice(0, file.lastIndexOf("."));
  const outputPath = join(dir, `output/${baseName}-${Bun.randomUUIDv7()}.json`);
  await Bun.write(outputPath, JSON.stringify(diarized, null, 2));
  console.log(`\nSaved to ${outputPath}\n`);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}
