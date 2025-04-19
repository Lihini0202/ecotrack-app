const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateEcoResponse(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const response = await result.response;
    const text = response.text();

    return text;
  } catch (err) {
    console.error("🔥 Gemini API error:", err);
    return "Oops! The eco coach is currently offline. Please try again later.";
  }
}

module.exports = { generateEcoResponse };
