const fs = require('fs');
let code = fs.readFileSync('frontend/app/(tabs)/home.tsx', 'utf8');

code = code.replace(
  /if \(activeTab === 'Discover'\) \{[\s\S]*?flatListRef\.current\?\.scrollToOffset\(\{ offset: 0, animated: true \}\);/m,
  `const handleTabRefresh = async () => {
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
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        };
        handleTabRefresh();`
);

fs.writeFileSync('frontend/app/(tabs)/home.tsx', code);
