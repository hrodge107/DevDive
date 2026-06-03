import { assembleDocument, normalizeCaptureScreens } from '../../utils/helpers.js';
import { enqueueScreenshot } from '../browser/playwright.service.js';
import { evaluateSubmission } from '../ai/gemini.service.js';

export const checkEvaluation = async (req, res) => {
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

    // 1. Assemble and capture using the Browser Queue
    const assembledDoc = assembleDocument(html, css, js);
    const screenshots = await enqueueScreenshot(assembledDoc, screensToCapture);

    // 2. Evaluate using Gemini
    const evaluation = await evaluateSubmission(html, css, js, rubric, screenshots);

    // 3. Calculate score
    const codePass = (evaluation.codeEvaluation || []).filter(e => e.passed).length;
    const codeTotal = rubric.codeRequirements?.length || 1;
    const visualPass = (evaluation.visualEvaluation || []).filter(e => e.passed).length;
    const visualTotal = rubric.visualRequirements?.length || 1;

    const codeScore = (codePass / codeTotal) * 50;
    const visualScore = (visualPass / visualTotal) * 50;
    const totalScore = Math.round(codeScore + visualScore);

    console.log(`✓ Evaluation complete: ${codePass}/${codeTotal} code, ${visualPass}/${visualTotal} visual = ${totalScore}/100`);

    // 4. Generate targeted hint based on which requirements failed
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

    // 5. Return response matching frontend expectations
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
};

export const healthCheck = (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};
