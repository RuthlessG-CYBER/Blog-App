const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/home.tsx', 'utf8');

code = code.replace(
  /const onRefresh = async \(\) => \{[\s\S]*?setRefreshing\(false\);\n  \};/m,
  `const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'Discover') {
      let newDepth = discoverDepth + 1;
      let res = await dispatch(fetchDiscoverPosts(newDepth) as any);
      if (res.payload && res.payload.length === 0) {
        newDepth = 0;
        await dispatch(fetchDiscoverPosts(newDepth) as any);
      }
      setDiscoverDepth(newDepth);
    } else if (activeTab === 'Following') {
      let newDepth = followingDepth + 1;
      let res = await dispatch(fetchFollowingPosts(newDepth) as any);
      if (res.payload && res.payload.length === 0) {
        newDepth = 0;
        await dispatch(fetchFollowingPosts(newDepth) as any);
      }
      setFollowingDepth(newDepth);
    } else {
      await dispatch(fetchPosts() as any);
    }
    setRefreshing(false);
  };`
);

fs.writeFileSync('frontend/app/(tabs)/home.tsx', code);
