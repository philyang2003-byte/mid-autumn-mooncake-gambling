const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  getState: () => request("/state"),

  addPlayer: (name, age) =>
    request("/players", { method: "POST", body: JSON.stringify({ name, age }) }),

  removePlayer: (id) =>
    request(`/players/${id}`, { method: "DELETE" }),

  startGame: () =>
    request("/game/start", { method: "POST" }),

  throwDice: () =>
    request("/game/throw", { method: "POST" }),

  setPenaltyProb: (prob) =>
    request("/game/penalty_prob", { method: "POST", body: JSON.stringify({ prob }) }),

  reset: () =>
    request("/game/reset", { method: "POST" }),

  getResults: () =>
    request("/game/results"),
};
