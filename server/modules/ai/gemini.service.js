import { GoogleGenerativeAI } from '@google/generative-ai';

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
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
    You are an expert web development instructor critically and objectively evaluating a student's submission.
    
    SOURCE CODE:
    HTML: ${html}
    CSS: ${css || '(no CSS)'}
    JS: ${js || '(no JS)'}

    RUBRIC - Code Requirements:
    ${rubric.codeRequirements ? rubric.codeRequirements.map((req, i) => `${i + 1}. ${req}`).join('\n') : 'None'}

    RUBRIC - Visual Requirements:
    ${rubric.visualRequirements ? rubric.visualRequirements.map((req, i) => `${i + 1}. ${req}`).join('\n') : 'None'}

    Evaluate EACH requirement critically, objectively,  and strictly (passed=true or passed=false).
    
    Return ONLY valid JSON with NO markdown, NO backticks, NO extra text:
    {
      "codeEvaluation": [
        {"requirement": "string (the requirement text)", "passed": boolean}
      ],
      "visualEvaluation": [
        {"requirement": "string (the requirement text)", "passed": boolean}
      ]
    }
  `;

  // Construct Multipart Request with screenshots
  console.log('📸 Sending AI evaluation request with screenshots...');
  const requestParts = [{ text: prompt }];
  if (screenshots.desktop) {
    requestParts.push({ inlineData: { mimeType: 'image/png', data: screenshots.desktop } });
  }
  if (screenshots.mobile) {
    requestParts.push({ inlineData: { mimeType: 'image/png', data: screenshots.mobile } });
  }

  const result = await model.generateContent(requestParts);

  // Extract and parse JSON response
  console.log('🤖 Processing AI response...');
  let evaluation;
  const responseText = result.response.text();
  
  try {
    evaluation = JSON.parse(responseText);
  } catch (parseError) {
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      evaluation = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error(`Failed to parse AI response: ${responseText.substring(0, 200)}`);
    }
  }

  return evaluation;
}
