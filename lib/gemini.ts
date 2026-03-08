import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
export const ai = new GoogleGenAI({ apiKey });

export async function generateHorseVerdict(horseData: any) {
    if (!apiKey) {
        return {
            aiVerdict: "Gemini API Key not configured. AI Analysis unavailable.",
            pros: ["System not configured"],
            cons: ["API key missing"],
            confidence: 50
        };
    }

    const prompt = `
    You are the "Festival Whisperer", an expert AI horse racing analyst specifically built for the Cheltenham Festival.
    Analyze the following horse data and provide a json response.
    
    Horse Data:
    ${JSON.stringify(horseData, null, 2)}
    
    Return a JSON object with this exact structure, nothing else:
    {
      "aiVerdict": "A 2-3 sentence punchy analysis of the horse's chances based on the data, writing in a sharp, authoritative tone.",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2"],
      "confidence": 75
    }
    
    The confidence should be an integer between 0 and 100 representing the model's confidence in this horse performing well (100 being near certainty of placing/winning).
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        throw new Error("Empty response from Gemini");
    } catch (error) {
        console.error("Error generating verdict:", error);
        return null;
    }
}

export async function generateChatResponse(input: string, style: string, contextData: any) {
    if (!apiKey) {
        return "I'm sorry, I cannot process this request at the moment because my API key is not configured.";
    }

    const prompt = `
    You are the "Festival Whisperer", an expert AI horse racing analyst built for the Cheltenham Festival.
    Your personality is sharp, authoritative, and data-driven.
    The user is asking: "${input}"
    Their chosen betting style is: "${style}"

    Here is the day's racing data to use as context:
    ${JSON.stringify(contextData, null, 2)}

    Format your response in Markdown. You can suggest specific horses, give odds if they exist in the context, and build accumulators if asked.
    Keep it punchy, engaging, and professional. Use emojis sparingly.
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        if (response.text) return response.text;
        throw new Error("Empty response from Gemini");
    } catch (error) {
        console.error("Error generating chat response:", error);
        return "Sorry, I encountered an error while analyzing the data. Please try again.";
    }
}

export async function analyzeBetSlip(legs: any[], stake: string) {
    if (!apiKey) {
        return {
            riskLevel: "Medium",
            advice: "API Key missing. Cannot analyze.",
            safeCashOut: 0,
            letItRide: 0
        };
    }

    const prompt = `
    You are the "Festival Whisperer", an expert AI horse racing analyst.
    Analyze this user's bet slip:
    Stake: £${stake}
    Legs:
    ${JSON.stringify(legs, null, 2)}

    Determine the overall risk of this bet slip. Return a JSON object exactly like this:
    {
       "riskLevel": "Low" | "Medium" | "High" | "Extreme",
       "advice": "A 2-3 sentence punchy explanation of the biggest risk in this slip and your cash out strategy.",
       "safeCashOut": 40, 
       "letItRide": 100
    }
    The safeCashOut and letItRide values should be percentages (e.g. 40 = 40% of max return).
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        if (response.text) return JSON.parse(response.text);
        throw new Error("Empty response from Gemini");
    } catch (error) {
        console.error("Error generating slip analysis:", error);
        return null;
    }
}
