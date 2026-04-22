import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from .game_state import GameManager

DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

app = Flask(__name__, static_folder=DIST_DIR, static_url_path="")
CORS(app)

gm = GameManager()


# ── 静态文件 ─────────────────────────────────────────────────

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    full = os.path.join(DIST_DIR, path)
    if path and os.path.exists(full):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, "index.html")


# ── 玩家管理 ─────────────────────────────────────────────────

@app.route("/api/players", methods=["POST"])
def add_player():
    data = request.get_json()
    name = (data.get("name") or "").strip()
    try:
        age = int(data.get("age"))
        if not (0 < age <= 120):
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "年龄无效"}), 400
    if not name:
        return jsonify({"error": "姓名不能为空"}), 400
    if gm.player_count >= 12:
        return jsonify({"error": "已达到最多 12 人"}), 400
    result = gm.add_player(name, age)
    return jsonify(result)


@app.route("/api/players/<player_id>", methods=["DELETE"])
def remove_player(player_id):
    if not gm.remove_player(player_id):
        return jsonify({"error": "玩家不存在"}), 404
    return jsonify({"ok": True})


# ── 游戏控制 ─────────────────────────────────────────────────

@app.route("/api/game/start", methods=["POST"])
def start_game():
    if not gm.start_game():
        return jsonify({"error": "至少需要 2 名玩家"}), 400
    return jsonify(gm.get_state())


@app.route("/api/game/throw", methods=["POST"])
def throw_dice():
    if gm.phase != "game":
        return jsonify({"error": "游戏尚未开始"}), 400
    event = gm.throw_dice()
    return jsonify({**event.to_dict(), "state": gm.get_state()})


@app.route("/api/game/penalty_prob", methods=["POST"])
def update_penalty_prob():
    data = request.get_json()
    try:
        prob = float(data.get("prob", 0.05))
    except (ValueError, TypeError):
        return jsonify({"error": "概率值无效"}), 400
    gm.update_penalty_prob(prob)
    return jsonify({"penalty_prob": gm.penalty_prob})


@app.route("/api/game/reset", methods=["POST"])
def reset_game():
    gm.reset()
    return jsonify({"ok": True})


# ── 状态 & 结果 ──────────────────────────────────────────────

@app.route("/api/state")
def get_state():
    return jsonify(gm.get_state())


@app.route("/api/game/results")
def get_results():
    if gm.phase != "results":
        return jsonify({"error": "游戏尚未结束"}), 400
    return jsonify(gm.get_results())
