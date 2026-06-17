import { GoogleGenerativeAI } from '@google/generative-ai';
import { evaluationResponseSchema } from './schemas.js';

// Initialize Generative AI client lazily to ensure process.env.GEMINI_API_KEY is loaded
let genAI = null;

function getGenAI() {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }
  return genAI;
}

export async function evaluateSubmission(html, css, js, rubric, screenshots) {
  const model = getGenAI().getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are an automated evaluation engine for DevDive.
Analyze the student code snippets and screenshots. Grade them against this evaluation rubric guidelines object:
${JSON.stringify(rubric)}

Provide helpful, encouraging advice inside overallHint to guide the student forward.`,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: evaluationResponseSchema
    }
  });

  // Construct Multipart Request with screenshots
  console.log('📸 Sending AI evaluation request with screenshots...');
  const requestParts = [
    { text: `HTML Workspace Code:\n\`\`\`html\n${html}\n\`\`\`` },
    { text: `CSS Workspace Code:\n\`\`\`css\n${css || '(no CSS)'}\n\`\`\`` },
    { text: `JS Workspace Code:\n\`\`\`javascript\n${js || '(no JS)'}\n\`\`\`` }
  ];
  
  if (screenshots.desktop) {
    requestParts.push({ inlineData: { mimeType: 'image/png', data: screenshots.desktop } });
  }
  if (screenshots.mobile) {
    requestParts.push({ inlineData: { mimeType: 'image/png', data: screenshots.mobile } });
  }

  const result = await model.generateContent(requestParts);

  // Extract and parse JSON response
  console.log('🤖 Processing AI response...');
  const rawText = result.response.text();

  try {
    return JSON.parse(rawText);
  } catch (parseError) {
    console.error("Critical Failure: Inability to parse schema-guaranteed JSON text:", rawText);
    throw parseError;
  }
}
