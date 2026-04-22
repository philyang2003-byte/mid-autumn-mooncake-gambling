from dataclasses import dataclass, field, asdict
from typing import Optional


@dataclass
class Player:
    id: str
    name: str
    age: int
    creation_order: int
    prizes: dict = field(default_factory=dict)  # {prize_key: count}

    def to_dict(self):
        return asdict(self)


@dataclass
class ZhuangyuanRecord:
    """Tracks who currently holds the best 状元-level roll."""
    player_id: Optional[str] = None
    level: int = 999          # lower = better (1=六勃红 ... 6=四红); 999 = no record
    label: str = ""

    def to_dict(self):
        return asdict(self)


@dataclass
class ThrowEvent:
    """Result returned to frontend after a throw."""
    dice: list
    prize_key: Optional[str] = None
    prize_label: Optional[str] = None
    steal_from_id: Optional[str] = None
    steal_from_name: Optional[str] = None
    penalty: bool = False
    penalty_player_id: Optional[str] = None
    game_over: bool = False
    no_prize: bool = False
    zhuangyuan_update: bool = False

    def to_dict(self):
        return asdict(self)
