const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/home.tsx', 'utf8');

if (!code.includes('import { fetchMe }')) {
  code = code.replace(
    "import { toggleFollow } from '../../src/api';",
    "import { toggleFollow } from '../../src/api';\nimport { fetchMe } from '../../src/store/slices/authSlice';"
  );
}

if (!code.includes('dispatch(fetchMe());')) {
  code = code.replace(
    "dispatch(fetchDiscoverPosts()); // Refresh discover feed to update follow status",
    "dispatch(fetchDiscoverPosts()); // Refresh discover feed to update follow status\n      dispatch(fetchMe()); // Refresh user profile to update following count"
  );
}

fs.writeFileSync('frontend/app/(tabs)/home.tsx', code);
