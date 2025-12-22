# OpenAI Image Package

Image editing using OpenAI's gpt-image-1.5 model.

## Structure

```
openai/image/
├── index.ts       # Main script
├── input/
│   ├── banana.jpeg    # Input image
│   └── prompt.txt     # Edit prompt
└── output/        # Generated images
```

## Notes

- Uses OpenAI SDK's `images.edit` API
- Output format: PNG (1024x1024)
- Filenames use UUIDv7
