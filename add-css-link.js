const fs = require('fs');

const dashboard = fs.readFileSync('dashboard.html', 'utf8');

// Find favicon line and insert CSS link after it
const cssLink = '\t<link rel="stylesheet" href="dashboard-header-premium.css">';
const faviconPattern = /<link rel="icon"[^>]+>/;

const updated = dashboard.replace(faviconPattern, (match) => {
  return match + '\n' + cssLink;
});

fs.writeFileSync('dashboard.html', updated);
console.log('✅ Premium CSS link added to dashboard.html');

