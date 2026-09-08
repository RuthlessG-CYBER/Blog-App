const fs = require('fs');
let code = fs.readFileSync('backend/src/services/post.service.ts', 'utf8');

code = code.replace(/_count: \{\s*select: \{\s*likes: true\s*\}\s*\}/g, '_count: { select: { likes: true, comments: true } }');

fs.writeFileSync('backend/src/services/post.service.ts', code);
