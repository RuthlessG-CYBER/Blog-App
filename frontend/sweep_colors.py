import os
import re

color_map = {
    '"#005c55"': 'theme.primary',
    "'#005c55'": 'theme.primary',
    '"#0f766e"': 'theme.primaryContainer',
    "'#0f766e'": 'theme.primaryContainer',
    '"#131b2e"': 'theme.onSurface',
    "'#131b2e'": 'theme.onSurface',
    '"#6e7977"': 'theme.outline',
    "'#6e7977'": 'theme.outline',
    '"#a0aba9"': 'theme.outlineVariant',
    "'#a0aba9'": 'theme.outlineVariant',
    '"#bdc9c6"': 'theme.outlineVariant',
    "'#bdc9c6'": 'theme.outlineVariant',
    '"#ba1a1a"': 'theme.error',
    "'#ba1a1a'": 'theme.error',
    '"#545f73"': 'theme.secondary',
    "'#545f73'": 'theme.secondary',
    '"#ffffff"': 'theme.white',
    "'#ffffff'": 'theme.white',
    '"#fff"': 'theme.white',
    "'#fff'": 'theme.white',
    '"#eef0ff"': 'theme.surfaceContainer',
    "'#eef0ff'": 'theme.surfaceContainer',
    '"#f2f3ff"': 'theme.surfaceContainer',
    "'#f2f3ff'": 'theme.surfaceContainer',
    '"#eaedff"': 'theme.surfaceContainer',
    "'#eaedff'": 'theme.surfaceContainer',
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Skip if no hex codes
    if not re.search(r"#[0-9a-fA-F]{3,6}", content):
        return

    print(f"Sweeping {filepath}")
    
    # We already have useTheme in all these files, just replace the strings
    for old, new in color_map.items():
        # placeholderTextColor="#a0aba9" -> placeholderTextColor={theme.outlineVariant}
        content = content.replace(f'placeholderTextColor={old}', f'placeholderTextColor={{{new}}}')
        content = content.replace(f'color={old}', f'color={{{new}}}')
        content = content.replace(f'backgroundColor: {old}', f'backgroundColor: {new}')
        content = content.replace(f'bg: {old}', f'bg: {new}')
        content = content.replace(f'color: {old}', f'color: {new}')
        # Handle arrays like outputRange: ['#bdc9c6', '#0f766e', '#bdc9c6']
        # We can just blindly replace the string literal if it's exact
        content = content.replace(f'{old}', f'{new}')

    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('app'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
