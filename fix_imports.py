#!/usr/bin/env python3
import os
import re
from pathlib import Path

def fix_component_file(filepath):
    """Fix a single component file for Next.js"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Add 'use client' if it contains hooks or motion
    needs_client = any(keyword in content for keyword in [
        'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo',
        'motion.', '<motion.', 'AnimatePresence', 'useScroll', 'useTransform'
    ])
    
    if needs_client and not content.strip().startswith("'use client'"):
        content = "'use client';\n\n" + content
    
    # Fix import paths
    # Fix relative component imports to absolute
    content = re.sub(r"from '\.\./components/", "from '@/app/components/", content)
    content = re.sub(r"from '\./components/", "from '@/app/components/", content)
    
    # Fix UI component imports
    content = re.sub(r"from '@/components/ui/", "from '@/app/components/ui/", content)
    
    # Fix asset imports - from relative to public
    content = re.sub(r"from '\.\./assets/", "from '/assets/", content)
    content = re.sub(r"from '\.\./\.\./assets/", "from '/assets/", content)
    
    # Fix utils import
    content = re.sub(r"from '\.\./lib/utils'", "from '@/lib/utils'", content)
    content = re.sub(r"from '\.\./\.\./lib/utils'", "from '@/lib/utils'", content)
    
    # Only write if changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")
    else:
        print(f"No changes: {filepath}")

def process_directory(directory):
    """Process all .tsx files in directory"""
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                try:
                    fix_component_file(filepath)
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    base_path = Path("/home/blimbing/Documents/Portfolio/fe-next/app")
    
    print("Processing components...")
    process_directory(base_path / "components")
    
    print("\nProcessing pages...")
    process_directory(base_path / "pages")
    
    print("\nDone!")
