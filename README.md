# 中秋博饼

中秋节传统博饼游戏的数字化实现。玩家轮流掷六颗骰子，按照传统规则赢取对应奖品，直到所有奖品被博完。

## 游戏规则

- 最年长的玩家先投，其余按加入顺序循环
- 掷出特定点数组合即可赢得对应奖品：

| 奖项 | 条件 | 数量 | 可抢夺 |
|------|------|------|--------|
| 状元 | 四红（4个4）及以上特殊组合 | 1 | 是 |
| 对堂 | 顺子 1-2-3-4-5-6 | 2 | 是 |
| 三红 | 恰好3个4 | 4 | 是 |
| 四进 | 除4以外的四同 | 8 | 否 |
| 二举 | 恰好2个4 | 16 | 否 |
| 一秀 | 恰好1个4 | 32 | 否 |

- **状元**：游戏中途只记录最高级别，游戏结束时分配给记录最高状元的玩家
- **抢夺**：三红、对堂可从当前持有者手中抢夺；无人持有则从奖池取
- **惩罚**：可设置骰子掉出碗的概率（0–50%），触发时当前玩家跳过本轮

## 项目结构

```
mid-autumn-mooncake-gambling/
├── main.py              # 启动入口
├── requirements.txt     # Python 依赖
├── backend/
│   ├── server.py        # Flask API 路由
│   ├── game_state.py    # 游戏状态管理（GameManager）
│   ├── game_logic.py    # 判奖逻辑
│   └── models.py        # 数据类
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── api/gameApi.js
        └── components/  # Background, Bowl, Die, PlayerRing,
                         # PrizePanel, SetupPanel, ControlPanel,
                         # StealNotice, ResultsModal
```

## 运行方法

**环境要求：** Python 3.9+

> 无需手动安装任何依赖，`main.py` 会在启动时自动检查并安装所需的 Python 包。

```bash
python main.py
```

启动后浏览器会自动打开 `http://localhost:5001`。

### 首次运行时会自动完成

| 步骤 | 说明 |
|------|------|
| 检查 Python 依赖 | 自动安装 `flask`、`flask-cors`（若未安装） |
| 启动服务 | Flask 后端监听 `http://localhost:5001` |
| 打开浏览器 | 自动跳转到游戏页面 |

### 如果自动安装失败，可手动安装

```bash
pip install flask flask-cors
```
