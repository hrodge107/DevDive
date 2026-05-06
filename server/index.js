import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { chromium } from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import rateLimit from 'express-rate-limit';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Standardize middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Implement industry-standard rate limiting
const checkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 submissions per window
  message: { error: true, message: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Assembles HTML, CSS, and JS into a single injectible string for Playwright
 */
function assembleDocument(html, css, js) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${css || ''}</style>
    </head>
    <body>
      ${html || ''}
      <script>${js || ''}</script>
    </body>
    </html>
  `;
}

const VALID_SCREENS = new Set(['desktop', 'mobile']);

function normalizeCaptureScreens(requested) {
  if (!Array.isArray(requested)) return ['desktop'];
  const normalized = requested
    .map((item) => (typeof item === 'string' ? item.toLowerCase().trim() : ''))
    .filter((item) => VALID_SCREENS.has(item));

  return normalized.length > 0 ? [...new Set(normalized)] : ['desktop'];
}

/**
 * Captures screenshots at required mobile and desktop viewports.
 * Uses browser context for memory safety.
 */
async function captureScreenshots(htmlContent, captureScreens) {
  let browser;
  let context;
  try {
    console.log('Launching Playwright...');
    browser = await chromium.launch();
    context = await browser.newContext();
    const page = await context.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle' });

    const views = normalizeCaptureScreens(captureScreens);
    const screenshots = {};

    // Desktop capture (scaled to 800x500 to save base64 token cost)
    if (views.includes('desktop')) {
      await page.setViewportSize({ width: 800, height: 500 });
      const desktopBuffer = await page.screenshot({ type: 'png' });
      screenshots.desktop = desktopBuffer.toString('base64');
    }

    // Mobile capture (scaled to 375x667)
    if (views.includes('mobile')) {
      await page.setViewportSize({ width: 375, height: 667 });
      const mobileBuffer = await page.screenshot({ type: 'png' });
      screenshots.mobile = mobileBuffer.toString('base64');
    }

    return screenshots;
  } catch (error) {
    console.error('Screenshot error:', error);
    throw new Error(`Screenshot generation failed: ${error.message}`);
  } finally {
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

app.post('/api/check', checkLimiter, async (req, res) => {
  try {
    const { code, aiRubric, captureScreens } = req.body;
    
    if (!code || !code.html || !aiRubric) {
      return res.status(400).json({ error: true, message: 'Missing required code or rubric payload.' });
    }

    const html = code.html || '';
    const css = code.css || '';
    const js = code.js || '';
    const rubric = aiRubric;
    const screensToCapture = normalizeCaptureScreens(captureScreens);

    // 1. Assemble and capture
    const assembledDoc = assembleDocument(html, css, js);
    const screenshots = await captureScreenshots(assembledDoc, screensToCapture);

    // 2. Initialize Gemini with strict JSON enforcement
    const model = genAI.getGenerativeModel({ 
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

    // 3. Construct Multipart Request with screenshots
    console.log('📸 Sending AI evaluation request with screenshots...');
    const requestParts = [{ text: prompt }];
    if (screenshots.desktop) {
      requestParts.push({ inlineData: { mimeType: 'image/png', data: screenshots.desktop } });
    }
    if (screenshots.mobile) {
      requestParts.push({ inlineData: { mimeType: 'image/png', data: screenshots.mobile } });
    }

    const result = await model.generateContent(requestParts);

    // 4. Extract and parse JSON response
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

    // 5. Calculate score
    const codePass = (evaluation.codeEvaluation || []).filter(e => e.passed).length;
    const codeTotal = rubric.codeRequirements?.length || 1;
    const visualPass = (evaluation.visualEvaluation || []).filter(e => e.passed).length;
    const visualTotal = rubric.visualRequirements?.length || 1;

    const codeScore = (codePass / codeTotal) * 50;
    const visualScore = (visualPass / visualTotal) * 50;
    const totalScore = Math.round(codeScore + visualScore);

    console.log(`✓ Evaluation complete: ${codePass}/${codeTotal} code, ${visualPass}/${visualTotal} visual = ${totalScore}/100`);

    // 6. Generate targeted hint based on which requirements failed
    let overallHint = '';
    const failedCode = (evaluation.codeEvaluation || []).filter(e => !e.passed);
    const failedVisual = (evaluation.visualEvaluation || []).filter(e => !e.passed);
    const hasFailedCode = failedCode.length > 0;
    const hasFailedVisual = failedVisual.length > 0;

    if (totalScore >= 75) {
      overallHint = '🎉 Excellent! Your submission meets all requirements. Keep up the great work!';
    } else if (hasFailedCode && hasFailedVisual) {
      overallHint = '💡 Review both your code structure and visual output to match all requirements.';
    } else if (hasFailedCode) {
      overallHint = '👨‍💻 Your visual output looks good! Debug your code to ensure all logic requirements are met.';
    } else if (hasFailedVisual) {
      overallHint = '🎨 Your code logic is solid! Focus on the visual design to match the requirements exactly.';
    } else {
      overallHint = '📚 Review all the failed requirements carefully and test your changes thoroughly.';
    }

    const primaryScreenshot = screenshots.desktop || screenshots.mobile || null;

    // 7. Return response matching frontend expectations
    res.json({
      score: totalScore,
      isPassed: totalScore >= 75,
      screenshot: primaryScreenshot,
      overallHint,
      codeEvaluation: evaluation.codeEvaluation || [],
      visualEvaluation: evaluation.visualEvaluation || []
    });

  } catch (error) {
    console.error('Check endpoint error:', error);
    res.status(500).json({ 
      error: true, 
      message: 'Evaluation failed on the server.',
      details: error.message
    });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`DevDive check server active on port ${PORT}`);
});
