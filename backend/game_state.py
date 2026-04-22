"""
GameManager: 博饼游戏的核心状态机。
负责玩家管理、轮次推进、掷骰判奖、抢奖品、惩罚触发等全部逻辑。
"""

import random
import uuid
from typing import Optional

from .models import Player, ZhuangyuanRecord, ThrowEvent
from .game_logic import PRIZES, PRIZE_MAP, judge_roll, ZHUANGYUAN_LEVEL_NONE

DEFAULT_PENALTY_PROB = 0.05


class GameManager:
    def __init__(self):
        self._players: list[Player] = []
        self._players_by_id: dict[str, Player] = {}   # O(1) lookup
        self._names_used: set[str] = set()             # O(1) name check
        self._creation_counter = 0
        self.phase = "setup"                           # setup | game | results
        self.turn_order: list[str] = []
        self.current_turn_idx: int = 0
        self.penalty_prob: float = DEFAULT_PENALTY_PROB
        self.prize_pool: dict[str, int] = {}
        self.prize_holders: dict[str, list[str]] = {}  # can_steal prizes → ordered holder ids
        self.zhuangyuan_record = ZhuangyuanRecord()

    # ── 玩家管理 ──────────────────────────────────────────────

    def add_player(self, name: str, age: int) -> dict:
        """添加玩家，重名自动编号。返回 {player, warned, actual_name}。"""
        actual_name = self._unique_name(name)
        warned = actual_name != name
        self._creation_counter += 1
        player = Player(
            id=str(uuid.uuid4()),
            name=actual_name,
            age=age,
            creation_order=self._creation_counter,
        )
        self._players.append(player)
        self._players_by_id[player.id] = player
        self._names_used.add(actual_name)
        return {"player": player.to_dict(), "warned": warned, "actual_name": actual_name}

    def remove_player(self, player_id: str) -> bool:
        player = self._players_by_id.pop(player_id, None)
        if player is None:
            return False
        self._players.remove(player)
        self._names_used.discard(player.name)
        return True

    @property
    def player_count(self) -> int:
        return len(self._players)

    def _unique_name(self, name: str) -> str:
        if name not in self._names_used:
            return name
        count = 2
        while f"{name}{count}" in self._names_used:
            count += 1
        return f"{name}{count}"

    # ── 游戏启动 ──────────────────────────────────────────────

    def start_game(self) -> bool:
        if len(self._players) < 2:
            return False
        self.phase = "game"

        # 最年长者优先（同龄取创建顺序最早者）
        oldest = max(self._players, key=lambda p: (p.age, -p.creation_order))
        oldest_idx = self._players.index(oldest)
        ordered = self._players[oldest_idx:] + self._players[:oldest_idx]
        self.turn_order = [p.id for p in ordered]
        self.current_turn_idx = 0

        self.prize_pool = {p["key"]: p["total"] for p in PRIZES}
        self.prize_holders = {p["key"]: [] for p in PRIZES if p["can_steal"]}
        self.zhuangyuan_record = ZhuangyuanRecord()

        for p in self._players:
            p.prizes = {prize["key"]: 0 for prize in PRIZES}

        return True

    # ── 掷骰核心 ──────────────────────────────────────────────

    def throw_dice(self) -> ThrowEvent:
        current_id = self.turn_order[self.current_turn_idx]
        dice = [random.randint(1, 6) for _ in range(6)]
        event = ThrowEvent(dice=dice)

        # 惩罚检测（骰子掉出碗）
        if random.random() < self.penalty_prob:
            event.penalty = True
            event.penalty_player_id = current_id
            self._advance_turn()
            return event

        result = judge_roll(dice)
        if result is None:
            self._advance_turn()
            return event

        key = result["key"]
        prize_info = PRIZE_MAP[key]

        # 状元：只记录最高级别，游戏结束时分配
        if key == "zhuangyuan":
            lvl = result["zhuangyuan_level"]
            if lvl < self.zhuangyuan_record.level:
                self.zhuangyuan_record.player_id = current_id
                self.zhuangyuan_record.level = lvl
                self.zhuangyuan_record.label = result["label"]
                event.prize_label = result["label"]
                event.zhuangyuan_update = True
            else:
                event.no_prize = True
            self._advance_turn()
            return event

        # 可抢奖项（三红、对堂）
        if prize_info["can_steal"]:
            holders = self.prize_holders[key]
            if holders:
                self._steal_prize(key, holders[-1], current_id, result, event)
            elif self.prize_pool[key] > 0:
                self._award_from_pool(key, current_id, result, event)
                self.prize_holders[key].append(current_id)
            else:
                event.no_prize = True
        # 不可抢奖项（四进、二举、一秀）
        else:
            if self.prize_pool[key] > 0:
                self._award_from_pool(key, current_id, result, event)
            else:
                event.no_prize = True

        if self._is_game_over():
            self._finalize()
            event.game_over = True
            return event

        self._advance_turn()
        return event

    def _steal_prize(self, key: str, steal_id: str, current_id: str, result: dict, event: ThrowEvent):
        steal_player = self._players_by_id[steal_id]
        current_player = self._players_by_id[current_id]
        steal_player.prizes[key] -= 1
        current_player.prizes[key] += 1
        if steal_player.prizes[key] <= 0:
            self.prize_holders[key].remove(steal_id)
        self.prize_holders[key].append(current_id)
        event.prize_key = key
        event.prize_label = result["label"]
        event.steal_from_id = steal_id
        event.steal_from_name = steal_player.name

    def _award_from_pool(self, key: str, current_id: str, result: dict, event: ThrowEvent):
        self.prize_pool[key] -= 1
        self._players_by_id[current_id].prizes[key] += 1
        event.prize_key = key
        event.prize_label = result["label"]

    # ── 结算 ──────────────────────────────────────────────────

    def _finalize(self):
        self.phase = "results"
        if self.zhuangyuan_record.player_id:
            winner = self._players_by_id.get(self.zhuangyuan_record.player_id)
            if winner:
                winner.prizes["zhuangyuan"] += 1

    def _is_game_over(self) -> bool:
        return all(
            self.prize_pool[key] == 0
            for key in PRIZE_MAP
            if key != "zhuangyuan"
        )

    # ── 工具方法 ──────────────────────────────────────────────

    def _advance_turn(self):
        self.current_turn_idx = (self.current_turn_idx + 1) % len(self.turn_order)

    def update_penalty_prob(self, prob: float):
        self.penalty_prob = max(0.0, min(1.0, prob))

    def reset(self):
        self._players.clear()
        self._players_by_id.clear()
        self._names_used.clear()
        self._creation_counter = 0
        self.phase = "setup"
        self.turn_order = []
        self.current_turn_idx = 0
        self.penalty_prob = DEFAULT_PENALTY_PROB
        self.prize_pool = {}
        self.prize_holders = {}
        self.zhuangyuan_record = ZhuangyuanRecord()

    # ── 序列化 ────────────────────────────────────────────────

    def get_state(self) -> dict:
        current_id = (
            self.turn_order[self.current_turn_idx]
            if self.turn_order and self.phase == "game"
            else None
        )
        return {
            "phase": self.phase,
            "players": [p.to_dict() for p in self._players],
            "turn_order": self.turn_order,
            "current_player_id": current_id,
            "prize_pool": self.prize_pool.copy(),
            "prize_holders": {k: list(v) for k, v in self.prize_holders.items()},
            "zhuangyuan_record": self.zhuangyuan_record.to_dict(),
            "penalty_prob": self.penalty_prob,
        }

    def get_results(self) -> dict:
        prize_names = {p["key"]: p["name"] for p in PRIZES}
        results = []
        for p in self._players:
            items = [
                {"key": key, "name": prize_names[key], "count": p.prizes.get(key, 0)}
                for key in (prize["key"] for prize in PRIZES)
                if p.prizes.get(key, 0) > 0
            ]
            results.append({
                "player": p.to_dict(),
                "items": items,
                "total": sum(i["count"] for i in items),
            })
        results.sort(key=lambda r: -r["total"])
        return {
            "results": results,
            "zhuangyuan_winner_id": self.zhuangyuan_record.player_id,
            "zhuangyuan_label": self.zhuangyuan_record.label,
        }
