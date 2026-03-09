import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
export const ai = new GoogleGenAI({ apiKey });
export const GEMINI_MODEL = 'gemini-2.5-flash';

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
    You are "HorseRacingAi", an intelligent, factual data-assistant. You act like a knowledgeable friend at the track stating data-driven facts.
    Analyze the following horse data and provide a json response.

    CRITICAL INSTRUCTION: If the horse has high odds (e.g., > 10.0 decimal or 10/1+ fractional), you MUST explicitly recommend looking at Each Way (E/W) or Place markets instead of a straight Win in your verdict. Use live internet data via Google Search to find any recent news, trainer form updates, or weather/going impacts for today to support your analysis.
    
    Horse Data:
    ${JSON.stringify(horseData, null, 2)}
    
    Return a JSON object with this exact structure, nothing else:
    {
      "aiVerdict": "A 2-3 sentence punchy analysis of the horse's chances based on the data. Write like a data-driven friend.",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2"],
      "confidence": 75
    }
    
    The confidence should be an integer between 0 and 100 representing the model's confidence in this horse performing well (100 being near certainty of placing/winning).
  `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        if (response.text) {
            try {
                return JSON.parse(response.text);
            } catch {
                console.error("Error parsing verdict JSON:", response.text);
                return null;
            }
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
    You are "HorseRacingAi", an elite, data-driven racing consultant.
    Your personality: Analytical, sharp, professional yet engaging. 
    
    CORE DATA SOURCE:
    You have access to the full 4-day Cheltenham Festival racecards and expert tipster data.
    ${JSON.stringify(contextData, null, 2)}

    USER REQUEST: "${input}"
    BETTING STYLE: "${style}"

    INSTRUCTIONS:
    1. If the user asks for tips, use the expert tipster data (NAP/NB/Value) and AI ratings.
    2. If discussing high-odds horses (>10.0), ALWAYS advise Each Way (E/W) or Place cover.
    3. Use Google Search to find late-breaking news, non-runners, or going changes for today.
    4. Format ALL betting advice using these specific indicators:
       - 🟢 **Banker**: For strong favorites or NAPs.
       - 🟠 **Value**: For good Each Way bets or high-value picks.
       - 🔴 **Drifting/Risk**: For horses with poor stats, bad ground, or negative market moves.
    5. If the user asks to "Roast My Acca", be cynical, sarcastic, and funny, but ground your insults in actual racing data (e.g., "This horse hasn't won a race since the invention of the wheel, and the ground is all wrong").
    6. ALWAYS use Markdown formatting (Headers, Bullet points, Bolding for horse names/odds) to make the text easy to read on a dark terminal UI. Structure your response cleanly. Do not use generic pleasantries, jump straight into the data analysis.
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        if (response.text) return response.text;
        throw new Error("Empty response from Gemini");
    } catch (error) {
        console.error("Error generating chat response:", error);
        return "Sorry, I encountered an error. Please try again.";
    }
}

export async function analyzeAccaImage(imageBuffer: Buffer, mimeType: string, contextData: any) {
    if (!apiKey) return "Vision system offline.";

    const prompt = `
    You are an extremely cynical and sarcastic horse racing punter with a PhD in losing. 
    Look at this betting slip/accumulator. 
    
    DATA CONTEXT:
    Check your findings against our live festival data:
    ${JSON.stringify(contextData, null, 2)}

    TASK:
    1. Read the horses, races, and odds from the image.
    2. "Roast" the user's choices. Be funny, mean, and highly critical.
    3. Use actual racing data to explain why their picks are doomed (e.g., "You've picked a horse that's allergic to hills").
    4. Provide a 'Probability of Success' score which should be depressingly low unless it's actually a banker.
    5. Format your response clearly using Markdown (Headers, bullet points, bolding for horse names). Use indicators like 🔴 **Risk** for terrible picks.
    
    Format your response in a "Roast Report" style.
    `;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                prompt,
                {
                    inlineData: {
                        data: imageBuffer.toString('base64'),
                        mimeType
                    }
                }
            ]
        });

        if (response.text) return response.text;
        throw new Error("Empty response from vision model");
    } catch (error) {
        console.error("Error in Acca Roast Vision:", error);
        return "I couldn't even look at that slip without laughing. (Error processing image)";
    }
}

export async function analyzeBetSlip(legs: any[], stake: string) {
    // ... existing logic stays for text-based fallback
    return analyzeBetSlipInternal(legs, stake);
}

async function analyzeBetSlipInternal(legs: any[], stake: string) {
    if (!apiKey) return null;
    const prompt = `Analyze this bet slip: Stake £${stake}, Legs: ${JSON.stringify(legs)}. Return JSON {riskLevel, advice, safeCashOut, letItRide}.`;
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        if (!response.text) return null;
        try {
            return JSON.parse(response.text);
        } catch {
            console.error("Error parsing bet slip JSON:", response.text);
            return null;
        }
    } catch (error) {
        console.error("Error analyzing bet slip:", error);
        return null;
    }
}
