// Bopia prize determination logic.
// Rolled 6 dice values [v1..v6]. Apply the following rules IN ORDER, returning the highest prize:
// Simplified common ruleset:
//   状元 (zhuangyuan):
//     - 六勃红 (all six = 4)
//     - 六杯红 (all six = 1) / 黑六勃
//     - 遍地锦 (all six are same, not 4)
//     - 五子登科 (five of a kind, any)
//     - 五红 (five 4s, sixth any -> actually 五红 = 5x4 + 1 non-4)
//     - 状元 = four 4s + two others
//   对堂 (duitang) = 1,2,3,4,5,6 straight
//   三红 (sanhong) = three 4s
//   四进 (sijin) = four of a kind (not 4s)
//   二举 (erju) = two 4s
//   一秀 (yixiu) = one 4
//
// Returns { key, label } or null for no prize.

function judgeRoll(dice){
  const v = [...dice].sort((a,b)=>a-b);
  const count = Array(7).fill(0);
  dice.forEach(d=>count[d]++);
  const fours = count[4];

  // all six same
  const allSame = count.some(c=>c===6);
  if (allSame){
    return count[4]===6 ? {key:"zhuangyuan", label:"状元 · 六勃红"}
         : count[1]===6 ? {key:"zhuangyuan", label:"状元 · 黑六勃"}
         : {key:"zhuangyuan", label:"状元 · 遍地锦"};
  }
  // five of a kind
  if (count.some(c=>c===5)){
    if (count[4]===5) return {key:"zhuangyuan", label:"状元 · 五红"};
    return {key:"zhuangyuan", label:"状元 · 五子"};
  }
  // straight 1-6
  const isStraight = [1,2,3,4,5,6].every(n=>count[n]===1);
  if (isStraight){
    return {key:"duitang", label:"对堂 · 1-2-3-4-5-6"};
  }
  // four 4s
  if (fours===4) return {key:"zhuangyuan", label:"状元 · 四红"};
  // four of a kind (not 4)
  if (count.some((c,i)=>c===4 && i!==4)) return {key:"sijin", label:"四进"};
  // three 4s
  if (fours===3) return {key:"sanhong", label:"三红"};
  // two 4s
  if (fours===2) return {key:"erju", label:"二举"};
  // one 4
  if (fours===1) return {key:"yixiu", label:"一秀"};
  return null;
}

window.judgeRoll = judgeRoll;
