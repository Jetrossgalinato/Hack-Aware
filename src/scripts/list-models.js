const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
  const modelsToTest = [
    "gemini-2.0-flash-exp",
    "gemini-exp-1206",
    "gemini-exp-1121",
  ];

  console.log("Testing experimental models...\n");

  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Test");
      const response = await result.response;
      console.log(
        `✓ ${modelName} - WORKS (response: ${response
          .text()
          .substring(0, 50)}...)`
      );
    } catch (error) {
      const errorMsg =
        error.message.includes("quota") || error.message.includes("429")
          ? "QUOTA EXCEEDED (but model exists)"
          : error.message.split("\n")[0];
      console.log(`✗ ${modelName} - ${errorMsg}`);
    }
  }
}

testModels();
