# Google Gemini Image Generation

Generate images using Google's Gemini image models.

## Supported Models

| Alias                 | Model ID                       |
| --------------------- | ------------------------------ |
| `pro`, `nanobana-pro` | gemini-3-pro-image-preview     |
| `flash`, `nanobana-2` | gemini-3.1-flash-image-preview |

## Setup

```bash
bun install
```

Set your API key in `.env`:

```
GOOGLE_API_KEY=your-api-key
```

## Usage

```bash
# Default (pro)
bun run index.ts

# Use alias
bun run index.ts flash
bun run index.ts nanobana-2

# Use full model ID directly
bun run index.ts gemini-3.1-flash-image-preview
```

Output images are saved to `output/` directory.
