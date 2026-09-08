const fs = require('fs');
let code = fs.readFileSync('frontend/app/notifications.tsx', 'utf8');

// Replace icon based on type
code = code.replace(
  /<View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-error items-center justify-center border-2 border-surface">\s*<Ionicons name="heart" size=\{10\} color=\{theme\.white\} \/>\s*<\/View>/g,
  `{item.type === 'LIKE' && (
          <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-error items-center justify-center border-2 border-surface">
            <Ionicons name="heart" size={10} color={theme.white} />
          </View>
        )}
        {item.type === 'COMMENT' && (
          <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary items-center justify-center border-2 border-surface">
            <Ionicons name="chatbubble" size={10} color={theme.white} />
          </View>
        )}
        {item.type === 'follow' && (
          <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary items-center justify-center border-2 border-surface">
            <Ionicons name="person-add" size={10} color={theme.white} />
          </View>
        )}`
);

// Replace message based on type
code = code.replace(
  /<Text className="text-on-surface text-\[15px\] leading-relaxed">\s*<Text className="font-bold">\{item\.actor\.name\}<\/Text> liked your post\s*\{item\.post \? <Text className="font-semibold text-primary"> &quot;\{item\.post\.title\}&quot;<\/Text> : ' \(deleted post\)'\}\s*<\/Text>/,
  `<Text className="text-on-surface text-[15px] leading-relaxed">
          <Text className="font-bold">{item.actor.name}</Text>
          {item.type === 'LIKE' && ' liked your post '}
          {item.type === 'COMMENT' && ' commented on your post '}
          {item.type === 'follow' && ' started following you'}
          {(item.type === 'LIKE' || item.type === 'COMMENT') && (item.post ? <Text className="font-semibold text-primary"> &quot;{item.post.title}&quot;</Text> : ' (deleted post)')}
        </Text>`
);

fs.writeFileSync('frontend/app/notifications.tsx', code);
