import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables. AI features may not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePetAdvice = async (userQuery: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Service Unavailable (Under Maintenance).";
  // if (!ai) return "AI Service Unavailable (Missing API Key).";

  try {
    const model = "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model,
      contents: userQuery,
      config: {
        systemInstruction: "You are a helpful and empathetic veterinary assistant. Provide general advice for pet owners. Always include a disclaimer that you are an AI and they should consult a real veterinarian for medical emergencies.",
      }
    });

    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};

export const generateBlogDraft = async (topic: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "AI Service Unavailable.";
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Write a structured blog post about: ${topic}`,
        config: {
            systemInstruction: "You are an expert veterinary content writer. Write informative, scientifically accurate, yet accessible blog posts for pet owners.",
        }
      });
  
      return response.text || "Could not generate blog.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Error generating blog.";
    }
  };