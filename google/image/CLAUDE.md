# Google Gemini Image Package

Image generation using Google's gemini-3-pro-image-preview model.

## Structure

```
google/image/
├── index.ts       # Main script
├── input/
│   ├── banana.jpeg    # Input image
│   └── prompt.txt     # Generation prompt
└── output/        # Generated images
```

## Notes

- Uses @google/genai SDK
- Uses `responseModalities: ["IMAGE"]` for image output
- Output format: PNG
- Filenames use UUIDv7
