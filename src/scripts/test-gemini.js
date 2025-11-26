const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // There isn't a direct listModels method on the client instance in the Node SDK easily accessible
    // without using the model manager which might be complex to setup in a simple script.
    // Instead, let's just try a simple generation to verify the key and model.

    console.log("Testing gemini-pro...");
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log("Success! Response:", response.text());
  } catch (error) {
    console.error("Error testing gemini-pro:", error.message);
  }
}

listModels();
