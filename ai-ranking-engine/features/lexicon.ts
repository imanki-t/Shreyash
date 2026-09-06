export interface LexiconEntry {
  term: string;
  weight: number;
  category: "credibility" | "severity" | "wholesome" | "anomaly" | "operational";
}

export class IntelligenceLexicon {
  private dictionary: Map<string, LexiconEntry>;

  constructor() {
    this.dictionary = new Map();
    const entries: LexiconEntry[] = [
      { term: "verified", weight: 2.5, category: "credibility" },
      { term: "corroborated", weight: 2.2, category: "credibility" },
      { term: "confirmed", weight: 2.0, category: "credibility" },
      { term: "eyewitness", weight: 1.8, category: "credibility" },
      { term: "affidavit", weight: 1.7, category: "credibility" },
      { term: "deposition", weight: 1.6, category: "credibility" },
      { term: "authenticated", weight: 2.1, category: "credibility" },
      { term: "tamper-evident", weight: 1.9, category: "credibility" },
      { term: "intercept", weight: 1.5, category: "operational" },
      { term: "wiretap", weight: 1.7, category: "operational" },
      { term: "surveillance", weight: 1.8, category: "operational" },
      { term: "reconnaissance", weight: 1.6, category: "operational" },
      { term: "coordinates", weight: 1.4, category: "operational" },
      { term: "tactical", weight: 1.5, category: "operational" },
      { term: "simulation", weight: 1.3, category: "operational" },
      { term: "cadence", weight: 1.2, category: "operational" },
      { term: "anomaly", weight: 2.4, category: "anomaly" },
      { term: "discrepancy", weight: 2.6, category: "anomaly" },
      { term: "variance", weight: 1.9, category: "anomaly" },
      { term: "detonation", weight: 2.2, category: "anomaly" },
      { term: "unverified", weight: 1.8, category: "anomaly" },
      { term: "erratic", weight: 2.0, category: "anomaly" },
      { term: "compromised", weight: 2.7, category: "anomaly" },
      { term: "catastrophic", weight: 2.8, category: "severity" },
      { term: "critical", weight: 2.5, category: "severity" },
      { term: "severe", weight: 2.3, category: "severity" },
      { term: "danger", weight: 2.0, category: "severity" },
      { term: "emergency", weight: 2.4, category: "severity" },
      { term: "lethal", weight: 2.6, category: "severity" },
      { term: "collapse", weight: 2.2, category: "severity" },
      { term: "breach", weight: 2.5, category: "severity" },
      { term: "wholesome", weight: 3.0, category: "wholesome" },
      { term: "camaraderie", weight: 2.8, category: "wholesome" },
      { term: "loyalty", weight: 2.9, category: "wholesome" },
      { term: "clutch", weight: 2.7, category: "wholesome" },
      { term: "heroic", weight: 2.6, category: "wholesome" },
      { term: "brotherhood", weight: 2.8, category: "wholesome" },
      { term: "friendship", weight: 2.9, category: "wholesome" },
      { term: "unconditional", weight: 2.5, category: "wholesome" },
      { term: "legendary", weight: 2.4, category: "wholesome" },
      { term: "heartwarming", weight: 2.7, category: "wholesome" },
      { term: "trust", weight: 2.6, category: "wholesome" },
      { term: "alliance", weight: 2.2, category: "wholesome" },
      { term: "support", weight: 2.1, category: "wholesome" },
      { term: "tribute", weight: 2.4, category: "wholesome" },
      { term: "commendation", weight: 2.8, category: "wholesome" }
    ];
    for (let i = 0; i < entries.length; i++) {
      this.dictionary.set(entries[i].term, entries[i]);
    }
  }

  public lookup(token: string): LexiconEntry | undefined {
    return this.dictionary.get(token.toLowerCase());
  }

  public analyzeText(tokens: string[]): {
    credibilityScore: number;
    anomalyScore: number;
    severityScore: number;
    wholesomeScore: number;
    operationalScore: number;
    dominantCategory: string;
  } {
    let credibility = 0;
    let anomaly = 0;
    let severity = 0;
    let wholesome = 0;
    let operational = 0;

    for (let i = 0; i < tokens.length; i++) {
      const match = this.lookup(tokens[i]);
      if (match) {
        if (match.category === "credibility") credibility += match.weight;
        else if (match.category === "anomaly") anomaly += match.weight;
        else if (match.category === "severity") severity += match.weight;
        else if (match.category === "wholesome") wholesome += match.weight;
        else if (match.category === "operational") operational += match.weight;
      }
    }

    const categories = [
      { name: "wholesome", val: wholesome },
      { name: "credibility", val: credibility },
      { name: "anomaly", val: anomaly },
      { name: "severity", val: severity },
      { name: "operational", val: operational },
    ];
    categories.sort((a, b) => b.val - a.val);

    return {
      credibilityScore: Math.tanh(credibility / 10.0),
      anomalyScore: Math.tanh(anomaly / 10.0),
      severityScore: Math.tanh(severity / 10.0),
      wholesomeScore: Math.tanh(wholesome / 10.0),
      operationalScore: Math.tanh(operational / 10.0),
      dominantCategory: categories[0].name,
    };
  }
}
