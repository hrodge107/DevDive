import { assembleDocument, normalizeCaptureScreens } from '../../utils/helpers.js';
import { enqueueScreenshot } from '../browser/playwright.service.js';
import { evaluateSubmission } from '../ai/gemini.service.js';
import { supabase } from '../../lib/supabase.js';

export const checkEvaluation = async (req, res) => {
  try {
    const { code, captureScreens, userId, unitId, exerciseId } = req.body;
    
    if (!code || !code.html || !exerciseId) {
      return res.status(400).json({ error: true, message: 'Missing required code or exerciseId payload.' });
    }

    // Fetch rubric securely from Supabase (Service Role Key bypasses RLS)
    const { data: exerciseData, error: rubricError } = await supabase
      .from('exercises')
      .select('ai_rubric')
      .eq('id', exerciseId)
      .single();

    if (rubricError || !exerciseData?.ai_rubric) {
      return res.status(404).json({ error: true, message: 'Exercise rubric not found.' });
    }

    const html = code.html || '';
    const css = code.css || '';
    const js = code.js || '';
    const rubric = exerciseData.ai_rubric;
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

    const codePointsPerReq = rubric.codeRequirements?.length ? 50 / rubric.codeRequirements.length : 0;
    const visualPointsPerReq = rubric.visualRequirements?.length ? 50 / rubric.visualRequirements.length : 0;

    console.log(`✓ Evaluation complete: ${codePass}/${codeTotal} code, ${visualPass}/${visualTotal} visual = ${totalScore}/100`);

    // Log progress if passed
    if (totalScore >= 75 && userId && unitId && exerciseId) {
      try {
        await supabase.from('user_progress').insert({
          user_id: userId,
          unit_id: unitId,
          exercise_id: exerciseId,
          is_completed: true,
          exercise_score: totalScore
        });
        console.log(`Progress logged for user ${userId}`);
      } catch (err) {
        console.error('Failed to log progress to Supabase:', err);
      }
    }

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
      visualEvaluation: evaluation.visualEvaluation || [],
      codePointsPerReq,
      visualPointsPerReq
    });

  } catch (error) {
    console.error('Check endpoint error:', error);
    
    let statusCode = 500;
    let message = 'Evaluation failed on the server.';
    
    if (error.message.includes('Screenshot') || error.message.includes('Playwright') || error.message.includes('Execution timeout')) {
      statusCode = 502;
      message = 'Visual generation service unavailable or timed out.';
    } else if (error.message.includes('AI') || error.message.includes('Gemini') || error.message.includes('parse AI response')) {
      statusCode = 502;
      message = 'AI evaluation service is temporarily unavailable.';
    }

    res.status(statusCode).json({ 
      error: true, 
      message,
      details: error.message
    });
  }
};

export const healthCheck = (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};
