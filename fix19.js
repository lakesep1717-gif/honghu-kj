const fs = require('fs');
const html = fs.readFileSync('C:/Users/10540/.qclaw/workspace/rpa-scenarios/index.html', 'utf-8');
const script = html.substring(html.indexOf('<script>') + 8, html.indexOf('</script>'));

// Find where Unexpected token ';' is
try {
    new Function(script);
    console.log('OK');
} catch(e) {
    console.log('Error:', e.message);
    // Show the context around each ; in last 1000 chars
    const lastPart = script.substring(script.length - 2000);
    console.log('\n=== ; positions in last 2000 chars ===');
    for (let i = 0; i < lastPart.length; i++) {
        if (lastPart[i] === ';') {
            const absPos = script.length - 2000 + i;
            console.log('; at', absPos, ':', JSON.stringify(script.substring(Math.max(0,absPos-15), absPos+30)));
        }
    }
    
    // Also check raw content around script end
    console.log('\n=== Last 300 chars of script ===');
    console.log(JSON.stringify(script.substring(script.length - 300)));
}
