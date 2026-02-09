# OpenAI Diarization

Transcribe audio/video with speaker diarization using OpenAI's gpt-4o-transcribe-diarize model.

## Setup

```bash
bun install
```

Set your API key in `.env`:

```
OPENAI_API_KEY=your-api-key
```

## Usage

Place media files (mp3, mp4, m4a, wav, webm) in `input/`, then run:

```bash
bun run index.ts
```

Output JSON files with speaker annotations are saved to `output/` directory.

## Output Format

The output includes speaker-labeled segments:

```
[00:01.200 -> 00:03.500] A: こんにちは
[00:03.800 -> 00:06.100] B: はい、こんにちは
```

Speakers are labeled sequentially (`A`, `B`, ...) by default.
