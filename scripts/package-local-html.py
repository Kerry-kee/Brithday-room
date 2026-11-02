"""Package the verified local-HTML build with simple opening instructions."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import json
import re

workspace = Path(__file__).resolve().parent.parent
artifacts = workspace / "artifacts"
root = artifacts / "local-html"
archive = artifacts / "Brithday-room-local-html.zip"
instructions = root / "打开说明.txt"

assert (root / "index.html").is_file(), "请先运行 npm run build:local"
instructions.write_text(
    "生日小屋本地 HTML 版\n\n"
    "1. 请先完整解压整个压缩包。\n"
    "2. 使用 Microsoft Edge 或 Google Chrome 双击打开 index.html。\n"
    "3. 不要只复制 index.html；assets 和 fonts 文件夹必须保留。\n"
    "4. 本版本无需联网，也无需安装 Node.js。\n",
    encoding="utf-8-sig",
)

allowed = {".html", ".css", ".js", ".json", ".txt", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".woff", ".woff2"}
files = sorted(path for path in root.rglob("*") if path.is_file())
for file in files:
    assert not file.is_symlink() and file.suffix.lower() in allowed, f"不支持的文件：{file}"
    assert root in file.resolve().parents, f"文件超出产物目录：{file}"
    if file.suffix.lower() not in {".html", ".css"}:
        continue
    source = file.read_text(encoding="utf-8")
    refs = re.findall(r'(?:src|href)=["\']([^"\']+)', source) if file.suffix.lower() == ".html" else re.findall(r'url\(["\']?([^"\')]+)', source)
    for ref in refs:
        if ref.startswith("data:"):
            continue
        assert not re.match(r"^(?:[a-z]+:|/)", ref, re.I), f"必须使用相对资源：{ref}"
        target = (file.parent / ref).resolve()
        assert root in target.parents and target.is_file(), f"资源不存在：{ref}"

with ZipFile(archive, "w", compression=ZIP_DEFLATED, compresslevel=9) as package:
    for file in files:
        package.write(file, file.relative_to(root).as_posix())

result = {
    "archive": str(archive),
    "bytes": archive.stat().st_size,
    "sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
    "files": len(files),
    "uncompressedBytes": sum(file.stat().st_size for file in files),
}
print(json.dumps(result, ensure_ascii=False, indent=2))
