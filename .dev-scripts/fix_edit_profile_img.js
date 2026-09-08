const fs = require('fs');
let code = fs.readFileSync('frontend/app/edit-profile.tsx', 'utf8');

code = code.replace(
  /<Image source=\{\{ uri: displayImage \}\} className="w-full h-full" contentFit="cover" \/>/g,
  '<Image source={{ uri: displayImage }} style={{ width: \'100%\', height: \'100%\' }} contentFit="cover" transition={200} />'
);

fs.writeFileSync('frontend/app/edit-profile.tsx', code);
