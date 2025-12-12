import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TranslationSegment, GlossaryTerm } from '../types';

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Defined schema for the structured output
const flaggedTermSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    term: { type: Type.STRING, description: "The specific word or phrase in the source text that is uncertain." },
    suggestion: { type: Type.STRING, description: "The proposed translation." },
    reason: { type: Type.STRING, description: "Why this term is flagged (e.g., ambiguous, neologism, complex syntax)." },
  }
};

const segmentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    sourceText: { type: Type.STRING, description: "The original text segment (sentence or paragraph)." },
    translatedText: { type: Type.STRING, description: "The translated text." },
    uncertaintyScore: { type: Type.NUMBER, description: "A score from 0.0 (certain) to 1.0 (highly uncertain)." },
    flaggedTerms: { 
      type: Type.ARRAY, 
      items: flaggedTermSchema,
      description: "List of specific terms that might be inaccurate or require review."
    }
  },
  required: ["sourceText", "translatedText", "uncertaintyScore", "flaggedTerms"]
};

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: segmentSchema
};

export const translateDocument = async (
  fileBase64: string,
  mimeType: string,
  glossary: GlossaryTerm[],
  targetLanguage: string = "English"
): Promise<TranslationSegment[]> => {
  const ai = getGeminiClient();

  // Simulated RAG: Format glossary for context
  const glossaryContext = glossary.length > 0 
    ? `Use the following technical glossary for consistency:\n${glossary.map(g => `- ${g.source}: ${g.target}`).join('\n')}`
    : "No specific glossary provided.";

  const prompt = `
    You are an expert Senior Patent Translator. 
    Task: Translate the attached patent document into ${targetLanguage}.
    
    GUIDELINES:
    1. **Format**: Maintain strict technical accuracy and legal tone.
    2. **Segmentation**: Split the translation into logical segments. 
       - Treat paragraph identifiers (e.g., "[0001]", "[0023]") as natural segment breaks. 
       - Each segment should ideally be one paragraph or a distinct claim.
    3. **Numbering Handling**: 
       - **Preserve** paragraph identifiers (e.g., [0001]).
       - **Ignore/Remove** margin line numbers (e.g., 5, 10, 15) if they appear mid-sentence or disrupt the text flow. Do not let line numbers break a sentence into multiple segments.
    4. **Glossary**: ${glossaryContext}
    5. **Uncertainty Analysis**: CRITICAL: Identify any "uncertain phrases". These are terms that are ambiguous, potential neologisms, extremely complex, or where the translation might be shaky. Flag them.
    
    Output Format: Return a JSON array of segments.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a helpful, professional AI assistant for patent attorneys.",
        temperature: 0.2, // Low temperature for precision
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Add client-side IDs
      return data.map((seg: any, index: number) => ({
        ...seg,
        id: `seg-${Date.now()}-${index}`
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

export const suggestTermImprovement = async (
  term: string,
  context: string,
  targetLang: string
): Promise<string[]> => {
  const ai = getGeminiClient();
  
  const prompt = `
    The term "${term}" appears in the following context: "${context}".
    Provide 3 alternative professional translations for this term in ${targetLang} specifically for a patent/legal context.
    Return only the list of comma-separated strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text ? response.text.split(',').map(s => s.trim()) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};