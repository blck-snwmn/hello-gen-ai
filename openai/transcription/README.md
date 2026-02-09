# OpenAI Transcription

Transcribe audio/video to SRT using OpenAI's whisper-1 model.

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

Output SRT files are saved to `output/` directory.
