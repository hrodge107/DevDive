const VALID_SCREENS = new Set(['desktop', 'mobile']);

/**
 * Assembles HTML, CSS, and JS into a single injectible string for Playwright
 */
export function assembleDocument(html, css, js) {
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

export function normalizeCaptureScreens(requested) {
  if (!Array.isArray(requested)) return ['desktop'];
  const normalized = requested
    .map((item) => (typeof item === 'string' ? item.toLowerCase().trim() : ''))
    .filter((item) => VALID_SCREENS.has(item));

  return normalized.length > 0 ? [...new Set(normalized)] : ['desktop'];
}
