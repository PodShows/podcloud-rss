const statsMock = `#!/usr/bin/env node

var process = require("process") ; 
process.exit((+process.argv[2]+1 || 0)-1);
`
