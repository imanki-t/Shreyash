export interface DocketItem {
  docketNumber: string;
  name: string;
  slug: string;
  description: string;
  classificationDefault: string;
}

export const DEFAULT_DOCKETS: DocketItem[] = [
  {
    docketNumber: "Docket 01",
    name: "Digital Simulation Engagements",
    slug: "simulation-operations",
    description: "Official repository of all multiplayer engagements, structural builds, tactical miscalculations, and in-game incidents involving Subject Shreyash across various titles.",
    classificationDefault: "RESTRICTED",
  },
  {
    docketNumber: "Docket 02",
    name: "Verbal Disclosures & Audio Intercepts",
    slug: "verbal-intercepts",
    description: "Documented audio surveillance intercepts, voice channel recordings, and verbatim out-of-context transcripts captured during operational sessions.",
    classificationDefault: "CONFIDENTIAL",
  },
  {
    docketNumber: "Docket 03",
    name: "Visual & Photographic Surveillance",
    slug: "photographic-evidence",
    description: "Photographic exhibits, screengrabs, facial surveillance captures, and visual artifacts cataloged under chain-of-custody protocols.",
    classificationDefault: "RESTRICTED",
  },
  {
    docketNumber: "Docket 04",
    name: "Behavioral Anomalies & Peculiarities",
    slug: "behavioral-anomalies",
    description: "Incidents exhibiting significant variance from rational baseline behavior, unexplained late-night occurrences, and peculiar tactical habits.",
    classificationDefault: "SPECIAL OVERSIGHT",
  },
  {
    docketNumber: "Docket 05",
    name: "Commendations & Wholesome Records",
    slug: "commendations",
    description: "Declassified evidence of exemplary loyalty, emotional camaraderie, heroic clutches, and genuine friendship within the Directorate.",
    classificationDefault: "DECLASSIFIED // WHOLESOME",
  },
];
