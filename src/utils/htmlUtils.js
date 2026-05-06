export const injectCSS = (htmlContent, files) => {
  const linkRegex = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>|<link[^>]*href="([^"]+)"[^>]*rel="stylesheet"[^>]*>/gi;
  
  const cssInjections = [];
  let match;
  
  while ((match = linkRegex.exec(htmlContent)) !== null) {
    // Group 1 is from first pattern, Group 2 is from second pattern
    const cssFileName = match[1] || match[2];
    const cssFile = files.find(f => f.name === cssFileName);
    
    if (cssFile) {
      cssInjections.push(`<style>${cssFile.content}</style>`);
    }
  }
  
  // Remove all link tags (both patterns)
  let injectedHtml = htmlContent.replace(linkRegex, '');
  
  // Insert the style tags right after the opening head tag
  const headCloseIndex = injectedHtml.indexOf('</head>');
  if (headCloseIndex !== -1) {
    injectedHtml = injectedHtml.slice(0, headCloseIndex) + cssInjections.join('\n') + injectedHtml.slice(headCloseIndex);
  } else {
    // If no </head>, add styles before <body>
    const bodyIndex = injectedHtml.indexOf('<body>');
    if (bodyIndex !== -1) {
      injectedHtml = injectedHtml.slice(0, bodyIndex) + cssInjections.join('\n') + injectedHtml.slice(bodyIndex);
    }
  }
  
  return injectedHtml;
};

export const buildPreviewHtml = (files) => {
  // Extract all HTML files for multi-page support
  const htmlFiles = {};
  files.forEach(file => {
    if (file.name.endsWith('.html')) {
      htmlFiles[file.name] = file.content;
    }
  });

  // Get index.html content
  const htmlFile = files.find(f => f.name === 'index.html');
  let htmlContent = htmlFile?.content || '';

  // Inject CSS and get processed HTML
  htmlContent = injectCSS(htmlContent, files);

  // Create the master HTML document with routing system
  const masterHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>DevDive Preview</title>
      </head>
      <body>
        ${htmlContent}
        <script>
          // Store all HTML files for routing
          const pages = ${JSON.stringify(htmlFiles)};
          
          // Function to attach navigation handlers
          function attachNavHandlers() {
            const links = document.querySelectorAll('a[href]');
            links.forEach(link => {
              link.addEventListener('click', function(e) {
                const href = e.target.getAttribute('href');
                if (href && href.endsWith('.html') && pages[href]) {
                  e.preventDefault();
                  document.body.innerHTML = pages[href];
                  attachNavHandlers();
                }
              });
            });
          }
          
          // Attach handlers on page load
          attachNavHandlers();
        </script>
      </body>
    </html>
  `;
  
  return masterHtml;
};
