import os
import re

color_map = {
    '"#005c55"': 'theme.primary',
    "'#005c55'": 'theme.primary',
    '"#131b2e"': 'theme.onSurface',
    "'#131b2e'": 'theme.onSurface',
    '"#6e7977"': 'theme.outline',
    "'#6e7977'": 'theme.outline',
    '"#a0aba9"': 'theme.outlineVariant',
    "'#a0aba9'": 'theme.outlineVariant',
    '"#ba1a1a"': 'theme.error',
    "'#ba1a1a'": 'theme.error',
    '"#545f73"': 'theme.secondary',
    "'#545f73'": 'theme.secondary',
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Skip if no colors are in this file
    has_color = any(c in content for c in color_map.keys())
    if not has_color:
        return

    print(f"Processing {filepath}")
    
    # Import useTheme
    depth = filepath.count('/') - 1
    rel_path = '../' * depth + 'src/utils/theme' if depth > 0 else './src/utils/theme'
    if filepath.startswith('app/(tabs)'):
        rel_path = '../../src/utils/theme'
    elif filepath.startswith('app/(auth)'):
        rel_path = '../../src/utils/theme'
        
    if 'useTheme' not in content:
        # insert after React import or similar
        content = re.sub(r"(import React.*?;\n)", r"\1import { useTheme } from '" + rel_path + "';\n", content, 1)

    # Insert const theme = useTheme(); inside the component
    # Find the default export function
    func_match = re.search(r"(export default function \w+\(.*?\)\s*\{)", content)
    if func_match and 'const theme = useTheme();' not in content:
        content = content.replace(func_match.group(1), func_match.group(1) + "\n  const theme = useTheme();")

    # Replace colors
    for old, new in color_map.items():
        # Replace color="#005c55" -> color={theme.primary}
        content = content.replace(f"color={old}", f"color={{{new}}}")
        # Replace other usages if they match exactly
        content = content.replace(f" {old} ", f" {new} ")

    # Special handling for focus states like `isEmailFocused ? '#005c55' : '#6e7977'`
    content = content.replace("'#005c55' : '#6e7977'", "theme.primary : theme.outline")
    content = content.replace("? '#005c55'", "? theme.primary")
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('app'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
