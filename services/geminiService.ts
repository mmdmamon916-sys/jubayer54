import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateImageWithGemini = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  
  // Using gemini-2.5-flash-image (Nano Banana) for generation
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      // imageConfig can be added here if needed, e.g., aspectRatio: "1:1"
    }
  });

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("No candidates returned from Gemini");
  }

  const parts = response.candidates[0].content.parts;
  let imageUrl = '';

  for (const part of parts) {
    if (part.inlineData) {
      const base64String = part.inlineData.data;
      const mimeType = part.inlineData.mimeType || 'image/png';
      imageUrl = `data:${mimeType};base64,${base64String}`;
      break; 
    }
  }

  if (!imageUrl) {
    throw new Error("No image data found in response. The model might have returned only text.");
  }

  return imageUrl;
};

export const editImageWithGemini = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = getAiClient();

  // Using gemini-2.5-flash-image (Nano Banana) for editing
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ]
    }
  });

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("No candidates returned from Gemini");
  }

  const parts = response.candidates[0].content.parts;
  let imageUrl = '';

  for (const part of parts) {
    if (part.inlineData) {
      const base64String = part.inlineData.data;
      const mimeTypeRes = part.inlineData.mimeType || 'image/png';
      imageUrl = `data:${mimeTypeRes};base64,${base64String}`;
      break;
    }
  }

  if (!imageUrl) {
    throw new Error("No edited image returned. The model might have refused the request or returned only text.");
  }

  return imageUrl;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,") to get just the base64 string
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};
