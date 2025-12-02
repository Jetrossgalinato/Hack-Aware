const Groq = require("groq-sdk");
require("dotenv").config({ path: ".env.local" });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function testGroq() {
  console.log("Testing Groq API connection...\n");

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Say 'Groq API is working!' if you can read this.",
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 100,
    });

    console.log("✓ Success! Groq API is working.");
    console.log("\nResponse:", completion.choices[0]?.message?.content);
    console.log("\nModel used:", completion.model);
    console.log("Tokens used:", completion.usage);
  } catch (error) {
    console.error("✗ Error:", error.message);
  }
}

testGroq();
