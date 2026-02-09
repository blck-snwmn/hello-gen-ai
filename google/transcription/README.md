# Google Gemini Transcription

Transcribe audio/video to SRT using Google's gemini-3-flash-preview model.

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

Output SRT files are saved to `output/` directory.
