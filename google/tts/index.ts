import { join } from "node:path";
import { GoogleGenAI } from "@google/genai";

const dir = import.meta.dir;

const ai = new GoogleGenAI({});
const model = "gemini-2.5-flash-preview-tts";

const config = await Bun.file(join(dir, "input/config.json")).json();
const voiceName: string = config.voiceName;
const stylePrompt: string = config.stylePrompt;

const text = await Bun.file(join(dir, "input/text.txt")).text();
console.log(`Voice: ${voiceName}, Style: ${stylePrompt}`);
console.log(`Text: ${text.slice(0, 100)}`);

function createWavHeader(pcmDataLength: number): Buffer {
  const sampleRate = 24000;
  const bitsPerSample = 16;
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const header = Buffer.alloc(44);

  // RIFF chunk descriptor
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmDataLength, 4);
  header.write("WAVE", 8);

  // fmt sub-chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  header.write("data", 36);
  header.writeUInt32LE(pcmDataLength, 40);

  return header;
}

// Generate WAV (PCM)
console.log("Generating WAV audio...");
const wavResponse = await ai.models.generateContent({
  model,
  contents: [{ text: `${stylePrompt} ${text}` }],
  config: {
    responseModalities: ["AUDIO"],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName,
        },
      },
    },
  },
});

const wavPart = wavResponse.candidates?.[0]?.content?.parts?.[0];
if (!wavPart?.inlineData?.data) {
  console.error("No WAV audio data received");
  process.exit(1);
}

const pcmData = Buffer.from(wavPart.inlineData.data, "base64");
const wavHeader = createWavHeader(pcmData.length);
const wavBuffer = Buffer.concat([wavHeader, pcmData]);
const wavFilename = join(dir, `output/${Bun.randomUUIDv7()}.wav`);
await Bun.write(wavFilename, wavBuffer);
console.log(`WAV saved to ${wavFilename}`);

console.log("Done!");
