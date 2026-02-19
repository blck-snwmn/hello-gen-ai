# hello-gen-ai

Bun monorepo for multi-modal AI experiments.

## Packages

| Package | Description | Model |
|---------|-------------|-------|
| [openai/image](./openai/image) | Image editing | gpt-image-1.5 |
| [openai/transcription](./openai/transcription) | Speech-to-text (SRT) | whisper-1 |
| [openai/diarization](./openai/diarization) | Speech-to-text with speaker diarization | gpt-4o-transcribe-diarize |
| [google/image](./google/image) | Image generation | gemini-3-pro-image-preview |
| [google/transcription](./google/transcription) | Speech-to-text (SRT) | gemini-3-flash-preview |
| [google/diarization](./google/diarization) | Speech-to-text with speaker diarization | gemini-3-flash-preview |
| [openai/video](./openai/video) | Video generation | sora-2 |
| [google/tts](./google/tts) | Text-to-speech (WAV) | gemini-2.5-flash-preview-tts |
| [google/video](./google/video) | Video generation | veo-3.1-generate-preview |
