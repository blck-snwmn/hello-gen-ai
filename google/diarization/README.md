# Google Diarization

Transcribe audio/video with speaker diarization using Gemini's multimodal audio understanding.

## Setup

```bash
bun install
```

Set your API key in `.env`:

```
GOOGLE_API_KEY=your-api-key
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
[00:00:01.200 -> 00:00:03.500] Speaker A: こんにちは
[00:00:03.800 -> 00:00:06.100] Speaker B: はい、こんにちは
```
