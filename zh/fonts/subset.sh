#!/bin/bash
# 重新生成字体子集（客户补充履历文字后运行一次）
# 依赖: pip install fonttools brotli
# 字体源: https://github.com/lxgw/LxgwWenKai/releases/download/v1.520/LXGWWenKai-Regular.ttf
#         https://github.com/lxgw/LxgwWenKai/releases/download/v1.520/LXGWWenKai-Medium.ttf
# 用法: ./subset.sh /path/to/LXGWWenKai-Regular.ttf /path/to/LXGWWenKai-Medium.ttf
set -e
cd "$(dirname "$0")/.."
python3 - <<'PY'
import glob, string
chars = set(string.printable)
chars |= set("·—…''“”「」『』（）《》〈〉、。，；：？！×↑↓←→©±%‰°")
for pattern in ['*.html', 'play/*.html', 'css/*.css', 'js/*.js']:
    for f in glob.glob(pattern):
        chars |= set(open(f, encoding='utf-8').read())
open('fonts/charset.txt', 'w', encoding='utf-8').write(''.join(sorted(c for c in chars if not c.isspace() or c == ' ')))
PY
pyftsubset "$1" --text-file=fonts/charset.txt --flavor=woff2 --output-file=fonts/wenkai-r.woff2 --layout-features='*'
pyftsubset "$2" --text-file=fonts/charset.txt --flavor=woff2 --output-file=fonts/wenkai-m.woff2 --layout-features='*'
echo "done"
