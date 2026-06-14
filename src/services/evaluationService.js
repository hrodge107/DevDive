export const evaluateCode = async (userId, unitId, exerciseId, htmlContent, cssContent = '', jsContent = '') => {
  const response = await fetch('/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      unitId,
      exerciseId,
      code: { html: htmlContent, css: cssContent, js: jsContent },
      captureScreens: ['desktop']
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Evaluation failed');
  }
  return data;
};
