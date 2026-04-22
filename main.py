"""
中秋博饼 · 启动入口
运行方式：python main.py
首次运行会自动安装所需依赖并构建前端，之后直接启动 Flask 服务并打开浏览器。
"""

import os
import subprocess
import sys
import threading
import time
import webbrowser

# ── 自动检查并安装 Python 依赖 ────────────────────────────────
REQUIRED_PACKAGES = {
    "flask": "flask>=3.0.0",
    "flask_cors": "flask-cors>=4.0.0",
}

def ensure_packages():
    missing = []
    for module, pip_name in REQUIRED_PACKAGES.items():
        try:
            __import__(module)
        except ImportError:
            missing.append(pip_name)
    if missing:
        print(f"📥 缺少依赖，正在自动安装：{', '.join(missing)}")
        subprocess.check_call([sys.executable, "-m", "pip", "install", *missing])
        print("✅ 依赖安装完成\n")

ensure_packages()

ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT, "frontend")
DIST_DIR = os.path.join(FRONTEND_DIR, "dist")
PORT = 5001


def run(cmd: list[str], cwd: str):
    result = subprocess.run(cmd, cwd=cwd)
    if result.returncode != 0:
        print(f"\n错误：命令 {' '.join(cmd)} 执行失败（返回码 {result.returncode}）")
        sys.exit(result.returncode)


def build_frontend():
    if os.path.exists(DIST_DIR):
        return

    node_modules = os.path.join(FRONTEND_DIR, "node_modules")
    if not os.path.exists(node_modules):
        print("📦 首次运行，安装前端依赖（npm install）...")
        run(["npm", "install"], cwd=FRONTEND_DIR)

    print("🔨 构建前端（npm run build）...")
    run(["npm", "run", "build"], cwd=FRONTEND_DIR)
    print("✅ 前端构建完成")


def open_browser():
    time.sleep(1.5)
    webbrowser.open(f"http://localhost:{PORT}")


if __name__ == "__main__":
    build_frontend()
    threading.Thread(target=open_browser, daemon=True).start()
    print(f"🚀 启动服务：http://localhost:{PORT}")
    from backend.server import app
    app.run(host="0.0.0.0", port=PORT, debug=False)
