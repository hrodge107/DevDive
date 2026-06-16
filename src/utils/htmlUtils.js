export const injectCSS = (htmlContent, files) => {
  const linkRegex = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>|<link[^>]*href="([^"]+)"[^>]*rel="stylesheet"[^>]*>/gi;
  
  const cssInjections = [];
  
  // Replace only links that correspond to local files, keep external ones
  const injectedHtml = htmlContent.replace(linkRegex, (match, href1, href2) => {
    const cssFileName = href1 || href2;
    const cssFile = files.find(f => f.name === cssFileName);
    if (cssFile) {
      cssInjections.push(`<style>${cssFile.content}</style>`);
      return '';
    }
    return match;
  });
  
  // Insert the style tags right after the opening head tag
  let finalHtml = injectedHtml;
  const headCloseIndex = finalHtml.indexOf('</head>');
  if (headCloseIndex !== -1) {
    finalHtml = finalHtml.slice(0, headCloseIndex) + cssInjections.join('\n') + finalHtml.slice(headCloseIndex);
  } else {
    // If no </head>, add styles before <body>
    const bodyIndex = finalHtml.indexOf('<body>');
    if (bodyIndex !== -1) {
      finalHtml = finalHtml.slice(0, bodyIndex) + cssInjections.join('\n') + finalHtml.slice(bodyIndex);
    }
  }
  
  return finalHtml;
};

export const injectJS = (htmlContent, files) => {
  const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>(?:<\/script>)?/gi;
  
  const jsInjections = [];
  
  // Replace only scripts that correspond to local files, keep external ones (e.g. CDNs)
  const injectedHtml = htmlContent.replace(scriptRegex, (match, src) => {
    const jsFile = files.find(f => f.name === src);
    if (jsFile) {
      jsInjections.push(`<script>${jsFile.content}</script>`);
      return '';
    }
    return match;
  });
  
  // Append JS script tags before </body>
  let finalHtml = injectedHtml;
  const bodyCloseIndex = finalHtml.indexOf('</body>');
  if (bodyCloseIndex !== -1) {
    finalHtml = finalHtml.slice(0, bodyCloseIndex) + jsInjections.join('\n') + finalHtml.slice(bodyCloseIndex);
  } else {
    // If no </body>, just append at the end
    finalHtml = finalHtml + '\n' + jsInjections.join('\n');
  }
  
  return finalHtml;
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

  // Inject CSS and JS and get processed HTML
  htmlContent = injectCSS(htmlContent, files);
  htmlContent = injectJS(htmlContent, files);

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
          const pages = ${JSON.stringify(htmlFiles).replace(/<\/script>/gi, '<\\/script>')};
          
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
