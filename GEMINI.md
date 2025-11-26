# GEMINI.md

## Project Overview

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). The application, "Hack Aware," is an AI-powered tool designed to check if a website is vulnerable to common security hacks.

The project is built with the following technologies:

- **Framework:** [Next.js](https://nextjs.org/) (a React framework)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Linting:** [ESLint](https://eslint.org/)

The application's main entry point is `src/app/page.tsx`, which renders the landing page located at `src/app/landing/page.tsx`.

## Building and Running

### Running the Development Server

To run the application in a development environment, use the following command:

```bash
npm run dev
```

This will start the development server, and you can view the application by opening [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

To create a production-ready build of the application, run the following command:

```bash
npm run build
```

This will create an optimized build of the application in the `.next` directory.

### Starting the Production Server

To start the application in production mode (after building), use the following command:

```bash
npm run start
```

### Linting

To run the linter and check for code quality issues, use the following command:

```bash
npm run lint
```

## Development Conventions

- **Styling:** The project uses Tailwind CSS for styling. Utility classes are used directly in the JSX of the components.
- **Components:** The application's UI is built with React components. The main page component is located in `src/app/page.tsx`.
- **Routing:** The application uses the Next.js App Router. The file system is used to define routes. For example, `src/app/landing/page.tsx` corresponds to the `/landing` route.
- **TypeScript:** The project is written in TypeScript, and type checking is enforced.

## Architecture & Strategy: Hybrid Approach

To build "Hack Aware" effectively and safely, you should not rely on an AI model to perform the hacking (sending attack payloads). LLMs are not reliable vulnerability scanners on their own and can hallucinate vulnerabilities or miss obvious ones.

Instead, the industry-standard approach is a **Hybrid Architecture**: Use a traditional DAST scanner (Dynamic Application Security Testing) to find potential issues, and use an LLM API to analyze those findings, explain the risk, and write the fix.

### 1. Top Recommended AI Models (Cloud APIs)

These models have the best reasoning capabilities for interpreting code and security logs.

| Model                 | Provider  | Best For                 | Why it fits "Hack Aware"                                                                                                                                                                                                                       |
| :-------------------- | :-------- | :----------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude 3.5 Sonnet** | Anthropic | Code Analysis & Accuracy | Currently widely regarded as the top model for coding tasks. It has a massive context window (200k tokens), allowing you to paste entire HTTP response bodies or large code files for analysis. It is less prone to "lazy" answers than GPT-4. |
| **GPT-4o**            | OpenAI    | Speed & Function Calling | Extremely fast and excellent at "Tool Use" (Function Calling). You can build an agent that decides when to run a scan and when to ask for clarification. It has the most mature API ecosystem.                                                 |
| **Gemini 1.5 Pro**    | Google    | Massive Context          | If your scan logs are huge (e.g., full server logs), Gemini’s 1M+ token window is a game changer. It can ingest a whole repository or massive log file in one go to find patterns.                                                             |

### 2. Recommended Architecture for "Hack Aware"

Do not ask the LLM to "check this URL for bugs." It will likely refuse (safety guardrails) or hallucinate. Instead, use this flow:

#### Step 1: The Scanner (The "Hands")

Use an open-source scanning engine to do the actual probing.

- **Tool:** OWASP ZAP (Zed Attack Proxy)
- **Why:** It is free, open-source, and has a Python API. You can run it in the background of your web app to scan a target URL.
- **Action:** It generates a raw report (JSON/XML) listing potential alerts (e.g., "Possible SQL Injection").

#### Step 2: The AI (The "Brain")

Feed the raw report from ZAP into the LLM API.

- **Prompt:** "I have a security scan report for the URL example.com. Here is the raw JSON output. Please analyze this for False Positives, explain the impact of the 'High' severity alerts in simple terms, and provide code fixes for a React/Node.js stack."

### 3. Implementation Guide (Python Example)

Here is a conceptual example of how your backend code might look using Python and OpenAI (or Anthropic):

```python
# 1. Run the Scan (using OWASP ZAP API)
# (Pseudo-code: assumes you have ZAP running locally or in a container)
zap.urlopen(target_url)
zap.ascan.scan(target_url)
alerts = zap.core.alerts(baseurl=target_url)

# 2. Analyze with AI (using GPT-4o)
import openai

response = openai.chat.completions.create(
  model="gpt-4o",
  messages=[
    {"role": "system", "content": "You are a senior penetration tester. Analyze the following scan alerts."},
    {"role": "user", "content": f"Here are the raw alerts from OWASP ZAP: {alerts}. \n\n Summarize the critical threats and show how to fix the SQL injection specifically."}
  ]
)

# 3. specific Output for your User
print(response.choices[0].message.content)
```

### 4. Open Source / Private Alternatives

If you are worried about sending sensitive scan data to OpenAI/Anthropic, you can host your own model.

- **DeepSeek Coder V2:** excellent at code analysis and free to use if you host it yourself (or cheap via their API).
- **Llama 3 (via Groq):** incredibly fast inference, making your app feel "real-time."

### 5. Critical Legal & Ethical Warning

Since you are building a tool that "checks for hacks":

- **Authorization is Key:** Your app must strictly require proof of ownership before allowing a user to scan a URL. Scanning a website you do not own is illegal (often classified under the Computer Fraud and Abuse Act in the US and similar laws globally).
- **Terms of Service:** OpenAI and Anthropic have strict policies against using their models to generate cyberattacks. Using them to defend (analyze and fix) is generally allowed, but ensure your system prompts clearly state the defensive intent.
