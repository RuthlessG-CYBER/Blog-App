const fs = require('fs');
let code = fs.readFileSync('frontend/app/comments.tsx', 'utf8');

code = code.replace(
  "      Toast.show({ type: 'success', text1: 'Comment added' });\n",
  ""
);

fs.writeFileSync('frontend/app/comments.tsx', code);
