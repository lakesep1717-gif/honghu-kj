const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const scriptTagStart = html.indexOf('<script>') + 8;
const scriptTagEnd = html.indexOf('</script>');
const code = html.substring(scriptTagStart, scriptTagEnd);

try {
  new Function(code);
  console.log('OK');
} catch(e) {
  const result = {
    message: e.message,
    line: e.lineNumber,
    col: e.columnNumber,
    // Get the problematic line
    lineContent: e.lineNumber ? code.split('\n')[e.lineNumber - 1] : null,
    prevLine: e.lineNumber && e.lineNumber > 1 ? code.split('\n')[e.lineNumber - 2] : null,
    nextLine: e.lineNumber ? code.split('\n')[e.lineNumber] : null,
  };
  fs.writeFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/error_info.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
}
