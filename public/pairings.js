// V-Signal · Moduuliparit
// Määrittää mitkä moduulit muodostavat vuorovaikutteisen yhdistelmänäkymän.
// Jokainen pari kuvaa miksi moduulit kuuluvat yhteen ja mitä bus-kanavia ne jakavat.

export const PAIRINGS = [
  {
    a: "moduli001", b: "moduli002",
    title: "Demografia × Sektorimenot",
    synthesis: "Kun huoltosuhde heikkenee, mille sektoreille raha siirtyy? Kaksi näkymää, yksi kysymys.",
    bridge: ["selection.year", "filter.sector"],
  },
  {
    a: "moduli001", b: "moduli009",
    title: "Demografia × Skenaario",
    synthesis: "Lähtökohta huoltosuhteesta — testaa elastisuudet skenaariotyökalulla.",
    bridge: ["selection.year", "selection.sector"],
  },
  {
    a: "moduli002", b: "moduli009",
    title: "Sektorimenot × Skenaario",
    synthesis: "Valitse sektori menonäkymästä, lisää rahoitus skenaariotyökalussa, näe vaikutus.",
    bridge: ["selection.sector"],
  },
  {
    a: "moduli003", b: "moduli005",
    title: "Asuminen → Syntyvyys · v1 vs v2",
    synthesis: "Alkuperäinen ja korjattu ketjuanalyysi rinnakkain — vertaa metodologiaa.",
    bridge: ["selection.year", "selection.country"],
  },
  {
    a: "moduli003", b: "moduli004",
    title: "Asuminen × Osa-aikatyö",
    synthesis: "Kaksi syntyvyyden ajuria saman aikajanan päällä — asumiskustannus vs. työn epävarmuus.",
    bridge: ["selection.year", "filter.period"],
  },
  {
    a: "moduli004", b: "moduli005",
    title: "Korrelaatiot × Pohjoismainen vertailu",
    synthesis: "Suomalainen TFR-analyysi pohjoismaista taustaa vasten.",
    bridge: ["selection.year", "selection.country"],
  },
  {
    a: "moduli004", b: "moduli009",
    title: "TFR-korrelaatiot × Skenaario",
    synthesis: "Käännä korrelaatiokerroin politiikkasimulaatioksi.",
    bridge: ["selection.sector", "selection.year"],
  },
  {
    a: "moduli005", b: "moduli009",
    title: "Asunto-syntyvyysketju × Skenaario",
    synthesis: "Mitä jos asuntotuki kasvaisi — ketjun loppupäässä syntyvyys.",
    bridge: ["selection.sector", "selection.year"],
  },
];

// Symmetrinen haku
export function findPairing(idA, idB) {
  if (!idA || !idB || idA === idB) return null;
  return PAIRINGS.find(
    (p) => (p.a === idA && p.b === idB) || (p.a === idB && p.b === idA)
  ) || null;
}

// Kaikki moduulit jotka muodostavat parin annetun kanssa
export function partnersOf(id) {
  const out = new Set();
  for (const p of PAIRINGS) {
    if (p.a === id) out.add(p.b);
    if (p.b === id) out.add(p.a);
  }
  return out;
}
