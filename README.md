# Fluke of Flux

A Next.js application that serves as an AI image generator using the FLUX.1 [schnell] model. This application allows users to enter text prompts and generate images using the FLUX AI model.

## Features

- **AI Image Generation**: Generate images from text prompts using the FLUX.1 [schnell] model
- **Real-time Generation**: Call the FLUX endpoint to generate images based on user prompts
- **History Tracking**: Automatically saves up to 30 generated images in a history panel with timestamps
- **Download Functionality**: Download generated images to your device
- **Clean Interface**: Modern UI with dark theme for optimal viewing experience

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Navigate to the project directory:
```bash
cd fluke-of-flux
```

3. Install dependencies:
```bash
npm install
```

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

3. Enter a text prompt describing the image you want to generate

4. Click "Generate" or press Ctrl+Enter (Cmd+Enter on Mac) to create the image

5. Generated images will automatically appear in the history section below

## Project Structure

```
fluke-of-flux/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   ├── satujam.png
│   └── satujamico.png
├── package.json
├── README.md
└── tsconfig.json
```

## API Endpoint

The application uses a public FLUX endpoint to generate images. The API route is located at `app/api/generate/route.ts`.

## Configuration

The development server is configured to automatically kill port 3000 before starting, which helps avoid port conflicts.

## Technologies Used

- Next.js 14+
- React
- TypeScript
- Tailwind CSS (for styling)
- Node.js

## License

This project is open source and available under the MIT License.