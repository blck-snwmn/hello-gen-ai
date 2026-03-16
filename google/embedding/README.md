# google/embedding

Multimodal embedding and similarity search using Gemini Embedding 2 (`gemini-embedding-2-preview`) with LanceDB.

Supports text, images (PNG/JPEG), audio (MP3/WAV, max 80s), and video (MP4/MOV, max 128s).

## Usage

```bash
# Embed files into LanceDB (output/lancedb/)
bun run google/embedding/index.ts <file1> [file2] ...

# Search by text query (top 5 results)
bun run google/embedding/search.ts "your query here"
```

Requires `GOOGLE_API_KEY` environment variable.
