"""博饼判奖逻辑。掷 6 颗骰子，按规则从高到低判奖，返回第一个匹配项。"""

# 奖项定义：key, 中文名, 总数量, 能否被抢
PRIZES = [
    {"key": "zhuangyuan", "name": "状元", "total": 1,  "can_steal": True},
    {"key": "duitang",    "name": "对堂", "total": 2,  "can_steal": True},
    {"key": "sanhong",    "name": "三红", "total": 4,  "can_steal": True},
    {"key": "sijin",      "name": "四进", "total": 8,  "can_steal": False},
    {"key": "erju",       "name": "二举", "total": 16, "can_steal": False},
    {"key": "yixiu",      "name": "一秀", "total": 32, "can_steal": False},
]

PRIZE_MAP = {p["key"]: p for p in PRIZES}

# 状元子类型级别（数字越小越高级）
ZHUANGYUAN_LEVELS = {
    "六勃红": 1,
    "黑六勃": 2,
    "遍地锦": 3,
    "五红":   4,
    "五子":   5,
    "四红":   6,
}

ZHUANGYUAN_LEVEL_NONE = 999   # sentinel for "no 状元 record yet"


def judge_roll(dice: list[int]) -> dict | None:
    """
    判断 6 颗骰子的点数。
    返回 {key, label, zhuangyuan_level} 或 None（无奖）。
    zhuangyuan_level 仅在 key=="zhuangyuan" 时有意义。
    """
    count = [0] * 7
    for d in dice:
        count[d] += 1
    fours = count[4]

    # 全六相同
    if any(count[i] == 6 for i in range(1, 7)):
        if count[4] == 6:
            sub = "六勃红"
        elif count[1] == 6:
            sub = "黑六勃"
        else:
            sub = "遍地锦"
        return {"key": "zhuangyuan", "label": f"状元 · {sub}", "zhuangyuan_level": ZHUANGYUAN_LEVELS[sub]}

    # 五子（五个相同）
    if any(count[i] == 5 for i in range(1, 7)):
        sub = "五红" if count[4] == 5 else "五子"
        return {"key": "zhuangyuan", "label": f"状元 · {sub}", "zhuangyuan_level": ZHUANGYUAN_LEVELS[sub]}

    # 对堂 1-2-3-4-5-6
    if all(count[i] == 1 for i in range(1, 7)):
        return {"key": "duitang", "label": "对堂 · 1-2-3-4-5-6", "zhuangyuan_level": None}

    # 状元 · 四红
    if fours == 4:
        sub = "四红"
        return {"key": "zhuangyuan", "label": f"状元 · {sub}", "zhuangyuan_level": ZHUANGYUAN_LEVELS[sub]}

    # 四进（非4的四条）
    if any(count[i] == 4 for i in range(1, 7) if i != 4):
        return {"key": "sijin", "label": "四进", "zhuangyuan_level": None}

    # 三红
    if fours == 3:
        return {"key": "sanhong", "label": "三红", "zhuangyuan_level": None}

    # 二举
    if fours == 2:
        return {"key": "erju", "label": "二举", "zhuangyuan_level": None}

    # 一秀
    if fours == 1:
        return {"key": "yixiu", "label": "一秀", "zhuangyuan_level": None}

    return None
