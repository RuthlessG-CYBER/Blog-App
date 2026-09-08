const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/home.tsx', 'utf8');

code = code.replace(
  "dispatch(fetchDiscoverPosts());\n        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });",
  "fetchDataForTab(activeTab);\n        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });"
);

code = code.replace(
  "}, [navigation, dispatch]);",
  "}, [navigation, dispatch, activeTab]);"
);

fs.writeFileSync('frontend/app/(tabs)/home.tsx', code);
