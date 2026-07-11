const STORAGE_KEY = "heliora-web-kingdom-v1";
const AUTH_STORAGE_KEY = "heliora-supabase-session-v1";
const LOCAL_BACKEND_URL = "http://127.0.0.1:8787";
const HERO_LEVEL_CAP = 60;
let contentSource = "defaults";
let cloudConfig = {
  provider: "local",
  apiBaseUrl: LOCAL_BACKEND_URL,
  supabaseUrl: "",
  supabaseAnonKey: "",
};
let supabaseSession = null;

const RESOURCE_LABELS = {
  gold: "Or",
  food: "Vivres",
  stone: "Pierre",
  wood: "Bois",
  energy: "Energie",
  gems: "Gemmes",
  guildCoins: "Jetons",
};

const RESOURCE_MARKS = {
  gold: "OR",
  food: "VI",
  stone: "PI",
  wood: "BO",
  energy: "EN",
  gems: "GE",
  guildCoins: "JG",
};

const DEFENSE_TRAPS = [
  {
    id: "ballista",
    name: "Balistes solaires",
    mark: "BA",
    role: "Anti siege",
    power: 62,
    cost: { wood: 42, stone: 26, gold: 18 },
    note: "Perce les beliers et ralentit les assauts lourds.",
  },
  {
    id: "rune",
    name: "Runes de garde",
    mark: "RU",
    role: "Anti magie",
    power: 54,
    cost: { stone: 36, gems: 2, energy: 3 },
    note: "Absorbe les sorts et stabilise les boucliers.",
  },
  {
    id: "spike",
    name: "Fosses de lances",
    mark: "FL",
    role: "Anti cavalerie",
    power: 38,
    cost: { wood: 24, stone: 18, food: 12 },
    note: "Casse les charges rapides devant les remparts.",
  },
];

const TRAP_RARITIES = [
  { min: 1, label: "Commun", className: "common", multiplier: 1 },
  { min: 3, label: "Rare", className: "rare", multiplier: 1.22 },
  { min: 5, label: "Epique", className: "epic", multiplier: 1.52 },
  { min: 8, label: "Legendaire", className: "legendary", multiplier: 1.92 },
  { min: 10, label: "Mythique", className: "mythic", multiplier: 2.45 },
];

const TRAP_MAX_LEVEL = 10;

const DEFENSE_HERO_PASSIVES = {
  maelis: { name: "Egide royale", defense: 0.08, lossReduction: 0.1, text: "Renforce la ligne de front et reduit les pertes." },
  oren: { name: "Maitre des bastions", defense: 0.05, trapPreservation: 0.18, text: "Protege les pieges et les remparts pendant les raids." },
  saya: { name: "Veille astrale", threatControl: 0.12, reward: 0.06, text: "Anticipe les raids et ameliore les recompenses de garnison." },
  kael: { name: "Charge de contre-raid", defense: 0.04, reward: 0.08, text: "Transforme les defenses reussies en butin supplementaire." },
  lyra: { name: "Cantique des blesses", lossReduction: 0.12, reward: 0.04, text: "Stabilise l'hopital et recupere plus de ressources." },
  aurelion: { name: "Mandat solaire", defense: 0.12, reward: 0.14, text: "Donne une autorite solaire aux remparts et au butin." },
  nyxara: { name: "Voile du vide", lossReduction: 0.16, threatControl: 0.08, text: "Deroute les assaillants et limite les pertes." },
  draven: { name: "Titan obsidienne", defense: 0.18, trapPreservation: 0.1, text: "Ancre la citadelle et protege les structures defensives." },
  seraphine: { name: "Oracle celeste", reward: 0.16, shieldOnVictory: 90, text: "Convertit les victoires defensives en faveurs celestes." },
  ragnar: { name: "Tempete de rempart", defense: 0.1, threatControl: 0.14, text: "Brise l'elan ennemi et calme la pression de menace." },
  celestia: { name: "Archonte astrale", defense: 0.08, reward: 0.1, lossReduction: 0.08, text: "Equilibre protection, soins et recompenses." },
  varkhan: { name: "Garde draconique", defense: 0.16, trapPreservation: 0.12, text: "Durcit les remparts avec une garde draconique." },
  isolde: { name: "Bastion de givre", lossReduction: 0.18, threatControl: 0.06, text: "Ralentit les assauts et protege la garnison." },
  morvane: { name: "Pacte necro-garde", trapPreservation: 0.16, reward: 0.08, text: "Recycle les debris de raid en ressources utiles." },
};

let BUILDINGS = [
  {
    id: "castle",
    name: "Citadelle",
    role: "Debloque les niveaux du royaume",
    color: "#2f7f8a",
    mark: "CT",
    cost: { gold: 180, stone: 90, wood: 70 },
    power: 80,
  },
  {
    id: "farm",
    name: "Fermes",
    role: "Produit des vivres",
    color: "#6d9947",
    mark: "FR",
    cost: { gold: 80, wood: 60 },
    production: { food: 4 },
  },
  {
    id: "lumber",
    name: "Scierie",
    role: "Produit du bois",
    color: "#47775e",
    mark: "SC",
    cost: { gold: 85, stone: 40 },
    production: { wood: 3 },
  },
  {
    id: "quarry",
    name: "Carriere",
    role: "Produit de la pierre",
    color: "#76828c",
    mark: "CR",
    cost: { gold: 95, wood: 45 },
    production: { stone: 3 },
  },
  {
    id: "barracks",
    name: "Caserne",
    role: "Augmente la vitesse d'entrainement",
    color: "#a65050",
    mark: "CA",
    cost: { gold: 130, food: 95, stone: 65 },
    power: 55,
  },
  {
    id: "academy",
    name: "Academie",
    role: "Renforce les heros",
    color: "#4f76a8",
    mark: "AC",
    cost: { gold: 160, stone: 90, wood: 90 },
    power: 65,
  },
  {
    id: "wall",
    name: "Remparts",
    role: "Ajoute de la puissance defensive",
    color: "#5e6a73",
    mark: "RM",
    cost: { gold: 150, stone: 140, wood: 60 },
    power: 120,
  },
  {
    id: "market",
    name: "Marche",
    role: "Produit de l'or",
    color: "#c1963e",
    mark: "MA",
    cost: { gold: 120, wood: 80, stone: 50 },
    production: { gold: 3 },
  },
  {
    id: "hospital",
    name: "Hopital",
    role: "Recupere les blesses apres les combats",
    color: "#4f9f8f",
    mark: "HP",
    cost: { gold: 170, food: 130, wood: 75 },
    power: 70,
    effect: "Soins +8% et pertes reduites",
  },
  {
    id: "forge",
    name: "Forge",
    role: "Ameliore les equipements et artefacts",
    color: "#b46a34",
    mark: "FG",
    cost: { gold: 190, stone: 130, wood: 90 },
    power: 85,
    effect: "Artefacts +6% et siege renforce",
  },
  {
    id: "embassy",
    name: "Ambassade",
    role: "Coordonne l'aide de guilde et les rally",
    color: "#2f8b78",
    mark: "AM",
    cost: { gold: 160, food: 105, stone: 80 },
    power: 68,
    effect: "Aide de guilde +5%",
  },
  {
    id: "watchtower",
    name: "Tour de guet",
    role: "Detecte les menaces et prepare la defense",
    color: "#60758e",
    mark: "TG",
    cost: { gold: 155, stone: 125, wood: 70 },
    power: 92,
    effect: "Defense +7% et alerte avancee",
  },
  {
    id: "temple",
    name: "Temple astral",
    role: "Amplifie le mana et les bonus des heros",
    color: "#7654b6",
    mark: "TA",
    cost: { gold: 220, stone: 115, gems: 12 },
    power: 95,
    effect: "Mana heros +7%",
  },
  {
    id: "vault",
    name: "Coffre royal",
    role: "Protege une partie des ressources",
    color: "#9c7a35",
    mark: "CF",
    cost: { gold: 150, stone: 110, wood: 65 },
    power: 64,
    effect: "Ressources protegees +10%",
  },
  {
    id: "portal",
    name: "Portail des epreuves",
    role: "Ouvre les combats de progression du royaume",
    color: "#3f8fbf",
    mark: "PE",
    cost: { gold: 210, stone: 120, energy: 18 },
    power: 88,
    effect: "Epreuves et recompenses +5%",
  },
];

let CITY_LAYOUT = {
  castle: { x: 0, y: 0, width: 1.55, depth: 1.4, height: 2.35, shape: "castle" },
  farm: { x: -2.4, y: 1, width: 1.02, depth: 0.95, height: 0.78, shape: "house" },
  lumber: { x: -1.25, y: 2.15, width: 1.02, depth: 0.95, height: 1.0, shape: "mill" },
  quarry: { x: 1.25, y: 2.15, width: 1.0, depth: 0.95, height: 0.92, shape: "block" },
  barracks: { x: 2.4, y: 1, width: 1.14, depth: 1.02, height: 1.2, shape: "barracks" },
  academy: { x: -2.45, y: 3.25, width: 1.02, depth: 0.98, height: 1.35, shape: "tower" },
  wall: { x: 0, y: 3, width: 1.7, depth: 0.82, height: 1.05, shape: "wall" },
  market: { x: 2.45, y: 3.25, width: 1.02, depth: 0.98, height: 0.9, shape: "market" },
  hospital: { x: -1.35, y: 0.9, width: 1.04, depth: 0.98, height: 1.05, shape: "tower" },
  forge: { x: 1.35, y: 0.9, width: 1.04, depth: 0.98, height: 1.08, shape: "barracks" },
  embassy: { x: -3.1, y: 2.25, width: 1.0, depth: 0.95, height: 1.0, shape: "market" },
  watchtower: { x: 3.1, y: 2.25, width: 0.92, depth: 0.92, height: 1.45, shape: "tower" },
  temple: { x: -1.1, y: 4.05, width: 1.02, depth: 0.98, height: 1.28, shape: "tower" },
  vault: { x: 1.1, y: 4.05, width: 1.02, depth: 0.98, height: 0.95, shape: "block" },
  portal: { x: 0, y: 4.75, width: 1.08, depth: 1.0, height: 1.35, shape: "tower" },
};

const CITADEL_COMPARTMENTS = [
  { id: "keep", buildingId: "castle", label: "Donjon", note: "Niveau du royaume", x: 50, y: 24, tone: "royal" },
  { id: "barracks", buildingId: "barracks", label: "Caserne", note: "Former les troupes", x: 66, y: 48, tone: "war" },
  { id: "hospital", buildingId: "hospital", label: "Hopital", note: "Soigner les blesses", x: 36, y: 50, tone: "life" },
  { id: "academy", buildingId: "academy", label: "Academie", note: "Recherches", x: 28, y: 33, tone: "arcane" },
  { id: "forge", buildingId: "forge", label: "Forge", note: "Artefacts", x: 73, y: 32, tone: "ember" },
  { id: "wall", buildingId: "wall", label: "Remparts", note: "Defense", x: 50, y: 61, tone: "stone" },
  { id: "market", buildingId: "market", label: "Marche", note: "Or et echanges", x: 76, y: 63, tone: "gold" },
  { id: "embassy", buildingId: "embassy", label: "Ambassade", note: "Guilde et rally", x: 22, y: 61, tone: "jade" },
  { id: "watchtower", buildingId: "watchtower", label: "Tour de guet", note: "Alertes", x: 84, y: 43, tone: "steel" },
  { id: "temple", buildingId: "temple", label: "Temple", note: "Mana heros", x: 39, y: 70, tone: "arcane" },
  { id: "vault", buildingId: "vault", label: "Coffre", note: "Protection", x: 61, y: 72, tone: "gold" },
  { id: "portal", buildingId: "portal", label: "Portail", note: "Epreuves", x: 50, y: 80, tone: "arcane" },
  { id: "resources", buildingId: "farm", label: "Domaines", note: "Vivres, bois, pierre", x: 18, y: 76, tone: "life" },
];

const DISTRICT_BONUSES = [
  { buildingId: "hospital", type: "lossReduction", perLevel: 0.08, label: "Pertes de troupes -8%/niv." },
  { buildingId: "forge", type: "army", perLevel: 0.035, label: "Puissance d'armee +3,5%/niv." },
  { buildingId: "forge", type: "artifact", perLevel: 0.05, label: "Artefacts +5%/niv." },
  { buildingId: "embassy", type: "rally", perLevel: 0.05, label: "Rally et aide de guilde +5%/niv." },
  { buildingId: "watchtower", type: "marchSpeed", perLevel: 0.035, label: "Vitesse de marche +3,5%/niv." },
  { buildingId: "watchtower", type: "scouting", perLevel: 0.04, label: "Controle de carte +4%/niv." },
  { buildingId: "temple", type: "hero", perLevel: 0.04, label: "Puissance heros +4%/niv." },
  { buildingId: "temple", type: "xp", perLevel: 0.035, label: "XP heros +3,5%/niv." },
  { buildingId: "vault", type: "production", perLevel: 0.025, label: "Production protegee +2,5%/niv." },
  { buildingId: "portal", type: "trial", perLevel: 0.06, label: "Epreuves du royaume +6%/niv." },
  { buildingId: "market", type: "loot", perLevel: 0.025, label: "Butin de victoire +2,5%/niv." },
  { buildingId: "wall", type: "defense", perLevel: 0.04, label: "Defense et pertes reduites +4%/niv." },
];

const DISTRICT_SYNERGIES = [
  {
    id: "military_core",
    name: "Noyau militaire",
    buildings: ["barracks", "forge", "wall", "watchtower"],
    reward: { gold: 520, stone: 420, energy: 22 },
    bonus: "Armee, defense et marches stabilisees",
  },
  {
    id: "support_network",
    name: "Reseau de soutien",
    buildings: ["hospital", "embassy", "vault"],
    reward: { food: 520, wood: 340, guildCoins: 80 },
    bonus: "Soins, guilde et protection de ressources",
  },
  {
    id: "arcane_path",
    name: "Voie astrale",
    buildings: ["academy", "temple", "portal"],
    reward: { gems: 70, energy: 45, guildCoins: 60 },
    bonus: "Heros, recherches et epreuves du royaume",
  },
  {
    id: "royal_economy",
    name: "Economie royale",
    buildings: ["farm", "market", "lumber", "quarry"],
    reward: { gold: 680, food: 520, wood: 420, stone: 420 },
    bonus: "Production et butin de victoire",
  },
];

let UNITS = [
  {
    id: "guard",
    name: "Gardes solaires",
    role: "Infanterie robuste",
    type: "infantry",
    cost: { food: 18, gold: 8 },
    seconds: 3,
    power: 10,
  },
  {
    id: "archer",
    name: "Archers de verre",
    role: "Degats rapides",
    type: "ranged",
    cost: { food: 14, wood: 16, gold: 10 },
    seconds: 4,
    power: 14,
  },
  {
    id: "rider",
    name: "Cavaliers d'aube",
    role: "Charge mobile",
    type: "cavalry",
    cost: { food: 28, gold: 20, stone: 8 },
    seconds: 7,
    power: 26,
  },
  {
    id: "mage",
    name: "Mages d'obsidienne",
    role: "Degats de zone",
    type: "magic",
    cost: { gold: 30, gems: 2, food: 18 },
    seconds: 9,
    power: 30,
  },
  {
    id: "ram",
    name: "Beliers runiques",
    role: "Siege anti-remparts",
    type: "siege",
    cost: { wood: 36, stone: 28, gold: 18 },
    seconds: 10,
    power: 34,
  },
];

let HEROES = [
  {
    id: "maelis",
    name: "Maelis",
    title: "Paladine celeste",
    bonus: "Bonus de puissance d'armee",
    role: "Tank royal",
    rarity: "Legendaire",
    element: "Solar",
    stars: 5,
    classMark: "DEF",
    color: "#1f64b7",
    accent: "#f1c34d",
    dark: "#183f7a",
    weapon: "lance",
    skill: "Egide solaire",
    skillBonus: "Reduit les pertes d'infanterie",
    art: "./hero-reference.png",
    artAlt: "Maelis, paladine en armure blanche et or dans une cite lumineuse",
    basePower: 70,
  },
  {
    id: "oren",
    name: "Oren",
    title: "Maitre de forge",
    bonus: "Bonus aux recompenses de pierre et bois",
    role: "Briseur mecanique",
    rarity: "Epique",
    element: "Forge",
    stars: 4,
    classMark: "SUP",
    color: "#315f48",
    accent: "#d88d32",
    dark: "#30261d",
    weapon: "hammer",
    skill: "Canon de breche",
    skillBonus: "Renforce les troupes de siege",
    art: "./hero2.png",
    artAlt: "Oren, ingenieur de guerre barbu en armure mecanique dans une cite forge",
    basePower: 48,
  },
  {
    id: "saya",
    name: "Saya",
    title: "Eclaireuse astrale",
    bonus: "Expeditions plus rapides",
    role: "Assassin mobile",
    rarity: "Mythique",
    element: "Astral",
    stars: 5,
    classMark: "DPS",
    color: "#4f76d8",
    accent: "#78f0e2",
    dark: "#233468",
    weapon: "blade",
    art: "./saya-astral.png",
    artAlt: "Saya, eclaireuse astrale en armure legere bleue avec lames astrales cyan",
    skill: "Frappe astrale",
    skillBonus: "Accelere les expeditions",
    basePower: 54,
  },
  {
    id: "kael",
    name: "Kael",
    title: "Capitaine carmin",
    bonus: "Bonus de cavalerie",
    role: "Charge frontale",
    rarity: "Epique",
    element: "Guerre",
    stars: 4,
    classMark: "ATK",
    color: "#9d3b36",
    accent: "#f0b75e",
    dark: "#4b2426",
    weapon: "lance",
    art: "./kael-crimson.png",
    artAlt: "Kael, capitaine de cavalerie en armure carmin et or avec lance royale",
    skill: "Percussion royale",
    skillBonus: "Renforce la cavalerie",
    basePower: 52,
  },
  {
    id: "lyra",
    name: "Lyra",
    title: "Archiviste lunaire",
    bonus: "Bonus de recherche et artefacts",
    role: "Mage tactique",
    rarity: "Legendaire",
    element: "Lunaire",
    stars: 5,
    classMark: "MAG",
    color: "#7459c8",
    accent: "#95ecff",
    dark: "#2a255f",
    weapon: "staff",
    art: "./lyra-lunar.png",
    artAlt: "Lyra, archiviste lunaire en robe violette avec grimoire et artefacts flottants",
    skill: "Convergence",
    skillBonus: "Ameliore les formations equilibrees",
    basePower: 66,
  },
  {
    id: "aurelion",
    name: "Aurelion",
    title: "Empereur solaire",
    bonus: "Puissance d'armee premium",
    role: "Souverain offensif",
    rarity: "Ultra rare premium",
    element: "Solaire divin",
    stars: 5,
    classMark: "UR",
    color: "#f0b43a",
    accent: "#fff1a7",
    dark: "#5a2d0b",
    weapon: "scepter",
    art: "./aurelion-african-power.png",
    artAlt: "Aurelion, empereur solaire africain en armure or et ivoire devant une citadelle radieuse",
    visualTheme: "African Power",
    signature: "Couronne solaire, or royal et domination d'armee.",
    skill: "Jugement imperial",
    skillBonus: "Multiplie la pression de l'avant-garde",
    basePower: 310,
    statMultiplier: 5,
    tier: "premium",
  },
  {
    id: "nyxara",
    name: "Nyxara",
    title: "Reine du vide",
    bonus: "Controle et degats arcaniques premium",
    role: "Mage de rupture",
    rarity: "Ultra rare premium",
    element: "Vide",
    stars: 5,
    classMark: "UR",
    color: "#6b4cff",
    accent: "#d7b5ff",
    dark: "#21124a",
    weapon: "orb",
    art: "./nyxara-african-power.png",
    artAlt: "Nyxara, reine africaine du vide en robe violette royale avec orbe cosmique et couronne noire",
    visualTheme: "African Power",
    signature: "Reine cosmique, vide violet et controle des lignes.",
    skill: "Eclipse absolue",
    skillBonus: "Affaiblit toute la formation ennemie",
    basePower: 295,
    statMultiplier: 5,
    tier: "premium",
  },
  {
    id: "draven",
    name: "Draven",
    title: "Titan d'obsidienne",
    bonus: "Defense et reduction des pertes premium",
    role: "Rempart mythique",
    rarity: "Ultra rare premium",
    element: "Obsidienne",
    stars: 5,
    classMark: "UR",
    color: "#4b5563",
    accent: "#ff9f43",
    dark: "#171923",
    weapon: "greatshield",
    art: "./draven-african-power.png",
    artAlt: "Draven, titan africain d'obsidienne en armure volcanique avec grand bouclier runique",
    visualTheme: "African Power",
    signature: "Bouclier basaltique, garde ancestrale et defense absolue.",
    skill: "Mur du colosse",
    skillBonus: "Absorbe les degats massifs",
    basePower: 330,
    statMultiplier: 5,
    tier: "premium",
  },
  {
    id: "seraphine",
    name: "Seraphine",
    title: "Oracle celeste",
    bonus: "Soutien, mana et soins tactiques premium",
    role: "Oracle de guerre",
    rarity: "Ultra rare premium",
    element: "Celeste",
    stars: 5,
    classMark: "UR",
    color: "#38bdf8",
    accent: "#e0f7ff",
    dark: "#12375f",
    weapon: "halo",
    art: "./seraphine-african-power.png",
    artAlt: "Seraphine, oracle celeste africaine en tenue blanche et turquoise avec halo d'etoiles",
    visualTheme: "African Power",
    signature: "Oracle etoile, soin tactique et aura celeste.",
    skill: "Benediction des astres",
    skillBonus: "Amplifie les autres heros",
    basePower: 285,
    statMultiplier: 5,
    tier: "premium",
  },
  {
    id: "ragnar",
    name: "Ragnar",
    title: "Seigneur tempete",
    bonus: "Charge cavaliere et vitesse premium",
    role: "Briseur de lignes",
    rarity: "Ultra rare premium",
    element: "Tempete",
    stars: 5,
    classMark: "UR",
    color: "#0f766e",
    accent: "#99f6e4",
    dark: "#083344",
    weapon: "stormaxe",
    art: "./ragnar-african-power.png",
    artAlt: "Ragnar, seigneur africain de la tempete en armure turquoise avec hache de foudre",
    visualTheme: "African Power",
    signature: "Hache de foudre, marche tempete et charge royale.",
    skill: "Ouragan royal",
    skillBonus: "Percute les flancs et augmente les critiques",
    basePower: 300,
    statMultiplier: 5,
    tier: "premium",
  },
  {
    id: "celestia",
    name: "Celestia",
    title: "Archonte astrale",
    bonus: "Assassinat et XP heros premium",
    role: "Executeur astral",
    rarity: "Ultra rare premium",
    element: "Astral pur",
    stars: 5,
    classMark: "UR",
    color: "#db2777",
    accent: "#fbcfe8",
    dark: "#4a044e",
    weapon: "dualblade",
    art: "./celestia-african-power.png",
    artAlt: "Celestia, archonte astrale africaine en armure magenta et or avec doubles lames stellaires",
    visualTheme: "African Power",
    signature: "Lames astrales, vitesse d'elite et execution ciblee.",
    skill: "Lame de constellation",
    skillBonus: "Frappe les chefs ennemis avec precision",
    basePower: 305,
    statMultiplier: 5,
    tier: "premium",
  },
  {
    id: "varkhan",
    name: "Varkhan",
    title: "Empereur dragon",
    bonus: "Degats de flamme et pression totale premium",
    role: "Souverain draconique",
    rarity: "Ultra rare premium",
    element: "Dragon feu",
    stars: 5,
    classMark: "UR",
    color: "#b45309",
    accent: "#ffb347",
    dark: "#1c0a06",
    weapon: "flameblade",
    art: "./varkhan-dragon.png",
    artAlt: "Varkhan, empereur dragon en armure noire et or avec lame de feu devant une citadelle volcanique",
    skill: "Couronne infernale",
    skillBonus: "Brule l'armee ennemie et augmente les degats critiques",
    basePower: 350,
    statMultiplier: 5,
    tier: "premium",
  },
  {
    id: "isolde",
    name: "Isolde",
    title: "Imperatrice du givre",
    bonus: "Controle, defense et gel premium",
    role: "Mage imperiale",
    rarity: "Ultra rare premium",
    element: "Givre royal",
    stars: 5,
    classMark: "UR",
    color: "#2563eb",
    accent: "#bae6fd",
    dark: "#172554",
    weapon: "frostspear",
    art: "./isolde-frost.png",
    artAlt: "Isolde, imperatrice du givre en armure argent et saphir avec lance de glace",
    skill: "Prison d'aurore",
    skillBonus: "Gele la formation ennemie et reduit les pertes",
    basePower: 340,
    statMultiplier: 5,
    tier: "premium",
  },
  {
    id: "morvane",
    name: "Morvane",
    title: "Necromancien royal",
    bonus: "Drain, controle et recuperation premium",
    role: "Archimage sombre",
    rarity: "Ultra rare premium",
    element: "Ame verte",
    stars: 5,
    classMark: "UR",
    color: "#047857",
    accent: "#86efac",
    dark: "#061b14",
    weapon: "soulstaff",
    art: "./morvane-necro.png",
    artAlt: "Morvane, necromancien royal en armure noire et emeraude avec sceptre de feu spirituel",
    skill: "Moisson des ames",
    skillBonus: "Draine la puissance ennemie et stabilise l'escouade",
    basePower: 335,
    statMultiplier: 5,
    tier: "premium",
  },
];

const PREMIUM_HERO_IDS = ["aurelion", "nyxara", "draven", "seraphine", "ragnar", "celestia", "varkhan", "isolde", "morvane"];
const AFRICAN_POWER_HERO_IDS = ["aurelion", "nyxara", "draven", "seraphine", "ragnar", "celestia"];
const AFRICAN_POWER_SET_TIERS = [
  { count: 2, label: "Cour royale", army: 0.06, mitigation: 0.03, xp: 0.04, text: "Armee +6%, pertes -3%, XP heros +4%" },
  { count: 4, label: "Ascendance", army: 0.12, mitigation: 0.07, xp: 0.09, text: "Armee +12%, pertes -7%, XP heros +9%" },
  { count: 5, label: "Empire African Power", army: 0.2, mitigation: 0.12, xp: 0.16, text: "Armee +20%, pertes -12%, XP heros +16%" },
];

let WORLD_NODES = [
  { id: "n1", name: "Camp de Bandits", type: "camp", power: 420, level: 5, x: 27, y: 43, guild: "BDT", enemyFormation: "charge", reward: { gold: 360, food: 280 }, icon: "CB" },
  { id: "n2", name: "Geant de Feu", type: "elite", power: 720, level: 6, x: 34, y: 29, guild: "IGN", enemyFormation: "siege", reward: { gold: 520, stone: 260, energy: 12 }, icon: "GF" },
  { id: "n3", name: "Dragon Ancien", type: "elite", power: 3400, level: 30, x: 52, y: 24, guild: "DRA", enemyFormation: "arcane", reward: { gold: 1800, gems: 120, energy: 28 }, icon: "DA" },
  { id: "n4", name: "Golem de Pierre", type: "elite", power: 950, level: 8, x: 64, y: 32, guild: "ROC", enemyFormation: "shieldwall", reward: { stone: 900, gold: 320 }, icon: "GP" },
  { id: "n5", name: "Camp Orc", type: "camp", power: 860, level: 7, x: 66, y: 48, guild: "ORC", enemyFormation: "balanced", reward: { gold: 640, food: 420, wood: 260 }, icon: "CO" },
  { id: "n6", name: "Necromancien", type: "elite", power: 2550, level: 25, x: 39, y: 76, guild: "NCR", enemyFormation: "arcane", reward: { gems: 95, energy: 24, gold: 1250 }, icon: "NC" },
  { id: "n7", name: "Ferme solaire", type: "resource", power: 160, level: 5, x: 52, y: 78, guild: "FRM", enemyFormation: "balanced", reward: { food: 760 }, icon: "FE", harvestTime: 32, troopsNeeded: 24 },
  { id: "n8", name: "Scierie d'Emeraude", type: "resource", power: 190, level: 6, x: 77, y: 60, guild: "SCI", enemyFormation: "volley", reward: { wood: 820 }, icon: "SC", harvestTime: 38, troopsNeeded: 28 },
  { id: "n9", name: "Carriere blanche", type: "resource", power: 175, level: 6, x: 22, y: 64, guild: "CAR", enemyFormation: "shieldwall", reward: { stone: 790 }, icon: "CR", harvestTime: 36, troopsNeeded: 26 },
  { id: "n10", name: "Mine d'Or", type: "resource", power: 260, level: 7, x: 80, y: 70, guild: "MOR", enemyFormation: "siege", reward: { gold: 880 }, icon: "OR", harvestTime: 44, troopsNeeded: 34 },
  { id: "n11", name: "Mine de Gemmes", type: "resource", power: 320, level: 7, x: 18, y: 71, guild: "GEM", enemyFormation: "arcane", reward: { gems: 90 }, icon: "GE", harvestTime: 52, troopsNeeded: 42 },
  { id: "n12", name: "Cristaux astraux", type: "resource", power: 380, level: 9, x: 15, y: 66, guild: "AST", enemyFormation: "arcane", reward: { energy: 32, gems: 45 }, icon: "CA", harvestTime: 58, troopsNeeded: 48 },
];

const QUESTS = [
  {
    id: "q1",
    title: "Elever la Citadelle au niveau 2",
    reward: { gold: 150, stone: 80 },
    done: (state) => state.buildings.castle >= 2,
  },
  {
    id: "q2",
    title: "Former 25 troupes",
    reward: { food: 220, gold: 120 },
    done: (state) => totalUnits(state) >= 25,
  },
  {
    id: "q3",
    title: "Gagner 3 expeditions",
    reward: { gold: 320, energy: 20 },
    done: (state) => state.victories >= 3,
  },
  {
    id: "q4",
    title: "Atteindre 1500 de puissance",
    reward: { gold: 500, stone: 260, wood: 260 },
    done: (state) => kingdomPower(state) >= 1500,
  },
];

let FORMATIONS = [
  { id: "balanced", name: "Ligne equilibree", bonusType: "all", counter: "siege", weakTo: "volley", description: "Stable contre les compositions inconnues." },
  { id: "shieldwall", name: "Mur de boucliers", bonusType: "infantry", counter: "charge", weakTo: "siege", description: "Infanterie devant, pertes reduites." },
  { id: "volley", name: "Pluie d'archers", bonusType: "ranged", counter: "shieldwall", weakTo: "charge", description: "Degats a distance contre les lignes lentes." },
  { id: "charge", name: "Charge cavaliere", bonusType: "cavalry", counter: "volley", weakTo: "shieldwall", description: "Percute les archers et les camps legerement proteges." },
  { id: "arcane", name: "Cercle arcanique", bonusType: "magic", counter: "balanced", weakTo: "charge", description: "Mages en zone contre les groupes denses." },
  { id: "siege", name: "Train de siege", bonusType: "siege", counter: "shieldwall", weakTo: "charge", description: "Brise les fortifications et les elites defensives." },
];

const FORMATION_MARKS = {
  balanced: "EQ",
  shieldwall: "MB",
  volley: "AR",
  charge: "CA",
  arcane: "MA",
  siege: "SI",
};

const UNIT_MARKS = {
  guard: "GA",
  archer: "AR",
  rider: "CA",
  mage: "MG",
  ram: "BE",
};

const UNIT_TYPE_LABELS = {
  infantry: "Infanterie",
  ranged: "Distance",
  cavalry: "Cavalerie",
  magic: "Mages",
  siege: "Siege",
};

let RESEARCH = [
  { id: "logistics", name: "Logistique royale", max: 5, cost: { gold: 180, wood: 120 }, bonus: "Production +5% par niveau" },
  { id: "formations", name: "Doctrine de formation", max: 5, cost: { gold: 220, food: 120 }, bonus: "Puissance tactique +4% par niveau" },
  { id: "engineering", name: "Ingenierie de siege", max: 4, cost: { gold: 260, stone: 160 }, bonus: "Beliers et batiments +6% par niveau" },
  { id: "diplomacy", name: "Diplomatie de guilde", max: 4, cost: { gold: 160, food: 100 }, bonus: "Aide de guilde et rally +5% par niveau" },
];

let ARTIFACTS = [
  { id: "sun_crown", name: "Couronne solaire", cost: { gold: 420, stone: 220 }, bonus: "Heros +8%", power: 90 },
  { id: "forge_core", name: "Coeur de forge", cost: { gold: 380, wood: 220, stone: 220 }, bonus: "Siege +12%", power: 80 },
  { id: "moon_chart", name: "Carte lunaire", cost: { gold: 500, energy: 25 }, bonus: "Marches +10%", power: 110 },
];

let LIVE_EVENTS = [
  {
    id: "ball_carnival",
    name: "Carnaval des Royaumes",
    tag: "Event saisonnier",
    endsInHours: 72,
    goal: 500,
    reward: { gold: 900, food: 600, gems: 80 },
    shopSkin: "carnival_castle",
    description: "Gagne des points via entrainement, expeditions, aides de guilde et recherches.",
  },
  {
    id: "guild_expedition",
    name: "Expedition de guilde",
    tag: "GvG simule",
    endsInHours: 120,
    goal: 800,
    reward: { stone: 700, wood: 700, guildCoins: 120 },
    shopSkin: "emerald_route",
    description: "Accumule des points de rally et grimpe dans le classement d'alliance.",
  },
];

let SHOP_ITEMS = [
  { id: "carnival_castle", name: "Skin Citadelle carnaval", type: "castle", price: 120, bonus: "Production +4%", event: "ball_carnival" },
  { id: "emerald_route", name: "Skin Route emeraude", type: "route", price: 90, bonus: "Marches +5%", event: "guild_expedition" },
  { id: "solar_army", name: "Skin Armee solaire", type: "army", price: 140, bonus: "Puissance +3%", event: "ball_carnival" },
  { id: "starter_pass", name: "Pass de conquete", type: "pass", price: 0, bonus: "Recompense de progression gratuite" },
];

const KINGDOM_TRIALS = [
  { id: "sentinels", name: "Portail des sentinelles", level: 1, power: 220, energy: 8, reward: { gold: 360, food: 300, energy: 16 }, bonus: { type: "power", value: 150, label: "+150 puissance royaume" } },
  { id: "shards", name: "Arene des eclats", level: 2, power: 460, energy: 9, reward: { stone: 320, wood: 320, gems: 35 }, bonus: { type: "production", value: 0.03, label: "Production +3%" } },
  { id: "crimson_bastion", name: "Bastion carmin", level: 3, power: 820, energy: 10, reward: { gold: 720, guildCoins: 90, gems: 45 }, unlockHero: "kael", bonus: { type: "army", value: 0.04, label: "Armee +4%" } },
  { id: "lunar_crypt", name: "Crypte lunaire", level: 4, power: 1280, energy: 11, reward: { food: 900, stone: 620, energy: 30 }, bonus: { type: "training", value: 0.06, label: "Entrainement +6%" } },
  { id: "astral_sanctum", name: "Sanctuaire astral", level: 5, power: 1820, energy: 12, reward: { gems: 100, guildCoins: 140, energy: 40 }, unlockHero: "lyra", bonus: { type: "xp", value: 0.08, label: "XP heros +8%" } },
  { id: "heliora_throne", name: "Trone d'Heliora", level: 6, power: 2550, energy: 14, reward: { gems: 180, guildCoins: 220, gold: 1400 }, bonus: { type: "army", value: 0.06, label: "Conquete finale: armee +6%" } },
];

const REWARD_CODES = {
  heliorax: {
    label: "Pack royal Heliorax",
    reward: { gems: 5000, guildCoins: 5000, energy: 5000 },
  },
};

let GUILD_MEMBERS = [
  { name: "Ariane", rank: "R4", power: 18400, status: "Chasse monstres" },
  { name: "Bastian", rank: "R3", power: 13950, status: "Pret pour rally" },
  { name: "Nora", rank: "R3", power: 12220, status: "Collecte ressources" },
  { name: "Ilan", rank: "R2", power: 9100, status: "Aide construction" },
];

let LEADERBOARD = [
  { name: "Solaris Prime", guild: "SPX", power: 86200 },
  { name: "Forge Aegis", guild: "FGA", power: 74400 },
  { name: "Moon Vale", guild: "MVL", power: 69100 },
];

const ONBOARDING_STEPS = [
  "Bienvenue commandant. Ameliore la Citadelle pour debloquer le royaume.",
  "Forme des troupes puis choisis une formation dans l'onglet Armee.",
  "Rejoins l'Alliance simulee pour utiliser l'aide de guilde et les rally.",
  "Passe par Events chaque jour pour reclamer les recompenses liveops.",
];

const $ = (selector) => document.querySelector(selector);

const elements = {
  kingdomSummary: $("#kingdomSummary"),
  liveOpsBar: $("#liveOpsBar"),
  resources: $("#resources"),
  tabs: document.querySelectorAll(".tab"),
  views: document.querySelectorAll(".view"),
  kingdomCanvas: $("#kingdomCanvas"),
  citadelInspector: $("#citadelInspector"),
  citadelCompartments: $("#citadelCompartments"),
  cityGrid: $("#cityGrid"),
  quickActions: $("#quickActions"),
  selectedBuildingName: $("#selectedBuildingName"),
  buildingDetails: $("#buildingDetails"),
  citadelOverview: $("#citadelOverview"),
  kingdomTrialPanel: $("#kingdomTrialPanel"),
  formationPanel: $("#formationPanel"),
  trainingQueue: $("#trainingQueue"),
  unitList: $("#unitList"),
  heroList: $("#heroList"),
  mapGrid: $("#mapGrid"),
  selectedNodeName: $("#selectedNodeName"),
  nodeDetails: $("#nodeDetails"),
  battleReport: $("#battleReport"),
  marchList: $("#marchList"),
  guildPanel: $("#guildPanel"),
  chatPanel: $("#chatPanel"),
  leaderboardPanel: $("#leaderboardPanel"),
  eventPanel: $("#eventPanel"),
  inboxPanel: $("#inboxPanel"),
  shopPanel: $("#shopPanel"),
  progressionPanel: $("#progressionPanel"),
  questList: $("#questList"),
  logList: $("#logList"),
  reportCenter: $("#reportCenter"),
  reportInsights: $("#reportInsights"),
  authPanel: $("#authPanel"),
  installAppBtn: $("#installAppBtn"),
  syncBtn: $("#syncBtn"),
  saveBtn: $("#saveBtn"),
  resetBtn: $("#resetBtn"),
  onboarding: $("#onboarding"),
  rewardBurst: $("#rewardBurst"),
  toast: $("#toast"),
};

let state;
let selectedBuilding = "castle";
let selectedNode = "n1";
let selectedMapFilter = "all";
let selectedReportFilter = "all";
let attackPrep = null;
let worldMapZoom = 1;
let toastTimer = null;
let rewardBurstTimer = null;
let deferredInstallPrompt = null;
let canvasContext = null;
let canvasScale = 1;
let projectedBuildings = [];

function createInitialState() {
  const today = todayKey();
  return {
    playerId: `player-${Math.random().toString(16).slice(2, 10)}`,
    resources: { gold: 420, food: 360, stone: 260, wood: 260, energy: 60, gems: 120, guildCoins: 0 },
    buildings: Object.fromEntries(BUILDINGS.map((building) => [building.id, building.id === "castle" ? 1 : 0])),
    units: Object.fromEntries(UNITS.map((unit) => [unit.id, 0])),
    heroes: Object.fromEntries(HEROES.map((hero) => [hero.id, createHeroProgress(hero.id)])),
    activeHero: "maelis",
    heroLineup: ["maelis", "oren", "saya"],
    heroUnlocks: ["maelis", "oren", "saya", ...PREMIUM_HERO_IDS],
    kingdomTrial: { level: 1, completed: [], bonuses: [] },
    selectedFormation: "balanced",
    research: Object.fromEntries(RESEARCH.map((item) => [item.id, 0])),
    artifacts: [],
    cosmetics: ["starter_pass"],
    activeSkins: { castle: null, army: null, route: null },
    eventProgress: Object.fromEntries(LIVE_EVENTS.map((event) => [event.id, 0])),
    claimedEvents: [],
    claimedDistrictSynergies: [],
    claimedLoginDate: "",
    inbox: [
      { id: `welcome-${today}`, title: "Bienvenue dans Heliora", body: "Pack de depart disponible.", reward: { gold: 180, food: 160, gems: 20 }, claimed: false },
    ],
    guild: {
      id: "",
      name: "Aube d'Heliora",
      tag: "HDH",
      rank: "R3",
      role: "member",
      helps: 3,
      rallyReadyAt: 0,
      score: 320,
      lastResetDate: today,
      cloudMembers: [],
      invites: [],
      leaderboard: [],
    },
    chat: [
      { from: "Ariane", text: "Bienvenue. Lance une aide de guilde avant les gros timers." },
      { from: "Bastian", text: "Rally pret sur les elites de la carte." },
    ],
    sharedReports: [],
    leaderboard: LEADERBOARD,
    battleReports: [],
    harvestReports: [],
    defenseReports: [],
    scoutReports: {},
    mapBookmarks: [],
    defense: {
      shieldUntil: 0,
      woundedUnits: Object.fromEntries(UNITS.map((unit) => [unit.id, 0])),
      traps: Object.fromEntries(DEFENSE_TRAPS.map((trap) => [trap.id, 0])),
      trapLevels: Object.fromEntries(DEFENSE_TRAPS.map((trap) => [trap.id, 1])),
      heroes: ["maelis", "oren", "saya"],
      drillReadyAt: 0,
      nextRaidAt: Date.now() + 7 * 60 * 1000,
      threatLevel: 1,
    },
    training: [],
    marches: [],
    returnMarches: [],
    redeemedCodes: [],
    clearedNodes: [],
    nodeRespawns: {},
    claimedQuests: [],
    victories: 0,
    onboardingStep: 0,
    backend: {
      mode: "local",
      cloudSyncAt: 0,
      status: "Sauvegarde locale",
    },
    account: {
      provider: "local",
      userId: "",
      email: "",
      connectedAt: 0,
    },
    lastTick: Date.now(),
    log: ["Le royaume d'Heliora s'eveille."],
  };
}

function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return createInitialState();
  }

  try {
    const parsed = JSON.parse(saved);
    return migrateState(parsed);
  } catch {
    return createInitialState();
  }
}

function migrateState(saved) {
  const fresh = createInitialState();
  return {
    ...fresh,
    ...saved,
    playerId: saved.playerId ?? fresh.playerId,
    resources: { ...fresh.resources, ...saved.resources },
    buildings: { ...fresh.buildings, ...saved.buildings },
    units: { ...fresh.units, ...saved.units },
    heroes: Object.fromEntries(HEROES.map((hero) => [hero.id, normalizeHeroProgress(hero.id, saved.heroes?.[hero.id] ?? fresh.heroes[hero.id])])),
    heroLineup: saved.heroLineup ?? fresh.heroLineup,
    heroUnlocks: [...new Set([...(saved.heroUnlocks ?? fresh.heroUnlocks), ...PREMIUM_HERO_IDS, saved.activeHero, ...(saved.heroLineup ?? [])].filter(Boolean))],
    kingdomTrial: {
      ...fresh.kingdomTrial,
      ...saved.kingdomTrial,
      completed: saved.kingdomTrial?.completed ?? fresh.kingdomTrial.completed,
      bonuses: saved.kingdomTrial?.bonuses ?? fresh.kingdomTrial.bonuses,
      level: Math.max(1, saved.kingdomTrial?.level ?? fresh.kingdomTrial.level),
    },
    research: { ...fresh.research, ...saved.research },
    artifacts: saved.artifacts ?? fresh.artifacts,
    cosmetics: saved.cosmetics ?? fresh.cosmetics,
    activeSkins: { ...fresh.activeSkins, ...saved.activeSkins },
    eventProgress: { ...fresh.eventProgress, ...saved.eventProgress },
    claimedEvents: saved.claimedEvents ?? fresh.claimedEvents,
    inbox: saved.inbox ?? fresh.inbox,
    guild: { ...fresh.guild, ...saved.guild },
    chat: saved.chat ?? fresh.chat,
    sharedReports: saved.sharedReports ?? fresh.sharedReports,
    leaderboard: saved.leaderboard ?? fresh.leaderboard,
    battleReports: saved.battleReports ?? fresh.battleReports,
    harvestReports: saved.harvestReports ?? fresh.harvestReports,
    defenseReports: saved.defenseReports ?? fresh.defenseReports,
    scoutReports: { ...fresh.scoutReports, ...saved.scoutReports },
    mapBookmarks: saved.mapBookmarks ?? fresh.mapBookmarks,
    marches: saved.marches ?? fresh.marches,
    returnMarches: saved.returnMarches ?? fresh.returnMarches,
    defense: {
      ...fresh.defense,
      ...saved.defense,
      woundedUnits: { ...fresh.defense.woundedUnits, ...saved.defense?.woundedUnits },
      traps: { ...fresh.defense.traps, ...saved.defense?.traps },
      trapLevels: { ...fresh.defense.trapLevels, ...saved.defense?.trapLevels },
      heroes: saved.defense?.heroes ?? saved.heroLineup?.slice(0, 3) ?? fresh.defense.heroes,
    },
    nodeRespawns: saved.nodeRespawns ?? Object.fromEntries((saved.clearedNodes ?? []).map((id) => [id, Date.now() + nodeRespawnMs(getNode(id))])),
    selectedFormation: saved.selectedFormation ?? fresh.selectedFormation,
    claimedLoginDate: saved.claimedLoginDate ?? fresh.claimedLoginDate,
    claimedDistrictSynergies: saved.claimedDistrictSynergies ?? fresh.claimedDistrictSynergies,
    redeemedCodes: saved.redeemedCodes ?? fresh.redeemedCodes,
    training: saved.training ?? [],
    marches: saved.marches ?? [],
    onboardingStep: saved.onboardingStep ?? fresh.onboardingStep,
    backend: { ...fresh.backend, ...saved.backend, cloudSyncAt: saved.cloudSyncAt ?? saved.backend?.cloudSyncAt ?? fresh.backend.cloudSyncAt },
    account: { ...fresh.account, ...saved.account },
    log: saved.log?.slice(0, 8) ?? fresh.log,
  };
}

function saveGame(showMessage = false) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastTick: Date.now() }));
  if (showMessage) {
    showToast("Sauvegarde effectuee.");
  }
}

function applyOfflineProgress() {
  const now = Date.now();
  const elapsed = Math.min((now - state.lastTick) / 1000, 7200);
  if (elapsed <= 2) {
    return;
  }

  addProduction(elapsed);
  state.lastTick = now;
  applyDailyReset(now);
  refreshWorldNodes(now);
  processTimedActions(now);
}

function addProduction(seconds) {
  const productionBonus = 1 + (state.research.logistics ?? 0) * 0.05 + (state.activeSkins.castle ? 0.04 : 0) + kingdomTrialBonus("production") + districtBonus("production");
  for (const building of BUILDINGS) {
    const level = state.buildings[building.id] ?? 0;
    if (!building.production || level <= 0) {
      continue;
    }

    for (const [resource, amount] of Object.entries(building.production)) {
      state.resources[resource] += amount * level * seconds * productionBonus;
    }
  }
}

function processTimedActions(now = Date.now()) {
  const completedTraining = state.training.filter((item) => item.readyAt <= now);
  state.training = state.training.filter((item) => item.readyAt > now);

  for (const item of completedTraining) {
    state.units[item.unitId] += item.amount;
    awardEventPoints(item.amount * 2);
    addLog(`${item.amount} ${getUnit(item.unitId).name} rejoignent l'armee.`);
  }

  const completedMarches = state.marches.filter((march) => march.readyAt <= now);
  state.marches = state.marches.filter((march) => march.readyAt > now);

  for (const march of completedMarches) {
    resolveMarch(march);
  }

  state.returnMarches ??= [];
  const completedReturnMarches = state.returnMarches.filter((march) => march.readyAt <= now);
  state.returnMarches = state.returnMarches.filter((march) => march.readyAt > now);

  for (const march of completedReturnMarches) {
    completeHarvestReturn(march);
  }

  processDefenseRaidSchedule(now);
}

function tick() {
  const now = Date.now();
  const elapsed = Math.min((now - state.lastTick) / 1000, 5);
  addProduction(elapsed);
  state.lastTick = now;
  applyDailyReset(now);
  refreshWorldNodes(now);
  processTimedActions(now);
  render();
}

function applyDailyReset(now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  state.guild.lastResetDate ??= today;
  if (state.guild.lastResetDate === today) {
    return;
  }
  state.guild.lastResetDate = today;
  state.guild.helps = 3 + researchLevel("diplomacy");
  state.guild.rallyReadyAt = 0;
  addInbox("Reset de guilde", "Tes aides de guilde sont rechargees pour la journee.");
}

function formatNumber(value) {
  return Math.floor(value).toLocaleString("fr-FR");
}

function formatTime(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0 ? `${minutes}m ${String(rest).padStart(2, "0")}s` : `${rest}s`;
}

function formatCosts(costs, multiplier = 1) {
  return Object.entries(costs)
    .map(([resource, amount]) => `<span class="pill">${RESOURCE_LABELS[resource]} ${formatNumber(amount * multiplier)}</span>`)
    .join("");
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getBuilding(id) {
  return BUILDINGS.find((building) => building.id === id);
}

function getUnit(id) {
  return UNITS.find((unit) => unit.id === id);
}

function getHero(id) {
  return HEROES.find((hero) => hero.id === id);
}

function heroUnlocked(heroId) {
  return (state.heroUnlocks ?? []).includes(heroId);
}

function getNode(id) {
  return WORLD_NODES.find((node) => node.id === id);
}

function nodeCoords(node) {
  return {
    x: Math.round(320 + (node.x ?? 50) * 4.8),
    y: Math.round(480 + (node.y ?? 50) * 3.9),
  };
}

function nodeTypeLabel(type) {
  return {
    elite: "Monstre",
    resource: "Ressource",
    camp: "Camp ennemi",
  }[type] ?? "Cible";
}

function nodeIcon(node) {
  return {
    elite: node.icon ?? "MO",
    resource: node.icon ?? "RS",
    camp: node.icon ?? "CP",
  }[node.type] ?? node.icon ?? "ND";
}

function nodeDistance(node) {
  const dx = (node.x ?? 50) - 50;
  const dy = (node.y ?? 50) - 52;
  return Math.max(1.2, Math.hypot(dx, dy) / 8);
}

function mapFilterOptions() {
  return [
    { id: "all", label: "Tout", matches: () => true },
    { id: "camp", label: "Chateaux", matches: (node) => node.type === "camp" },
    { id: "resource", label: "Ressources", matches: (node) => node.type === "resource" },
    { id: "elite", label: "Monstres", matches: (node) => node.type === "elite" },
    { id: "safe", label: "Farm", matches: (node) => nodeThreatLevel(node).id !== "high" },
    { id: "bookmarked", label: "Favoris", matches: (node) => state.mapBookmarks.includes(node.id) },
    { id: "scouted", label: "Scout", matches: (node) => Boolean(state.scoutReports[node.id]) },
  ];
}

function nodeMatchesMapFilter(node) {
  return mapFilterOptions().find((option) => option.id === selectedMapFilter)?.matches(node) ?? true;
}

function nodeThreatLevel(node) {
  const ratio = node.power / Math.max(1, battlePowerAgainst(node));
  if (ratio <= 0.72) {
    return { id: "low", label: "Avantage", text: "Cible favorable pour farm rapide." };
  }
  if (ratio <= 1.05) {
    return { id: "mid", label: "Equilibre", text: "Combat jouable avec bonne formation." };
  }
  return { id: "high", label: "Danger", text: "Prepare un rally ou renforce l'armee." };
}

function nodeStrategyText(node) {
  const threat = nodeThreatLevel(node);
  const recommended = recommendedFormationForNode(node);
  if (node.type === "resource") {
    return `${threat.text} Priorite aux bonus de collecte et marches rapides.`;
  }
  if (node.type === "elite") {
    return `${threat.text} Utilise l'aide de guilde et ${recommended.name} contre ${getFormation(node.enemyFormation).name}.`;
  }
  return `${threat.text} Formation conseillee: ${recommended.name}. Verifie les pertes avant d'envoyer tes meilleures troupes.`;
}

function recommendedFormationForNode(node) {
  return FORMATIONS.find((formation) => formation.counter === node.enemyFormation) ?? getFormation();
}

function expectedLossText(node) {
  const ratio = node.power / Math.max(1, battlePowerAgainst(node));
  if (ratio <= 0.72) {
    return "faibles";
  }
  if (ratio <= 1.05) {
    return "moderees";
  }
  return "elevees";
}

function scoutEnemyProfile(node) {
  const formation = getFormation(node.enemyFormation);
  const profiles = {
    shieldwall: { dominant: "Infanterie lourde", weakness: "Mages et siege", trap: "Pieux anti-cavalerie", advice: "Evite la charge frontale. Utilise Cercle arcanique ou Train de siege." },
    volley: { dominant: "Archers en retrait", weakness: "Cavalerie", trap: "Filets de ralentissement", advice: "La Charge cavaliere peut briser la ligne arriere." },
    charge: { dominant: "Cavalerie rapide", weakness: "Infanterie", trap: "Raid de flanc", advice: "Mur de boucliers reduit le choc initial." },
    siege: { dominant: "Machines de siege", weakness: "Cavalerie", trap: "Projectiles lourds", advice: "Frappe vite avec cavalerie avant que le siege s'installe." },
    balanced: { dominant: "Groupe mixte", weakness: "Mages de zone", trap: "Contre-attaque adaptee", advice: "Cercle arcanique punit les groupes denses." },
    arcane: { dominant: "Mages de zone", weakness: "Cavalerie rapide", trap: "Brulure de mana", advice: "Utilise Charge cavaliere et heros assassins." },
  };
  return profiles[formation.id] ?? profiles.balanced;
}

function scoutLootQuality(node) {
  if (node.type === "elite") {
    return "Butin rare possible";
  }
  if (node.type === "resource") {
    return "Butin stable de ressources";
  }
  return node.power >= 500 ? "Butin militaire eleve" : "Butin standard";
}

function toggleMapBookmark(nodeId) {
  if (state.mapBookmarks.includes(nodeId)) {
    state.mapBookmarks = state.mapBookmarks.filter((id) => id !== nodeId);
    showToast("Cible retiree des favoris.");
  } else {
    state.mapBookmarks = [nodeId, ...state.mapBookmarks].slice(0, 8);
    showToast("Cible ajoutee aux favoris.");
  }
  saveGame(false);
  render();
}

function scoutNode(nodeId) {
  const node = getNode(nodeId);
  if (!node) {
    return;
  }
  if (state.resources.energy < 4) {
    showToast("Il faut 4 Energie pour envoyer un eclaireur.");
    return;
  }
  state.resources.energy -= 4;
  const threat = nodeThreatLevel(node);
  const formation = recommendedFormationForNode(node);
  const profile = scoutEnemyProfile(node);
  state.scoutReports[nodeId] = {
    createdAt: Date.now(),
    threat: threat.label,
    formation: formation.name,
    enemyFormation: getFormation(node.enemyFormation).name,
    dominant: profile.dominant,
    weakness: profile.weakness,
    trap: profile.trap,
    advice: profile.advice,
    lootQuality: scoutLootQuality(node),
    losses: expectedLossText(node),
    reward: rewardText(node.reward),
    power: node.power,
  };
  awardEventPoints(25);
  addLog(`Eclaireur revenu de ${node.name}: menace ${threat.label}, pertes ${expectedLossText(node)}.`);
  saveGame(false);
  showToast(`Rapport scout disponible: ${node.name}.`);
  render();
}

function normalizeHeroLineup(lineup = state.heroLineup, limit = 5) {
  const source = Array.isArray(lineup) && lineup.length ? lineup : state.heroLineup;
  return [...new Set(source.filter((heroId) => heroUnlocked(heroId) && getHero(heroId)))].slice(0, limit);
}

function heroNames(lineup = []) {
  const names = normalizeHeroLineup(lineup).map((heroId) => getHero(heroId)?.name).filter(Boolean);
  return names.length ? names.join(", ") : "Aucun heros";
}

function mergeRewards(...rewards) {
  return rewards.reduce((merged, reward) => {
    for (const [resource, amount] of Object.entries(reward ?? {})) {
      merged[resource] = (merged[resource] ?? 0) + Math.ceil(amount ?? 0);
    }
    return merged;
  }, {});
}

function harvestHeroBonus(lineup = state.heroLineup) {
  const heroes = normalizeHeroLineup(lineup);
  const bonus = { yield: 0, speed: 0, rare: 0, safety: 0, labels: [] };
  const add = (heroId, stats, label) => {
    if (!heroes.includes(heroId)) {
      return;
    }
    bonus.yield += stats.yield ?? 0;
    bonus.speed += stats.speed ?? 0;
    bonus.rare += stats.rare ?? 0;
    bonus.safety += stats.safety ?? 0;
    bonus.labels.push(label);
  };

  add("saya", { speed: 0.12, rare: 0.025 }, "Saya: retour astral +12% vitesse");
  add("oren", { yield: 0.08, safety: 0.04 }, "Oren: emballage forge +8% butin");
  add("lyra", { yield: 0.04, rare: 0.04 }, "Lyra: lecture des filons rares");
  add("maelis", { safety: 0.08, yield: 0.03 }, "Maelis: escorte protegee");
  add("kael", { speed: 0.06 }, "Kael: cavalerie de relais");
  add("aurelion", { yield: 0.12, safety: 0.04 }, "Aurelion: tribut solaire +12%");
  add("nyxara", { rare: 0.06 }, "Nyxara: fragments du vide");
  add("draven", { safety: 0.12 }, "Draven: convoi blinde");
  add("seraphine", { yield: 0.07, rare: 0.03 }, "Seraphine: prescience des reserves");
  add("ragnar", { speed: 0.1 }, "Ragnar: marche tempete +10%");
  add("celestia", { speed: 0.08, rare: 0.05 }, "Celestia: routes stellaires");
  add("varkhan", { yield: 0.1 }, "Varkhan: intimidation draconique");
  add("isolde", { safety: 0.08, rare: 0.025 }, "Isolde: conservation du fret");
  add("morvane", { yield: 0.05, rare: 0.05 }, "Morvane: moisson d'ames");

  const premiumCount = heroes.filter((heroId) => getHero(heroId)?.tier === "premium").length;
  const powerScale = Math.min(0.1, heroes.reduce((sum, heroId) => sum + heroPower(heroId), 0) / 60000);
  bonus.yield += premiumCount * 0.015 + powerScale;
  bonus.speed += Math.min(0.05, premiumCount * 0.01);
  bonus.rare += premiumCount * 0.012;
  if (premiumCount > 0) {
    bonus.labels.push(`${premiumCount} premium: aura royale +${Math.round((premiumCount * 0.015 + powerScale) * 100)}% butin`);
  }

  bonus.yield = Math.min(0.55, bonus.yield);
  bonus.speed = Math.min(0.45, bonus.speed);
  bonus.rare = Math.min(0.32, bonus.rare);
  bonus.safety = Math.min(0.35, bonus.safety);
  return bonus;
}

function harvestDurationMs(node, lineup = state.heroLineup) {
  const bonus = harvestHeroBonus(lineup);
  const base = (node.harvestTime ?? 34) * 1000 + marchTravelMs(node) * 0.75;
  return Math.ceil(base * (1 - bonus.speed));
}

function harvestReturnMs(node, lineup = state.heroLineup) {
  const bonus = harvestHeroBonus(lineup);
  return Math.max(3200, Math.ceil(marchTravelMs(node) * 0.55 * (1 - bonus.speed * 0.8)));
}

function projectedHarvestReward(node, lineup = state.heroLineup) {
  const heroBonus = harvestHeroBonus(lineup);
  const yieldBonus = 1 + districtBonus("production") + (state.research.logistics ?? 0) * 0.04 + heroBonus.yield;
  return Object.fromEntries(Object.entries(node.reward).map(([resource, amount]) => [resource, Math.ceil(amount * yieldBonus)]));
}

function harvestRareReward(node, lineup = state.heroLineup) {
  const bonus = harvestHeroBonus(lineup);
  const chance = Math.min(0.42, 0.04 + (node.level ?? 1) * 0.006 + bonus.rare);
  if (Math.random() > chance) {
    return {};
  }
  const level = node.level ?? 1;
  if (node.reward.gems) {
    return { energy: 4 + Math.ceil(level * 0.8), guildCoins: 10 + level * 2 };
  }
  return { gems: 4 + Math.ceil(level * 1.4), guildCoins: 8 + level * 2 };
}

function startHarvestMarch(nodeId, unitSelection = null, lineupSelection = null) {
  const node = getNode(nodeId);
  if (!node || node.type !== "resource") {
    return;
  }

  if (isNodeCleared(nodeId)) {
    showToast("Cette ressource se regenere avant la prochaine recolte.");
    return;
  }

  if (state.marches.length >= 2) {
    showToast("Tes commandants sont deja en marche.");
    return;
  }

  const selectedUnits = clampUnitSnapshot(unitSelection ?? currentUnitSnapshot());
  const lineup = normalizeHeroLineup(lineupSelection);
  const troopsReady = totalUnitsInSnapshot(selectedUnits);
  const troopsNeeded = node.troopsNeeded ?? Math.max(12, (node.level ?? 1) * 5);
  if (troopsReady < troopsNeeded) {
    showToast(`Il faut ${troopsNeeded} troupes dans l'escorte pour recolter ${node.name}.`);
    return;
  }

  const startedAt = Date.now();
  state.marches.push({
    nodeId,
    mode: "harvest",
    startedAt,
    readyAt: startedAt + harvestDurationMs(node, lineup),
    lineup,
    unitsAtStart: selectedUnits,
  });
  addLog(`Marche de recolte envoyee vers ${node.name} avec ${heroNames(lineup)}.`);
  saveGame(false);
  render();
}

function resolveHarvestMarch(march) {
  const node = getNode(march.nodeId);
  if (!node) {
    return;
  }

  const now = Date.now();
  const lineup = normalizeHeroLineup(march.lineup);
  const reward = projectedHarvestReward(node, lineup);
  const returnDuration = harvestReturnMs(node, lineup);
  state.returnMarches ??= [];
  state.returnMarches.push({
    nodeId: node.id,
    mode: "harvest",
    returning: true,
    startedAt: now,
    readyAt: now + returnDuration,
    returnDuration,
    harvestDuration: harvestDurationMs(node, lineup),
    reward,
    lineup,
    unitsAtStart: march.unitsAtStart,
  });
  addLog(`Recolte chargee a ${node.name}. Le convoi rentre vers la citadelle.`);
  showToast(`Convoi de retour: ${node.name} (${formatTime(returnDuration)}).`);
  saveGame(false);
}

function completeHarvestReturn(march) {
  const node = getNode(march.nodeId);
  if (!node) {
    return;
  }

  const lineup = normalizeHeroLineup(march.lineup);
  const rareReward = harvestRareReward(node, lineup);
  const reward = mergeRewards(march.reward ?? projectedHarvestReward(node, lineup), rareReward);
  const bonus = harvestHeroBonus(lineup);
  const escortPower = UNITS.reduce((sum, unit) => sum + ((march.unitsAtStart?.[unit.id] ?? 0) * unit.power), 0);
  addResources(reward);
  state.nodeRespawns[node.id] = Date.now() + nodeRespawnMs(node);
  refreshWorldNodes();
  const report = {
    id: `${Date.now()}-${node.id}-harvest`,
    nodeId: node.id,
    node: node.name,
    level: node.level ?? 1,
    reward,
    rareReward,
    lineup,
    heroNames: heroNames(lineup),
    units: march.unitsAtStart ?? {},
    escortPower,
    bonus: {
      yield: bonus.yield,
      speed: bonus.speed,
      rare: bonus.rare,
      safety: bonus.safety,
      labels: bonus.labels,
    },
    duration: (march.harvestDuration ?? harvestDurationMs(node, lineup)) + (march.returnDuration ?? harvestReturnMs(node, lineup)),
    harvestDuration: march.harvestDuration ?? harvestDurationMs(node, lineup),
    returnDuration: march.returnDuration ?? harvestReturnMs(node, lineup),
    createdAt: Date.now(),
  };
  state.harvestReports = [report, ...(state.harvestReports ?? [])].slice(0, 12);
  awardEventPoints(45 + (node.level ?? 1) * 8);
  addLog(`Convoi revenu de ${node.name}: ${rewardText(reward)}.`);
  showReward(`Convoi revenu: ${node.name} | ${rewardText(reward)}`);
  showRewardBurst(`Convoi revenu: ${node.name}`, reward, report.heroNames, rareReward);
  saveGame(false);
}

function getFormation(id = state.selectedFormation) {
  return FORMATIONS.find((formation) => formation.id === id) ?? FORMATIONS[0];
}

function activeEvent() {
  return eventCycleInfo().event;
}

function eventCycleInfo(now = Date.now()) {
  const events = LIVE_EVENTS.length ? LIVE_EVENTS : [{ id: "default", endsInHours: 24 }];
  const anchor = Date.UTC(2026, 6, 1);
  const durations = events.map((event) => Math.max(1, event.endsInHours ?? 24) * 60 * 60 * 1000);
  const total = durations.reduce((sum, value) => sum + value, 0);
  const elapsed = Math.max(0, now - anchor);
  const cycle = Math.floor(elapsed / total);
  let cursor = elapsed % total;
  for (let index = 0; index < events.length; index += 1) {
    if (cursor < durations[index]) {
      return {
        event: events[index],
        index,
        cycle,
        startedAt: now - cursor,
        endsAt: now + (durations[index] - cursor),
      };
    }
    cursor -= durations[index];
  }
  return { event: events[0], index: 0, cycle, startedAt: now, endsAt: now + durations[0] };
}

function eventProgressKey(eventId) {
  return `${eventId}:${eventCycleInfo().cycle}`;
}

function eventClaimKey(eventId) {
  return `${eventId}:${eventCycleInfo().cycle}`;
}

function eventProgress(eventId) {
  const key = eventProgressKey(eventId);
  return state.eventProgress[key] ?? state.eventProgress[eventId] ?? 0;
}

function nodeRespawnMs(node) {
  if (!node) {
    return 20 * 60 * 1000;
  }
  const base = node.type === "elite" ? 45 : node.type === "resource" ? 18 : 25;
  return base * 60 * 1000;
}

function isNodeCleared(nodeId, now = Date.now()) {
  return (state.nodeRespawns?.[nodeId] ?? 0) > now;
}

function refreshWorldNodes(now = Date.now()) {
  state.nodeRespawns ??= {};
  for (const [nodeId, respawnAt] of Object.entries(state.nodeRespawns)) {
    if (respawnAt <= now) {
      delete state.nodeRespawns[nodeId];
    }
  }
  state.clearedNodes = Object.keys(state.nodeRespawns);
}

async function callBackend(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1600);
  try {
    const baseUrl = cloudConfig.apiBaseUrl || LOCAL_BACKEND_URL;
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function loadCloudConfig() {
  try {
    const response = await fetch("./data/cloud-config.json", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const config = await response.json();
    cloudConfig = {
      ...cloudConfig,
      ...config,
      apiBaseUrl: (config.apiBaseUrl || cloudConfig.apiBaseUrl || LOCAL_BACKEND_URL).replace(/\/$/, ""),
      supabaseUrl: (config.supabaseUrl || "").replace(/\/$/, ""),
      supabaseAnonKey: config.supabaseAnonKey || "",
    };
  } catch {
    cloudConfig = { ...cloudConfig, provider: "local" };
  }
}

function cloudProviderReady() {
  if (cloudConfig.provider === "supabase") {
    return Boolean(cloudConfig.supabaseUrl && cloudConfig.supabaseAnonKey);
  }
  return Boolean(cloudConfig.apiBaseUrl);
}

function supabaseAuthReady() {
  return cloudConfig.provider === "supabase" && cloudProviderReady();
}

function authToken() {
  return supabaseSession?.access_token || "";
}

function saveSupabaseSession(session) {
  supabaseSession = session?.access_token ? session : null;
  if (supabaseSession) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(supabaseSession));
    return;
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function loadStoredSupabaseSession() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
    if (stored?.access_token) {
      supabaseSession = stored;
    }
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function authUser() {
  return supabaseSession?.user ?? null;
}

async function supabaseAuthRequest(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(`${cloudConfig.supabaseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        apikey: cloudConfig.supabaseAnonKey,
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });
    const payload = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error_description || payload?.msg || payload?.message || `Supabase Auth HTTP ${response.status}`);
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshSupabaseSession() {
  if (!supabaseAuthReady() || !supabaseSession?.refresh_token) {
    return false;
  }
  try {
    const payload = await supabaseAuthRequest("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: supabaseSession.refresh_token }),
    });
    if (payload?.access_token) {
      saveSupabaseSession(payload);
      return true;
    }
  } catch {
    saveSupabaseSession(null);
  }
  return false;
}

async function ensureSupabaseSession() {
  if (!supabaseAuthReady()) {
    return false;
  }
  if (!supabaseSession?.access_token) {
    loadStoredSupabaseSession();
  }
  if (!supabaseSession?.access_token) {
    return false;
  }
  const expiresAt = (supabaseSession.expires_at ?? 0) * 1000;
  if (expiresAt && expiresAt - Date.now() < 60000) {
    return refreshSupabaseSession();
  }
  return true;
}

async function supabaseRequest(path, options = {}) {
  const { authenticated = false, ...requestOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const token = authenticated ? authToken() : cloudConfig.supabaseAnonKey;
    const response = await fetch(`${cloudConfig.supabaseUrl}${path}`, {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        apikey: cloudConfig.supabaseAnonKey,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(requestOptions.headers ?? {}),
      },
    });
    if (!response.ok) {
      throw new Error(`Supabase HTTP ${response.status}`);
    }
    if (response.status === 204) {
      return null;
    }
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function mapLeaderboardRows(rows = []) {
  return rows.map((row) => ({
    name: row.name ?? row.player_id ?? "Commandant",
    guild: row.guild?.name?.slice(0, 3).toUpperCase() ?? row.guild_tag ?? "HDH",
    power: row.kingdom_power ?? 0,
  }));
}

function mapChatRows(rows = []) {
  return rows.map((row) => ({
    from: row.from_name ?? "Alliance",
    text: row.message ?? "",
    kind: row.kind ?? "",
    createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
  }));
}

function supabaseEq(value) {
  return encodeURIComponent(String(value ?? ""));
}

function playerDisplayName() {
  return authUser()?.email?.split("@")[0] || state.account?.email?.split("@")[0] || "Commandant";
}

function guildTagFromName(name = "") {
  const letters = String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 3);
  return letters.padEnd(3, "H") || "HDH";
}

function mapGuildRows(rows = []) {
  return rows.map((row) => ({
    id: row.id,
    name: row.name ?? "Alliance",
    tag: row.tag ?? "HDH",
    score: row.score ?? 0,
    power: row.power ?? 0,
    memberCount: row.member_count ?? 0,
    isOpen: row.is_open ?? true,
  }));
}

function mapGuildMembers(rows = []) {
  return rows.map((row) => ({
    userId: row.user_id,
    playerId: row.player_id,
    name: row.name ?? "Commandant",
    rank: ({ leader: "R5", officer: "R4", member: "R3", recruit: "R1" })[row.role] ?? "R1",
    role: row.role ?? "recruit",
    power: row.kingdom_power ?? 0,
    contribution: row.contribution ?? 0,
    status: row.role === "leader" ? "Chef de guilde" : row.role === "officer" ? "Officier" : "Membre actif",
  }));
}

async function syncCloudGuildData() {
  if (!await ensureSupabaseSession()) {
    return null;
  }

  const guildRows = await supabaseRequest("/rest/v1/heliora_guilds?select=id,name,tag,score,power,member_count,is_open&order=power.desc&limit=20", { authenticated: true });
  const guildLeaderboard = mapGuildRows(guildRows);
  state.guild.leaderboard = guildLeaderboard;

  if (!state.guild.id) {
    const ownRows = await supabaseRequest(`/rest/v1/heliora_guild_members?select=guild_id,role,heliora_guilds(id,name,tag,score,power,member_count,is_open)&user_id=eq.${supabaseEq(authUser()?.id)}&limit=1`, { authenticated: true });
    const ownGuild = ownRows?.[0]?.heliora_guilds;
    if (ownGuild?.id) {
      state.guild = {
        ...state.guild,
        id: ownGuild.id,
        name: ownGuild.name,
        tag: ownGuild.tag,
        role: ownRows[0].role ?? "member",
        rank: ({ leader: "R5", officer: "R4", member: "R3", recruit: "R1" })[ownRows[0].role] ?? "R1",
        score: ownGuild.score ?? state.guild.score,
      };
    }
  }

  if (state.guild.id) {
    const memberRows = await supabaseRequest(`/rest/v1/heliora_guild_members?select=user_id,player_id,name,role,kingdom_power,contribution,joined_at&guild_id=eq.${supabaseEq(state.guild.id)}&order=kingdom_power.desc`, { authenticated: true });
    state.guild.cloudMembers = mapGuildMembers(memberRows);
    const inviteRows = await supabaseRequest(`/rest/v1/heliora_guild_invites?select=id,invited_email,status,created_at&guild_id=eq.${supabaseEq(state.guild.id)}&status=eq.pending&order=created_at.desc&limit=6`, { authenticated: true }).catch(() => []);
    state.guild.invites = inviteRows ?? [];
  }

  return state.guild;
}

async function upsertCloudGuildMember(role = state.guild.role || "member") {
  if (!await ensureSupabaseSession()) {
    throw new Error("Connexion joueur requise");
  }
  const user = authUser();
  if (!user?.id || !state.guild.id) {
    throw new Error("Guilde cloud introuvable");
  }
  await supabaseRequest("/rest/v1/heliora_guild_members?on_conflict=guild_id,user_id", {
    method: "POST",
    authenticated: true,
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      guild_id: state.guild.id,
      user_id: user.id,
      player_id: state.playerId,
      name: playerDisplayName(),
      role,
      kingdom_power: kingdomPower(),
      contribution: state.guild.score ?? 0,
    }),
  });
}

async function syncSupabase(payload) {
  if (!await ensureSupabaseSession()) {
    throw new Error("Connexion Supabase requise");
  }
  const user = authUser();
  if (!user?.id) {
    throw new Error("Session Supabase invalide");
  }
  const playerName = payload.state?.guild?.name ? `${payload.state.guild.name} Cmd` : "Commandant";
  const saveState = {
    ...payload.state,
    account: {
      provider: "supabase",
      userId: user.id,
      email: user.email ?? "",
      connectedAt: payload.state?.account?.connectedAt || Date.now(),
    },
  };
  await supabaseRequest("/rest/v1/heliora_players?on_conflict=user_id", {
    method: "POST",
    authenticated: true,
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      user_id: user.id,
      player_id: payload.playerId,
      name: playerName,
      guild_tag: payload.guild?.tag ?? payload.guild?.name?.slice(0, 3).toUpperCase() ?? "HDH",
      guild: payload.guild,
      kingdom_power: payload.kingdomPower,
      resources: payload.resources,
      save_state: saveState,
      save_version: 2,
      synced_at: new Date().toISOString(),
    }),
  });

  const leaderboardRows = await supabaseRequest("/rest/v1/heliora_leaderboard?select=player_id,name,guild_tag,guild,kingdom_power&order=kingdom_power.desc&limit=10", { authenticated: true });
  let chatRows = [];
  try {
    chatRows = await supabaseRequest("/rest/v1/heliora_chat?select=from_name,message,kind,created_at&order=created_at.desc&limit=20", { authenticated: true });
  } catch {
    chatRows = [];
  }
  try {
    if (state.guild.id) {
      await upsertCloudGuildMember();
    }
    await syncCloudGuildData();
  } catch {
    // La sauvegarde joueur reste prioritaire si la couche guilde cloud est indisponible.
  }

  return {
    ok: true,
    syncedAt: Date.now(),
    leaderboard: mapLeaderboardRows(leaderboardRows),
    chat: mapChatRows(chatRows),
  };
}

async function loadSupabaseSave() {
  if (!await ensureSupabaseSession()) {
    return null;
  }
  const rows = await supabaseRequest("/rest/v1/heliora_players?select=save_state,synced_at&limit=1", { authenticated: true });
  const saveState = rows?.[0]?.save_state;
  return saveState ? migrateState(saveState) : null;
}

async function signInSupabase(email, password) {
  const payload = await supabaseAuthRequest("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveSupabaseSession(payload);
  const user = authUser();
  state.account = {
    provider: "supabase",
    userId: user?.id ?? "",
    email: user?.email ?? email,
    connectedAt: Date.now(),
  };
  const cloudState = await loadSupabaseSave();
  if (cloudState) {
    const localPower = kingdomPower(state);
    const cloudPower = kingdomPower(cloudState);
    if (cloudPower >= localPower || confirm("Une sauvegarde cloud existe. Charger cette progression ?")) {
      state = {
        ...cloudState,
        account: state.account,
        backend: { mode: "supabase", cloudSyncAt: Date.now(), status: "Compte Supabase connecte" },
      };
    }
  }
  saveGame(false);
  showReward("Compte joueur connecte.");
  await cloudSync();
}

async function signUpSupabase(email, password) {
  const payload = await supabaseAuthRequest("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (payload?.access_token) {
    saveSupabaseSession(payload);
    const user = authUser();
    state.account = {
      provider: "supabase",
      userId: user?.id ?? "",
      email: user?.email ?? email,
      connectedAt: Date.now(),
    };
    saveGame(false);
    await cloudSync();
    showReward("Compte cree et sauvegarde cloud activee.");
    return;
  }
  showToast("Compte cree. Verifie ton email puis connecte-toi.");
}

async function signOutSupabase() {
  if (supabaseSession?.access_token && supabaseAuthReady()) {
    try {
      await supabaseAuthRequest("/auth/v1/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${supabaseSession.access_token}` },
      });
    } catch {
      // La session locale est nettoyee meme si Supabase ne repond pas.
    }
  }
  saveSupabaseSession(null);
  state.account = { provider: "local", userId: "", email: "", connectedAt: 0 };
  state.backend = { ...state.backend, mode: "local", status: "Session deconnectee, sauvegarde locale active" };
  saveGame(false);
  showToast("Compte deconnecte.");
  render();
}

async function initializeAuthState() {
  if (!supabaseAuthReady()) {
    return;
  }
  loadStoredSupabaseSession();
  if (!supabaseSession?.access_token) {
    return;
  }
  const valid = await ensureSupabaseSession();
  const user = authUser();
  if (!valid || !user?.id) {
    state.account = { provider: "local", userId: "", email: "", connectedAt: 0 };
    saveGame(false);
    return;
  }
  state.account = {
    provider: "supabase",
    userId: user.id,
    email: user.email ?? "",
    connectedAt: state.account?.connectedAt || Date.now(),
  };
  state.backend = {
    ...state.backend,
    mode: "supabase",
    status: "Compte Supabase connecte",
  };
  try {
    await syncCloudGuildData();
  } catch {
    // Le compte reste utilisable meme si la liste des guildes ne charge pas au demarrage.
  }
  saveGame(false);
}

async function loadContentPack() {
  const loaders = [
    async () => {
      if (!cloudProviderReady() || cloudConfig.provider === "supabase") {
        throw new Error("No API content backend");
      }
      return { source: cloudConfig.provider === "cloud-api" ? "cloud-api" : "api", pack: await callBackend("/api/content") };
    },
    async () => {
      const response = await fetch("./data/game-content.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return { source: "local-json", pack: await response.json() };
    },
  ];

  for (const loader of loaders) {
    try {
      const { source, pack } = await loader();
      applyContentPack(pack);
      contentSource = source;
      return;
    } catch {
      contentSource = "defaults";
    }
  }
}

function applyContentPack(pack) {
  if (!pack || typeof pack !== "object") {
    return;
  }
  const premiumHeroes = HEROES.filter((hero) => hero.tier === "premium");
  BUILDINGS = pack.buildings ?? BUILDINGS;
  CITY_LAYOUT = pack.cityLayout ?? CITY_LAYOUT;
  UNITS = pack.units ?? UNITS;
  HEROES = mergeById(pack.heroes ?? HEROES, premiumHeroes);
  WORLD_NODES = pack.worldNodes ?? WORLD_NODES;
  FORMATIONS = pack.formations ?? FORMATIONS;
  RESEARCH = pack.research ?? RESEARCH;
  ARTIFACTS = pack.artifacts ?? ARTIFACTS;
  LIVE_EVENTS = pack.liveEvents ?? LIVE_EVENTS;
  SHOP_ITEMS = pack.shopItems ?? SHOP_ITEMS;
  GUILD_MEMBERS = pack.guildMembers ?? GUILD_MEMBERS;
  LEADERBOARD = pack.leaderboard ?? LEADERBOARD;
}

function mergeById(primary, additions) {
  const merged = [...primary];
  for (const item of additions) {
    const index = merged.findIndex((entry) => entry.id === item.id);
    if (index >= 0) {
      merged[index] = { ...merged[index], ...item };
    } else {
      merged.push(item);
    }
  }
  return merged;
}

function buildingUpgradeCost(building) {
  const level = state.buildings[building.id] ?? 0;
  const multiplier = level === 0 ? 1 : Math.pow(1.68, level);
  return scaleCost(building.cost, multiplier);
}

function scaleCost(cost, multiplier) {
  return Object.fromEntries(Object.entries(cost).map(([resource, amount]) => [resource, Math.ceil(amount * multiplier)]));
}

function researchCost(item, level = researchLevel(item.id)) {
  const lyraDiscount = state.heroLineup?.includes("lyra") ? 0.9 : 1;
  return scaleCost(item.cost, (1 + level * 0.75) * lyraDiscount);
}

function artifactCost(item) {
  const lyraDiscount = state.heroLineup?.includes("lyra") ? 0.9 : 1;
  return scaleCost(item.cost, lyraDiscount);
}

function canAfford(cost) {
  return Object.entries(cost).every(([resource, amount]) => (state.resources[resource] ?? 0) >= amount);
}

function spend(cost) {
  if (!canAfford(cost)) {
    return false;
  }

  for (const [resource, amount] of Object.entries(cost)) {
    state.resources[resource] -= amount;
  }
  return true;
}

function addResources(reward) {
  for (const [resource, amount] of Object.entries(reward)) {
    state.resources[resource] = (state.resources[resource] ?? 0) + amount;
  }
}

function awardEventPoints(amount, eventId = activeEvent().id) {
  const liveopsBonus = 1 + researchLevel("liveops") * 0.06 + districtBonus("scouting") * 0.35;
  const key = eventProgressKey(eventId);
  state.eventProgress[key] = (state.eventProgress[key] ?? 0) + Math.max(0, Math.floor(amount * liveopsBonus));
}

function researchLevel(id) {
  return state.research[id] ?? 0;
}

function districtLevel(id, currentState = state) {
  return currentState.buildings?.[id] ?? 0;
}

function districtBonus(type, currentState = state) {
  return DISTRICT_BONUSES
    .filter((bonus) => bonus.type === type)
    .reduce((sum, bonus) => sum + districtLevel(bonus.buildingId, currentState) * bonus.perLevel, 0);
}

function activeDistrictBonusLabels(currentState = state) {
  return DISTRICT_BONUSES
    .map((bonus) => {
      const level = districtLevel(bonus.buildingId, currentState);
      if (level <= 0) {
        return null;
      }
      const building = getBuilding(bonus.buildingId);
      return `${building?.name ?? bonus.buildingId}: ${bonus.label.replace("/niv.", ` x${level}`)}`;
    })
    .filter(Boolean);
}

function artifactPower() {
  const base = state.artifacts.reduce((sum, id) => sum + (ARTIFACTS.find((artifact) => artifact.id === id)?.power ?? 0), 0);
  return Math.floor(base * (1 + districtBonus("artifact")));
}

function skinPowerBonus() {
  return (state.activeSkins.army ? 0.03 : 0) + (state.activeSkins.route ? 0.02 : 0);
}

function unitTypePower(type, unitSnapshot = state.units, lineup = state.heroLineup) {
  const base = UNITS
    .filter((unit) => unit.type === type)
    .reduce((sum, unit) => sum + unit.power * (unitSnapshot?.[unit.id] ?? 0), 0);
  const engineering = type === "siege" ? researchLevel("engineering") * 0.06 : 0;
  const selectedLineup = normalizeHeroLineup(lineup);
  const kael = type === "cavalry" && selectedLineup.includes("kael") ? 0.12 : 0;
  const oren = type === "siege" && selectedLineup.includes("oren") ? 0.12 : 0;
  return base * (1 + engineering + kael + oren + districtBonus("army"));
}

function troopBreakdown(unitSnapshot = state.units, lineup = state.heroLineup) {
  return {
    infantry: unitTypePower("infantry", unitSnapshot, lineup),
    ranged: unitTypePower("ranged", unitSnapshot, lineup),
    cavalry: unitTypePower("cavalry", unitSnapshot, lineup),
    magic: unitTypePower("magic", unitSnapshot, lineup),
    siege: unitTypePower("siege", unitSnapshot, lineup),
  };
}

function africanPowerCount(lineup = state.heroLineup) {
  return [...new Set((lineup ?? []).filter((heroId) => AFRICAN_POWER_HERO_IDS.includes(heroId)))].length;
}

function africanPowerSetBonus(lineup = state.heroLineup) {
  const count = africanPowerCount(lineup);
  const activeTier = [...AFRICAN_POWER_SET_TIERS].reverse().find((tier) => count >= tier.count) ?? null;
  return {
    count,
    tier: activeTier,
    army: activeTier?.army ?? 0,
    mitigation: activeTier?.mitigation ?? 0,
    xp: activeTier?.xp ?? 0,
  };
}

function formationMultiplier(formationId = state.selectedFormation, enemyFormationId = "balanced", lineup = state.heroLineup) {
  const formation = getFormation(formationId);
  const selectedLineup = normalizeHeroLineup(lineup);
  const doctrine = researchLevel("formations") * 0.04;
  let multiplier = 1 + doctrine + skinPowerBonus();
  if (formation.counter === enemyFormationId) {
    multiplier += 0.18;
  }
  if (formation.weakTo === enemyFormationId) {
    multiplier -= 0.14;
  }
  if (formation.id === "balanced" && selectedLineup.includes("lyra")) {
    multiplier += 0.08;
  }
  multiplier += kingdomTrialBonus("army");
  multiplier += districtBonus("defense") * 0.35;
  multiplier += africanPowerSetBonus(selectedLineup).army;
  return Math.max(0.72, multiplier);
}

function heroSquadPower(lineup = state.heroLineup) {
  const selectedLineup = normalizeHeroLineup(lineup);
  const squad = selectedLineup.reduce((sum, heroId) => sum + heroPower(heroId), 0);
  return Math.floor(squad * 0.58);
}

function battlePowerAgainst(node, unitSnapshot = state.units, rallyOverride = null, lineup = state.heroLineup) {
  const selectedLineup = normalizeHeroLineup(lineup);
  const breakdown = troopBreakdown(unitSnapshot, selectedLineup);
  const formation = getFormation();
  const primary = formation.bonusType === "all" ? 0 : breakdown[formation.bonusType] * 0.12;
  const troops = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const rallyArtifact = state.artifacts.includes("guild_standard") ? 0.09 : 0;
  const rally = rallyOverride === true || (rallyOverride == null && Date.now() < (state.guild.rallyReadyAt ?? 0))
    ? 1.18 + researchLevel("diplomacy") * 0.05 + rallyArtifact + districtBonus("rally")
    : 1;
  return Math.floor((troops + primary + heroSquadPower(selectedLineup) + artifactPower()) * formationMultiplier(formation.id, node.enemyFormation, selectedLineup) * rally);
}

function addInbox(title, body, reward = null) {
  state.inbox = [
    { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, title, body, reward, claimed: !reward },
    ...state.inbox,
  ].slice(0, 12);
}

function claimDailyReward() {
  const today = todayKey();
  if (state.claimedLoginDate === today) {
    showToast("Recompense quotidienne deja reclamee.");
    return;
  }
  const reward = { gold: 240, food: 240, energy: 20, gems: 25 };
  addResources(reward);
  state.claimedLoginDate = today;
  awardEventPoints(60);
  addInbox("Connexion quotidienne", `Recompense recue: ${rewardText(reward)}.`);
  showReward(`Bonus quotidien: ${rewardText(reward)}`);
  render();
}

function claimInboxReward(id) {
  const message = state.inbox.find((item) => item.id === id);
  if (!message || message.claimed || !message.reward) {
    return;
  }
  addResources(message.reward);
  message.claimed = true;
  showReward(`Cadeau recu: ${rewardText(message.reward)}`);
  render();
}

function claimEventReward(eventId) {
  const event = LIVE_EVENTS.find((item) => item.id === eventId);
  const claimKey = eventClaimKey(eventId);
  if (!event || state.claimedEvents.includes(claimKey) || eventProgress(eventId) < event.goal) {
    return;
  }
  addResources(event.reward);
  state.claimedEvents.push(claimKey);
  addInbox(`${event.name} termine`, `Recompense d'evenement: ${rewardText(event.reward)}.`);
  showReward(`Event termine: ${rewardText(event.reward)}`);
  render();
}

function buyShopItem(id) {
  const item = SHOP_ITEMS.find((entry) => entry.id === id);
  if (!item || state.cosmetics.includes(id)) {
    return;
  }
  if (item.price > 0 && !spend({ gems: item.price })) {
    showToast("Pas assez de gemmes.");
    return;
  }
  state.cosmetics.push(id);
  if (item.type === "castle" || item.type === "army" || item.type === "route") {
    state.activeSkins[item.type] = id;
  }
  awardEventPoints(80);
  showReward(`${item.name} debloque.`);
  render();
}

function equipSkin(id) {
  const item = SHOP_ITEMS.find((entry) => entry.id === id);
  if (!item || !state.cosmetics.includes(id) || !(item.type in state.activeSkins)) {
    return;
  }
  state.activeSkins[item.type] = state.activeSkins[item.type] === id ? null : id;
  showToast(state.activeSkins[item.type] ? `${item.name} equipe.` : `${item.name} retire.`);
  render();
}

function redeemRewardCode(rawCode) {
  const code = rawCode.trim().toLowerCase();
  const offer = REWARD_CODES[code];

  if (!code) {
    showToast("Entre un code cadeau.");
    return;
  }

  if (!offer) {
    showToast("Code cadeau invalide.");
    return;
  }

  state.redeemedCodes ??= [];
  if (state.redeemedCodes.includes(code)) {
    showToast("Ce code a deja ete utilise.");
    return;
  }

  addResources(offer.reward);
  state.redeemedCodes.push(code);
  addInbox(offer.label, `Code ${code.toUpperCase()} active: ${rewardText(offer.reward)}.`);
  addLog(`${offer.label} reclame avec le code ${code.toUpperCase()}.`);
  showReward(`${offer.label}: ${rewardText(offer.reward)}`);
  saveGame(false);
  render();
}

function startResearch(id) {
  const item = RESEARCH.find((entry) => entry.id === id);
  const level = researchLevel(id);
  if (!item || level >= item.max) {
    return;
  }
  const cost = researchCost(item, level);
  if (!spend(cost)) {
    showToast("Ressources insuffisantes pour la recherche.");
    return;
  }
  state.research[id] = level + 1;
  awardEventPoints(120);
  addLog(`${item.name} atteint le niveau ${level + 1}.`);
  render();
}

function craftArtifact(id) {
  const item = ARTIFACTS.find((entry) => entry.id === id);
  if (!item || state.artifacts.includes(id)) {
    return;
  }
  const cost = artifactCost(item);
  if (!spend(cost)) {
    showToast("Ressources insuffisantes pour l'artefact.");
    return;
  }
  state.artifacts.push(id);
  awardEventPoints(150);
  showReward(`${item.name} forge.`);
  render();
}

function guildRoleRank(role) {
  return ({ leader: "R5", officer: "R4", member: "R3", recruit: "R1" })[role] ?? "R1";
}

function canManageGuild() {
  return ["leader", "officer"].includes(state.guild.role);
}

async function ensureCloudGuildAction() {
  if (cloudConfig.provider !== "supabase" || !cloudProviderReady()) {
    showToast("Configure Supabase pour activer les guildes reelles.");
    return false;
  }
  if (!await ensureSupabaseSession()) {
    showToast("Connecte ton compte joueur pour utiliser les guildes cloud.");
    return false;
  }
  return true;
}

async function createCloudGuild(event) {
  event.preventDefault();
  if (!await ensureCloudGuildAction()) {
    return;
  }
  const formData = new FormData(event.currentTarget);
  const name = String(formData.get("guildName") || "").trim().slice(0, 42);
  const tag = String(formData.get("guildTag") || guildTagFromName(name)).trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  if (name.length < 3 || tag.length < 2) {
    showToast("Nom de guilde et tag trop courts.");
    return;
  }
  try {
    const user = authUser();
    const rows = await supabaseRequest("/rest/v1/heliora_guilds", {
      method: "POST",
      authenticated: true,
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        owner_user_id: user.id,
        name,
        tag,
        description: "Alliance fondee depuis Heliora Royaumes.",
        power: kingdomPower(),
        score: state.guild.score ?? 0,
        member_count: 1,
        is_open: true,
      }),
    });
    const guild = rows?.[0];
    if (!guild?.id) {
      throw new Error("Creation impossible");
    }
    state.guild = {
      ...state.guild,
      id: guild.id,
      name: guild.name,
      tag: guild.tag,
      role: "leader",
      rank: "R5",
      score: guild.score ?? state.guild.score,
    };
    await upsertCloudGuildMember("leader");
    await syncCloudGuildData();
    saveGame(false);
    showReward(`Guilde ${guild.tag} creee.`);
  } catch (error) {
    showToast(error.message || "Creation de guilde impossible.");
  }
  render();
}

async function joinCloudGuild(guildId) {
  if (!await ensureCloudGuildAction()) {
    return;
  }
  try {
    const rows = await supabaseRequest(`/rest/v1/heliora_guilds?select=id,name,tag,score,is_open&id=eq.${supabaseEq(guildId)}&limit=1`, { authenticated: true });
    const guild = rows?.[0];
    if (!guild?.id || !guild.is_open) {
      showToast("Cette guilde n'accepte pas les entrees libres.");
      return;
    }
    state.guild = {
      ...state.guild,
      id: guild.id,
      name: guild.name,
      tag: guild.tag,
      role: "member",
      rank: "R3",
      score: guild.score ?? state.guild.score,
    };
    await upsertCloudGuildMember("member");
    await syncCloudGuildData();
    await cloudSync();
    showReward(`Tu as rejoint ${guild.name}.`);
  } catch {
    showToast("Impossible de rejoindre cette guilde.");
  }
  render();
}

async function inviteCloudGuildMember(event) {
  event.preventDefault();
  if (!await ensureCloudGuildAction() || !state.guild.id || !canManageGuild()) {
    showToast("Seuls les chefs/officiers peuvent inviter.");
    return;
  }
  const formData = new FormData(event.currentTarget);
  const email = String(formData.get("inviteEmail") || "").trim().toLowerCase();
  if (!email.includes("@")) {
    showToast("Email invalide.");
    return;
  }
  try {
    await supabaseRequest("/rest/v1/heliora_guild_invites", {
      method: "POST",
      authenticated: true,
      body: JSON.stringify({
        guild_id: state.guild.id,
        invited_email: email,
        created_by: authUser().id,
        status: "pending",
      }),
    });
    await syncCloudGuildData();
    showReward("Invitation envoyee.");
  } catch {
    showToast("Invitation impossible pour le moment.");
  }
  render();
}

async function promoteCloudGuildMember(userId) {
  if (!await ensureCloudGuildAction() || state.guild.role !== "leader") {
    showToast("Seul le chef peut promouvoir.");
    return;
  }
  try {
    await supabaseRequest(`/rest/v1/heliora_guild_members?guild_id=eq.${supabaseEq(state.guild.id)}&user_id=eq.${supabaseEq(userId)}`, {
      method: "PATCH",
      authenticated: true,
      body: JSON.stringify({ role: "officer" }),
    });
    await syncCloudGuildData();
    showReward("Membre promu officier.");
  } catch {
    showToast("Promotion impossible.");
  }
  render();
}

async function leaveCloudGuild() {
  if (!await ensureCloudGuildAction() || !state.guild.id) {
    return;
  }
  if (state.guild.role === "leader" && (state.guild.cloudMembers?.length ?? 0) > 1) {
    showToast("Transfere le commandement avant de quitter.");
    return;
  }
  try {
    await supabaseRequest(`/rest/v1/heliora_guild_members?guild_id=eq.${supabaseEq(state.guild.id)}&user_id=eq.${supabaseEq(authUser().id)}`, {
      method: "DELETE",
      authenticated: true,
    });
    state.guild = {
      ...state.guild,
      id: "",
      name: "Sans alliance",
      tag: "SOLO",
      role: "recruit",
      rank: "R1",
      cloudMembers: [],
      invites: [],
    };
    await cloudSync();
    showToast("Tu as quitte la guilde.");
  } catch {
    showToast("Impossible de quitter la guilde.");
  }
  render();
}

async function refreshCloudGuilds() {
  if (!await ensureCloudGuildAction()) {
    return;
  }
  try {
    await syncCloudGuildData();
    await cloudSync();
    showToast("Guildes cloud actualisees.");
  } catch {
    showToast("Actualisation guilde impossible.");
  }
  render();
}

function requestGuildHelp() {
  if (state.guild.helps <= 0) {
    showToast("Aides de guilde epuisees pour le moment.");
    return;
  }
  state.guild.helps -= 1;
  state.guild.score += Math.floor(35 * (1 + districtBonus("rally")));
  awardEventPoints(45, "guild_expedition");
  for (const item of state.training) {
    item.readyAt -= (4000 + researchLevel("diplomacy") * 1500) * (1 + districtBonus("rally"));
  }
  state.chat = [{ from: "Systeme", text: "Les allies accelerent tes timers." }, ...state.chat].slice(0, 8);
  showToast("Aide de guilde recue.");
  render();
}

function prepareRally() {
  state.guild.rallyReadyAt = Date.now() + Math.floor(90000 * (1 + districtBonus("rally") * 0.5));
  state.guild.score += Math.floor(60 * (1 + districtBonus("rally")));
  awardEventPoints(70, "guild_expedition");
  state.chat = [{ from: "Ariane", text: "Rally ouvert pendant 90 secondes. Vise une elite." }, ...state.chat].slice(0, 8);
  showToast("Rally de guilde prepare.");
  render();
}

async function cloudSync() {
  if (cloudConfig.provider === "supabase" && cloudProviderReady() && !await ensureSupabaseSession()) {
    state.backend = {
      mode: "local",
      cloudSyncAt: Date.now(),
      status: "Connexion joueur requise",
    };
    showToast("Connecte ton compte joueur avant la sauvegarde cloud.");
    render();
    return;
  }

  const payload = {
    playerId: state.playerId,
    kingdomPower: kingdomPower(),
    guild: state.guild,
    resources: state.resources,
    state,
  };

  try {
    const result = cloudConfig.provider === "supabase" && cloudProviderReady()
      ? await syncSupabase(payload)
      : await callBackend("/api/sync", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    state.backend = {
      mode: cloudConfig.provider === "supabase" ? "supabase" : "api",
      cloudSyncAt: result.syncedAt ?? Date.now(),
      status: cloudConfig.provider === "supabase" ? "Supabase connecte" : "API connectee",
    };
    if (result.leaderboard) {
      state.leaderboard = result.leaderboard;
    }
    if (result.chat?.length) {
      state.chat = result.chat.slice(0, 8);
    }
    addInbox("Cloud sync", "Sauvegarde envoyee au backend cloud. Classement et chat mis a jour.");
    saveGame(false);
    showReward("Cloud sync reussi.");
  } catch {
    state.backend = {
      mode: "local",
      cloudSyncAt: Date.now(),
      status: cloudConfig.provider === "supabase" ? "Supabase non configure" : "API absente, fallback local",
    };
    addInbox("Cloud sync local", "Backend cloud indisponible. La sauvegarde locale reste active.");
    saveGame(false);
    showToast("Backend cloud absent: sauvegarde locale conservee.");
  }
  render();
}

function buildingCategory(building) {
  return {
    castle: "Citadelle",
    farm: "Production",
    lumber: "Production",
    quarry: "Production",
    barracks: "Militaire",
    academy: "Recherche",
    wall: "Defense",
    market: "Economie",
    hospital: "Soutien",
    forge: "Equipement",
    embassy: "Alliance",
    watchtower: "Defense",
    temple: "Heros",
    vault: "Protection",
    portal: "Epreuves",
  }[building.id] ?? "Batiment";
}

function buildingMaxLevel(building) {
  return building.id === "castle" ? 10 : Math.max(1, state.buildings.castle ?? 1);
}

function buildingUpgradeSeconds(building) {
  const level = state.buildings[building.id] ?? 0;
  const base = building.id === "castle" ? 55 : building.id === "wall" ? 44 : building.production ? 26 : 34;
  return Math.round(base * Math.pow(1.42, level));
}

function buildingEffectText(building, level = state.buildings[building.id] ?? 0) {
  if (level <= 0) {
    return "Aucun effet actif";
  }
  if (building.production) {
    return Object.entries(building.production)
      .map(([resource, amount]) => `${RESOURCE_LABELS[resource]} +${formatNumber(amount * level * 60 * (1 + researchLevel("logistics") * 0.05))}/min`)
      .join(", ");
  }
  if (building.effect) {
    return `${building.effect} - puissance +${formatNumber(level * (building.power ?? 35))}`;
  }
  return `Puissance royaume +${formatNumber(level * (building.power ?? 35))}`;
}

function buildingStatus(building) {
  const level = state.buildings[building.id] ?? 0;
  const cost = buildingUpgradeCost(building);
  const maxLevel = buildingMaxLevel(building);
  const unlocked = building.id === "castle" || level > 0 || (state.buildings.castle ?? 0) >= 1;
  const maxed = level >= maxLevel;
  const affordable = canAfford(cost);
  if (!unlocked) {
    return { id: "locked", label: "Verrouille", canUpgrade: false, reason: "Citadelle requise" };
  }
  if (maxed) {
    return { id: "maxed", label: "Max", canUpgrade: false, reason: "Niveau maximum actuel" };
  }
  if (!affordable) {
    return { id: "insufficient", label: "Ressources", canUpgrade: false, reason: "Ressources insuffisantes" };
  }
  return { id: level === 0 ? "buildable" : "upgradeable", label: level === 0 ? "Construire" : "Ameliorer", canUpgrade: true, reason: "" };
}

function missingCostText(cost) {
  return Object.entries(cost)
    .filter(([resource, amount]) => (state.resources[resource] ?? 0) < amount)
    .map(([resource, amount]) => `${RESOURCE_LABELS[resource]} ${formatNumber(amount - (state.resources[resource] ?? 0))}`)
    .join(", ");
}

function upgradeBuilding(id) {
  const building = getBuilding(id);
  const castleLevel = state.buildings.castle;
  const currentLevel = state.buildings[id] ?? 0;

  if (id !== "castle" && currentLevel >= castleLevel) {
    showToast("Ameliore d'abord la Citadelle.");
    return;
  }

  const cost = buildingUpgradeCost(building);
  if (!spend(cost)) {
    showToast("Ressources insuffisantes.");
    return;
  }

  state.buildings[id] = currentLevel + 1;
  awardEventPoints(90);
  addLog(`${building.name} passe au niveau ${state.buildings[id]}.`);
  render();
}

function trainUnit(unitId, amount) {
  const unit = getUnit(unitId);
  const barracksLevel = state.buildings.barracks ?? 0;
  if (barracksLevel <= 0) {
    showToast("Construis une Caserne pour former des troupes.");
    return;
  }

  const cost = scaleCost(unit.cost, amount);
  if (!spend(cost)) {
    showToast("Ressources insuffisantes pour l'entrainement.");
    return;
  }

  const speedBonus = 1 + barracksLevel * 0.16 + researchLevel("logistics") * 0.04 + kingdomTrialBonus("training") + districtBonus("army") * 0.35;
  const readyAt = Date.now() + (unit.seconds * amount * 1000) / speedBonus;
  state.training.push({ unitId, amount, startedAt: Date.now(), readyAt });
  addLog(`Entrainement lance: ${amount} ${unit.name}.`);
  render();
}

function selectHero(heroId) {
  if (!heroUnlocked(heroId)) {
    showToast("Ce heros se debloque dans les Epreuves du Royaume.");
    return;
  }
  state.activeHero = heroId;
  if (!state.heroLineup.includes(heroId)) {
    state.heroLineup = [heroId, ...state.heroLineup].slice(0, 5);
  }
  showToast(`${getHero(heroId).name} commande l'armee.`);
  render();
}

function toggleHeroLineup(heroId) {
  if (!heroUnlocked(heroId)) {
    showToast("Termine les Epreuves du Royaume pour debloquer ce heros.");
    return;
  }
  if (state.heroLineup.includes(heroId)) {
    if (state.heroLineup.length <= 1) {
      showToast("Garde au moins un heros dans l'escouade.");
      return;
    }
    state.heroLineup = state.heroLineup.filter((id) => id !== heroId);
  } else {
    if (state.heroLineup.length >= 5) {
      showToast("Escouade complete: 5 heros maximum.");
      return;
    }
    state.heroLineup.push(heroId);
  }
  render();
}

function activateAfricanPowerLineup() {
  const available = AFRICAN_POWER_HERO_IDS.filter((heroId) => heroUnlocked(heroId));
  if (available.length < 2) {
    showToast("Il faut au moins 2 heros African Power debloques.");
    return;
  }

  state.heroLineup = available
    .sort((a, b) => heroPower(b) - heroPower(a))
    .slice(0, 5);
  state.activeHero = state.heroLineup.includes("aurelion") ? "aurelion" : state.heroLineup[0];
  const tier = africanPowerSetBonus().tier;
  showToast(`${tier?.label ?? "African Power"} active: ${state.heroLineup.length}/5 heros.`);
  render();
}

function createHeroProgress(heroId) {
  return normalizeHeroProgress(heroId, { level: 1, xp: 0, totalXp: 0, milestones: [] });
}

function normalizeHeroProgress(heroId, progress = {}) {
  let level = Math.min(HERO_LEVEL_CAP, Math.max(1, Math.floor(progress.level ?? 1)));
  let xp = Math.max(0, Math.floor(progress.xp ?? 0));
  while (level < HERO_LEVEL_CAP && xp >= heroXpForNextLevel(level)) {
    xp -= heroXpForNextLevel(level);
    level += 1;
  }
  if (level >= HERO_LEVEL_CAP) {
    xp = 0;
  }
  const computedTotal = heroTotalXpAtLevel(level) + xp;
  return {
    level,
    xp,
    totalXp: Math.max(progress.totalXp ?? 0, computedTotal),
    milestones: progress.milestones ?? heroMilestoneLevels(level),
  };
}

function heroXpForNextLevel(level) {
  return Math.floor(95 * Math.pow(level, 1.58) + level * 42);
}

function heroTotalXpAtLevel(level) {
  let total = 0;
  for (let current = 1; current < level; current += 1) {
    total += heroXpForNextLevel(current);
  }
  return total;
}

function heroMilestoneLevels(level) {
  return Array.from({ length: Math.floor(level / 5) }, (_, index) => (index + 1) * 5);
}

function heroNextMilestone(level) {
  const next = Math.ceil((level + 1) / 5) * 5;
  return next <= HERO_LEVEL_CAP ? next : null;
}

function heroBaseStats(heroId) {
  const hero = getHero(heroId);
  const style = heroCombatStyle(heroId);
  const premiumMultiplier = hero.statMultiplier ?? 1;
  const roleMods = {
    Tank: { damage: 0.82, health: 1.34, mana: 0.88, defense: 1.34 },
    Siege: { damage: 1.18, health: 1.04, mana: 0.96, defense: 1.06 },
    Assassin: { damage: 1.26, health: 0.9, mana: 1.08, defense: 0.88 },
    Cavalerie: { damage: 1.12, health: 1.12, mana: 0.9, defense: 1.04 },
    Mage: { damage: 1.04, health: 0.92, mana: 1.34, defense: 0.94 },
  }[style.role] ?? { damage: 1, health: 1, mana: 1, defense: 1 };

  return {
    damage: Math.floor((58 + hero.basePower * 1.55 + hero.stars * 12) * roleMods.damage * premiumMultiplier),
    health: Math.floor((620 + hero.basePower * 7.8 + hero.stars * 62) * roleMods.health * premiumMultiplier),
    mana: Math.floor((82 + hero.basePower * 0.78 + hero.stars * 12) * roleMods.mana * premiumMultiplier),
    defense: Math.floor((36 + hero.basePower * 0.72 + hero.stars * 8) * roleMods.defense * premiumMultiplier),
  };
}

function heroStatsAtLevel(heroId, level = state.heroes[heroId]?.level ?? 1) {
  const base = heroBaseStats(heroId);
  const milestoneBonus = Math.floor(level / 5);
  const statBoost = 1 + milestoneBonus * 0.045;
  return {
    damage: Math.floor((base.damage + (level - 1) * 13) * statBoost),
    health: Math.floor((base.health + (level - 1) * 82) * statBoost),
    mana: Math.floor((base.mana + (level - 1) * 9) * statBoost),
    defense: Math.floor((base.defense + (level - 1) * 7) * statBoost),
  };
}

function heroLevelReward(level) {
  return { gems: 8 + level * 2, energy: 6 + Math.floor(level / 2), guildCoins: 12 + level };
}

function heroPower(heroId = state.activeHero) {
  const hero = getHero(heroId);
  const progress = state.heroes[heroId] ?? { level: 1, xp: 0 };
  const stats = heroStatsAtLevel(heroId, progress.level);
  const academy = state.buildings.academy ?? 0;
  const artifactBonus = state.artifacts.includes("sun_crown") ? 1.08 : 1;
  return Math.floor((hero.basePower + progress.level * 25 + stats.damage * 0.24 + stats.health * 0.035 + stats.mana * 0.1 + stats.defense * 0.72 + academy * 32) * artifactBonus * (1 + districtBonus("hero")));
}

function defenseHeroLineup() {
  const assigned = (state.defense?.heroes ?? []).filter((heroId) => heroUnlocked(heroId));
  if (assigned.length > 0) {
    return assigned.slice(0, 3);
  }
  return (state.heroLineup ?? []).filter((heroId) => heroUnlocked(heroId)).slice(0, 3);
}

function heroDefensePower(heroId) {
  const hero = getHero(heroId);
  if (!hero) {
    return 0;
  }
  const progress = state.heroes[heroId] ?? { level: 1 };
  const stats = heroStatsAtLevel(heroId, progress.level);
  const roleBonus = {
    Tank: 1.24,
    Support: 1.12,
    Mage: 1.08,
    Ranged: 1.04,
    Siege: 1.1,
    Assassin: 0.96,
    Cavalry: 1,
  }[hero.role] ?? 1;
  const premiumGuard = hero.tier === "premium" ? 1.18 : 1;
  const wallBonus = 1 + (state.buildings.wall ?? 0) * 0.035 + (state.buildings.watchtower ?? 0) * 0.025;
  return Math.floor((heroPower(heroId) * 0.18 + stats.health * 0.045 + stats.defense * 1.35 + stats.mana * 0.12) * roleBonus * premiumGuard * wallBonus);
}

function defenseHeroSetBonus(lineup = defenseHeroLineup()) {
  const africanCount = africanPowerCount(lineup);
  const premiumCount = lineup.filter((heroId) => getHero(heroId)?.tier === "premium").length;
  return 1 + Math.min(0.18, africanCount * 0.035 + premiumCount * 0.025);
}

function defenseHeroPassive(heroId) {
  const hero = getHero(heroId);
  const base = DEFENSE_HERO_PASSIVES[heroId] ?? {
    name: "Garde specialisee",
    defense: hero?.role === "Tank" ? 0.06 : 0.035,
    lossReduction: hero?.role === "Support" ? 0.06 : 0.025,
    reward: hero?.tier === "premium" ? 0.06 : 0.025,
    text: "Apporte un bonus defensif adapte a son role.",
  };
  const level = state.heroes[heroId]?.level ?? 1;
  const heroTier = hero?.tier === "premium" ? 0.15 : 0;
  const scale = 1 + (level - 1) * 0.015 + heroTier;
  return {
    ...base,
    defense: (base.defense ?? 0) * scale,
    lossReduction: (base.lossReduction ?? 0) * scale,
    trapPreservation: (base.trapPreservation ?? 0) * scale,
    reward: (base.reward ?? 0) * scale,
    threatControl: (base.threatControl ?? 0) * scale,
    shieldOnVictory: base.shieldOnVictory ?? 0,
  };
}

function defenseHeroPassiveSummary(lineup = defenseHeroLineup()) {
  const summary = lineup.reduce((total, heroId) => {
    const passive = defenseHeroPassive(heroId);
    total.defense += passive.defense ?? 0;
    total.lossReduction += passive.lossReduction ?? 0;
    total.trapPreservation += passive.trapPreservation ?? 0;
    total.reward += passive.reward ?? 0;
    total.threatControl += passive.threatControl ?? 0;
    total.shieldOnVictory = Math.max(total.shieldOnVictory, passive.shieldOnVictory ?? 0);
    total.labels.push(`${getHero(heroId)?.name ?? "Heros"}: ${passive.name}`);
    return total;
  }, {
    defense: 0,
    lossReduction: 0,
    trapPreservation: 0,
    reward: 0,
    threatControl: 0,
    shieldOnVictory: 0,
    labels: [],
  });
  return {
    defense: Math.min(0.32, summary.defense),
    lossReduction: Math.min(0.35, summary.lossReduction),
    trapPreservation: Math.min(0.45, summary.trapPreservation),
    reward: Math.min(0.4, summary.reward),
    threatControl: Math.min(0.28, summary.threatControl),
    shieldOnVictory: summary.shieldOnVictory,
    labels: summary.labels,
  };
}

function heroCombatStyle(heroId) {
  return {
    maelis: {
      action: "Egide solaire",
      role: "Tank",
      damageType: "sacre",
      target: "ligne ennemie",
      scale: 0.48,
      crit: 0.08,
      armorBreak: 0.02,
      mitigation: 0.16,
      unitMitigation: { infantry: 0.28 },
      text: "Absorbe le choc et contre-attaque.",
    },
    oren: {
      action: "Canon de breche",
      role: "Siege",
      damageType: "perforant",
      target: "remparts",
      scale: 0.74,
      crit: 0.12,
      armorBreak: 0.12,
      mitigation: 0.04,
      unitMitigation: { siege: 0.18 },
      text: "Perce l'armure et ouvre une breche.",
    },
    saya: {
      action: "Frappe astrale",
      role: "Assassin",
      damageType: "precis",
      target: "commandement",
      scale: 0.66,
      crit: 0.28,
      armorBreak: 0.04,
      mitigation: 0.08,
      unitMitigation: { ranged: 0.12 },
      text: "Vise les chefs et evite une partie de la riposte.",
    },
    kael: {
      action: "Percussion royale",
      role: "Cavalerie",
      damageType: "impact",
      target: "flanc",
      scale: 0.7,
      crit: 0.16,
      armorBreak: 0.07,
      mitigation: 0.06,
      unitMitigation: { cavalry: 0.16 },
      text: "Brise le flanc avec une charge lourde.",
    },
    lyra: {
      action: "Convergence",
      role: "Mage",
      damageType: "arcane",
      target: "formation",
      scale: 0.6,
      crit: 0.18,
      armorBreak: 0.06,
      mitigation: 0.1,
      unitMitigation: { ranged: 0.08, siege: 0.08 },
      text: "Synchronise les heros et affaiblit la formation.",
    },
    aurelion: {
      action: "Jugement imperial",
      role: "Mage",
      damageType: "solaire premium",
      target: "armee entiere",
      scale: 1.05,
      crit: 0.32,
      armorBreak: 0.16,
      mitigation: 0.12,
      unitMitigation: { infantry: 0.14, cavalry: 0.12 },
      text: "Irradie le champ de bataille et brise le moral ennemi.",
    },
    nyxara: {
      action: "Eclipse absolue",
      role: "Mage",
      damageType: "vide premium",
      target: "formation",
      scale: 1.12,
      crit: 0.34,
      armorBreak: 0.2,
      mitigation: 0.1,
      unitMitigation: { ranged: 0.16, siege: 0.14 },
      text: "Distord la formation ennemie et aspire le mana.",
    },
    draven: {
      action: "Mur du colosse",
      role: "Tank",
      damageType: "obsidienne premium",
      target: "avant-garde",
      scale: 0.92,
      crit: 0.18,
      armorBreak: 0.1,
      mitigation: 0.28,
      unitMitigation: { infantry: 0.3, cavalry: 0.18, siege: 0.12 },
      text: "Bloque la riposte et transforme la defense en contre-attaque.",
    },
    seraphine: {
      action: "Benediction des astres",
      role: "Mage",
      damageType: "celeste premium",
      target: "escouade alliee",
      scale: 0.96,
      crit: 0.24,
      armorBreak: 0.08,
      mitigation: 0.22,
      unitMitigation: { infantry: 0.12, ranged: 0.12, cavalry: 0.12, siege: 0.12 },
      text: "Renforce les heros et stabilise toute l'escouade.",
    },
    ragnar: {
      action: "Ouragan royal",
      role: "Cavalerie",
      damageType: "tempete premium",
      target: "flanc",
      scale: 1.08,
      crit: 0.36,
      armorBreak: 0.14,
      mitigation: 0.1,
      unitMitigation: { cavalry: 0.28 },
      text: "Traverse les flancs avec une charge foudroyante.",
    },
    celestia: {
      action: "Lame de constellation",
      role: "Assassin",
      damageType: "astral premium",
      target: "commandement",
      scale: 1.16,
      crit: 0.42,
      armorBreak: 0.12,
      mitigation: 0.1,
      unitMitigation: { ranged: 0.18 },
      text: "Execute les chefs ennemis avant la contre-attaque.",
    },
    varkhan: {
      action: "Couronne infernale",
      role: "Cavalerie",
      damageType: "flamme draconique premium",
      target: "armee entiere",
      scale: 1.22,
      crit: 0.38,
      armorBreak: 0.18,
      mitigation: 0.12,
      unitMitigation: { cavalry: 0.18, siege: 0.16 },
      text: "Enflamme la ligne ennemie et force une rupture brutale.",
    },
    isolde: {
      action: "Prison d'aurore",
      role: "Mage",
      damageType: "givre royal premium",
      target: "formation",
      scale: 1.02,
      crit: 0.26,
      armorBreak: 0.08,
      mitigation: 0.26,
      unitMitigation: { infantry: 0.18, ranged: 0.14, cavalry: 0.14 },
      text: "Gele la riposte ennemie et protege l'escouade.",
    },
    morvane: {
      action: "Moisson des ames",
      role: "Mage",
      damageType: "necrotique premium",
      target: "commandement",
      scale: 1.08,
      crit: 0.3,
      armorBreak: 0.16,
      mitigation: 0.2,
      unitMitigation: { infantry: 0.1, siege: 0.2 },
      text: "Draine la force adverse et rend le combat plus stable.",
    },
  }[heroId] ?? {
    action: "Assaut heroique",
    role: "Polyvalent",
    damageType: "physique",
    target: "avant-garde",
    scale: 0.52,
    crit: 0.1,
    armorBreak: 0.03,
    mitigation: 0.04,
    unitMitigation: {},
    text: "Appuie l'assaut principal.",
  };
}

function heroPowerFromMarch(heroId, march) {
  if (march.heroPowersAtStart?.[heroId]) {
    return march.heroPowersAtStart[heroId];
  }
  const hero = getHero(heroId);
  const progress = march.heroLevelsAtStart?.[heroId] ?? state.heroes[heroId]?.level ?? 1;
  const stats = heroStatsFromMarch(heroId, march);
  const academy = state.buildings.academy ?? 0;
  const artifactBonus = state.artifacts.includes("sun_crown") ? 1.08 : 1;
  return Math.floor((hero.basePower + progress * 25 + stats.damage * 0.24 + stats.health * 0.035 + stats.mana * 0.1 + stats.defense * 0.72 + academy * 32) * artifactBonus * (1 + districtBonus("hero")));
}

function heroStatsFromMarch(heroId, march) {
  return march.heroStatsAtStart?.[heroId] ?? heroStatsAtLevel(heroId, march.heroLevelsAtStart?.[heroId] ?? state.heroes[heroId]?.level ?? 1);
}

function heroCombatSequence(march, node) {
  const lineup = (march.lineup?.length ? march.lineup : state.heroLineup).slice(0, 5);
  const hasLyra = lineup.includes("lyra");
  const africanPower = africanPowerSetBonus(lineup);
  const sequence = {
    strikes: [],
    totalDamage: 0,
    armorBreak: 0,
    mitigation: 0,
    unitMitigation: {},
    control: 0,
  };

  for (const heroId of lineup) {
    const hero = getHero(heroId);
    const style = heroCombatStyle(heroId);
    const power = heroPowerFromMarch(heroId, march);
    const stats = heroStatsFromMarch(heroId, march);
    const enemyPressure = node.type === "elite" ? 0.9 : node.type === "resource" ? 1.08 : 1;
    const formationEdge = style.target === "formation" || style.target === "flanc" ? 1.06 : 1;
    const variance = 0.86 + Math.random() * 0.26;
    const critChance = Math.min(0.55, style.crit + stats.mana / 5200 + (hasLyra && heroId !== "lyra" ? 0.04 : 0));
    const critical = Math.random() < critChance;
    const damage = Math.max(1, Math.floor((power * 0.44 + stats.damage * style.scale + stats.mana * 0.18) * variance * enemyPressure * formationEdge * (critical ? 1.45 : 1)));

    sequence.totalDamage += damage;
    sequence.armorBreak += style.armorBreak;
    sequence.mitigation += style.mitigation + stats.defense / 7200;
    sequence.control += critical ? 0.08 : 0.03;
    for (const [type, value] of Object.entries(style.unitMitigation)) {
      sequence.unitMitigation[type] = Math.max(sequence.unitMitigation[type] ?? 0, value);
    }
    sequence.strikes.push({
      hero: hero.name,
      action: style.action,
      role: style.role,
      damageType: style.damageType,
      target: style.target,
      damage,
      critical,
      effect: style.text,
    });
  }

  sequence.armorBreak = Math.min(0.28, sequence.armorBreak);
  sequence.mitigation = Math.min(0.52, sequence.mitigation + (hasLyra ? 0.04 : 0) + africanPower.mitigation);
  sequence.control = Math.min(0.32, sequence.control);
  sequence.africanPowerTier = africanPower.tier?.label ?? "";
  return sequence;
}

function totalUnits(currentState = state) {
  return Object.values(currentState.units).reduce((sum, value) => sum + value, 0);
}

function totalUnitsInSnapshot(unitSnapshot = state.units) {
  return Object.values(unitSnapshot ?? {}).reduce((sum, value) => sum + Math.max(0, value ?? 0), 0);
}

function currentUnitSnapshot() {
  return Object.fromEntries(UNITS.map((unit) => [unit.id, state.units[unit.id] ?? 0]));
}

function clampUnitSnapshot(unitSnapshot = {}) {
  return Object.fromEntries(UNITS.map((unit) => {
    const owned = state.units[unit.id] ?? 0;
    return [unit.id, Math.min(owned, Math.max(0, Math.floor(unitSnapshot[unit.id] ?? 0)))];
  }));
}

function armyPower() {
  const node = getNode(selectedNode) ?? WORLD_NODES[0];
  return battlePowerAgainst(node);
}

function kingdomPower(currentState = state) {
  const buildingPower = BUILDINGS.reduce((sum, building) => {
    const level = currentState.buildings[building.id] ?? 0;
    return sum + level * (building.power ?? 35);
  }, 0);
  const unitPower = UNITS.reduce((sum, unit) => sum + unit.power * (currentState.units[unit.id] ?? 0), 0);
  const heroTotal = HEROES.reduce((sum, hero) => {
    const progress = currentState.heroes[hero.id] ?? { level: 1 };
    const stats = heroStatsAtLevel(hero.id, progress.level ?? 1);
    return sum + Math.floor(hero.basePower + (progress.level ?? 1) * 25 + stats.damage * 0.24 + stats.health * 0.035 + stats.mana * 0.1 + stats.defense * 0.72);
  }, 0);
  const trialPower = kingdomTrialBonus("power", currentState);
  const districtPower = Math.floor((buildingPower + unitPower + heroTotal) * (districtBonus("army", currentState) + districtBonus("hero", currentState) * 0.45 + districtBonus("defense", currentState) * 0.35));
  return Math.floor(buildingPower + unitPower + heroTotal + artifactPower() + trialPower + districtPower + Object.values(currentState.research ?? {}).reduce((sum, level) => sum + level * 55, 0));
}

function woundedTotal() {
  return Object.values(state.defense?.woundedUnits ?? {}).reduce((sum, value) => sum + (value ?? 0), 0);
}

function hospitalCapacity() {
  return Math.floor((state.buildings.hospital ?? 0) * 120 + (state.buildings.castle ?? 1) * 35);
}

function trapCount(trapId) {
  return state.defense?.traps?.[trapId] ?? 0;
}

function trapLevel(trapId) {
  return Math.min(TRAP_MAX_LEVEL, Math.max(1, Math.floor(state.defense?.trapLevels?.[trapId] ?? 1)));
}

function trapRarity(level) {
  return [...TRAP_RARITIES].reverse().find((rarity) => level >= rarity.min) ?? TRAP_RARITIES[0];
}

function trapUnitPower(trap) {
  const level = trapLevel(trap.id);
  const rarity = trapRarity(level);
  const levelBonus = 1 + (level - 1) * 0.12;
  return Math.floor(trap.power * levelBonus * rarity.multiplier);
}

function trapUpgradeCost(trap) {
  const level = trapLevel(trap.id);
  const forgeDiscount = 1 - Math.min(0.18, (state.buildings.forge ?? 0) * 0.03);
  const multiplier = (1.35 + level * 0.72) * forgeDiscount;
  return scaleCost(trap.cost, multiplier);
}

function totalTrapCount() {
  return DEFENSE_TRAPS.reduce((sum, trap) => sum + trapCount(trap.id), 0);
}

function trapCapacity() {
  const wall = state.buildings.wall ?? 0;
  const tower = state.buildings.watchtower ?? 0;
  const castle = state.buildings.castle ?? 1;
  return Math.floor(4 + castle * 3 + wall * 8 + tower * 5);
}

function trapBuildCost(trap, amount = 1) {
  const pressure = 1 + Math.floor(totalTrapCount() / 10) * 0.08;
  return scaleCost(trap.cost, amount * pressure);
}

function trapPower() {
  const wall = state.buildings.wall ?? 0;
  const tower = state.buildings.watchtower ?? 0;
  const forge = state.buildings.forge ?? 0;
  const builtTraps = DEFENSE_TRAPS.reduce((sum, trap) => sum + trapCount(trap.id) * trapUnitPower(trap), 0);
  const trapBonus = 1 + wall * 0.035 + tower * 0.025 + forge * 0.02;
  return Math.floor(wall * 75 + tower * 58 + forge * 28 + builtTraps * trapBonus);
}

function protectedResourceCapacity() {
  const vault = state.buildings.vault ?? 0;
  const castle = state.buildings.castle ?? 1;
  return Math.floor(240 + vault * 520 + castle * 130);
}

function citadelDefensePower() {
  const wall = (state.buildings.wall ?? 0) * 165;
  const tower = (state.buildings.watchtower ?? 0) * 115;
  const hospital = (state.buildings.hospital ?? 0) * 54;
  const garrison = UNITS.reduce((sum, unit) => sum + (state.units[unit.id] ?? 0) * unit.power * 0.72, 0);
  const wallHeroes = defenseHeroLineup();
  const heroes = wallHeroes.reduce((sum, heroId) => sum + heroDefensePower(heroId), 0) * defenseHeroSetBonus(wallHeroes);
  const passives = defenseHeroPassiveSummary(wallHeroes);
  const district = 1 + districtBonus("defense") + districtBonus("lossReduction") * 0.55;
  return Math.floor((wall + tower + hospital + garrison + heroes + trapPower()) * district * (1 + passives.defense));
}

function enemyRaidProfile() {
  const castle = state.buildings.castle ?? 1;
  const threatLevel = state.defense?.threatLevel ?? 1;
  const pressure = 0.72 + Math.random() * 0.72 + threatLevel * 0.06;
  const archetypes = [
    { name: "Raid de cavalerie", formation: "charge", note: "Cavalerie rapide et pillage court." },
    { name: "Siege de maraudeurs", formation: "siege", note: "Beliers legers contre remparts." },
    { name: "Cercle de mages noirs", formation: "arcane", note: "Degats de zone contre garnison dense." },
    { name: "Bande d'archers mercenaires", formation: "volley", note: "Tir a distance contre front lent." },
  ];
  const profile = archetypes[Math.floor(Math.random() * archetypes.length)];
  return {
    ...profile,
    power: Math.floor((420 + castle * 220 + kingdomPower() * 0.1) * pressure),
  };
}

function nextDefenseRaidDelay(now = Date.now()) {
  const castle = state.buildings.castle ?? 1;
  const wall = state.buildings.wall ?? 0;
  const shieldActive = now < (state.defense?.shieldUntil ?? 0);
  const base = shieldActive ? 11 * 60 * 1000 : 8 * 60 * 1000;
  const pressure = Math.max(0, castle - 1) * 45 * 1000;
  const fortification = wall * 25 * 1000 + researchLevel("engineering") * 20 * 1000 + researchLevel("formations") * 12 * 1000;
  const jitter = Math.floor(Math.random() * 4 * 60 * 1000);
  return Math.max(3 * 60 * 1000, base + jitter - pressure + fortification);
}

function scheduleNextCitadelRaid(now = Date.now(), options = {}) {
  state.defense ??= {};
  const delay = options.delayMs ?? nextDefenseRaidDelay(now);
  state.defense.nextRaidAt = now + delay;
}

function processDefenseRaidSchedule(now = Date.now()) {
  state.defense ??= {};
  state.defense.nextRaidAt ??= now + nextDefenseRaidDelay(now);
  state.defense.threatLevel ??= 1;
  if (state.defense.nextRaidAt > now) {
    return;
  }
  simulateCitadelAttack({ automated: true, now });
}

function accelerateCitadelRaid() {
  const now = Date.now();
  state.defense ??= {};
  state.defense.nextRaidAt = now + 15 * 1000;
  state.defense.threatLevel = Math.min(5, (state.defense.threatLevel ?? 1) + 1);
  addLog("Les eclaireurs signalent une attaque imminente sur la citadelle.");
  showToast("Alerte avancee: raid ennemi dans 15 secondes.");
  saveGame(false);
  render();
}

function buildDefenseTrap(trapId, amount = 1) {
  const trap = DEFENSE_TRAPS.find((item) => item.id === trapId);
  if (!trap) {
    return;
  }
  state.defense ??= {};
  state.defense.traps ??= Object.fromEntries(DEFENSE_TRAPS.map((item) => [item.id, 0]));
  const capacityLeft = trapCapacity() - totalTrapCount();
  const buildAmount = Math.min(amount, Math.max(0, capacityLeft));
  if (buildAmount <= 0) {
    showToast("Capacite de pieges atteinte. Ameliore Remparts ou Tour de guet.");
    return;
  }
  const cost = trapBuildCost(trap, buildAmount);
  if (!spend(cost)) {
    showToast(`Pieges impossibles: manque ${missingCostText(cost)}.`);
    return;
  }
  state.defense.traps[trap.id] = trapCount(trap.id) + buildAmount;
  addLog(`${buildAmount} ${trap.name} installes sur les remparts.`);
  showToast(`${trap.name}: +${formatNumber(trapUnitPower(trap) * buildAmount)} defense brute.`);
  saveGame(false);
  render();
}

function upgradeDefenseTrap(trapId) {
  const trap = DEFENSE_TRAPS.find((item) => item.id === trapId);
  if (!trap) {
    return;
  }
  state.defense ??= {};
  state.defense.trapLevels ??= Object.fromEntries(DEFENSE_TRAPS.map((item) => [item.id, 1]));
  const currentLevel = trapLevel(trapId);
  if (trapCount(trapId) <= 0) {
    showToast("Construis au moins un piege avant de l'ameliorer.");
    return;
  }
  if (currentLevel >= TRAP_MAX_LEVEL) {
    showToast(`${trap.name} est deja au niveau maximum.`);
    return;
  }
  const cost = trapUpgradeCost(trap);
  if (!spend(cost)) {
    showToast(`Amelioration impossible: manque ${missingCostText(cost)}.`);
    return;
  }
  state.defense.trapLevels[trap.id] = currentLevel + 1;
  const rarity = trapRarity(currentLevel + 1);
  awardEventPoints(35 + currentLevel * 10);
  addLog(`${trap.name} ameliorees au niveau ${currentLevel + 1} (${rarity.label}).`);
  showReward(`${trap.name} niv. ${currentLevel + 1} - ${rarity.label}`);
  saveGame(false);
  render();
}

function toggleDefenseHero(heroId) {
  if (!heroUnlocked(heroId)) {
    showToast("Ce heros n'est pas encore disponible pour la garnison.");
    return;
  }
  state.defense ??= {};
  state.defense.heroes = defenseHeroLineup();
  if (state.defense.heroes.includes(heroId)) {
    if (state.defense.heroes.length <= 1) {
      showToast("Garde au moins un heros sur les remparts.");
      return;
    }
    state.defense.heroes = state.defense.heroes.filter((id) => id !== heroId);
  } else {
    if (state.defense.heroes.length >= 3) {
      showToast("Garnison complete: 3 heros maximum.");
      return;
    }
    state.defense.heroes.push(heroId);
  }
  addLog(`Garnison ajustee: ${state.defense.heroes.map((id) => getHero(id)?.name).filter(Boolean).join(", ")}.`);
  saveGame(false);
  render();
}

function damageDefenseTraps(losses, victory, passiveSummary = defenseHeroPassiveSummary()) {
  if (losses <= 0 || totalTrapCount() <= 0) {
    return 0;
  }
  let toDestroy = Math.min(totalTrapCount(), Math.max(1, Math.floor(losses * (victory ? 0.08 : 0.16) * (1 - passiveSummary.trapPreservation))));
  let destroyed = 0;
  for (const trap of [...DEFENSE_TRAPS].reverse()) {
    if (toDestroy <= 0) {
      break;
    }
    const count = trapCount(trap.id);
    const removed = Math.min(count, toDestroy);
    if (removed > 0) {
      state.defense.traps[trap.id] = count - removed;
      destroyed += removed;
      toDestroy -= removed;
    }
  }
  return destroyed;
}

function defenseVictoryReward(raid, effectiveDefense) {
  const threatLevel = state.defense?.threatLevel ?? 1;
  const wallHeroes = defenseHeroLineup();
  const passives = defenseHeroPassiveSummary(wallHeroes);
  const heroBonus = Math.min(0.32, wallHeroes.length * 0.05 + africanPowerCount(wallHeroes) * 0.035);
  const trapBonus = Math.min(0.24, totalTrapCount() * 0.012);
  const guardScore = Math.max(raid.power, effectiveDefense) / 1000;
  const multiplier = 1 + threatLevel * 0.08 + heroBonus + trapBonus + passives.reward;
  const reward = {
    gold: Math.floor((120 + guardScore * 46) * multiplier),
    food: Math.floor((95 + guardScore * 34) * multiplier),
    guildCoins: Math.floor((18 + threatLevel * 7 + wallHeroes.length * 4) * multiplier),
    energy: Math.floor(4 + threatLevel * 2 + Math.min(8, totalTrapCount() * 0.35)),
  };
  if (threatLevel >= 3 || effectiveDefense > raid.power * 1.35) {
    reward.gems = Math.floor(6 + threatLevel * 2 + africanPowerCount(wallHeroes) * 2);
  }
  return reward;
}

function simulateCitadelAttack(options = {}) {
  const now = options.now ?? Date.now();
  state.defense ??= {};
  state.defense.woundedUnits ??= Object.fromEntries(UNITS.map((unit) => [unit.id, 0]));
  if (now < (state.defense?.shieldUntil ?? 0)) {
    const raid = enemyRaidProfile();
    const report = {
      id: `def-${now}`,
      victory: true,
      blocked: true,
      enemy: raid.name,
      enemyPower: raid.power,
      defensePower: citadelDefensePower(),
      wounded: 0,
      permanentLosses: 0,
      destroyedTraps: 0,
      pillaged: {},
      reward: {},
      advice: "Bouclier actif: aucune perte, aucun pillage.",
      createdAt: now,
    };
    state.defenseReports = [report, ...(state.defenseReports ?? [])].slice(0, 4);
    state.defense.threatLevel = Math.max(1, (state.defense.threatLevel ?? 1) - 1);
    scheduleNextCitadelRaid(now);
    addLog(`Attaque bloquee par le bouclier: ${raid.name}.`);
    showToast("Bouclier actif: raid ennemi bloque.");
    saveGame(false);
    render();
    return;
  }

  const raid = enemyRaidProfile();
  const defensePassives = defenseHeroPassiveSummary();
  const defensePower = citadelDefensePower();
  const roll = 0.92 + Math.random() * 0.18;
  const effectiveDefense = defensePower * roll;
  const victory = effectiveDefense >= raid.power;
  const pressure = raid.power / Math.max(1, effectiveDefense);
  const lossRate = Math.min(0.28, Math.max(0.015, victory ? 0.035 + pressure * 0.035 : 0.09 + pressure * 0.08));
  const passiveLossRate = Math.max(0.006, lossRate * (1 - defensePassives.lossReduction));
  const totalAvailable = totalUnits();
  const totalLosses = Math.min(totalAvailable, Math.floor(totalAvailable * passiveLossRate));
  const capacityLeft = Math.max(0, hospitalCapacity() - woundedTotal());
  const wounded = Math.min(capacityLeft, Math.floor(totalLosses * (victory ? 0.78 : 0.62)));
  const permanentLosses = Math.max(0, totalLosses - wounded);

  if (totalLosses > 0) {
    const removedByUnit = {};
    let remainingLosses = totalLosses;
    for (const unit of UNITS) {
      if (remainingLosses <= 0) {
        break;
      }
      const available = state.units[unit.id] ?? 0;
      const removed = Math.min(available, remainingLosses);
      if (removed > 0) {
        state.units[unit.id] = available - removed;
        removedByUnit[unit.id] = removed;
        remainingLosses -= removed;
      }
    }

    let remainingWounded = wounded;
    for (const [unitId, removed] of Object.entries(removedByUnit)) {
      if (remainingWounded <= 0) {
        break;
      }
      const unitWounded = Math.min(removed, remainingWounded);
      state.defense.woundedUnits[unitId] = (state.defense.woundedUnits[unitId] ?? 0) + unitWounded;
      remainingWounded -= unitWounded;
    }
  }

  const pillaged = {};
  if (!victory) {
    const protection = protectedResourceCapacity();
    for (const resource of ["gold", "food", "wood", "stone"]) {
      const available = Math.max(0, (state.resources[resource] ?? 0) - protection * 0.25);
      const taken = Math.floor(Math.min(available, raid.power * 0.035));
      if (taken > 0) {
        state.resources[resource] -= taken;
        pillaged[resource] = taken;
      }
    }
    state.defense.shieldUntil = now + 8 * 60 * 1000;
  }

  const destroyedTraps = damageDefenseTraps(Math.max(totalLosses, Math.floor(raid.power / 900)), victory, defensePassives);
  const reward = victory ? defenseVictoryReward(raid, effectiveDefense) : {};
  if (victory) {
    addResources(reward);
    addInbox("Defense victorieuse", `La garnison a repousse ${raid.name}. Recompense: ${rewardText(reward)}.`);
    if (defensePassives.shieldOnVictory > 0) {
      state.defense.shieldUntil = Math.max(state.defense.shieldUntil ?? 0, now + defensePassives.shieldOnVictory * 1000);
    }
  }
  const advice = victory
    ? `Defense tenue. Recompense obtenue: ${rewardText(reward)}. Passifs actifs: ${defensePassives.labels.join(", ")}.`
    : "Defense percee. Le bouclier temporaire est active: soigne les blesses et renforce les remparts.";
  const report = {
    id: `def-${now}`,
    victory,
    blocked: false,
    enemy: raid.name,
    enemyFormation: getFormation(raid.formation).name,
    enemyNote: raid.note,
    enemyPower: raid.power,
    defensePower: Math.floor(effectiveDefense),
    wounded,
    permanentLosses,
    destroyedTraps,
    pillaged,
    reward,
    passives: {
      labels: defensePassives.labels,
      defense: defensePassives.defense,
      lossReduction: defensePassives.lossReduction,
      trapPreservation: defensePassives.trapPreservation,
      reward: defensePassives.reward,
      threatControl: defensePassives.threatControl,
      shieldOnVictory: defensePassives.shieldOnVictory,
    },
    advice,
    createdAt: now,
  };

  state.defenseReports = [report, ...(state.defenseReports ?? [])].slice(0, 4);
  state.defense.threatLevel = victory
    ? Math.max(1, (state.defense.threatLevel ?? 1) - 1 - Math.floor(defensePassives.threatControl * 4))
    : Math.min(5, (state.defense.threatLevel ?? 1) + 1);
  scheduleNextCitadelRaid(now);
  awardEventPoints(victory ? 60 : 25);
  addLog(`${victory ? "Defense victorieuse" : "Defense percee"} contre ${raid.name}.`);
  if (victory) {
    showReward(`Defense victorieuse: ${rewardText(reward)}`);
  } else {
    showToast("Defense percee: bouclier temporaire active.");
  }
  saveGame(false);
  render();
}

function activateDefenseShield() {
  if (Date.now() < (state.defense?.shieldUntil ?? 0)) {
    showToast("Bouclier deja actif.");
    return;
  }
  const cost = { gems: 35 };
  if (!spend(cost)) {
    showToast("Il faut 35 gemmes pour activer le bouclier.");
    return;
  }
  state.defense ??= {};
  state.defense.shieldUntil = Date.now() + 30 * 60 * 1000;
  addLog("Bouclier de citadelle active pour 30 minutes.");
  saveGame(false);
  render();
}

function healWoundedUnits() {
  const wounded = woundedTotal();
  if (wounded <= 0) {
    showToast("Aucun blesse a soigner.");
    return;
  }
  const cost = { food: wounded * 3, gold: wounded * 2 };
  if (!spend(cost)) {
    showToast(`Soins impossibles: manque ${missingCostText(cost)}.`);
    return;
  }
  const woundedByUnit = { ...(state.defense?.woundedUnits ?? {}) };
  for (const [unitId, amount] of Object.entries(woundedByUnit)) {
    if (amount > 0) {
      state.units[unitId] = (state.units[unitId] ?? 0) + amount;
    }
  }
  state.defense.woundedUnits = Object.fromEntries(UNITS.map((unit) => [unit.id, 0]));
  addLog(`${formatNumber(wounded)} troupes soignees a l'Hopital.`);
  saveGame(false);
  render();
}

function runDefenseDrill() {
  const now = Date.now();
  if (now < (state.defense?.drillReadyAt ?? 0)) {
    showToast(`Exercice disponible dans ${formatTime(state.defense.drillReadyAt - now)}.`);
    return;
  }
  if ((state.resources.energy ?? 0) < 6) {
    showToast("Il faut 6 Energie pour lancer un exercice defensif.");
    return;
  }
  state.resources.energy -= 6;
  state.defense.drillReadyAt = now + 90 * 1000;
  const simulatedWounded = Math.min(hospitalCapacity(), Math.max(3, Math.floor(totalUnits() * 0.03)));
  if (simulatedWounded > 0) {
    const firstUnit = UNITS.find((unit) => (state.units[unit.id] ?? 0) > 0);
    if (firstUnit) {
      state.defense.woundedUnits[firstUnit.id] = (state.defense.woundedUnits[firstUnit.id] ?? 0) + simulatedWounded;
    }
  }
  awardEventPoints(45);
  addLog(`Exercice defensif termine: ${formatNumber(citadelDefensePower())} puissance defensive.`);
  showToast("Exercice defensif termine. Rapport de garnison mis a jour.");
  saveGame(false);
  render();
}

function kingdomTrialBonus(type, currentState = state) {
  const bonuses = currentState.kingdomTrial?.bonuses ?? [];
  return bonuses.reduce((sum, bonusId) => {
    const trial = KINGDOM_TRIALS.find((item) => item.id === bonusId);
    return sum + (trial?.bonus?.type === type ? trial.bonus.value : 0);
  }, 0);
}

function currentKingdomTrial() {
  const completed = state.kingdomTrial?.completed ?? [];
  return KINGDOM_TRIALS.find((trial) => !completed.includes(trial.id)) ?? KINGDOM_TRIALS[KINGDOM_TRIALS.length - 1];
}

function kingdomTrialCombatPower() {
  const unitPower = UNITS.reduce((sum, unit) => sum + unit.power * (state.units[unit.id] ?? 0), 0);
  const castle = (state.buildings.castle ?? 1) * 70;
  const doctrine = Object.values(state.research ?? {}).reduce((sum, level) => sum + level * 30, 0);
  return Math.floor((heroSquadPower() + unitPower + castle + artifactPower() + doctrine) * (1 + kingdomTrialBonus("army") + districtBonus("trial") + africanPowerSetBonus().army));
}

function completeKingdomTrial(trialId) {
  const trial = KINGDOM_TRIALS.find((item) => item.id === trialId);
  if (!trial || state.kingdomTrial.completed.includes(trial.id)) {
    return;
  }
  state.kingdomTrial.completed.push(trial.id);
  state.kingdomTrial.bonuses.push(trial.id);
  state.kingdomTrial.level = Math.min(KINGDOM_TRIALS.length + 1, trial.level + 1);
  addResources(trial.reward);
  awardHeroXp((45 + trial.power * 0.08) * (1 + districtBonus("trial") * 0.4), state.heroLineup);

  if (trial.unlockHero && !heroUnlocked(trial.unlockHero)) {
    state.heroUnlocks.push(trial.unlockHero);
    state.heroes[trial.unlockHero] = normalizeHeroProgress(trial.unlockHero, state.heroes[trial.unlockHero]);
    const hero = getHero(trial.unlockHero);
    addInbox(`Nouveau heros: ${hero.name}`, `${hero.name}, ${hero.title}, rejoint ton royaume via ${trial.name}.`);
  }

  awardEventPoints(120 + trial.level * 40);
  addInbox(`${trial.name} terminee`, `Bonus permanent: ${trial.bonus.label}. Recompense: ${rewardText(trial.reward)}.`);
  addLog(`Epreuve de Royaume terminee: ${trial.name}.`);
  showReward(`${trial.name}: ${trial.bonus.label}`);
  saveGame(false);
}

function fightKingdomTrial(trialId) {
  const trial = KINGDOM_TRIALS.find((item) => item.id === trialId);
  if (!trial) {
    return;
  }
  if (state.kingdomTrial.completed.includes(trial.id)) {
    showToast("Cette epreuve est deja terminee.");
    return;
  }
  if (currentKingdomTrial().id !== trial.id) {
    showToast("Termine d'abord l'epreuve precedente.");
    return;
  }
  if ((state.resources.energy ?? 0) < trial.energy) {
    showToast(`Il faut ${trial.energy} Energie.`);
    return;
  }
  const power = kingdomTrialCombatPower();
  if (power < trial.power) {
    showToast(`Puissance insuffisante: ${formatNumber(power)} / ${formatNumber(trial.power)}.`);
    return;
  }

  state.resources.energy -= trial.energy;
  completeKingdomTrial(trial.id);
  render();
}

function marchSpeedMultiplier() {
  return (state.activeHero === "saya" ? 0.72 : 1)
    * (state.activeSkins.route ? 0.95 : 1)
    * (state.artifacts.includes("moon_chart") ? 0.9 : 1)
    * (1 - Math.min(0.35, districtBonus("marchSpeed")));
}

function marchTravelMs(node) {
  return Math.max(4500, (7000 + node.power * 12) * marchSpeedMultiplier());
}

function estimateLossRate(node, unitSnapshot = state.units, rally = false, lineup = state.heroLineup) {
  const attackPower = Math.max(1, battlePowerAgainst(node, unitSnapshot, rally, lineup));
  const pressure = node.power / Math.max(attackPower, 1);
  const baseLossRate = attackPower >= node.power ? 0.045 + pressure * 0.05 : 0.13 + pressure * 0.1;
  const districtMitigation = Math.min(0.48, districtBonus("lossReduction") + districtBonus("defense") * 0.55);
  const africanPower = africanPowerSetBonus(lineup);
  return Math.max(0.015, baseLossRate * (1 - districtMitigation) * (1 - africanPower.mitigation));
}

function openAttackPreparation(nodeId, rally = false) {
  const node = getNode(nodeId);
  if (!node) {
    return;
  }
  attackPrep = {
    nodeId,
    mode: "attack",
    rally,
    units: clampUnitSnapshot(currentUnitSnapshot()),
    lineup: normalizeHeroLineup(state.heroLineup),
  };
  renderNodeDetails();
}

function openHarvestPreparation(nodeId) {
  const node = getNode(nodeId);
  if (!node || node.type !== "resource") {
    return;
  }
  attackPrep = {
    nodeId,
    mode: "harvest",
    rally: false,
    units: clampUnitSnapshot(currentUnitSnapshot()),
    lineup: normalizeHeroLineup(state.heroLineup),
  };
  renderNodeDetails();
}

function optimizeHarvestEscort(nodeId) {
  if (!attackPrep || attackPrep.mode !== "harvest") {
    return;
  }
  const node = getNode(nodeId);
  if (!node) {
    return;
  }
  let remaining = node.troopsNeeded ?? Math.max(12, (node.level ?? 1) * 5);
  const nextUnits = Object.fromEntries(UNITS.map((unit) => [unit.id, 0]));
  const priority = ["rider", "guard", "archer", "mage", "ram"];
  for (const unitId of priority) {
    const owned = state.units[unitId] ?? 0;
    const amount = Math.min(owned, remaining);
    nextUnits[unitId] = amount;
    remaining -= amount;
    if (remaining <= 0) {
      break;
    }
  }
  attackPrep.units = clampUnitSnapshot(nextUnits);
  renderNodeDetails();
}

function updatePreparedUnit(unitId, action) {
  if (!attackPrep) {
    return;
  }
  const unit = getUnit(unitId);
  const owned = state.units[unitId] ?? 0;
  const current = attackPrep.units[unitId] ?? 0;
  const step = action === "max" ? owned : Math.max(1, Math.min(20, Math.ceil(Math.max(owned, 1) * 0.1)));
  const next = action === "max" ? owned : action === "clear" ? 0 : action === "plus" ? current + step : current - step;
  attackPrep.units = clampUnitSnapshot({ ...attackPrep.units, [unit.id]: next });
  renderNodeDetails();
}

function applyPreparedFormation(formationId) {
  state.selectedFormation = formationId;
  renderNodeDetails();
}

function togglePreparedHero(heroId) {
  if (!attackPrep) {
    return;
  }
  if (!heroUnlocked(heroId)) {
    showToast("Ce heros n'est pas encore disponible.");
    return;
  }
  const lineup = normalizeHeroLineup(attackPrep.lineup);
  if (lineup.includes(heroId)) {
    if (lineup.length <= 1) {
      showToast("Garde au moins un heros dans la marche.");
      return;
    }
    attackPrep.lineup = lineup.filter((id) => id !== heroId);
  } else {
    if (lineup.length >= 5) {
      showToast("5 heros maximum dans une marche.");
      return;
    }
    attackPrep.lineup = [...lineup, heroId];
  }
  renderNodeDetails();
}

function activatePreparedAfricanPowerLineup() {
  if (!attackPrep) {
    activateAfricanPowerLineup();
    return;
  }
  const available = AFRICAN_POWER_HERO_IDS
    .filter((heroId) => heroUnlocked(heroId))
    .sort((a, b) => heroPower(b) - heroPower(a))
    .slice(0, 5);
  if (available.length < 2) {
    showToast("Il faut au moins 2 heros African Power debloques.");
    return;
  }
  attackPrep.lineup = available;
  showToast(`Escouade premium prete: ${available.length}/5 heros.`);
  renderNodeDetails();
}

function closeAttackPreparation() {
  attackPrep = null;
  renderNodeDetails();
}

function confirmPreparedAttack() {
  if (!attackPrep) {
    return;
  }
  const { nodeId, rally, units, lineup } = attackPrep;
  attackPrep = null;
  if (getNode(nodeId)?.type === "resource") {
    startHarvestMarch(nodeId, units, lineup);
    return;
  }
  startMarch(nodeId, rally, units, lineup);
}

function startMarch(nodeId, rally = false, unitSelection = null, lineupSelection = null) {
  const node = getNode(nodeId);
  if (isNodeCleared(nodeId)) {
    showToast("Cette zone se reconstitue avant le prochain combat.");
    return;
  }

  if (state.marches.length >= 2) {
    showToast("Tes commandants sont deja en marche.");
    return;
  }

  if (state.resources.energy < 10) {
    showToast("Il faut 10 Energie pour lancer une expedition.");
    return;
  }

  const selectedUnits = clampUnitSnapshot(unitSelection ?? currentUnitSnapshot());
  const lineup = normalizeHeroLineup(lineupSelection);

  if (totalUnitsInSnapshot(selectedUnits) <= 0) {
    showToast("Forme des troupes avant d'attaquer.");
    return;
  }

  state.resources.energy -= 10;
  const travelMs = marchTravelMs(node);
  const startedAt = Date.now();
  state.marches.push({
    nodeId,
    powerAtStart: battlePowerAgainst(node, selectedUnits, rally, lineup),
    formation: state.selectedFormation,
    lineup,
    heroLevelsAtStart: Object.fromEntries(lineup.map((heroId) => [heroId, state.heroes[heroId]?.level ?? 1])),
    heroPowersAtStart: Object.fromEntries(lineup.map((heroId) => [heroId, heroPower(heroId)])),
    heroStatsAtStart: Object.fromEntries(lineup.map((heroId) => [heroId, heroStatsAtLevel(heroId)])),
    unitsAtStart: selectedUnits,
    rally,
    startedAt,
    readyAt: startedAt + travelMs,
  });
  addLog(`${rally ? "Rally" : "Expedition"} lance vers ${node.name}.`);
  render();
}

function resolveMarch(march) {
  const node = getNode(march.nodeId);
  if (march.mode === "harvest") {
    resolveHarvestMarch(march);
    return;
  }
  const attackPower = Math.max(1, march.powerAtStart ?? battlePowerAgainst(node));
  const formation = getFormation(march.formation ?? state.selectedFormation);
  const heroTactics = heroCombatSequence(march, node);
  const roll = 0.9 + Math.random() * 0.22;
  const skillPower = heroTactics.totalDamage * (1 + heroTactics.armorBreak) + node.power * heroTactics.control * 0.18;
  const effectiveAttack = attackPower * roll + skillPower;
  const victory = effectiveAttack >= node.power;
  const pressure = node.power / Math.max(effectiveAttack, 1);
  const baseLossRate = victory ? 0.045 + pressure * 0.05 : 0.13 + pressure * 0.1;
  const districtMitigation = Math.min(0.48, districtBonus("lossReduction") + districtBonus("defense") * 0.55);
  const lossRate = Math.max(0.015, baseLossRate * (1 - heroTactics.mitigation) * (1 - districtMitigation));
  const losses = applyLosses(lossRate, march.lineup ?? state.heroLineup, march.unitsAtStart, heroTactics);
  const xpGained = combatXpReward(node, victory, effectiveAttack);
  const xpUpdates = awardHeroXp(xpGained, march.lineup ?? state.heroLineup);
  const recommendations = battleRecommendations(node, formation, victory, losses, march);

  const report = {
    id: `${Date.now()}-${node.id}`,
    node: node.name,
    victory,
    formation: formation.name,
    enemyFormation: getFormation(node.enemyFormation).name,
    attackPower: Math.floor(effectiveAttack),
    rawPower: Math.floor(attackPower * roll),
    skillPower: Math.floor(skillPower),
    enemyPower: node.power,
    losses,
    heroStrikes: heroTactics.strikes,
    armorBreak: heroTactics.armorBreak,
    mitigation: heroTactics.mitigation,
    africanPowerTier: heroTactics.africanPowerTier,
    recommendations,
    xpGained,
    xpUpdates,
    createdAt: Date.now(),
  };
  state.battleReports = [report, ...state.battleReports].slice(0, 5);

  if (!victory) {
    addLog(`Defaite a ${node.name}. Les survivants reviennent avec des lecons cheres.`);
    awardEventPoints(25);
    showToast(`Defaite contre ${node.name}.`);
    saveGame(false);
    return;
  }

  const reward = { ...node.reward };
  if ((march.lineup ?? state.heroLineup).includes("oren")) {
    reward.stone = Math.ceil((reward.stone ?? 0) * 1.18);
    reward.wood = Math.ceil((reward.wood ?? 0) * 1.18);
  }
  const lootBonus = districtBonus("loot");
  if (lootBonus > 0) {
    for (const resource of Object.keys(reward)) {
      reward[resource] = Math.ceil(reward[resource] * (1 + lootBonus));
    }
  }
  addResources(reward);
  state.nodeRespawns[node.id] = Date.now() + nodeRespawnMs(node);
  refreshWorldNodes();
  state.victories += 1;
  awardEventPoints(110 + Math.floor(node.power / 10));
  awardEventPoints(80, "guild_expedition");
  addLog(`Victoire a ${node.name}. Butin: ${rewardText(reward)}.`);
  showReward(`Victoire: ${node.name} | ${rewardText(reward)}`);
  saveGame(false);
}

function applyLosses(rate, lineup = state.heroLineup, unitSnapshot = null, tactics = {}) {
  const losses = {};
  for (const unit of UNITS) {
    const count = state.units[unit.id] ?? 0;
    const sourceCount = unitSnapshot?.[unit.id] ?? count;
    const guardReduction = lineup.includes("maelis") && unit.type === "infantry" ? 0.75 : 1;
    const tacticalReduction = 1 - Math.min(0.45, tactics.unitMitigation?.[unit.type] ?? 0);
    const lost = Math.min(count, Math.floor(sourceCount * rate * guardReduction * tacticalReduction));
    state.units[unit.id] = count - lost;
    losses[unit.id] = lost;
  }
  return losses;
}

function combatXpReward(node, victory, effectiveAttack) {
  const difficultyRatio = node.power / Math.max(1, effectiveAttack);
  const typeBonus = node.type === "elite" ? 1.45 : node.type === "resource" ? 0.88 : 1;
  const difficultyBonus = Math.min(1.85, Math.max(0.75, difficultyRatio + 0.45));
  const outcome = victory ? 1 : 0.46;
  return Math.max(10, Math.floor((36 + node.power * 0.16) * typeBonus * difficultyBonus * outcome));
}

function battleRecommendations(node, formation, victory, losses = {}, march = {}) {
  const recommendations = [];
  const recommended = recommendedFormationForNode(node);
  const scout = state.scoutReports[node.id];
  const sent = march.unitsAtStart ?? state.units;
  const totalSent = Object.values(sent).reduce((sum, value) => sum + value, 0);
  const totalLost = Object.values(losses).reduce((sum, value) => sum + value, 0);
  const lossRatio = totalSent > 0 ? totalLost / totalSent : 0;
  const lineup = march.lineup ?? state.heroLineup;
  const africanPower = africanPowerSetBonus(lineup);

  if (formation.id !== recommended.id) {
    recommendations.push(`Essaie ${recommended.name}: cette formation repond mieux a ${getFormation(node.enemyFormation).name}.`);
  }
  if (recommended.bonusType === "magic" && (sent.mage ?? 0) <= 0) {
    recommendations.push("Forme des Mages d'obsidienne pour profiter du Cercle arcanique contre les groupes denses.");
  }
  if (recommended.bonusType === "siege" && (sent.ram ?? 0) <= 0) {
    recommendations.push("Ajoute des Beliers runiques avant de viser une cible defensive ou une ligne fortifiee.");
  }
  if (scout?.trap && !victory) {
    recommendations.push(`Scout: attention au piege "${scout.trap}". ${scout.advice ?? ""}`.trim());
  }
  if (lossRatio > 0.12 && (state.buildings.hospital ?? 0) <= 0) {
    recommendations.push("Construis l'Hopital pour convertir une partie des pertes en blesses recuperables.");
  }
  if (!victory) {
    recommendations.push("Renforce l'escouade ou lance un rally avant de retenter cette cible.");
  }
  if (africanPower.count >= 3 && africanPower.count < 5) {
    recommendations.push(`Set African Power ${africanPower.count}/5: ajoute un heros du set pour atteindre le palier suivant.`);
  }
  if (!recommendations.length) {
    recommendations.push("Composition stable: continue a monter les niveaux de heros et les recherches de formation.");
  }

  return recommendations.slice(0, 3);
}

function awardHeroXp(amount, heroIds = [state.activeHero]) {
  const recipients = [...new Set(heroIds.filter((heroId) => getHero(heroId)))];
  const africanPower = africanPowerSetBonus(recipients);
  const updates = [];

  for (const heroId of recipients) {
    const hero = getHero(heroId);
    const progress = normalizeHeroProgress(heroId, state.heroes[heroId]);
    const gain = Math.max(1, Math.floor(amount * (heroId === state.activeHero ? 1.1 : 1) * (1 + kingdomTrialBonus("xp") + districtBonus("xp") + africanPower.xp)));
    const oldLevel = progress.level;
    progress.xp += gain;
    progress.totalXp += gain;

    while (progress.level < HERO_LEVEL_CAP && progress.xp >= heroXpForNextLevel(progress.level)) {
      progress.xp -= heroXpForNextLevel(progress.level);
      progress.level += 1;
    }

    const unlockedMilestones = [];
    for (const level of heroMilestoneLevels(progress.level)) {
      if (level > oldLevel && !progress.milestones.includes(level)) {
        progress.milestones.push(level);
        unlockedMilestones.push(level);
        const reward = heroLevelReward(level);
        addResources(reward);
        addInbox(`${hero.name} niveau ${level}`, `Palier hero debloque: stats +4,5% et recompense speciale recue (${rewardText(reward)}).`);
      }
    }

    state.heroes[heroId] = progress;
    if (progress.level > oldLevel) {
      addLog(`${hero.name} atteint le niveau ${progress.level}.`);
    }
    updates.push({ heroId, hero: hero.name, xp: gain, oldLevel, level: progress.level, milestones: unlockedMilestones });
  }

  return updates;
}

function rewardText(reward) {
  return Object.entries(reward)
    .map(([resource, amount]) => `${RESOURCE_LABELS[resource]} ${formatNumber(amount)}`)
    .join(", ");
}

function claimQuest(questId) {
  const quest = QUESTS.find((item) => item.id === questId);
  if (!quest.done(state) || state.claimedQuests.includes(questId)) {
    return;
  }

  addResources(quest.reward);
  state.claimedQuests.push(questId);
  addLog(`Objectif accompli: ${quest.title}.`);
  render();
}

function addLog(message) {
  state.log = [message, ...state.log].slice(0, 10);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2200);
}

function showReward(message) {
  showToast(message);
  document.body.classList.add("reward-flash");
  setTimeout(() => document.body.classList.remove("reward-flash"), 700);
}

function updateInstallButton() {
  if (!elements.installAppBtn) {
    return;
  }
  const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches || navigator.standalone;
  elements.installAppBtn.hidden = standalone || !deferredInstallPrompt;
}

async function installApp() {
  if (!deferredInstallPrompt) {
    showToast("Installation disponible depuis le menu du navigateur.");
    return;
  }
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  updateInstallButton();
  showToast(choice.outcome === "accepted" ? "Installation lancee." : "Installation annulee.");
}

function setupPwaInstall() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      state.backend.status = "PWA hors ligne indisponible";
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButton();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallButton();
    showReward("Heliora installe sur l'appareil.");
  });

  elements.installAppBtn?.addEventListener("click", installApp);
  updateInstallButton();
}

function showRewardBurst(title, reward = {}, heroes = "", rareReward = {}) {
  if (!elements.rewardBurst) {
    return;
  }
  const rareText = Object.keys(rareReward ?? {}).length ? rewardText(rareReward) : "";
  elements.rewardBurst.innerHTML = `
    <article class="reward-burst-card">
      <span class="reward-burst-glow"></span>
      <div>
        <small>Retour du convoi</small>
        <strong>${title}</strong>
        <p>${rewardText(reward)}</p>
        ${rareText ? `<em>Bonus rare: ${rareText}</em>` : ""}
        <span>${heroes}</span>
      </div>
    </article>
  `;
  elements.rewardBurst.classList.add("show");
  clearTimeout(rewardBurstTimer);
  rewardBurstTimer = setTimeout(() => {
    elements.rewardBurst.classList.remove("show");
  }, 3200);
}

function render() {
  renderTopHud();
  renderAuthPanel();
  renderNavigation();
  renderLiveOpsBar();
  renderOnboarding();
  renderResources();
  renderCity();
  drawKingdomScene();
  renderBuildingDetails();
  renderCitadelOverview();
  renderKingdomTrialPanel();
  renderQuickActions();
  renderArmy();
  renderWorld();
  renderAlliance();
  renderEvents();
  renderShop();
  renderQuests();
  renderReports();
}

function renderLiveOpsBar() {
  const cycle = eventCycleInfo();
  const event = cycle.event;
  const progress = eventProgress(event.id);
  const percent = Math.min(100, (progress / event.goal) * 100);
  const backendLabel = {
    api: "API cloud",
    supabase: "Supabase",
    local: "localStorage",
  }[state.backend.mode] ?? state.backend.mode;
  elements.liveOpsBar.innerHTML = `
    <article class="live-card">
      <div>
        <span class="eyebrow">${event.tag}</span>
        <strong>${event.name}</strong>
        <p>${event.description}</p>
        <p>Fin de rotation: ${formatTime(cycle.endsAt - Date.now())}</p>
        <p>Backend: ${backendLabel} - ${state.backend.status}</p>
        <p>Contenu: ${contentSource}</p>
      </div>
      <div class="live-progress">
        <span>${formatNumber(progress)} / ${formatNumber(event.goal)} pts</span>
        <div class="progress"><span style="--progress: ${percent}%"></span></div>
      </div>
      <button class="mini-button" type="button" data-jump="events">Voir</button>
    </article>
  `;
  elements.liveOpsBar.querySelector("[data-jump]")?.addEventListener("click", () => switchView("events"));
}

function renderAuthPanel() {
  if (!elements.authPanel) {
    return;
  }

  if (cloudConfig.provider !== "supabase") {
    elements.authPanel.innerHTML = `
      <article class="auth-card local">
        <div>
          <span class="eyebrow">Compte joueur</span>
          <strong>Sauvegarde locale active</strong>
          <p>Renseigne Supabase dans data/cloud-config.json pour activer les comptes cloud securises.</p>
        </div>
        <span class="auth-status">Local</span>
      </article>
    `;
    return;
  }

  if (!cloudProviderReady()) {
    elements.authPanel.innerHTML = `
      <article class="auth-card warning">
        <div>
          <span class="eyebrow">Supabase Auth</span>
          <strong>Configuration manquante</strong>
          <p>Ajoute Project URL et anon public key dans data/cloud-config.json.</p>
        </div>
        <span class="auth-status">A configurer</span>
      </article>
    `;
    return;
  }

  const user = authUser();
  if (user?.id) {
    elements.authPanel.innerHTML = `
      <article class="auth-card connected">
        <div>
          <span class="eyebrow">Compte joueur</span>
          <strong>${escapeHtml(user.email ?? state.account.email ?? "Joueur connecte")}</strong>
          <p>Sauvegarde cloud protegee par RLS. ID joueur: ${escapeHtml(String(user.id).slice(0, 8))}...</p>
        </div>
        <div class="auth-actions">
          <button class="mini-button" type="button" data-auth-sync>Sauvegarder cloud</button>
          <button class="mini-button" type="button" data-auth-load>Charger cloud</button>
          <button class="mini-button" type="button" data-auth-logout>Deconnexion</button>
        </div>
      </article>
    `;
    elements.authPanel.querySelector("[data-auth-sync]")?.addEventListener("click", cloudSync);
    elements.authPanel.querySelector("[data-auth-load]")?.addEventListener("click", restoreCloudSave);
    elements.authPanel.querySelector("[data-auth-logout]")?.addEventListener("click", signOutSupabase);
    return;
  }

  elements.authPanel.innerHTML = `
    <article class="auth-card">
      <div>
        <span class="eyebrow">Compte joueur</span>
        <strong>Connexion cloud securisee</strong>
        <p>Connecte-toi pour sauvegarder la progression, les heros, ressources et futurs classements.</p>
      </div>
      <form class="auth-form" data-auth-form>
        <input type="email" name="email" autocomplete="email" placeholder="Email joueur" required />
        <input type="password" name="password" autocomplete="current-password" placeholder="Mot de passe" minlength="6" required />
        <button class="mini-button" type="submit" data-auth-mode="signin">Connexion</button>
        <button class="mini-button" type="submit" data-auth-mode="signup">Creer</button>
      </form>
    </article>
  `;
  elements.authPanel.querySelector("[data-auth-form]")?.addEventListener("submit", handleAuthSubmit);
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const submitter = event.submitter;
  const formData = new FormData(event.currentTarget);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || password.length < 6) {
    showToast("Email et mot de passe de 6 caracteres minimum.");
    return;
  }

  try {
    if (submitter?.dataset.authMode === "signup") {
      await signUpSupabase(email, password);
    } else {
      await signInSupabase(email, password);
    }
  } catch (error) {
    showToast(error.message || "Connexion impossible pour le moment.");
  } finally {
    render();
  }
}

async function restoreCloudSave() {
  try {
    const cloudState = await loadSupabaseSave();
    if (!cloudState) {
      showToast("Aucune sauvegarde cloud trouvee.");
      return;
    }
    state = {
      ...cloudState,
      account: {
        provider: "supabase",
        userId: authUser()?.id ?? "",
        email: authUser()?.email ?? "",
        connectedAt: Date.now(),
      },
      backend: { mode: "supabase", cloudSyncAt: Date.now(), status: "Sauvegarde cloud chargee" },
    };
    saveGame(false);
    showReward("Sauvegarde cloud chargee.");
    render();
  } catch {
    showToast("Impossible de charger la sauvegarde cloud.");
  }
}

function renderOnboarding() {
  if (state.onboardingStep >= ONBOARDING_STEPS.length) {
    elements.onboarding.innerHTML = "";
    elements.onboarding.classList.remove("show");
    return;
  }
  elements.onboarding.classList.add("show");
  elements.onboarding.innerHTML = `
    <article class="onboarding-card">
      <span class="eyebrow">Guide</span>
      <p>${ONBOARDING_STEPS[state.onboardingStep]}</p>
      <div class="onboarding-actions">
        <button class="mini-button" type="button" data-next-guide>Suivant</button>
        <button class="mini-button" type="button" data-skip-guide>Masquer</button>
      </div>
    </article>
  `;
  elements.onboarding.querySelector("[data-next-guide]").addEventListener("click", () => {
    state.onboardingStep += 1;
    render();
  });
  elements.onboarding.querySelector("[data-skip-guide]").addEventListener("click", () => {
    state.onboardingStep = ONBOARDING_STEPS.length;
    render();
  });
}

function renderTopHud() {
  if (!elements.kingdomSummary) {
    return;
  }
  const castleLevel = state.buildings.castle ?? 1;
  const readyQuests = QUESTS.filter((quest) => quest.done(state) && !state.claimedQuests.includes(quest.id)).length;
  elements.kingdomSummary.innerHTML = `
    <span>Citadelle ${castleLevel}</span>
    <span>Epreuve ${Math.min(state.kingdomTrial?.level ?? 1, KINGDOM_TRIALS.length)}</span>
    <span>Puissance ${formatNumber(kingdomPower())}</span>
    <span>Energie ${formatNumber(state.resources.energy ?? 0)}</span>
    <span>${readyQuests} recompense${readyQuests > 1 ? "s" : ""}</span>
  `;
}

function renderNavigation() {
  const navMeta = {
    kingdom: { icon: "CT", label: "Royaume", badge: BUILDINGS.filter((building) => buildingStatus(building).canUpgrade).length },
    army: { icon: "AR", label: "Armee", badge: state.training.length },
    world: { icon: "MP", label: "Carte", badge: state.marches.length },
    alliance: { icon: "AL", label: "Alliance", badge: state.guild.helps },
    events: { icon: "EV", label: "Events", badge: LIVE_EVENTS.filter((event) => eventProgress(event.id) >= event.goal && !state.claimedEvents.includes(eventClaimKey(event.id))).length },
    shop: { icon: "BT", label: "Boutique", badge: SHOP_ITEMS.filter((item) => item.price === 0 && !state.cosmetics.includes(item.id)).length },
    quests: { icon: "Q", label: "Quetes", badge: QUESTS.filter((quest) => quest.done(state) && !state.claimedQuests.includes(quest.id)).length },
    reports: { icon: "RP", label: "Rapports", badge: Math.min(9, (state.battleReports?.length ?? 0) + (state.defenseReports?.length ?? 0) + Object.keys(state.scoutReports ?? {}).length) },
  };
  elements.tabs.forEach((tab) => {
    const meta = navMeta[tab.dataset.view] ?? { icon: "", label: tab.dataset.view, badge: 0 };
    tab.innerHTML = `<span class="tab-icon">${meta.icon}</span><span>${meta.label}</span>${meta.badge > 0 ? `<strong>${meta.badge}</strong>` : ""}`;
  });
}

function renderResources() {
  const prod = productionPerMinute();
  elements.resources.innerHTML = Object.entries(RESOURCE_LABELS)
    .map(([key, label]) => {
      const modifier = prod[key] ? `+${formatNumber(prod[key])}/min` : "stock";
      const important = ["gold", "food", "stone", "wood", "energy"].includes(key);
      return `
        <article class="resource ${important ? "core" : "secondary"}" data-resource="${key}">
          <span class="resource-mark">${RESOURCE_MARKS[key]}</span>
          <span class="resource-copy">
            <span>${label}</span>
            <strong>${formatNumber(state.resources[key] ?? 0)}</strong>
            <span>${modifier}</span>
          </span>
        </article>
      `;
    })
    .join("");
}

function productionPerMinute() {
  const totals = {};
  const productionBonus = 1 + (state.research.logistics ?? 0) * 0.05 + (state.activeSkins.castle ? 0.04 : 0) + kingdomTrialBonus("production") + districtBonus("production");
  for (const building of BUILDINGS) {
    const level = state.buildings[building.id] ?? 0;
    if (!building.production || level <= 0) {
      continue;
    }

    for (const [resource, amount] of Object.entries(building.production)) {
      totals[resource] = (totals[resource] ?? 0) + amount * level * 60 * productionBonus;
    }
  }
  return totals;
}

function renderCity() {
  elements.cityGrid.innerHTML = BUILDINGS.map((building) => {
    const level = state.buildings[building.id] ?? 0;
    const status = buildingStatus(building);
    const label = level > 0 ? `Niv. ${level}` : "A construire";
    return `
      <button class="building status-${status.id} ${selectedBuilding === building.id ? "active" : ""} ${level === 0 ? "locked" : ""}" style="--building-color: ${building.color}" type="button" data-building="${building.id}" data-level="${level}">
        <span class="building-art" aria-hidden="true"><span>${building.mark}</span></span>
        <span class="building-status">${status.label}</span>
        <span class="building-copy">
          <span class="building-title">${building.name}</span>
          <span class="building-meta">${buildingCategory(building)} - ${label}</span>
          <span class="building-effect">${buildingEffectText(building, level)}</span>
        </span>
      </button>
    `;
  }).join("");

  elements.cityGrid.querySelectorAll("[data-building]").forEach((button) => {
    button.addEventListener("click", () => {
      selectBuilding(button.dataset.building);
    });
  });

  renderCitadelCompartments();
  renderCitadelInspector();
}

function selectBuilding(id, announce = false) {
  const building = getBuilding(id);
  if (!building) {
    return;
  }

  selectedBuilding = building.id;
  render();
  if (announce) {
    const level = state.buildings[building.id] ?? 0;
    showToast(`${building.name} selectionne - ${level > 0 ? `niveau ${level}` : "a construire"}.`);
  }
}

function renderCitadelCompartments() {
  if (!elements.citadelCompartments) {
    return;
  }

  elements.citadelCompartments.innerHTML = CITADEL_COMPARTMENTS.map((compartment) => {
    const building = getBuilding(compartment.buildingId);
    if (!building) {
      return "";
    }
    const level = state.buildings[building.id] ?? 0;
    const status = buildingStatus(building);
    const active = selectedBuilding === building.id;
    return `
      <button class="citadel-node tone-${compartment.tone} status-${status.id} ${active ? "active" : ""}" type="button" data-citadel-building="${building.id}" style="--x: ${compartment.x}; --y: ${compartment.y}; --building-color: ${building.color}" title="${building.name} - ${building.role}">
        <span class="node-pulse" aria-hidden="true"></span>
        <span class="node-mark">${building.mark}</span>
        <span class="node-copy">
          <strong>${compartment.label}</strong>
          <em>${level > 0 ? `Niv. ${level}` : "A construire"}</em>
          <small>${compartment.note}</small>
        </span>
      </button>
    `;
  }).join("");

  elements.citadelCompartments.querySelectorAll("[data-citadel-building]").forEach((button) => {
    button.addEventListener("click", () => selectBuilding(button.dataset.citadelBuilding, true));
  });
}

function citadelCompartmentForBuilding(id) {
  return CITADEL_COMPARTMENTS.find((compartment) => compartment.buildingId === id);
}

function citadelActionFor(building) {
  return {
    castle: { label: "Gerer le trone", hint: "Ameliorations", action: () => showToast("La Citadelle controle le niveau maximum du royaume.") },
    barracks: { label: "Former", hint: "Onglet Armee", action: () => switchView("army") },
    hospital: { label: "Voir soins", hint: "Pertes reduites", action: () => showToast("L'Hopital reduira les pertes quand les combats avances seront actifs.") },
    academy: { label: "Rechercher", hint: "Doctrines", action: () => switchView("shop") },
    forge: { label: "Forger", hint: "Artefacts", action: () => switchView("shop") },
    wall: { label: "Defense", hint: "Remparts", action: () => showToast("Les Remparts ajoutent de la puissance defensive au royaume.") },
    market: { label: "Boutique", hint: "Echanges", action: () => switchView("shop") },
    embassy: { label: "Alliance", hint: "Aide guilde", action: () => switchView("alliance") },
    watchtower: { label: "Carte", hint: "Alertes", action: () => switchView("world") },
    temple: { label: "Heros", hint: "Mana", action: () => switchView("army") },
    vault: { label: "Coffre", hint: "Protection", action: () => showToast("Le Coffre royal protege les ressources contre les pertes futures.") },
    portal: { label: "Epreuves", hint: "Progression", action: () => elements.kingdomTrialPanel?.scrollIntoView({ behavior: "smooth", block: "center" }) },
    farm: { label: "Production", hint: "Domaines", action: () => showToast("Les Domaines regroupent fermes, scieries et carrieres.") },
    lumber: { label: "Production", hint: "Bois", action: () => showToast("La Scierie augmente la production de bois.") },
    quarry: { label: "Production", hint: "Pierre", action: () => showToast("La Carriere augmente la production de pierre.") },
  }[building.id] ?? { label: "Details", hint: "Quartier", action: () => showToast(`${building.name}: ${building.role}`) };
}

function renderCitadelInspector() {
  if (!elements.citadelInspector) {
    return;
  }

  const building = getBuilding(selectedBuilding);
  if (!building) {
    elements.citadelInspector.innerHTML = "";
    return;
  }

  const level = state.buildings[building.id] ?? 0;
  const status = buildingStatus(building);
  const nextLevel = Math.min(level + 1, buildingMaxLevel(building));
  const cost = buildingUpgradeCost(building);
  const missing = missingCostText(cost);
  const compartment = citadelCompartmentForBuilding(building.id);
  const action = citadelActionFor(building);
  const progress = Math.min(100, (level / buildingMaxLevel(building)) * 100);

  elements.citadelInspector.innerHTML = `
    <article class="citadel-inspector-card status-${status.id}" style="--building-color: ${building.color}">
      <div class="inspector-head">
        <span class="inspector-mark">${building.mark}</span>
        <div>
          <span class="eyebrow">${buildingCategory(building)}${compartment ? ` - ${compartment.label}` : ""}</span>
          <h3>${building.name}</h3>
          <p>${building.role}</p>
        </div>
        <strong>${status.label}</strong>
      </div>
      <div class="inspector-meter" aria-label="Progression du batiment"><span style="--progress: ${progress}%"></span></div>
      <div class="inspector-stats">
        <span>Niv. ${level} / ${buildingMaxLevel(building)}</span>
        <span>${buildingEffectText(building, level)}</span>
      </div>
      <div class="inspector-next">
        <span>Suivant: ${buildingEffectText(building, nextLevel)}</span>
        <small>${missing ? `Manque: ${missing}` : `Cout: ${formatCosts(cost)}`}</small>
      </div>
      <div class="inspector-actions">
        <button class="mini-button" type="button" data-citadel-open="${building.id}">${action.label}<small>${action.hint}</small></button>
        <button class="primary" type="button" data-citadel-upgrade="${building.id}" ${!status.canUpgrade ? "disabled" : ""}>${level === 0 ? "Construire" : `Ameliorer niv. ${nextLevel}`}</button>
      </div>
    </article>
  `;

  elements.citadelInspector.querySelector("[data-citadel-open]")?.addEventListener("click", () => citadelActionFor(building).action());
  elements.citadelInspector.querySelector("[data-citadel-upgrade]")?.addEventListener("click", () => upgradeBuilding(building.id));
}

function citadelDistricts() {
  const seen = new Set();
  return CITADEL_COMPARTMENTS.map((compartment) => {
    if (seen.has(compartment.buildingId)) {
      return null;
    }
    seen.add(compartment.buildingId);
    const building = getBuilding(compartment.buildingId);
    if (!building) {
      return null;
    }
    const level = state.buildings[building.id] ?? 0;
    const status = buildingStatus(building);
    return {
      compartment,
      building,
      level,
      status,
      max: buildingMaxLevel(building),
    };
  }).filter(Boolean);
}

function citadelPriority(districts) {
  return districts.find((item) => item.status.canUpgrade && item.level === 0)
    ?? districts.find((item) => item.status.canUpgrade)
    ?? districts.find((item) => item.status.id === "insufficient" && item.level === 0)
    ?? districts.find((item) => item.status.id === "insufficient")
    ?? districts.find((item) => item.level < item.max)
    ?? districts[0];
}

function synergyProgress(synergy) {
  const built = synergy.buildings.filter((id) => (state.buildings[id] ?? 0) > 0);
  return {
    built,
    total: synergy.buildings.length,
    ready: built.length >= synergy.buildings.length,
    claimed: state.claimedDistrictSynergies?.includes(synergy.id),
  };
}

function claimDistrictSynergy(id) {
  const synergy = DISTRICT_SYNERGIES.find((item) => item.id === id);
  if (!synergy) {
    return;
  }
  const progress = synergyProgress(synergy);
  if (!progress.ready || progress.claimed) {
    showToast(progress.claimed ? "Synergie deja reclamee." : "Construis tous les quartiers requis.");
    return;
  }

  state.claimedDistrictSynergies ??= [];
  state.claimedDistrictSynergies.push(synergy.id);
  addResources(synergy.reward);
  awardEventPoints(140);
  addInbox(`Synergie: ${synergy.name}`, `${synergy.bonus}. Recompense: ${rewardText(synergy.reward)}.`);
  addLog(`Synergie de citadelle activee: ${synergy.name}.`);
  showReward(`${synergy.name}: ${rewardText(synergy.reward)}`);
  saveGame(false);
  render();
}

function renderCitadelOverview() {
  if (!elements.citadelOverview) {
    return;
  }

  const districts = citadelDistricts();
  const active = districts.filter((item) => item.level > 0).length;
  const upgradeable = districts.filter((item) => item.status.canUpgrade && item.level > 0).length;
  const buildable = districts.filter((item) => item.status.canUpgrade && item.level === 0).length;
  const blocked = districts.filter((item) => item.status.id === "insufficient").length;
  const maxLevelTotal = districts.reduce((sum, item) => sum + item.max, 0);
  const currentLevelTotal = districts.reduce((sum, item) => sum + item.level, 0);
  const progress = maxLevelTotal ? Math.round((currentLevelTotal / maxLevelTotal) * 100) : 0;
  const priority = citadelPriority(districts);
  const activeBonuses = activeDistrictBonusLabels().slice(0, 6);

  elements.citadelOverview.innerHTML = `
    <section class="citadel-overview-card">
      <div class="overview-heading">
        <div>
          <span class="eyebrow">Etat de la citadelle</span>
          <h3>${active} / ${districts.length} quartiers actifs</h3>
        </div>
        <strong>${progress}%</strong>
      </div>
      <div class="overview-meter"><span style="--progress: ${progress}%"></span></div>
      <div class="overview-kpis">
        <span><strong>${buildable}</strong> a construire</span>
        <span><strong>${upgradeable}</strong> a ameliorer</span>
        <span><strong>${blocked}</strong> bloques</span>
      </div>
      ${renderCitadelDefensePanel()}
      ${priority ? `
        <article class="overview-priority" style="--building-color: ${priority.building.color}">
          <span class="overview-mark">${priority.building.mark}</span>
          <div>
            <strong>Priorite: ${priority.building.name}</strong>
            <small>${priority.status.canUpgrade ? (priority.level === 0 ? "Construction disponible" : "Amelioration disponible") : priority.status.reason || priority.building.role}</small>
          </div>
          <button class="mini-button" type="button" data-overview-select="${priority.building.id}">Voir</button>
        </article>
      ` : ""}
      <div class="district-bonus-list">
        ${activeBonuses.length ? activeBonuses.map((label) => `<span>${label}</span>`).join("") : `<span>Construis les quartiers pour activer leurs bonus reels.</span>`}
      </div>
      <div class="synergy-list">
        ${DISTRICT_SYNERGIES.map((synergy) => {
          const synergyState = synergyProgress(synergy);
          const pct = Math.round((synergyState.built.length / synergyState.total) * 100);
          return `
            <article class="synergy-card ${synergyState.ready ? "ready" : ""} ${synergyState.claimed ? "claimed" : ""}">
              <div>
                <strong>${synergy.name}</strong>
                <small>${synergy.bonus}</small>
              </div>
              <span>${synergyState.built.length}/${synergyState.total}</span>
              <div class="synergy-meter"><i style="--progress: ${pct}%"></i></div>
              <button class="mini-button" type="button" data-claim-synergy="${synergy.id}" ${!synergyState.ready || synergyState.claimed ? "disabled" : ""}>
                ${synergyState.claimed ? "Pris" : synergyState.ready ? "Reclamer" : rewardText(synergy.reward)}
              </button>
            </article>
          `;
        }).join("")}
      </div>
      <div class="district-strip">
        ${districts.map((item) => `
          <button class="district-chip status-${item.status.id} ${selectedBuilding === item.building.id ? "active" : ""}" type="button" data-overview-select="${item.building.id}" style="--building-color: ${item.building.color}">
            <span>${item.building.mark}</span>
            <strong>${item.compartment.label}</strong>
            <em>${item.level > 0 ? `Niv. ${item.level}` : "A batir"}</em>
          </button>
        `).join("")}
      </div>
    </section>
  `;

  elements.citadelOverview.querySelectorAll("[data-overview-select]").forEach((button) => {
    button.addEventListener("click", () => selectBuilding(button.dataset.overviewSelect, true));
  });
  elements.citadelOverview.querySelectorAll("[data-claim-synergy]").forEach((button) => {
    button.addEventListener("click", () => claimDistrictSynergy(button.dataset.claimSynergy));
  });
  elements.citadelOverview.querySelector("[data-defense-shield]")?.addEventListener("click", activateDefenseShield);
  elements.citadelOverview.querySelector("[data-defense-heal]")?.addEventListener("click", healWoundedUnits);
  elements.citadelOverview.querySelector("[data-defense-drill]")?.addEventListener("click", runDefenseDrill);
  elements.citadelOverview.querySelector("[data-defense-accelerate]")?.addEventListener("click", accelerateCitadelRaid);
  elements.citadelOverview.querySelectorAll("[data-build-trap]").forEach((button) => {
    button.addEventListener("click", () => buildDefenseTrap(button.dataset.buildTrap, Number(button.dataset.amount ?? 1)));
  });
  elements.citadelOverview.querySelectorAll("[data-upgrade-trap]").forEach((button) => {
    button.addEventListener("click", () => upgradeDefenseTrap(button.dataset.upgradeTrap));
  });
  elements.citadelOverview.querySelectorAll("[data-defense-hero]").forEach((button) => {
    button.addEventListener("click", () => toggleDefenseHero(button.dataset.defenseHero));
  });
}

function renderCitadelDefensePanel() {
  const shieldMs = Math.max(0, (state.defense?.shieldUntil ?? 0) - Date.now());
  const drillMs = Math.max(0, (state.defense?.drillReadyAt ?? 0) - Date.now());
  const nextRaidMs = Math.max(0, (state.defense?.nextRaidAt ?? Date.now()) - Date.now());
  const threatLevel = state.defense?.threatLevel ?? 1;
  const wounded = woundedTotal();
  const capacity = hospitalCapacity();
  const protectedCap = protectedResourceCapacity();
  const trapCap = trapCapacity();
  const trapTotal = totalTrapCount();
  const shieldActive = shieldMs > 0;
  const report = state.defenseReports?.[0];
  const pillageText = report && Object.keys(report.pillaged ?? {}).length > 0 ? rewardText(report.pillaged) : "Aucun";
  const rewardTextValue = report && Object.keys(report.reward ?? {}).length > 0 ? rewardText(report.reward) : "Aucune";
  const wallHeroes = defenseHeroLineup();
  const passiveSummary = defenseHeroPassiveSummary(wallHeroes);
  const wallHeroPower = Math.floor(wallHeroes.reduce((sum, heroId) => sum + heroDefensePower(heroId), 0) * defenseHeroSetBonus(wallHeroes));
  const unlockedHeroes = HEROES.filter((hero) => heroUnlocked(hero.id))
    .sort((a, b) => {
      const assignedDelta = Number(wallHeroes.includes(b.id)) - Number(wallHeroes.includes(a.id));
      return assignedDelta || heroDefensePower(b.id) - heroDefensePower(a.id);
    });
  const defenseHeroCards = unlockedHeroes.map((hero) => {
    const assigned = wallHeroes.includes(hero.id);
    const progress = state.heroes[hero.id] ?? { level: 1 };
    const passive = defenseHeroPassive(hero.id);
    return `
      <button class="defense-hero-chip ${assigned ? "assigned" : ""}" type="button" data-defense-hero="${hero.id}" style="--hero-color: ${hero.color}; --hero-accent: ${hero.accent}; --hero-dark: ${hero.dark}">
        ${hero.art ? `<img src="${hero.art}" alt="${hero.name}" />` : `<span>${hero.classMark}</span>`}
        <strong>${hero.name}</strong>
        <small>Niv. ${progress.level} - ${formatNumber(heroDefensePower(hero.id))} DEF</small>
        <em>${passive.name}</em>
        <small>${assigned ? passive.text : "Assigner aux remparts"}</small>
      </button>
    `;
  }).join("");
  const trapCards = DEFENSE_TRAPS.map((trap) => {
    const count = trapCount(trap.id);
    const level = trapLevel(trap.id);
    const rarity = trapRarity(level);
    const unitPower = trapUnitPower(trap);
    const costOne = trapBuildCost(trap, 1);
    const upgradeCost = trapUpgradeCost(trap);
    const canBuild = trapTotal < trapCap && canAfford(costOne);
    const canUpgrade = count > 0 && level < TRAP_MAX_LEVEL && canAfford(upgradeCost);
    return `
      <div class="defense-trap-card rarity-${rarity.className}">
        <span>${trap.mark}</span>
        <div>
          <strong>${trap.name}</strong>
          <small>${trap.role} - ${formatNumber(count)} poses - Niv. ${level}/${TRAP_MAX_LEVEL} - ${rarity.label}</small>
          <p>${trap.note}</p>
          <p class="trap-power-line">${formatNumber(unitPower)} DEF/u - prochain niv. ${level >= TRAP_MAX_LEVEL ? "max" : formatNumber(Math.floor(trap.power * (1 + level * 0.12) * trapRarity(level + 1).multiplier))}</p>
          <em>Cout +1: ${formatCosts(costOne)}</em>
          <em>${level >= TRAP_MAX_LEVEL ? "Rang maximum atteint" : `Ameliorer: ${formatCosts(upgradeCost)}`}</em>
        </div>
        <div class="trap-actions">
          <button class="mini-button" type="button" data-build-trap="${trap.id}" data-amount="1" ${!canBuild ? "disabled" : ""}>+1</button>
          <button class="mini-button" type="button" data-build-trap="${trap.id}" data-amount="5" ${trapTotal >= trapCap ? "disabled" : ""}>+5</button>
          <button class="mini-button trap-upgrade-button" type="button" data-upgrade-trap="${trap.id}" ${!canUpgrade ? "disabled" : ""}>Niv. +</button>
        </div>
      </div>
    `;
  }).join("");
  return `
    <article class="citadel-defense-card">
      <div class="defense-heading">
        <div>
          <span class="eyebrow">Defense de citadelle</span>
          <strong>${shieldActive ? `Bouclier ${formatTime(shieldMs)}` : "Bouclier inactif"}</strong>
        </div>
        <em>${formatNumber(citadelDefensePower())} DEF</em>
      </div>
      <div class="defense-kpis">
        <span><small>Remparts</small><strong>Niv. ${state.buildings.wall ?? 0}</strong></span>
        <span><small>Pieges</small><strong>${formatNumber(trapTotal)} / ${formatNumber(trapCap)}</strong></span>
        <span><small>Hopital</small><strong>${formatNumber(wounded)} / ${formatNumber(capacity)}</strong></span>
        <span><small>Coffre</small><strong>${formatNumber(protectedCap)}</strong></span>
      </div>
      <div class="defense-alert-track">
        <span>
          <small>Prochaine attaque</small>
          <strong>${nextRaidMs > 0 ? formatTime(nextRaidMs) : "Imminente"}</strong>
        </span>
        <span>
          <small>Menace</small>
          <strong>${threatLevel}/5</strong>
        </span>
        <div class="defense-threat-meter" style="--threat: ${(threatLevel / 5) * 100}%"><i></i></div>
      </div>
      <div class="defense-hero-wall">
        <div class="trap-grid-heading">
          <strong>Heros de rempart</strong>
          <small>${wallHeroes.length}/3 assignes - ${formatNumber(wallHeroPower)} DEF heros - passifs ${Math.round(passiveSummary.defense * 100)}% DEF</small>
        </div>
        <div class="defense-hero-roster">
          ${defenseHeroCards}
        </div>
        <div class="defense-passive-grid">
          <span><small>Pertes</small><strong>-${Math.round(passiveSummary.lossReduction * 100)}%</strong></span>
          <span><small>Pieges</small><strong>-${Math.round(passiveSummary.trapPreservation * 100)}%</strong></span>
          <span><small>Butin</small><strong>+${Math.round(passiveSummary.reward * 100)}%</strong></span>
          <span><small>Menace</small><strong>-${Math.round(passiveSummary.threatControl * 100)}%</strong></span>
        </div>
      </div>
      <div class="defense-actions">
        <button class="mini-button" type="button" data-defense-shield ${shieldActive ? "disabled" : ""}>Bouclier 35 GE</button>
        <button class="mini-button" type="button" data-defense-heal ${wounded <= 0 ? "disabled" : ""}>Soigner</button>
        <button class="mini-button" type="button" data-defense-drill ${drillMs > 0 ? "disabled" : ""}>${drillMs > 0 ? formatTime(drillMs) : "Exercice - 6 EN"}</button>
        <button class="mini-button defense-raid-button" type="button" data-defense-accelerate>Alerte +15s</button>
      </div>
      <div class="defense-trap-grid">
        <div class="trap-grid-heading">
          <strong>Atelier de pieges</strong>
          <small>${formatNumber(trapPower())} puissance defensive via remparts, tour et pieges</small>
        </div>
        ${trapCards}
      </div>
      ${report ? `
        <div class="defense-report ${report.blocked ? "blocked" : report.victory ? "victory" : "defeat"}">
          <div>
            <small>Derniere alerte</small>
            <strong>${report.blocked ? "Bloquee" : report.victory ? "Victoire" : "Defense percee"} - ${report.enemy}</strong>
          </div>
          <dl>
            <span><dt>Ennemi</dt><dd>${formatNumber(report.enemyPower)}</dd></span>
            <span><dt>Defense</dt><dd>${formatNumber(report.defensePower)}</dd></span>
            <span><dt>Blesses</dt><dd>${formatNumber(report.wounded)}</dd></span>
            <span><dt>Pertes</dt><dd>${formatNumber(report.permanentLosses)}</dd></span>
            <span><dt>Pieges</dt><dd>${formatNumber(report.destroyedTraps ?? 0)}</dd></span>
          </dl>
          <p><b>Pillage:</b> ${pillageText}</p>
          <p><b>Recompense:</b> ${rewardTextValue}</p>
          ${report.passives?.labels?.length ? `<p><b>Passifs:</b> ${report.passives.labels.join(", ")}</p>` : ""}
          <p>${report.advice}</p>
        </div>
      ` : `
        <div class="defense-report empty">
          <strong>Aucune alerte recente</strong>
          <p>Avance une alerte pour verifier la resistance des remparts, pieges, heros et troupes.</p>
        </div>
      `}
    </article>
  `;
}

function setupKingdomCanvas() {
  if (!elements.kingdomCanvas) {
    return;
  }

  canvasContext = elements.kingdomCanvas.getContext("2d");
  resizeKingdomCanvas();
  elements.kingdomCanvas.addEventListener("click", handleKingdomCanvasClick);
  elements.kingdomCanvas.addEventListener("pointermove", handleKingdomCanvasPointerMove);
  window.addEventListener("resize", () => {
    resizeKingdomCanvas();
    drawKingdomScene();
  });
  requestAnimationFrame(animateKingdomScene);
}

function resizeKingdomCanvas() {
  const canvas = elements.kingdomCanvas;
  const rect = canvas.getBoundingClientRect();
  canvasScale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * canvasScale));
  canvas.height = Math.max(1, Math.floor(rect.height * canvasScale));
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  if (canvasContext) {
    canvasContext.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
  }
}

function animateKingdomScene() {
  drawKingdomScene(performance.now());
  drawHeroCanvases(performance.now());
  requestAnimationFrame(animateKingdomScene);
}

function handleKingdomCanvasClick(event) {
  const hit = findCanvasBuilding(event);
  if (!hit) {
    return;
  }

  selectBuilding(hit.id, true);
}

function handleKingdomCanvasPointerMove(event) {
  const hit = findCanvasBuilding(event);
  elements.kingdomCanvas.style.cursor = hit ? "pointer" : "default";
}

function findCanvasBuilding(event) {
  const rect = elements.kingdomCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return projectedBuildings
    .filter((building) => {
      const dx = x - building.cx;
      const dy = y - building.cy;
      return Math.abs(dx) < building.rx && Math.abs(dy) < building.ry + building.height;
    })
    .sort((a, b) => b.cy - a.cy)[0];
}

function drawKingdomScene(time = performance.now()) {
  if (!canvasContext || !elements.kingdomCanvas) {
    return;
  }

  const canvas = elements.kingdomCanvas;
  const width = canvas.width / canvasScale;
  const height = canvas.height / canvasScale;
  if (width <= 1 || height <= 1) {
    return;
  }

  const ctx = canvasContext;
  ctx.clearRect(0, 0, width, height);
  drawSceneBackground(ctx, width, height);

  const tileWidth = Math.max(72, Math.min(116, width / 7.2));
  const tileHeight = tileWidth * 0.52;
  const origin = {
    x: width * 0.5,
    y: height * 0.47,
  };

  drawIsometricGround(ctx, origin, tileWidth, tileHeight, width, height, time);
  drawRoads(ctx, origin, tileWidth, tileHeight);

  projectedBuildings = BUILDINGS.map((building) => {
    const layout = CITY_LAYOUT[building.id];
    if (!layout) {
      return null;
    }
    const level = state.buildings[building.id] ?? 0;
    const center = projectIso(layout.x, layout.y, origin, tileWidth, tileHeight);
    return {
      id: building.id,
      building,
      layout,
      level,
      cx: center.x,
      cy: center.y,
      rx: tileWidth * 0.86,
      ry: tileHeight * 1.1,
      height: tileHeight * (layout.height + level * 0.13),
    };
  }).filter(Boolean).sort((a, b) => a.cy - b.cy);

  for (const item of projectedBuildings) {
    drawBuilding3D(ctx, item, tileWidth, tileHeight, time);
  }

  drawAmbientDetails(ctx, origin, tileWidth, tileHeight, time);
}

function drawSceneBackground(ctx, width, height) {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "rgba(255, 214, 126, 0.08)");
  sky.addColorStop(0.44, "rgba(183, 234, 213, 0.04)");
  sky.addColorStop(0.45, "rgba(15, 111, 104, 0.02)");
  sky.addColorStop(1, "rgba(7, 24, 31, 0.14)");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const sunX = width * 0.74;
  const sunY = height * 0.18;
  const glow = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, 88);
  glow.addColorStop(0, "rgba(255, 230, 128, 0.28)");
  glow.addColorStop(0.48, "rgba(255, 230, 128, 0.12)");
  glow.addColorStop(1, "rgba(255, 230, 128, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 226, 126, 0.18)";
  ctx.beginPath();
  ctx.arc(sunX, sunY, 42, 0, Math.PI * 2);
  ctx.fill();

  drawMountain(ctx, -80, height * 0.47, width * 0.44, 118, "#356c69", 0.12);
  drawMountain(ctx, width * 0.46, height * 0.45, width * 0.62, 146, "#2d5b5a", 0.1);
}

function drawMountain(ctx, x, y, width, height, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x + width * 0.48, y);
  ctx.lineTo(x + width, y + height);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawIsometricGround(ctx, origin, tileWidth, tileHeight, width, height, time) {
  const pulse = Math.sin(time / 1800) * 0.04;
  drawDiamond(ctx, origin.x, origin.y + tileHeight * 2.5, tileWidth * 4.2, tileHeight * 4.2, "#8fbd67", "#5c8f58");
  drawDiamond(ctx, origin.x, origin.y + tileHeight * 2.5, tileWidth * 3.65, tileHeight * 3.65, "#a4c876", "#75a862");

  ctx.save();
  ctx.globalAlpha = 0.16 + pulse;
  ctx.strokeStyle = "#f8efd0";
  ctx.lineWidth = 1;
  for (let i = -4; i <= 4; i += 1) {
    const a = projectIso(i, -3, origin, tileWidth, tileHeight);
    const b = projectIso(i, 4, origin, tileWidth, tileHeight);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    const c = projectIso(-3, i, origin, tileWidth, tileHeight);
    const d = projectIso(4, i, origin, tileWidth, tileHeight);
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#2a7b80";
  ctx.beginPath();
  ctx.ellipse(width * 0.18, height * 0.8, width * 0.18, 28, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRoads(ctx, origin, tileWidth, tileHeight) {
  const routes = [
    [
      [-2.4, 1],
      [0, 0],
      [2.4, 1],
    ],
    [
      [-1.25, 2.15],
      [0, 0],
      [1.25, 2.15],
    ],
    [
      [-2.45, 3.25],
      [0, 0],
      [2.45, 3.25],
    ],
    [
      [-3.1, 2.25],
      [0, 0],
      [3.1, 2.25],
    ],
    [
      [-1.1, 4.05],
      [0, 0],
      [1.1, 4.05],
    ],
    [
      [0, 0],
      [0, 4.75],
    ],
  ];

  ctx.save();
  ctx.strokeStyle = "rgba(245, 226, 164, 0.7)";
  ctx.lineWidth = Math.max(10, tileWidth * 0.12);
  ctx.lineCap = "round";
  for (const route of routes) {
    ctx.beginPath();
    route.forEach(([x, y], index) => {
      const p = projectIso(x, y, origin, tileWidth, tileHeight);
      if (index === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    });
    ctx.stroke();
  }
  ctx.restore();
}

function drawBuilding3D(ctx, item, tileWidth, tileHeight, time) {
  const { building, layout, level } = item;
  const raised = selectedBuilding === item.id ? Math.sin(time / 220) * 4 + 8 : 0;
  const cx = item.cx;
  const cy = item.cy - raised;
  const baseW = tileWidth * layout.width;
  const baseH = tileHeight * layout.depth;
  const bodyH = Math.max(tileHeight * 0.62, item.height * (level > 0 ? 1 : 0.56));
  const main = level > 0 ? building.color : "#8b9994";
  const top = mixColor(main, "#ffffff", 0.34);
  const side = mixColor(main, "#071f22", 0.28);
  const front = mixColor(main, "#102a2b", 0.16);

  drawEllipseShadow(ctx, cx, cy + baseH * 0.52, baseW * 0.78, baseH * 0.42, selectedBuilding === item.id ? 0.32 : 0.2);

  if (selectedBuilding === item.id) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 235, 142, 0.95)";
    ctx.lineWidth = 4;
    drawDiamondPath(ctx, cx, cy + baseH * 0.15, baseW * 1.12, baseH * 1.12);
    ctx.stroke();
    ctx.restore();
  }

  drawDiamond(ctx, cx, cy + baseH * 0.16, baseW * 1.18, baseH * 1.18, "rgba(236, 220, 154, 0.95)", "rgba(150, 119, 62, 0.74)");
  drawPrism(ctx, cx, cy, baseW, baseH, bodyH, top, front, side);

  if (layout.shape === "castle" || layout.shape === "tower") {
    drawTower(ctx, cx - baseW * 0.28, cy - bodyH * 0.08, baseW * 0.34, baseH * 0.42, bodyH * 1.16, top, front, side);
    drawTower(ctx, cx + baseW * 0.28, cy - bodyH * 0.08, baseW * 0.34, baseH * 0.42, bodyH * 1.16, top, front, side);
  }

  if (layout.shape === "wall") {
    for (let i = -2; i <= 2; i += 1) {
      drawTower(ctx, cx + i * baseW * 0.19, cy - bodyH * 0.1, baseW * 0.16, baseH * 0.28, bodyH * 0.76, top, front, side);
    }
  }

  if (layout.shape === "mill") {
    drawFlag(ctx, cx + baseW * 0.2, cy - bodyH - 20, "#fff2b4", time);
  }

  if (level === 0) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#172225";
    ctx.fillRect(cx - baseW * 0.24, cy - bodyH * 0.4, baseW * 0.48, bodyH * 0.26);
    ctx.restore();
  }

  drawBuildingBadge(ctx, cx, cy + baseH * 0.18, building.mark, selectedBuilding === item.id);
  drawSceneLabel(ctx, cx, cy + baseH * 0.94, building.name, level);
}

function drawPrism(ctx, cx, cy, width, depth, height, topColor, frontColor, sideColor) {
  const topY = cy - height;
  const left = { x: cx - width / 2, y: cy };
  const right = { x: cx + width / 2, y: cy };
  const bottom = { x: cx, y: cy + depth / 2 };
  const topBottom = { x: cx, y: topY + depth / 2 };
  const topLeft = { x: left.x, y: topY };
  const topRight = { x: right.x, y: topY };
  const topTop = { x: cx, y: topY - depth / 2 };

  ctx.fillStyle = sideColor;
  ctx.beginPath();
  ctx.moveTo(right.x, right.y);
  ctx.lineTo(bottom.x, bottom.y);
  ctx.lineTo(topBottom.x, topBottom.y);
  ctx.lineTo(topRight.x, topRight.y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = frontColor;
  ctx.beginPath();
  ctx.moveTo(left.x, left.y);
  ctx.lineTo(bottom.x, bottom.y);
  ctx.lineTo(topBottom.x, topBottom.y);
  ctx.lineTo(topLeft.x, topLeft.y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(topTop.x, topTop.y);
  ctx.lineTo(topRight.x, topRight.y);
  ctx.lineTo(topBottom.x, topBottom.y);
  ctx.lineTo(topLeft.x, topLeft.y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawTower(ctx, cx, cy, width, depth, height, topColor, frontColor, sideColor) {
  drawPrism(ctx, cx, cy, width, depth, height, topColor, frontColor, sideColor);
  ctx.fillStyle = "#f2d279";
  ctx.beginPath();
  ctx.moveTo(cx, cy - height - depth * 0.78);
  ctx.lineTo(cx + width * 0.46, cy - height - depth * 0.08);
  ctx.lineTo(cx, cy - height + depth * 0.28);
  ctx.lineTo(cx - width * 0.46, cy - height - depth * 0.08);
  ctx.closePath();
  ctx.fill();
}

function drawFlag(ctx, x, y, color, time) {
  const wave = Math.sin(time / 240) * 3;
  ctx.save();
  ctx.strokeStyle = "rgba(23, 34, 37, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 46);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + 4);
  ctx.quadraticCurveTo(x + 24, y + wave, x + 42, y + 10);
  ctx.quadraticCurveTo(x + 24, y + 18 + wave, x, y + 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBuildingBadge(ctx, x, y, text, active) {
  ctx.save();
  ctx.fillStyle = active ? "#f2d279" : "rgba(255, 248, 231, 0.9)";
  ctx.strokeStyle = active ? "#8a6420" : "rgba(28, 50, 48, 0.18)";
  ctx.lineWidth = 2;
  roundedRect(ctx, x - 18, y - 14, 36, 26, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = active ? "#3b2b0f" : "#0a4d50";
  ctx.font = "900 11px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawSceneLabel(ctx, x, y, name, level) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 248, 231, 0.88)";
  roundedRect(ctx, x - 48, y - 12, 96, 30, 8);
  ctx.fill();
  ctx.fillStyle = "#172225";
  ctx.font = "900 11px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, x, y);
  ctx.fillStyle = "#687776";
  ctx.font = "800 9px Segoe UI, sans-serif";
  ctx.fillText(level > 0 ? `Niv. ${level}` : "A construire", x, y + 11);
  ctx.restore();
}

function drawAmbientDetails(ctx, origin, tileWidth, tileHeight, time) {
  const sparkle = 0.5 + Math.sin(time / 400) * 0.5;
  const points = [
    projectIso(-2.45, 2.2, origin, tileWidth, tileHeight),
    projectIso(2.35, 2.2, origin, tileWidth, tileHeight),
    projectIso(-0.25, 3.35, origin, tileWidth, tileHeight),
  ];
  ctx.save();
  ctx.globalAlpha = 0.28 + sparkle * 0.22;
  ctx.fillStyle = "#fff0a3";
  for (const point of points) {
    ctx.beginPath();
    ctx.arc(point.x, point.y - 18, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawDiamond(ctx, x, y, width, height, fill, stroke) {
  ctx.save();
  ctx.fillStyle = fill;
  drawDiamondPath(ctx, x, y, width, height);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawDiamondPath(ctx, x, y, width, height) {
  ctx.beginPath();
  ctx.moveTo(x, y - height / 2);
  ctx.lineTo(x + width / 2, y);
  ctx.lineTo(x, y + height / 2);
  ctx.lineTo(x - width / 2, y);
  ctx.closePath();
}

function drawEllipseShadow(ctx, x, y, width, height, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#122225";
  ctx.beginPath();
  ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function projectIso(x, y, origin, tileWidth, tileHeight) {
  return {
    x: origin.x + (x - y) * tileWidth * 0.5,
    y: origin.y + (x + y) * tileHeight * 0.5,
  };
}

function mixColor(hex, targetHex, amount) {
  const from = hexToRgb(hex);
  const to = hexToRgb(targetHex);
  const mix = {
    r: Math.round(from.r + (to.r - from.r) * amount),
    g: Math.round(from.g + (to.g - from.g) * amount),
    b: Math.round(from.b + (to.b - from.b) * amount),
  };
  return `rgb(${mix.r}, ${mix.g}, ${mix.b})`;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function hexToRgba(hex, alpha) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function renderBuildingDetails() {
  const building = getBuilding(selectedBuilding);
  const level = state.buildings[building.id] ?? 0;
  const nextCost = buildingUpgradeCost(building);
  const status = buildingStatus(building);
  const nextLevel = Math.min(level + 1, buildingMaxLevel(building));
  const missing = missingCostText(nextCost);
  const powerGain = building.power ?? (building.production ? 35 : 45);

  elements.selectedBuildingName.textContent = building.name;
  elements.buildingDetails.innerHTML = `
    <div class="detail-list building-panel status-${status.id}">
      <div class="building-hero-panel" style="--building-color: ${building.color}">
        <span class="building-panel-mark">${building.mark}</span>
        <div>
          <span class="eyebrow">${buildingCategory(building)}</span>
          <h3>${building.name}</h3>
          <p>${building.role}</p>
        </div>
        <strong>${status.label}</strong>
      </div>
      <div class="detail-row"><span>Niveau actuel</span><strong>${level} / ${buildingMaxLevel(building)}</strong></div>
      <div class="detail-row"><span>Effet actuel</span><strong>${buildingEffectText(building, level)}</strong></div>
      <div class="detail-row"><span>Niveau suivant</span><strong>${buildingEffectText(building, nextLevel)}</strong></div>
      <div class="detail-row"><span>Gain puissance</span><strong>+${formatNumber(powerGain)}</strong></div>
      <div class="detail-row"><span>Duree estimee</span><strong>${formatTime(buildingUpgradeSeconds(building) * 1000)}</strong></div>
      <div class="detail-row"><span>Puissance totale</span><strong>${formatNumber(kingdomPower())}</strong></div>
      <div>
        <p class="muted">Cout ${level === 0 ? "construction" : "amelioration"}</p>
        <div class="costs">${formatCosts(nextCost)}</div>
      </div>
      ${missing ? `<p class="missing-note">Manque: ${missing}</p>` : ""}
      <button class="primary upgrade-cta" type="button" id="upgradeBtn" ${!status.canUpgrade ? "disabled" : ""}>
        ${status.canUpgrade ? (level === 0 ? "Construire" : `Ameliorer niv. ${nextLevel}`) : status.reason}
      </button>
      <button class="mini-button" type="button" id="detailsBtn">Voir details</button>
      ${building.id !== "castle" && level >= state.buildings.castle ? `<p class="muted">La Citadelle limite ce batiment. Monte-la au niveau ${state.buildings.castle + 1}.</p>` : ""}
    </div>
  `;
  $("#upgradeBtn").addEventListener("click", () => upgradeBuilding(building.id));
  $("#detailsBtn").addEventListener("click", () => showToast(`${building.name}: ${building.role}`));
}

function renderKingdomTrialPanel() {
  if (!elements.kingdomTrialPanel) {
    return;
  }
  const completed = state.kingdomTrial?.completed ?? [];
  const allDone = completed.length >= KINGDOM_TRIALS.length;
  const trial = currentKingdomTrial();
  const power = kingdomTrialCombatPower();
  const pct = allDone ? 100 : Math.min(100, (power / trial.power) * 100);
  const unlockedNames = (state.heroUnlocks ?? []).map((id) => getHero(id)?.name).filter(Boolean).join(", ");
  elements.kingdomTrialPanel.innerHTML = `
    <article class="kingdom-trial-card ${allDone ? "complete" : ""}">
      <div class="trial-heading">
        <span class="trial-mark">ER</span>
        <div>
          <span class="eyebrow">Epreuve du Royaume</span>
          <h3>${allDone ? "Trone d'Heliora maitrise" : trial.name}</h3>
          <p>${allDone ? "Tous les paliers sont termines. Les bonus restent actifs." : `Niveau ${trial.level} / ${KINGDOM_TRIALS.length}`}</p>
        </div>
      </div>
      <div class="trial-progress">
        <div class="detail-row"><span>Puissance d'assaut</span><strong>${formatNumber(power)}${allDone ? "" : ` / ${formatNumber(trial.power)}`}</strong></div>
        <div class="progress"><span style="--progress: ${pct}%"></span></div>
      </div>
      <div class="trial-path">
        ${KINGDOM_TRIALS.map((item) => {
          const done = completed.includes(item.id);
          const active = !allDone && item.id === trial.id;
          return `<span class="${done ? "done" : ""} ${active ? "active" : ""}">${item.level}</span>`;
        }).join("")}
      </div>
      <div class="trial-rewards">
        <span>Bonus actifs: ${completed.length ? completed.map((id) => KINGDOM_TRIALS.find((item) => item.id === id)?.bonus.label).filter(Boolean).join(" | ") : "Aucun"}</span>
        <span>Heros accessibles: ${unlockedNames}</span>
        ${!allDone ? `<span>Gain: ${rewardText(trial.reward)}${trial.unlockHero ? ` | Heros: ${getHero(trial.unlockHero).name}` : ""}</span>` : ""}
      </div>
      <button class="primary trial-fight" type="button" data-trial-fight="${trial.id}" ${allDone || power < trial.power || (state.resources.energy ?? 0) < trial.energy ? "disabled" : ""}>
        ${allDone ? "Toutes les epreuves terminees" : power < trial.power ? "Puissance insuffisante" : (state.resources.energy ?? 0) < trial.energy ? `Energie requise ${trial.energy}` : `Combattre (${trial.energy} energie)`}
      </button>
    </article>
  `;
  elements.kingdomTrialPanel.querySelector("[data-trial-fight]")?.addEventListener("click", (event) => fightKingdomTrial(event.currentTarget.dataset.trialFight));
}

function renderQuickActions() {
  if (!elements.quickActions) {
    return;
  }
  const building = getBuilding(selectedBuilding);
  const status = buildingStatus(building);
  const readyQuests = QUESTS.filter((quest) => quest.done(state) && !state.claimedQuests.includes(quest.id)).length;
  const freeShop = SHOP_ITEMS.filter((item) => item.price === 0 && !state.cosmetics.includes(item.id)).length;
  const actions = [
    { id: "upgrade", label: status.canUpgrade ? "Ameliorer" : "A verifier", meta: building.name, badge: status.canUpgrade ? "!" : "", action: () => status.canUpgrade ? upgradeBuilding(building.id) : showToast(status.reason || "Action indisponible.") },
    { id: "train", label: "Entrainer", meta: `${totalUnits()} troupes`, badge: state.training.length, action: () => switchView("army") },
    { id: "research", label: "Rechercher", meta: "Academie", badge: state.research.formations ?? 0, action: () => switchView("shop") },
    { id: "heroes", label: "Heros", meta: `${state.heroLineup.length}/5 actifs`, badge: "", action: () => switchView("army") },
    { id: "quests", label: "Missions", meta: "Objectifs", badge: readyQuests, action: () => switchView("quests") },
    { id: "rewards", label: "Recompenses", meta: "Events", badge: freeShop || "", action: () => switchView("events") },
  ];
  elements.quickActions.innerHTML = actions.map((action) => `
    <button class="quick-action" type="button" data-quick-action="${action.id}">
      <span>${action.label}</span>
      <strong>${action.meta}</strong>
      ${action.badge ? `<em>${action.badge}</em>` : ""}
    </button>
  `).join("");
  elements.quickActions.querySelectorAll("[data-quick-action]").forEach((button) => {
    const action = actions.find((item) => item.id === button.dataset.quickAction);
    button.addEventListener("click", () => action?.action());
  });
}

function renderArmy() {
  renderFormations();
  renderTrainingQueue();
  renderUnits();
  renderHeroes();
}

function renderFormations() {
  const breakdown = troopBreakdown();
  const squad = state.heroLineup.map((id) => getHero(id));
  const slots = Array.from({ length: 5 }, (_, index) => squad[index] ?? null);
  const currentFormation = getFormation();
  const africanPower = africanPowerSetBonus();
  const nextAfricanPowerTier = AFRICAN_POWER_SET_TIERS.find((tier) => africanPower.count < tier.count);
  elements.formationPanel.innerHTML = `
    <article class="system-card army-command-frame">
      <div class="army-command-top">
        <div class="army-command-title">
          <span class="army-crest">CS</span>
          <div>
            <span class="eyebrow">Formation de combat</span>
            <h3>Escouade de bataille</h3>
          </div>
        </div>
        <div class="army-command-meta">
          <strong>${currentFormation.name}</strong>
          <span>Puissance heros ${formatNumber(heroSquadPower())} - ${squad.length}/5 places</span>
        </div>
      </div>
      <div class="squad-strip">
        ${slots.map((hero, index) => {
          if (!hero) {
            return `
              <div class="squad-chip squad-empty">
                <span>${index + 1}</span>
                <strong>Place libre</strong>
                <small>Ajoute un heros</small>
              </div>
            `;
          }
          const progress = state.heroes[hero.id] ?? { level: 1 };
          return `
            <button class="squad-chip ${state.activeHero === hero.id ? "leader" : ""}" type="button" data-hero-squad="${hero.id}" style="--hero-color: ${hero.color}; --hero-accent: ${hero.accent}; --hero-dark: ${hero.dark}">
              ${hero.art ? `<img src="${hero.art}" alt="${hero.name}" />` : `<span>${hero.classMark}</span>`}
              <strong>${index + 1}. ${hero.name}</strong>
              <small>Niv. ${progress.level} - ${heroCombatStyle(hero.id).role}</small>
            </button>
          `;
        }).join("")}
      </div>
      <div class="set-bonus-panel ${africanPower.tier ? "active" : ""}">
        <div>
          <span class="eyebrow">Set premium</span>
          <strong>${africanPower.tier?.label ?? "African Power"}</strong>
          <p>${africanPower.tier?.text ?? "Ajoute 2 heros African Power pour activer le premier bonus de collection."}</p>
        </div>
        <div class="set-bonus-meter" aria-label="${africanPower.count} heros African Power actifs sur 5">
          ${AFRICAN_POWER_HERO_IDS.map((heroId) => `<span class="${state.heroLineup.includes(heroId) ? "filled" : ""}"></span>`).join("")}
        </div>
        <small>${africanPower.count}/5 heros African Power actifs${nextAfricanPowerTier ? ` - prochain palier: ${nextAfricanPowerTier.count}` : " - bonus maximum actif"}</small>
        <div class="set-bonus-actions">
          <button class="mini-button" type="button" data-african-power-lineup>Activer set</button>
          <button class="mini-button" type="button" data-african-power-leader ${state.heroLineup.includes("aurelion") ? "" : "disabled"}>Chef solaire</button>
        </div>
      </div>
      <div class="formation-grid army-formation-grid">
        ${FORMATIONS.map((formation) => `
          <button class="formation-card ${state.selectedFormation === formation.id ? "active-choice" : ""}" type="button" data-formation="${formation.id}">
            <span class="formation-mark">${FORMATION_MARKS[formation.id] ?? formation.name.slice(0, 2).toUpperCase()}</span>
            <strong>${formation.name}</strong>
            <span>${formation.description}</span>
            <em>${formationPowerText(formation, breakdown)}</em>
          </button>
        `).join("")}
      </div>
      <div class="tactical-row army-tactical-row">
        <span>Inf ${formatNumber(breakdown.infantry)}</span>
        <span>Arc ${formatNumber(breakdown.ranged)}</span>
        <span>Cav ${formatNumber(breakdown.cavalry)}</span>
        <span>Mag ${formatNumber(breakdown.magic)}</span>
        <span>Siege ${formatNumber(breakdown.siege)}</span>
      </div>
    </article>
  `;
  elements.formationPanel.querySelectorAll("[data-formation]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedFormation = button.dataset.formation;
      showToast(`${getFormation().name} selectionnee.`);
      render();
    });
  });
  elements.formationPanel.querySelectorAll("[data-hero-squad]").forEach((button) => {
    button.addEventListener("click", () => selectHero(button.dataset.heroSquad));
  });
  elements.formationPanel.querySelector("[data-african-power-lineup]")?.addEventListener("click", activateAfricanPowerLineup);
  elements.formationPanel.querySelector("[data-african-power-leader]")?.addEventListener("click", () => selectHero("aurelion"));
}

function formationPowerText(formation, breakdown = troopBreakdown()) {
  if (formation.bonusType === "all") {
    return `Inf ${formatNumber(breakdown.infantry)}`;
  }
  const labels = { infantry: "Inf", ranged: "Arc", cavalry: "Cav", magic: "Mag", siege: "Siege" };
  return `${labels[formation.bonusType] ?? "Bonus"} ${formatNumber(breakdown[formation.bonusType] ?? 0)}`;
}

function renderTrainingQueue() {
  if (state.training.length === 0) {
    elements.trainingQueue.innerHTML = `
      <div class="queue-item barracks-queue-empty">
        <strong>Aucun entrainement en cours.</strong>
        <span>Les casernes attendent tes ordres.</span>
      </div>
    `;
    return;
  }

  elements.trainingQueue.innerHTML = state.training
    .map((item) => {
      const unit = getUnit(item.unitId);
      const total = item.readyAt - item.startedAt;
      const progress = Math.min(100, ((Date.now() - item.startedAt) / total) * 100);
      return `
        <div class="queue-item barracks-queue-item">
          <span class="unit-mark" data-unit="${unit.id}" aria-hidden="true">${UNIT_MARKS[unit.id] ?? unit.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <strong>${item.amount} ${unit.name}</strong>
            <span>${formatTime(item.readyAt - Date.now())}</span>
            <div class="progress"><span style="--progress: ${progress}%"></span></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderUnits() {
  elements.unitList.innerHTML = UNITS.map((unit) => {
    const owned = state.units[unit.id] ?? 0;
    return `
      <article class="unit-card barracks-unit-card">
        <span class="unit-mark" data-unit="${unit.id}" aria-hidden="true">${UNIT_MARKS[unit.id] ?? unit.name.slice(0, 2).toUpperCase()}</span>
        <div>
          <div class="unit-headline">
            <div>
              <h3>${unit.name}</h3>
              <p>${unit.role} - ${UNIT_TYPE_LABELS[unit.type] ?? unit.type} - Puissance ${unit.power}</p>
            </div>
            <strong>${formatNumber(owned)}</strong>
          </div>
          <div class="costs">${formatCosts(unit.cost)}</div>
          <div class="train-controls barracks-train-controls">
            ${[1, 5, 20].map((amount) => `
              <button class="mini-button train-button" type="button" data-train="${unit.id}" data-amount="${amount}" ${!canAfford(scaleCost(unit.cost, amount)) ? "disabled" : ""}>
                <strong>+${amount}</strong>
                <span>${formatPrimaryCost(unit.cost, amount)}</span>
              </button>
            `).join("")}
          </div>
        </div>
      </article>
    `;
  }).join("");

  elements.unitList.querySelectorAll("[data-train]").forEach((button) => {
    button.addEventListener("click", () => trainUnit(button.dataset.train, Number(button.dataset.amount)));
  });
}

function formatPrimaryCost(cost, amount = 1) {
  const [resource, value] = Object.entries(cost)[0] ?? ["gold", 0];
  return `${RESOURCE_LABELS[resource] ?? resource} ${formatNumber(value * amount)}`;
}

function renderHeroes() {
  elements.heroList.innerHTML = HEROES.map((hero) => {
    const progress = normalizeHeroProgress(hero.id, state.heroes[hero.id]);
    state.heroes[hero.id] = progress;
    const required = progress.level >= HERO_LEVEL_CAP ? 0 : heroXpForNextLevel(progress.level);
    const pct = progress.level >= HERO_LEVEL_CAP ? 100 : Math.min(100, (progress.xp / required) * 100);
    const power = heroPower(hero.id);
    const stats = heroStatsAtLevel(hero.id, progress.level);
    const active = state.activeHero === hero.id;
    const inLineup = state.heroLineup.includes(hero.id);
    const inDefense = defenseHeroLineup().includes(hero.id);
    const locked = !heroUnlocked(hero.id);
    const premium = hero.tier === "premium";
    const lineupIndex = state.heroLineup.indexOf(hero.id);
    const combatStyle = heroCombatStyle(hero.id);
    const nextMilestone = heroNextMilestone(progress.level);
    return `
      <article class="hero-card ${active ? "active" : ""} ${inLineup ? "in-lineup" : ""} ${locked ? "locked-hero" : ""} ${premium ? "premium-hero" : ""} ${hero.art ? "has-art" : ""}" data-hero-card="${hero.id}" style="--hero-color: ${hero.color}; --hero-accent: ${hero.accent}; --hero-dark: ${hero.dark}">
        <div class="hero-showcase">
          ${hero.art ? `<img class="hero-art" src="${hero.art}" alt="${hero.artAlt ?? `${hero.name}, heros du royaume`}" />` : `<canvas class="hero-canvas" width="260" height="220" data-hero-canvas="${hero.id}" aria-label="Portrait 3D de ${hero.name}"></canvas>`}
          <span class="hero-class-mark">${hero.classMark}</span>
          <span class="hero-rarity">${hero.rarity}</span>
          ${premium ? `<span class="hero-premium-badge">Stats x5</span>` : ""}
          ${hero.visualTheme ? `<span class="hero-theme-badge">${hero.visualTheme}</span>` : ""}
          <span class="hero-element">${hero.element}</span>
          ${locked ? `<span class="hero-locked-badge">A debloquer</span>` : ""}
          ${active ? `<span class="hero-leader-badge">Chef</span>` : ""}
          ${inLineup ? `<span class="hero-lineup-badge">Escouade ${lineupIndex + 1}</span>` : ""}
          ${inDefense ? `<span class="hero-defense-badge">Rempart</span>` : ""}
        </div>
        <div class="hero-info">
          <div class="hero-stars" aria-label="${hero.stars} etoiles">
            ${Array.from({ length: 5 }, (_, index) => `<span class="${index < hero.stars ? "filled" : ""}"></span>`).join("")}
          </div>
          <div class="card-top">
            <div class="card-main">
              <h3>${hero.name}</h3>
              <p>${hero.title}</p>
            </div>
            <strong>Niv. ${progress.level}</strong>
          </div>
          <div class="hero-stats">
            <span>${hero.role}</span>
            <span>Puissance ${formatNumber(power)}</span>
          </div>
          ${hero.signature ? `<p class="hero-signature">${hero.signature}</p>` : ""}
          <div class="hero-attribute-grid">
            <span>Degats <strong>${formatNumber(stats.damage)}</strong></span>
            <span>Sante <strong>${formatNumber(stats.health)}</strong></span>
            <span>Mana <strong>${formatNumber(stats.mana)}</strong></span>
            <span>Defense <strong>${formatNumber(stats.defense)}</strong></span>
          </div>
          <p class="muted">${hero.bonus}</p>
          <p class="muted"><strong>${hero.skill}</strong> - ${hero.skillBonus}</p>
          <p class="hero-combat-note">${combatStyle.role} - ${combatStyle.text}</p>
          <div class="hero-xp-line">
            <span>${progress.level >= HERO_LEVEL_CAP ? "Niveau maximum" : `XP ${formatNumber(progress.xp)} / ${formatNumber(required)}`}</span>
            <span>${nextMilestone ? `Palier niv. ${nextMilestone}` : "Tous les paliers debloques"}</span>
          </div>
          <div class="progress"><span style="--progress: ${pct}%"></span></div>
          <div class="hero-actions">
            <button class="mini-button hero-command" type="button" data-hero="${hero.id}" ${active || locked ? "disabled" : ""}>
              ${locked ? "Verrouille" : active ? "Commandant actif" : "Commandant"}
            </button>
            <button class="mini-button" type="button" data-lineup="${hero.id}" ${locked ? "disabled" : ""}>
              ${locked ? "Epreuve requise" : inLineup ? "Retirer escouade" : "Ajouter escouade"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  elements.heroList.querySelectorAll("[data-hero]").forEach((button) => {
    button.addEventListener("click", () => selectHero(button.dataset.hero));
  });
  elements.heroList.querySelectorAll("[data-lineup]").forEach((button) => {
    button.addEventListener("click", () => toggleHeroLineup(button.dataset.lineup));
  });
  drawHeroCanvases(performance.now());
}

function drawHeroCanvases(time = performance.now()) {
  document.querySelectorAll("[data-hero-canvas]").forEach((canvas) => {
    const hero = getHero(canvas.dataset.heroCanvas);
    if (!hero) {
      return;
    }

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(rect.width * scale));
    const height = Math.max(1, Math.floor(rect.height * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drawHeroPortrait(ctx, hero, rect.width, rect.height, time);
  });
}

function drawHeroPortrait(ctx, hero, width, height, time) {
  if (width <= 1 || height <= 1) {
    return;
  }

  ctx.clearRect(0, 0, width, height);
  const bob = Math.sin(time / 480 + hero.basePower) * 3;
  const shine = 0.45 + Math.sin(time / 900 + hero.basePower) * 0.18;
  const centerX = width * 0.5;
  const baseY = height * 0.82;
  const main = hero.color;
  const accent = hero.accent;
  const dark = hero.dark;

  const aura = ctx.createRadialGradient(centerX, height * 0.42, 8, centerX, height * 0.46, width * 0.5);
  aura.addColorStop(0, hexToRgba(accent, 0.5));
  aura.addColorStop(0.58, hexToRgba(main, 0.24));
  aura.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(centerX, height * 0.48, width * 0.46, height * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();

  drawHeroPlatform(ctx, centerX, baseY, width * 0.62, height * 0.18, dark, accent);
  drawHeroBackpiece(ctx, hero, centerX, baseY + bob, width, height, time);
  drawHeroBody(ctx, hero, centerX, baseY + bob, width, height, main, dark, accent);
  drawHeroHead(ctx, centerX, baseY - height * 0.43 + bob, width, height, main, accent, shine);
  drawHeroWeapon(ctx, hero, centerX, baseY + bob, width, height, time);
  drawHeroSparkles(ctx, centerX, height * 0.46, width, height, accent, time);
}

function drawHeroPlatform(ctx, x, y, width, height, dark, accent) {
  drawEllipseShadow(ctx, x, y + height * 0.2, width, height * 0.54, 0.28);
  drawDiamond(ctx, x, y, width, height, hexToRgba(accent, 0.82), hexToRgba(dark, 0.6));
  drawDiamond(ctx, x, y - height * 0.08, width * 0.72, height * 0.56, "rgba(255, 248, 231, 0.72)", hexToRgba(accent, 0.7));
}

function drawHeroBackpiece(ctx, hero, x, y, width, height, time) {
  ctx.save();
  ctx.globalAlpha = 0.88;
  if (hero.id === "maelis") {
    ctx.fillStyle = hexToRgba(hero.accent, 0.9);
    ctx.beginPath();
    ctx.moveTo(x - width * 0.2, y - height * 0.52);
    ctx.lineTo(x - width * 0.34, y - height * 0.12);
    ctx.lineTo(x - width * 0.06, y - height * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + width * 0.2, y - height * 0.52);
    ctx.lineTo(x + width * 0.34, y - height * 0.12);
    ctx.lineTo(x + width * 0.06, y - height * 0.3);
    ctx.closePath();
    ctx.fill();
  } else if (hero.id === "oren") {
    ctx.fillStyle = hexToRgba("#d6d0b8", 0.82);
    for (let i = -2; i <= 2; i += 1) {
      drawPrism(ctx, x + i * width * 0.075, y - height * 0.16, width * 0.06, height * 0.06, height * (0.16 + Math.abs(i) * 0.025), "#d6d0b8", "#8b8d86", "#626a68");
    }
  } else {
    ctx.strokeStyle = hexToRgba(hero.accent, 0.8);
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i += 1) {
      const radius = width * (0.14 + i * 0.055);
      ctx.beginPath();
      ctx.ellipse(x, y - height * 0.32, radius, radius * 0.38, Math.sin(time / 1000) * 0.18, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawHeroBody(ctx, hero, x, y, width, height, main, dark, accent) {
  const shoulderY = y - height * 0.34;
  const waistY = y - height * 0.1;
  const left = x - width * 0.22;
  const right = x + width * 0.22;

  ctx.save();
  ctx.globalAlpha = 0.84;
  ctx.fillStyle = mixColor(dark, "#000000", 0.18);
  ctx.beginPath();
  ctx.moveTo(x - width * 0.22, shoulderY - height * 0.02);
  ctx.quadraticCurveTo(x, shoulderY + height * 0.2, x + width * 0.22, shoulderY - height * 0.02);
  ctx.lineTo(x + width * 0.28, waistY + height * 0.14);
  ctx.quadraticCurveTo(x, waistY + height * 0.22, x - width * 0.28, waistY + height * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  drawHeroLimb(ctx, left - width * 0.08, shoulderY + 12, left - width * 0.16, waistY, width * 0.07, dark, main);
  drawHeroLimb(ctx, right + width * 0.08, shoulderY + 12, right + width * 0.16, waistY, width * 0.07, dark, main);

  ctx.fillStyle = mixColor(main, "#ffffff", 0.18);
  ctx.beginPath();
  ctx.moveTo(x, shoulderY - height * 0.06);
  ctx.lineTo(right, shoulderY + height * 0.04);
  ctx.lineTo(x + width * 0.12, waistY);
  ctx.lineTo(x, waistY + height * 0.07);
  ctx.lineTo(x - width * 0.12, waistY);
  ctx.lineTo(left, shoulderY + height * 0.04);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(left, shoulderY + height * 0.04);
  ctx.lineTo(x - width * 0.12, waistY);
  ctx.lineTo(x, waistY + height * 0.07);
  ctx.lineTo(x, shoulderY + height * 0.03);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = hexToRgba(accent, 0.92);
  ctx.beginPath();
  ctx.moveTo(x, shoulderY);
  ctx.lineTo(x + width * 0.07, waistY - height * 0.01);
  ctx.lineTo(x, waistY + height * 0.04);
  ctx.lineTo(x - width * 0.07, waistY - height * 0.01);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.38)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.1, shoulderY + height * 0.04);
  ctx.lineTo(x + width * 0.1, shoulderY + height * 0.04);
  ctx.stroke();

  if (hero.id === "maelis") {
    ctx.fillStyle = hexToRgba(accent, 0.86);
    ctx.beginPath();
    ctx.ellipse(x - width * 0.22, waistY - height * 0.03, width * 0.075, height * 0.13, -0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  if (hero.id === "oren") {
    ctx.fillStyle = "#d6d0bd";
    drawPrism(ctx, x - width * 0.2, waistY + height * 0.02, width * 0.1, height * 0.05, height * 0.07, "#e8e1cc", "#9c9f96", "#626a68");
  }

  if (hero.id === "saya") {
    ctx.strokeStyle = hexToRgba(accent, 0.82);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, shoulderY + height * 0.1, width * 0.22, Math.PI * 0.12, Math.PI * 0.88);
    ctx.stroke();
  }
}

function drawHeroLimb(ctx, x1, y1, x2, y2, thickness, dark, main) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = thickness;
  ctx.strokeStyle = dark;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.lineWidth = thickness * 0.48;
  ctx.strokeStyle = mixColor(main, "#ffffff", 0.22);
  ctx.beginPath();
  ctx.moveTo(x1 - thickness * 0.15, y1 - thickness * 0.1);
  ctx.lineTo(x2 - thickness * 0.15, y2 - thickness * 0.1);
  ctx.stroke();
  ctx.restore();
}

function drawHeroHead(ctx, x, y, width, height, main, accent, shine) {
  const radius = Math.min(width, height) * 0.13;
  const face = ctx.createRadialGradient(x - radius * 0.28, y - radius * 0.28, radius * 0.1, x, y, radius);
  face.addColorStop(0, "#ffe2b1");
  face.addColorStop(0.64, "#c98f65");
  face.addColorStop(1, "#704638");
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = mixColor(main, "#071f22", 0.25);
  ctx.beginPath();
  ctx.moveTo(x - radius * 1.08, y - radius * 0.22);
  ctx.quadraticCurveTo(x, y - radius * 1.48, x + radius * 1.08, y - radius * 0.22);
  ctx.lineTo(x + radius * 0.7, y - radius * 0.7);
  ctx.lineTo(x, y - radius * 0.32);
  ctx.lineTo(x - radius * 0.7, y - radius * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = hexToRgba(accent, 0.85 + shine * 0.1);
  ctx.beginPath();
  ctx.moveTo(x, y - radius * 1.72);
  ctx.lineTo(x + radius * 0.36, y - radius * 0.74);
  ctx.lineTo(x, y - radius * 0.46);
  ctx.lineTo(x - radius * 0.36, y - radius * 0.74);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
  ctx.beginPath();
  ctx.arc(x - radius * 0.32, y - radius * 0.02, radius * 0.08, 0, Math.PI * 2);
  ctx.arc(x + radius * 0.32, y - radius * 0.02, radius * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(84, 45, 36, 0.65)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y + radius * 0.22, radius * 0.22, 0.1, Math.PI - 0.1);
  ctx.stroke();
}

function drawHeroWeapon(ctx, hero, x, y, width, height, time) {
  ctx.save();
  ctx.lineCap = "round";
  if (hero.weapon === "lance") {
    ctx.strokeStyle = "#f8e7aa";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.24, y - height * 0.62);
    ctx.lineTo(x + width * 0.13, y - height * 0.02);
    ctx.stroke();
    ctx.fillStyle = hero.accent;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.26, y - height * 0.69);
    ctx.lineTo(x + width * 0.34, y - height * 0.57);
    ctx.lineTo(x + width * 0.22, y - height * 0.58);
    ctx.closePath();
    ctx.fill();
  } else if (hero.weapon === "hammer") {
    ctx.strokeStyle = "#5b4c3b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.2, y - height * 0.5);
    ctx.lineTo(x + width * 0.05, y - height * 0.06);
    ctx.stroke();
    drawPrism(ctx, x + width * 0.24, y - height * 0.5, width * 0.14, height * 0.07, height * 0.09, "#d8d0bd", "#888d85", "#5f6664");
  } else {
    const sweep = Math.sin(time / 420) * 6;
    ctx.strokeStyle = hexToRgba(hero.accent, 0.95);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.26, y - height * 0.42 + sweep);
    ctx.quadraticCurveTo(x - width * 0.05, y - height * 0.58, x + width * 0.24, y - height * 0.36 - sweep);
    ctx.stroke();
    ctx.strokeStyle = "#eefcff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.18, y - height * 0.33 - sweep);
    ctx.lineTo(x + width * 0.3, y - height * 0.42 - sweep);
    ctx.stroke();
  }
  ctx.restore();
}

function drawHeroSparkles(ctx, x, y, width, height, color, time) {
  ctx.save();
  ctx.fillStyle = hexToRgba(color, 0.75);
  for (let i = 0; i < 7; i += 1) {
    const angle = time / 900 + i * 1.7;
    const px = x + Math.cos(angle) * width * (0.18 + (i % 3) * 0.05);
    const py = y + Math.sin(angle * 1.2) * height * 0.22;
    const size = 2 + Math.sin(time / 260 + i) * 1.2;
    ctx.beginPath();
    ctx.moveTo(px, py - size);
    ctx.lineTo(px + size, py);
    ctx.lineTo(px, py + size);
    ctx.lineTo(px - size, py);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function worldResourceHud() {
  return ["food", "wood", "stone", "gold", "energy", "gems"].map((key) => ({
    id: key,
    label: RESOURCE_LABELS[key],
    mark: RESOURCE_MARKS[key],
    value: state.resources[key] ?? 0,
  }));
}

function worldQuickActions() {
  return [
    { id: "construction", label: "Construction", mark: "CN", view: "kingdom" },
    { id: "research", label: "Recherche", mark: "RC", view: "quests" },
    { id: "training", label: "Entrainement", mark: "TR", view: "army" },
    { id: "forge", label: "Fusion", mark: "FG", view: "quests" },
    { id: "search", label: "Cibles", mark: "LB", filter: "elite" },
    { id: "rank", label: "Classement", mark: "TP", view: "alliance" },
  ];
}

function worldRightActions() {
  return [
    { id: "events", label: "Evenements", mark: "EV", view: "events", badge: eventProgress(activeEvent().id) > 0 ? "!" : "" },
    { id: "chests", label: "Coffres", mark: "CF", view: "alliance", badge: state.inbox.length },
    { id: "offers", label: "Offres", mark: "OF", view: "shop", badge: "!" },
  ];
}

function worldBottomActions() {
  const activeMarchCount = state.marches.length + (state.returnMarches?.length ?? 0);
  return [
    { id: "global", label: "Globe", mark: "GL", filter: "all" },
    { id: "quests", label: "Quetes", mark: "QT", view: "quests" },
    { id: "alliance", label: "Alliance", mark: "AL", view: "alliance", badge: activeMarchCount },
    { id: "messages", label: "Messages", mark: "MS", view: "alliance", badge: state.inbox.length },
    { id: "inventory", label: "Inventaire", mark: "IV", view: "shop" },
    { id: "heroes", label: "Heros", mark: "HE", view: "army" },
    { id: "home", label: "Accueil", mark: "AC", view: "kingdom" },
  ];
}

function handleWorldShortcut(actionId) {
  const action = [...worldQuickActions(), ...worldRightActions(), ...worldBottomActions()].find((item) => item.id === actionId);
  if (!action) {
    return;
  }
  if (action.filter) {
    selectedMapFilter = action.filter;
    showToast(action.filter === "all" ? "Carte globale affichee." : "Filtre de carte applique.");
    renderWorld();
    return;
  }
  switchView(action.view ?? "kingdom");
}

function updateWorldZoom(direction) {
  const delta = direction === "in" ? 0.12 : -0.12;
  worldMapZoom = Math.min(1.28, Math.max(0.82, Number((worldMapZoom + delta).toFixed(2))));
  renderWorld();
}

function marchDisplayInfo(march) {
  if (march.returning) {
    return { className: "harvest returning", mark: "RT", label: "Retour" };
  }
  if (march.mode === "harvest") {
    return { className: "harvest", mark: "RC", label: "Recolte" };
  }
  if (march.rally) {
    return { className: "rally", mark: "RY", label: "Rally" };
  }
  return { className: "attack", mark: "AT", label: "Attaque" };
}

function marchMapPosition(march) {
  const node = getNode(march.nodeId);
  const progress = marchProgress(march) / 100;
  const startX = 50;
  const startY = 52;
  const targetX = node?.x ?? startX;
  const targetY = node?.y ?? startY;
  if (march.returning) {
    return {
      x: targetX + (startX - targetX) * progress,
      y: targetY + (startY - targetY) * progress,
    };
  }
  return {
    x: startX + (targetX - startX) * progress,
    y: startY + (targetY - startY) * progress,
  };
}

function renderWorld() {
  const now = Date.now();
  const selected = getNode(selectedNode) ?? WORLD_NODES[0];
  const visualMarches = [...state.marches, ...(state.returnMarches ?? [])];
  const activeMarchTargets = new Set(visualMarches.map((march) => march.nodeId));
  const visibleNodes = WORLD_NODES.filter((node) => nodeMatchesMapFilter(node) || node.id === selected.id || activeMarchTargets.has(node.id));
  const routeLines = visualMarches.map((march) => {
    const node = getNode(march.nodeId);
    if (!node) {
      return "";
    }
    const info = marchDisplayInfo(march);
    return `<line class="march-route ${info.className}" x1="50%" y1="52%" x2="${node.x ?? 50}%" y2="${node.y ?? 50}%"></line>`;
  }).join("");
  const marchTokens = visualMarches.map((march) => {
    const node = getNode(march.nodeId);
    if (!node) {
      return "";
    }
    const info = marchDisplayInfo(march);
    const position = marchMapPosition(march);
    return `
      <button class="march-token ${info.className}" type="button" data-march-node="${node.id}" style="--x: ${position.x}%; --y: ${position.y}%">
        <span>${info.mark}</span>
        <strong>${info.label}</strong>
        <small>${formatTime(march.readyAt - now)}</small>
      </button>
    `;
  }).join("");
  elements.mapGrid.innerHTML = `
    <div class="map-stage" style="--map-zoom: ${worldMapZoom}">
      <div class="map-terrain" aria-hidden="true"></div>
      <svg class="map-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line class="home-route" x1="50%" y1="52%" x2="${selected.x ?? 50}%" y2="${selected.y ?? 50}%"></line>
        ${routeLines}
      </svg>
      ${marchTokens}
      <div class="world-resource-bar" aria-label="Ressources du royaume">
        <article class="world-power-card">
          <small>Puissance</small>
          <strong>${formatNumber(kingdomPower())}</strong>
        </article>
        ${worldResourceHud().map((resource) => `
          <button class="world-resource-chip" type="button" data-world-shortcut="home" title="${resource.label}">
            <span>${resource.mark}</span>
            <strong>${formatNumber(resource.value)}</strong>
          </button>
        `).join("")}
        <button class="world-plus-button" type="button" data-world-shortcut="offers">+</button>
      </div>
      <div class="world-side-actions left">
        ${worldQuickActions().map((action) => `
          <button type="button" data-world-shortcut="${action.id}">
            <span>${action.mark}</span>
            <strong>${action.label}</strong>
          </button>
        `).join("")}
      </div>
      <div class="world-side-actions right">
        ${worldRightActions().map((action) => `
          <button type="button" data-world-shortcut="${action.id}">
            ${action.badge ? `<em>${action.badge}</em>` : ""}
            <span>${action.mark}</span>
            <strong>${action.label}</strong>
          </button>
        `).join("")}
      </div>
      <div class="map-toolbar">
        ${mapFilterOptions().map((option) => {
          const count = WORLD_NODES.filter((node) => option.matches(node)).length;
          return `<button class="${selectedMapFilter === option.id ? "active" : ""}" type="button" data-map-filter="${option.id}">${option.label}<span>${count}</span></button>`;
        }).join("")}
      </div>
      <div class="map-zoom-controls">
        <button type="button" data-map-zoom="out">-</button>
        <span>${Math.round(worldMapZoom * 100)}%</span>
        <button type="button" data-map-zoom="in">+</button>
      </div>
      <div class="map-hud">
        <span>Monde d'Heliora</span>
        <span>X:${nodeCoords(selected).x} Y:${nodeCoords(selected).y}</span>
      </div>
      <div class="map-minimap" aria-label="Mini carte">
        ${WORLD_NODES.map((node) => `
          <button class="${selectedNode === node.id ? "active" : ""} ${nodeMatchesMapFilter(node) ? "" : "dim"} ${state.mapBookmarks.includes(node.id) ? "bookmarked" : ""} ${state.scoutReports[node.id] ? "scouted" : ""}" type="button" data-mini-node="${node.id}" style="--x: ${node.x ?? 50}%; --y: ${node.y ?? 50}%" title="${node.name}"></button>
        `).join("")}
        <span class="mini-base" style="--x: 50%; --y: 52%"></span>
      </div>
      <button class="world-alliance-fort" type="button" data-world-shortcut="alliance" style="--x: 78%; --y: 29%">
        <span>AL</span>
        <strong>Forteresse d'Alliance</strong>
      </button>
      <button class="kingdom-base" type="button" data-world-shortcut="home" style="--x: 50%; --y: 52%">
        <span class="base-level">${state.buildings.castle ?? 1}</span>
        <strong>Ma Citadelle</strong>
        <small>Accueil</small>
      </button>
    ${visibleNodes.map((node) => {
      const cleared = isNodeCleared(node.id, now);
      const respawnAt = state.nodeRespawns?.[node.id] ?? 0;
      const activeMarch = visualMarches.some((march) => march.nodeId === node.id);
      const threat = nodeThreatLevel(node);
      const bookmarked = state.mapBookmarks.includes(node.id);
      const scouted = Boolean(state.scoutReports[node.id]);
      return `
        <button class="node map-node threat-${threat.id} ${selectedNode === node.id ? "active" : ""} ${cleared ? "cleared" : ""} ${activeMarch ? "marching" : ""} ${bookmarked ? "bookmarked" : ""} ${scouted ? "scouted" : ""}" type="button" data-node="${node.id}" data-node-type="${node.type}" style="--x: ${node.x ?? 50}%; --y: ${node.y ?? 50}%">
          <span class="node-aura"></span>
          <span class="node-icon">${nodeIcon(node)}</span>
          <span class="node-level">${node.level ?? 1}</span>
          <span class="node-threat">${threat.label}</span>
          ${bookmarked ? `<span class="node-bookmark">Fav</span>` : ""}
          ${scouted ? `<span class="node-scouted">Scout</span>` : ""}
          <span class="node-copy">
            <strong>[${node.guild ?? "NPC"}] ${node.name}</strong>
            <span>${cleared ? `Respawn ${formatTime(respawnAt - now)}` : `${nodeTypeLabel(node.type)} - ${formatNumber(node.power)} PWR`}</span>
            <small>X:${nodeCoords(node).x} Y:${nodeCoords(node).y} - ${nodeDistance(node).toFixed(1)} mi</small>
          </span>
        </button>
      `;
    }).join("")}
      <nav class="world-bottom-nav" aria-label="Navigation monde">
        ${worldBottomActions().map((action) => `
          <button type="button" data-world-shortcut="${action.id}">
            ${action.badge ? `<em>${action.badge}</em>` : ""}
            <span>${action.mark}</span>
            <strong>${action.label}</strong>
          </button>
        `).join("")}
      </nav>
    </div>
  `;

  elements.mapGrid.querySelectorAll("[data-node]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedNode = button.dataset.node;
      attackPrep = null;
      render();
    });
  });
  elements.mapGrid.querySelectorAll("[data-map-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedMapFilter = button.dataset.mapFilter;
      render();
    });
  });
  elements.mapGrid.querySelectorAll("[data-mini-node]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedNode = button.dataset.miniNode;
      attackPrep = null;
      render();
    });
  });
  elements.mapGrid.querySelectorAll("[data-march-node]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedNode = button.dataset.marchNode;
      attackPrep = null;
      render();
    });
  });
  elements.mapGrid.querySelectorAll("[data-world-shortcut]").forEach((button) => {
    button.addEventListener("click", () => handleWorldShortcut(button.dataset.worldShortcut));
  });
  elements.mapGrid.querySelectorAll("[data-map-zoom]").forEach((button) => {
    button.addEventListener("click", () => updateWorldZoom(button.dataset.mapZoom));
  });

  renderNodeDetails();
  renderMarches();
}

function renderNodeDetails() {
  const node = getNode(selectedNode);
  const now = Date.now();
  const cleared = isNodeCleared(node.id, now);
  const respawnAt = state.nodeRespawns?.[node.id] ?? now;
  const formation = getFormation();
  const enemyFormation = getFormation(node.enemyFormation);
  const tactical = formationMultiplier(formation.id, node.enemyFormation);
  const rallyActive = Date.now() < (state.guild.rallyReadyAt ?? 0);
  const threat = nodeThreatLevel(node);
  const scout = state.scoutReports[node.id];
  const recommendedFormation = recommendedFormationForNode(node);
  const bookmarked = state.mapBookmarks.includes(node.id);
  const isResource = node.type === "resource";
  const troopsNeeded = node.troopsNeeded ?? Math.max(12, (node.level ?? 1) * 5);
  const harvestTime = harvestDurationMs(node);
  elements.selectedNodeName.textContent = node.name;
  elements.nodeDetails.innerHTML = `
    <article class="node-card">
      <div class="detail-row"><span>Type</span><strong>${nodeTypeLabel(node.type)} niv. ${node.level ?? 1}</strong></div>
      <div class="detail-row"><span>Coordonnees</span><strong>X:${nodeCoords(node).x} Y:${nodeCoords(node).y}</strong></div>
      <div class="detail-row"><span>Distance</span><strong>${nodeDistance(node).toFixed(1)} mi</strong></div>
      <div class="detail-row"><span>Menace</span><strong>${threat.label}</strong></div>
      <div class="detail-row"><span>${isResource ? "Garde locale" : "Puissance ennemie"}</span><strong>${formatNumber(node.power)}</strong></div>
      <div class="detail-row"><span>Ta puissance</span><strong>${formatNumber(armyPower())}</strong></div>
      ${isResource ? `
        <div class="detail-row"><span>Disponible</span><strong>${rewardText(node.reward)}</strong></div>
        <div class="detail-row"><span>Temps de recolte</span><strong>${formatTime(harvestTime)}</strong></div>
        <div class="detail-row"><span>Troupes requises</span><strong>${formatNumber(troopsNeeded)}</strong></div>
      ` : `
        <div class="detail-row"><span>Formation ennemie</span><strong>${enemyFormation.name}</strong></div>
        <div class="detail-row"><span>Formation conseillee</span><strong>${recommendedFormation.name}</strong></div>
        <div class="detail-row"><span>Avantage tactique</span><strong>${Math.round(tactical * 100)}%</strong></div>
        <div class="detail-row"><span>Cout</span><strong>10 Energie</strong></div>
      `}
      ${cleared ? `<div class="detail-row"><span>${isResource ? "Retour ressource" : "Retour des ennemis"}</span><strong>${formatTime(respawnAt - now)}</strong></div>` : ""}
      <p class="muted">${isResource ? "Recolte possible" : "Butin possible"}: ${rewardText(node.reward)}</p>
      <p class="map-advice">${nodeStrategyText(node)}</p>
      ${!isResource && scout ? `
        <div class="scout-report">
          <strong>Rapport eclaireur</strong>
          <span>Menace ${scout.threat} - pertes ${scout.losses}</span>
          <span>Formation ennemie: ${scout.enemyFormation ?? enemyFormation.name}</span>
          <span>Dominante: ${scout.dominant ?? "Non identifiee"}</span>
          <span>Faiblesse: ${scout.weakness ?? scout.formation}</span>
          <span>Piege probable: ${scout.trap ?? "Aucun signe clair"}</span>
          <span>Butin: ${scout.lootQuality ?? "Standard"} - ${scout.reward}</span>
          <em>${scout.advice ?? `Formation conseillee: ${scout.formation}`}</em>
        </div>
      ` : ""}
      <div class="map-actions">
        <button class="mini-button" type="button" id="bookmarkBtn">${bookmarked ? "Retirer favori" : "Marquer favori"}</button>
        ${isResource ? `<button class="mini-button" type="button" id="infoBtn">Info</button>` : `<button class="mini-button" type="button" id="scoutBtn">Eclairer - 4 Energie</button>`}
      </div>
      ${isResource ? `
        <button class="primary" type="button" id="harvestBtn" ${cleared ? "disabled" : ""}>
          ${cleared ? "Ressource en recharge" : "Preparer la recolte"}
        </button>
        ${attackPrep?.nodeId === node.id && attackPrep?.mode === "harvest" ? renderHarvestPreparationPanel(node) : ""}
      ` : `
        <button class="primary" type="button" id="attackBtn" ${cleared ? "disabled" : ""}>
          ${cleared ? "Zone en recharge" : "Preparer l'attaque"}
        </button>
        <button class="mini-button" type="button" id="rallyBtn" ${cleared || !rallyActive ? "disabled" : ""}>
          ${rallyActive ? "Preparer rally de guilde" : "Rally non prepare"}
        </button>
        ${attackPrep?.nodeId === node.id ? renderAttackPreparationPanel(node) : ""}
      `}
    </article>
  `;
  $("#bookmarkBtn").addEventListener("click", () => toggleMapBookmark(node.id));
  if (isResource) {
    $("#infoBtn")?.addEventListener("click", () => showToast(`${node.name}: ${rewardText(node.reward)}, ${formatNumber(troopsNeeded)} troupes, ${formatTime(harvestTime)}.`));
    $("#harvestBtn")?.addEventListener("click", () => openHarvestPreparation(node.id));
  } else {
    $("#scoutBtn").addEventListener("click", () => scoutNode(node.id));
    $("#attackBtn").addEventListener("click", () => openAttackPreparation(node.id));
    $("#rallyBtn").addEventListener("click", () => openAttackPreparation(node.id, true));
  }
  elements.nodeDetails.querySelectorAll("[data-prep-unit]").forEach((button) => {
    button.addEventListener("click", () => updatePreparedUnit(button.dataset.prepUnit, button.dataset.prepAction));
  });
  elements.nodeDetails.querySelectorAll("[data-prep-formation]").forEach((button) => {
    button.addEventListener("click", () => applyPreparedFormation(button.dataset.prepFormation));
  });
  elements.nodeDetails.querySelector("[data-prep-recommended]")?.addEventListener("click", () => applyPreparedFormation(recommendedFormation.id));
  elements.nodeDetails.querySelectorAll("[data-prep-hero]").forEach((button) => {
    button.addEventListener("click", () => togglePreparedHero(button.dataset.prepHero));
  });
  elements.nodeDetails.querySelector("[data-prep-african-power]")?.addEventListener("click", activatePreparedAfricanPowerLineup);
  elements.nodeDetails.querySelector("[data-harvest-fill]")?.addEventListener("click", () => optimizeHarvestEscort(node.id));
  elements.nodeDetails.querySelector("[data-prep-cancel]")?.addEventListener("click", closeAttackPreparation);
  elements.nodeDetails.querySelector("[data-prep-confirm]")?.addEventListener("click", confirmPreparedAttack);
  renderBattleReport();
}

function renderPreparedHeroSelector(prep, actionButton = "") {
  const lineup = normalizeHeroLineup(prep.lineup);
  const unlocked = HEROES.filter((hero) => heroUnlocked(hero.id));
  return `
    <div class="prep-heroes manual-hero-picker">
      <div class="prep-hero-header">
        <div>
          <strong>Commandants envoyes</strong>
          <small>${lineup.length}/5 selectionnes - ${heroNames(lineup)}</small>
        </div>
        ${actionButton}
      </div>
      <div class="prep-hero-roster">
        ${unlocked.map((hero) => {
          const progress = state.heroes[hero.id] ?? { level: 1 };
          const selected = lineup.includes(hero.id);
          return `
            <button class="${selected ? "selected" : ""}" type="button" data-prep-hero="${hero.id}" style="--hero-color: ${hero.color}; --hero-dark: ${hero.dark}; --hero-accent: ${hero.accent ?? hero.color}">
              ${hero.art ? `<img src="${hero.art}" alt="${hero.name}" />` : `<span>${hero.classMark}</span>`}
              <span>
                <strong>${hero.name}</strong>
                <small>Niv. ${progress.level ?? 1} - ${formatNumber(heroPower(hero.id))}</small>
              </span>
              <em>${selected ? "Envoye" : "Ajouter"}</em>
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderHarvestPreparationPanel(node) {
  const prep = attackPrep ?? { units: currentUnitSnapshot(), mode: "harvest" };
  const units = clampUnitSnapshot(prep.units);
  const lineup = normalizeHeroLineup(prep.lineup);
  const selectedCount = totalUnitsInSnapshot(units);
  const troopsNeeded = node.troopsNeeded ?? Math.max(12, (node.level ?? 1) * 5);
  const ready = selectedCount >= troopsNeeded;
  const travel = harvestDurationMs(node, lineup);
  const returnTravel = harvestReturnMs(node, lineup);
  const heroBonus = harvestHeroBonus(lineup);
  const yieldBonus = districtBonus("production") + (state.research.logistics ?? 0) * 0.04 + heroBonus.yield;
  const projectedReward = projectedHarvestReward(node, lineup);
  const escortPower = UNITS.reduce((sum, unit) => sum + (units[unit.id] ?? 0) * unit.power, 0);
  return `
    <section class="attack-prep harvest-prep war-room-modal" role="dialog" aria-modal="true" aria-label="Chambre de guerre - recolte">
      <div class="attack-prep-head">
        <div>
          <span class="eyebrow">Convoi de recolte</span>
          <h3>Chambre de guerre</h3>
        </div>
        <strong>${ready ? "Pret" : `${formatNumber(selectedCount)} / ${formatNumber(troopsNeeded)}`}</strong>
        <button class="war-room-close" type="button" data-prep-cancel>Fermer</button>
      </div>
      <div class="prep-kpis">
        <span><small>Escorte</small><strong>${formatNumber(selectedCount)}</strong></span>
        <span><small>Requis</small><strong>${formatNumber(troopsNeeded)}</strong></span>
        <span><small>Duree</small><strong>${formatTime(travel)}</strong></span>
        <span><small>Butin</small><strong>${rewardText(projectedReward)}</strong></span>
      </div>
      <div class="prep-intel harvest-intel">
        <span><small>Puissance escorte</small><strong>${formatNumber(escortPower)}</strong></span>
        <span><small>Bonus recolte</small><strong>+${Math.round(yieldBonus * 100)}%</strong></span>
        <span><small>Retour</small><strong>${formatTime(returnTravel)}</strong></span>
        <span><small>Chance rare</small><strong>${Math.round((0.04 + (node.level ?? 1) * 0.006 + heroBonus.rare) * 100)}%</strong></span>
        <span><small>Garde locale</small><strong>${formatNumber(node.power)}</strong></span>
        <p>${heroBonus.labels.length ? heroBonus.labels.slice(0, 3).join(" - ") : "Ajoute des heros specialises pour accelerer le convoi et augmenter le butin."}</p>
      </div>
      ${renderPreparedHeroSelector(prep, `<button class="mini-button" type="button" data-harvest-fill>Escorte optimale</button>`)}
      <div class="prep-units">
        ${UNITS.map((unit) => {
          const owned = state.units[unit.id] ?? 0;
          const amount = units[unit.id] ?? 0;
          return `
            <div class="prep-unit">
              <span class="unit-mark" data-unit="${unit.id}">${UNIT_MARKS[unit.id] ?? unit.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>${unit.name}</strong>
                <small>${formatNumber(amount)} / ${formatNumber(owned)} en escorte - charge ${formatNumber(amount * unit.power)}</small>
              </div>
              <div class="prep-unit-actions">
                <button type="button" data-prep-unit="${unit.id}" data-prep-action="minus" ${amount <= 0 ? "disabled" : ""}>-</button>
                <button type="button" data-prep-unit="${unit.id}" data-prep-action="plus" ${amount >= owned ? "disabled" : ""}>+</button>
                <button type="button" data-prep-unit="${unit.id}" data-prep-action="max" ${amount >= owned ? "disabled" : ""}>Max</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <p class="prep-warning">${ready ? `Convoi pret: ${rewardText(projectedReward)} apres ${formatTime(travel)} + retour ${formatTime(returnTravel)}.` : `Ajoute encore ${formatNumber(troopsNeeded - selectedCount)} troupes dans l'escorte.`}</p>
      <div class="prep-actions">
        <button class="mini-button" type="button" data-prep-cancel>Annuler</button>
        <button class="primary" type="button" data-prep-confirm ${!ready ? "disabled" : ""}>Lancer la recolte</button>
      </div>
    </section>
  `;
}

function renderAttackPreparationPanel(node) {
  const prep = attackPrep ?? { units: currentUnitSnapshot(), rally: false };
  const units = clampUnitSnapshot(prep.units);
  const lineup = normalizeHeroLineup(prep.lineup);
  const selectedCount = totalUnitsInSnapshot(units);
  const power = battlePowerAgainst(node, units, prep.rally, lineup);
  const ratio = power / Math.max(1, node.power);
  const lossRate = estimateLossRate(node, units, prep.rally, lineup);
  const totalExpectedLosses = Math.floor(selectedCount * lossRate);
  const formation = getFormation();
  const recommended = recommendedFormationForNode(node);
  const travel = marchTravelMs(node);
  const risk = ratio >= 1.25 ? "Avantage net" : ratio >= 1 ? "Jouable" : ratio >= 0.75 ? "Risque eleve" : "Danger critique";
  const scout = state.scoutReports[node.id];
  return `
    <section class="attack-prep war-room-modal" role="dialog" aria-modal="true" aria-label="Chambre de guerre - attaque">
      <div class="attack-prep-head">
        <div>
          <span class="eyebrow">${prep.rally ? "Rally de guilde" : "Attaque solo"}</span>
          <h3>Chambre de guerre</h3>
        </div>
        <strong>${risk}</strong>
        <button class="war-room-close" type="button" data-prep-cancel>Fermer</button>
      </div>
      <div class="prep-kpis">
        <span><small>Puissance</small><strong>${formatNumber(power)}</strong></span>
        <span><small>Ennemi</small><strong>${formatNumber(node.power)}</strong></span>
        <span><small>Marche</small><strong>${formatTime(travel)}</strong></span>
        <span><small>Pertes prevues</small><strong>${formatNumber(totalExpectedLosses)}</strong></span>
      </div>
      ${scout ? `
        <div class="prep-intel">
          <span><small>Dominante</small><strong>${scout.dominant ?? "Inconnue"}</strong></span>
          <span><small>Faiblesse</small><strong>${scout.weakness ?? recommended.name}</strong></span>
          <span><small>Piege</small><strong>${scout.trap ?? "Non confirme"}</strong></span>
          <p>${scout.advice ?? nodeStrategyText(node)}</p>
        </div>
      ` : `
        <div class="prep-intel muted-intel">
          <p>Envoie un eclaireur pour reveler dominante ennemie, faiblesse, pieges et qualite du butin.</p>
        </div>
      `}
      <div class="prep-formation">
        <div>
          <strong>${formation.name}</strong>
          <span>Conseillee: ${recommended.name}${scout ? ` - scout: pertes ${scout.losses}` : ""}</span>
        </div>
        <button class="mini-button" type="button" data-prep-recommended ${formation.id === recommended.id ? "disabled" : ""}>Optimiser</button>
      </div>
      ${renderPreparedHeroSelector({ ...prep, lineup }, `<button class="mini-button" type="button" data-prep-african-power>Set African Power</button>`)}
      <div class="prep-formation-list">
        ${FORMATIONS.map((item) => `
          <button class="${state.selectedFormation === item.id ? "active" : ""}" type="button" data-prep-formation="${item.id}">
            <strong>${FORMATION_MARKS[item.id] ?? item.name.slice(0, 2).toUpperCase()}</strong>
            <span>${item.name}</span>
          </button>
        `).join("")}
      </div>
      <div class="prep-units">
        ${UNITS.map((unit) => {
          const owned = state.units[unit.id] ?? 0;
          const amount = units[unit.id] ?? 0;
          const expected = Math.min(amount, Math.floor(amount * lossRate));
          return `
            <div class="prep-unit">
              <span class="unit-mark" data-unit="${unit.id}">${UNIT_MARKS[unit.id] ?? unit.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>${unit.name}</strong>
                <small>${formatNumber(amount)} / ${formatNumber(owned)} envoyes - pertes ~${formatNumber(expected)}</small>
              </div>
              <div class="prep-unit-actions">
                <button type="button" data-prep-unit="${unit.id}" data-prep-action="minus" ${amount <= 0 ? "disabled" : ""}>-</button>
                <button type="button" data-prep-unit="${unit.id}" data-prep-action="plus" ${amount >= owned ? "disabled" : ""}>+</button>
                <button type="button" data-prep-unit="${unit.id}" data-prep-action="max" ${amount >= owned ? "disabled" : ""}>Max</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <p class="prep-warning">${selectedCount <= 0 ? "Selectionne au moins une troupe." : nodeStrategyText(node)}</p>
      <div class="prep-actions">
        <button class="mini-button" type="button" data-prep-cancel>Annuler</button>
        <button class="primary" type="button" data-prep-confirm ${selectedCount <= 0 ? "disabled" : ""}>Confirmer le depart</button>
      </div>
    </section>
  `;
}

function renderBattleReport() {
  const report = state.battleReports[0];
  if (!report) {
    elements.battleReport.innerHTML = `<div class="node-card muted">Aucun rapport de bataille.</div>`;
    return;
  }
  elements.battleReport.innerHTML = `
    <article class="node-card battle-report">
      <div class="card-top">
        <div>
          <h3>${report.victory ? "Victoire" : "Defaite"} - ${report.node}</h3>
          <p>${report.formation} vs ${report.enemyFormation}</p>
        </div>
        <strong>${formatNumber(report.attackPower)} / ${formatNumber(report.enemyPower)}</strong>
      </div>
      <div class="battle-breakdown">
        <span>Force armee ${formatNumber(report.rawPower ?? report.attackPower)}</span>
        <span>Impact heros +${formatNumber(report.skillPower ?? 0)}</span>
        <span>Brise-armure ${Math.round((report.armorBreak ?? 0) * 100)}%</span>
        <span>Protection ${Math.round((report.mitigation ?? 0) * 100)}%</span>
        ${report.africanPowerTier ? `<span>Set ${report.africanPowerTier}</span>` : ""}
      </div>
      ${report.heroStrikes?.length ? `
        <div class="skill-list">
          ${report.heroStrikes.map((strike) => `
            <div class="skill-row ${strike.critical ? "critical" : ""}">
              <span><strong>${strike.hero}</strong><small>${strike.action} sur ${strike.target}</small></span>
              <strong>${strike.critical ? "CRIT " : ""}${formatNumber(strike.damage)} ${strike.damageType}</strong>
            </div>
          `).join("")}
        </div>
      ` : ""}
      ${report.xpUpdates?.length ? `
        <div class="xp-report">
          <strong>Experience +${formatNumber(report.xpGained ?? 0)}</strong>
          ${report.xpUpdates.map((update) => `
            <span>${update.hero}: +${formatNumber(update.xp)} XP${update.level > update.oldLevel ? ` - niveau ${update.level}` : ""}${update.milestones?.length ? ` - palier ${update.milestones.join(", ")}` : ""}</span>
          `).join("")}
        </div>
      ` : ""}
      ${report.recommendations?.length ? `
        <div class="battle-advice-list">
          <strong>Conseils tactiques</strong>
          ${report.recommendations.map((item) => `<span>${item}</span>`).join("")}
        </div>
      ` : ""}
      <p class="muted">Pertes: ${UNITS.map((unit) => `${unit.name} ${report.losses?.[unit.id] ?? 0}`).join(", ")}</p>
    </article>
  `;
}

function renderMarches() {
  const activeMarches = [...state.marches, ...(state.returnMarches ?? [])];
  if (activeMarches.length === 0) {
    elements.marchList.innerHTML = `<div class="march-card muted">Aucune expedition active.</div>`;
    return;
  }

  elements.marchList.innerHTML = activeMarches.map((march) => `
    <div class="march-card">
      <div class="card-top">
        <strong>${march.returning ? "Retour convoi" : march.mode === "harvest" ? "Recolte" : march.rally ? "Rally" : "Marche"} - ${getNode(march.nodeId)?.name ?? "Cible"}</strong>
        <span>${formatTime(march.readyAt - Date.now())}</span>
      </div>
      <div class="progress"><span style="--progress: ${marchProgress(march)}%"></span></div>
    </div>
  `).join("");
}

function marchProgress(march) {
  const startedAt = march.startedAt ?? Date.now();
  const total = Math.max(1, march.readyAt - startedAt);
  return Math.min(100, Math.max(0, ((Date.now() - startedAt) / total) * 100));
}

function renderAlliance() {
  const rallyActive = Date.now() < (state.guild.rallyReadyAt ?? 0);
  const cloudReady = cloudConfig.provider === "supabase" && cloudProviderReady();
  const connected = Boolean(authUser()?.id);
  const cloudMembers = state.guild.cloudMembers?.length ? state.guild.cloudMembers : [];
  const shownMembers = cloudMembers.length ? cloudMembers : GUILD_MEMBERS;
  const guildRows = state.guild.leaderboard?.length ? state.guild.leaderboard : [];
  elements.guildPanel.innerHTML = `
    <article class="system-card">
      <div class="card-top">
        <div>
          <span class="eyebrow">${state.guild.id ? "Guilde cloud" : "Alliance"}</span>
          <h3>[${escapeHtml(state.guild.tag ?? "HDH")}] ${escapeHtml(state.guild.name)}</h3>
          <p class="muted">Rang ${escapeHtml(state.guild.rank)} - Role ${escapeHtml(state.guild.role ?? "member")} - Score saison ${formatNumber(state.guild.score)}</p>
        </div>
        <strong>${rallyActive ? formatTime(state.guild.rallyReadyAt - Date.now()) : "Rally ferme"}</strong>
      </div>
      <div class="guild-cloud-status ${cloudReady && connected ? "online" : ""}">
        <span>${cloudReady ? "Supabase pret" : "Supabase non configure"}</span>
        <span>${connected ? "Compte connecte" : "Connexion requise"}</span>
        <span>${state.guild.id ? "Guilde reelle active" : "Mode local/simule"}</span>
      </div>
      <div class="guild-actions">
        <button class="primary" type="button" data-guild-help>Aide de guilde (${state.guild.helps})</button>
        <button class="mini-button" type="button" data-rally>Preparer rally</button>
        <button class="mini-button" type="button" data-guild-refresh>Actualiser cloud</button>
        ${state.guild.id ? `<button class="mini-button" type="button" data-guild-leave>Quitter</button>` : ""}
      </div>
      ${!state.guild.id ? `
        <form class="guild-form" data-guild-create>
          <input type="text" name="guildName" placeholder="Nom de guilde" maxlength="42" required />
          <input type="text" name="guildTag" placeholder="TAG" maxlength="4" />
          <button class="mini-button" type="submit">Creer guilde</button>
        </form>
      ` : ""}
      ${state.guild.id && canManageGuild() ? `
        <form class="guild-form" data-guild-invite>
          <input type="email" name="inviteEmail" placeholder="Email du joueur a inviter" required />
          <button class="mini-button" type="submit">Inviter</button>
        </form>
      ` : ""}
      <div class="member-list">
        ${shownMembers.map((member) => `
          <div class="member-row">
            <span><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.rank)} - ${escapeHtml(member.status)}${member.contribution ? ` - ${formatNumber(member.contribution)} pts` : ""}</small></span>
            <strong>${formatNumber(member.power)}</strong>
            ${state.guild.role === "leader" && member.userId && member.userId !== authUser()?.id && member.role !== "officer" ? `<button class="mini-button" type="button" data-guild-promote="${escapeHtml(member.userId)}">R4</button>` : ""}
          </div>
        `).join("")}
      </div>
      ${state.guild.invites?.length ? `
        <div class="guild-invites">
          <strong>Invitations en attente</strong>
          ${state.guild.invites.map((invite) => `<span>${escapeHtml(invite.invited_email)} - ${escapeHtml(invite.status)}</span>`).join("")}
        </div>
      ` : ""}
    </article>
    <article class="system-card">
      <h3>Guildes disponibles</h3>
      ${guildRows.length ? guildRows.slice(0, 6).map((guild) => `
        <div class="member-row">
          <span><strong>[${escapeHtml(guild.tag)}] ${escapeHtml(guild.name)}</strong><small>${formatNumber(guild.memberCount)} membres - score ${formatNumber(guild.score)}</small></span>
          <strong>${formatNumber(guild.power)}</strong>
          ${guild.id !== state.guild.id && guild.isOpen ? `<button class="mini-button" type="button" data-guild-join="${escapeHtml(guild.id)}">Rejoindre</button>` : ""}
        </div>
      `).join("") : `<p class="muted">Connecte Supabase pour charger les guildes reelles du royaume.</p>`}
    </article>
  `;
  elements.guildPanel.querySelector("[data-guild-help]").addEventListener("click", requestGuildHelp);
  elements.guildPanel.querySelector("[data-rally]").addEventListener("click", prepareRally);
  elements.guildPanel.querySelector("[data-guild-refresh]")?.addEventListener("click", refreshCloudGuilds);
  elements.guildPanel.querySelector("[data-guild-leave]")?.addEventListener("click", leaveCloudGuild);
  elements.guildPanel.querySelector("[data-guild-create]")?.addEventListener("submit", createCloudGuild);
  elements.guildPanel.querySelector("[data-guild-invite]")?.addEventListener("submit", inviteCloudGuildMember);
  elements.guildPanel.querySelectorAll("[data-guild-join]").forEach((button) => {
    button.addEventListener("click", () => joinCloudGuild(button.dataset.guildJoin));
  });
  elements.guildPanel.querySelectorAll("[data-guild-promote]").forEach((button) => {
    button.addEventListener("click", () => promoteCloudGuildMember(button.dataset.guildPromote));
  });

  elements.chatPanel.innerHTML = `
    <div class="chat-list">
      ${state.chat.map((message) => `<div class="chat-line ${message.kind === "report" ? "shared-report" : ""}"><strong>${escapeHtml(message.from)}</strong><span>${escapeHtml(message.text)}</span></div>`).join("")}
    </div>
  `;
  const playerEntry = { name: "Toi", guild: state.guild.tag ?? "HDH", power: kingdomPower() + state.guild.score };
  const rows = [...state.leaderboard, playerEntry].sort((a, b) => b.power - a.power).slice(0, 6);
  elements.leaderboardPanel.innerHTML = `
    <article class="system-card">
      <h3>Classement royaume</h3>
      ${rows.map((row, index) => `
        <div class="member-row ${row.name === "Toi" ? "highlight" : ""}">
          <span><strong>#${index + 1} ${escapeHtml(row.name)}</strong><small>${escapeHtml(row.guild)}</small></span>
          <strong>${formatNumber(row.power)}</strong>
        </div>
      `).join("")}
    </article>
    <article class="system-card">
      <h3>Classement alliances</h3>
      ${(state.guild.leaderboard ?? []).slice(0, 6).map((guild, index) => `
        <div class="member-row ${guild.id === state.guild.id ? "highlight" : ""}">
          <span><strong>#${index + 1} [${escapeHtml(guild.tag)}] ${escapeHtml(guild.name)}</strong><small>${formatNumber(guild.memberCount)} membres</small></span>
          <strong>${formatNumber(guild.power)}</strong>
        </div>
      `).join("") || `<p class="muted">Classement cloud disponible apres connexion Supabase.</p>`}
    </article>
  `;
}

function renderEvents() {
  const cycle = eventCycleInfo();
  const activeId = cycle.event.id;
  elements.eventPanel.innerHTML = `
    <div class="event-grid">
      ${LIVE_EVENTS.map((event) => {
        const progress = eventProgress(event.id);
        const pct = Math.min(100, (progress / event.goal) * 100);
        const claimed = state.claimedEvents.includes(eventClaimKey(event.id));
        const isActive = event.id === activeId;
        return `
          <article class="event-card ${isActive ? "active-event" : ""}">
            <span class="eyebrow">${event.tag}${isActive ? " - actif" : ""}</span>
            <h3>${event.name}</h3>
            <p>${event.description}</p>
            <div class="progress"><span style="--progress: ${pct}%"></span></div>
            <div class="detail-row"><span>Progression</span><strong>${formatNumber(progress)} / ${formatNumber(event.goal)}</strong></div>
            ${isActive ? `<div class="detail-row"><span>Temps restant</span><strong>${formatTime(cycle.endsAt - Date.now())}</strong></div>` : ""}
            <p class="muted">Recompense: ${rewardText(event.reward)}</p>
            <button class="primary" type="button" data-claim-event="${event.id}" ${claimed || progress < event.goal ? "disabled" : ""}>
              ${claimed ? "Reclame" : "Reclamer"}
            </button>
          </article>
        `;
      }).join("")}
    </div>
    <button class="mini-button" type="button" data-daily>Recompense quotidienne</button>
  `;
  elements.eventPanel.querySelector("[data-daily]").addEventListener("click", claimDailyReward);
  elements.eventPanel.querySelectorAll("[data-claim-event]").forEach((button) => {
    button.addEventListener("click", () => claimEventReward(button.dataset.claimEvent));
  });

  elements.inboxPanel.innerHTML = `
    <div class="inbox-list">
      ${state.inbox.map((message) => `
        <article class="message-card ${message.claimed ? "claimed" : ""}">
          <h3>${message.title}</h3>
          <p>${message.body}</p>
          ${message.reward ? `<p class="muted">${rewardText(message.reward)}</p>` : ""}
          ${message.reward ? `<button class="mini-button" type="button" data-inbox="${message.id}" ${message.claimed ? "disabled" : ""}>${message.claimed ? "Pris" : "Reclamer"}</button>` : ""}
        </article>
      `).join("")}
    </div>
  `;
  elements.inboxPanel.querySelectorAll("[data-inbox]").forEach((button) => {
    button.addEventListener("click", () => claimInboxReward(button.dataset.inbox));
  });
}

function renderShop() {
  const helioraxClaimed = state.redeemedCodes?.includes("heliorax");
  elements.shopPanel.innerHTML = `
    <article class="gift-code-card ${helioraxClaimed ? "claimed" : ""}">
      <div>
        <span class="eyebrow">Code royal</span>
        <h3>Pack Heliorax</h3>
        <p>Entre un code cadeau pour recevoir instantanement des ressources premium.</p>
      </div>
      <form class="gift-code-form" data-gift-code-form>
        <label class="sr-only" for="giftCodeInput">Code cadeau</label>
        <input id="giftCodeInput" type="text" name="giftCode" value="heliorax" placeholder="Ex: heliorax" autocomplete="off" ${helioraxClaimed ? "disabled" : ""} />
        <button class="primary" type="submit" ${helioraxClaimed ? "disabled" : ""}>${helioraxClaimed ? "Code utilise" : "Activer"}</button>
      </form>
      <button class="mini-button gift-code-shortcut" type="button" data-redeem-code="heliorax" ${helioraxClaimed ? "disabled" : ""}>
        ${helioraxClaimed ? "Pack deja reclame" : "Utiliser heliorax"}
      </button>
      <div class="gift-code-reward">
        <span>5000 Gemmes</span>
        <span>5000 Jetons</span>
        <span>5000 Energie</span>
      </div>
    </article>
    <div class="shop-grid">
      ${SHOP_ITEMS.map((item) => {
        const owned = state.cosmetics.includes(item.id);
        const equipped = state.activeSkins[item.type] === item.id;
        return `
          <article class="shop-card">
            <span class="eyebrow">${item.type}</span>
            <h3>${item.name}</h3>
            <p>${item.bonus}</p>
            <div class="detail-row"><span>Prix</span><strong>${item.price ? `${item.price} Gemmes` : "Gratuit"}</strong></div>
            <button class="primary" type="button" data-shop="${item.id}" ${owned ? "disabled" : ""}>${owned ? "Possede" : "Acheter"}</button>
            ${owned && item.type in state.activeSkins ? `<button class="mini-button" type="button" data-equip="${item.id}">${equipped ? "Desactiver" : "Equiper"}</button>` : ""}
          </article>
        `;
      }).join("")}
    </div>
  `;
  elements.shopPanel.querySelector("[data-gift-code-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    redeemRewardCode(new FormData(event.currentTarget).get("giftCode") ?? "");
  });
  elements.shopPanel.querySelectorAll("[data-redeem-code]").forEach((button) => {
    button.addEventListener("click", () => redeemRewardCode(button.dataset.redeemCode ?? ""));
  });
  elements.shopPanel.querySelectorAll("[data-shop]").forEach((button) => {
    button.addEventListener("click", () => buyShopItem(button.dataset.shop));
  });
  elements.shopPanel.querySelectorAll("[data-equip]").forEach((button) => {
    button.addEventListener("click", () => equipSkin(button.dataset.equip));
  });

  elements.progressionPanel.innerHTML = `
    <div class="progression-stack">
      <article class="system-card">
        <h3>Recherches</h3>
        ${RESEARCH.map((item) => {
          const level = researchLevel(item.id);
          const cost = researchCost(item, level);
          return `
            <div class="research-row">
              <span><strong>${item.name}</strong><small>Niv. ${level}/${item.max} - ${item.bonus}</small></span>
              <button class="mini-button" type="button" data-research="${item.id}" ${level >= item.max || !canAfford(cost) ? "disabled" : ""}>${level >= item.max ? "Max" : "Etudier"}</button>
            </div>
          `;
        }).join("")}
      </article>
      <article class="system-card">
        <h3>Artefacts</h3>
        ${ARTIFACTS.map((item) => `
          <div class="research-row">
            <span><strong>${item.name}</strong><small>${item.bonus} - ${formatCosts(artifactCost(item))}</small></span>
            <button class="mini-button" type="button" data-artifact="${item.id}" ${state.artifacts.includes(item.id) || !canAfford(artifactCost(item)) ? "disabled" : ""}>${state.artifacts.includes(item.id) ? "Forge" : "Forger"}</button>
          </div>
        `).join("")}
      </article>
    </div>
  `;
  elements.progressionPanel.querySelectorAll("[data-research]").forEach((button) => {
    button.addEventListener("click", () => startResearch(button.dataset.research));
  });
  elements.progressionPanel.querySelectorAll("[data-artifact]").forEach((button) => {
    button.addEventListener("click", () => craftArtifact(button.dataset.artifact));
  });
}

function reportAge(createdAt) {
  if (!createdAt) {
    return "Date inconnue";
  }
  const elapsed = Date.now() - createdAt;
  if (elapsed < 60 * 1000) {
    return "A l'instant";
  }
  return `Il y a ${formatTime(elapsed)}`;
}

function unitLossSummary(losses = {}) {
  const total = Object.values(losses).reduce((sum, value) => sum + (value ?? 0), 0);
  if (total <= 0) {
    return "Aucune perte";
  }
  return UNITS
    .map((unit) => [unit.name, losses[unit.id] ?? 0])
    .filter(([, amount]) => amount > 0)
    .map(([name, amount]) => `${name} ${formatNumber(amount)}`)
    .join(", ");
}

function militaryReportEntries() {
  const battleEntries = (state.battleReports ?? []).map((report) => ({
    id: `battle-${report.id}`,
    type: "battle",
    tone: report.victory ? "victory" : "defeat",
    label: "Bataille",
    title: `${report.victory ? "Victoire" : "Defaite"} - ${report.node}`,
    subtitle: `${report.formation} vs ${report.enemyFormation}`,
    power: `${formatNumber(report.attackPower)} / ${formatNumber(report.enemyPower)}`,
    createdAt: report.createdAt,
    shareText: `${report.victory ? "Victoire" : "Defaite"} a ${report.node} | ${report.formation} vs ${report.enemyFormation} | Puissance ${formatNumber(report.attackPower)}/${formatNumber(report.enemyPower)} | Pertes: ${unitLossSummary(report.losses)}`,
    metrics: [
      ["XP", formatNumber(report.xpGained ?? 0)],
      ["Heros", formatNumber(report.skillPower ?? 0)],
      ["Pertes", unitLossSummary(report.losses)],
    ],
    advice: report.recommendations?.[0] ?? "Compare la formation, les pertes et les competences heros avant la prochaine marche.",
  }));

  const defenseEntries = (state.defenseReports ?? []).map((report) => ({
    id: `defense-${report.id}`,
    type: "defense",
    tone: report.blocked ? "blocked" : report.victory ? "victory" : "defeat",
    label: "Defense",
    title: `${report.blocked ? "Bouclier" : report.victory ? "Defense tenue" : "Defense percee"} - ${report.enemy}`,
    subtitle: report.enemyFormation ?? report.enemyNote ?? "Alerte de citadelle",
    power: `${formatNumber(report.defensePower)} / ${formatNumber(report.enemyPower)}`,
    createdAt: report.createdAt,
    shareText: `${report.blocked ? "Bouclier actif" : report.victory ? "Defense tenue" : "Defense percee"} contre ${report.enemy} | DEF ${formatNumber(report.defensePower)}/${formatNumber(report.enemyPower)} | Blesses ${formatNumber(report.wounded ?? 0)} | Pieges perdus ${formatNumber(report.destroyedTraps ?? 0)} | ${report.advice ?? ""}`,
    metrics: [
      ["Blesses", formatNumber(report.wounded ?? 0)],
      ["Pertes", formatNumber(report.permanentLosses ?? 0)],
      ["Pieges", formatNumber(report.destroyedTraps ?? 0)],
      ["Pillage", Object.keys(report.pillaged ?? {}).length ? rewardText(report.pillaged) : "Aucun"],
      ["Recompense", Object.keys(report.reward ?? {}).length ? rewardText(report.reward) : "Aucune"],
      ["Passifs", report.passives?.labels?.length ? report.passives.labels.join(", ") : "-"],
    ],
    advice: report.advice ?? "Renforce les remparts, la tour de guet, les pieges et les heros de rempart.",
  }));

  const scoutEntries = Object.entries(state.scoutReports ?? {}).map(([nodeId, scout]) => {
    const node = getNode(nodeId);
    return {
      id: `scout-${nodeId}-${scout.createdAt ?? 0}`,
      type: "scout",
      tone: "scout",
      label: "Eclaireur",
      title: node?.name ?? "Cible inconnue",
      subtitle: `${scout.threat} - ${scout.enemyFormation}`,
      power: formatNumber(scout.power ?? node?.power ?? 0),
      createdAt: scout.createdAt,
      shareText: `Scout ${node?.name ?? "cible"} | Menace ${scout.threat} | Ennemi ${scout.enemyFormation} | Faiblesse ${scout.weakness ?? "-"} | Pertes ${scout.losses ?? "-"} | Butin ${scout.reward ?? "-"}`,
      metrics: [
        ["Dominant", scout.dominant ?? "-"],
        ["Faiblesse", scout.weakness ?? "-"],
        ["Butin", scout.reward ?? "-"],
        ["Pertes", scout.losses ?? "-"],
      ],
      advice: scout.advice ?? "Utilise la formation conseillee avant d'envoyer la marche.",
      nodeId,
    };
  });

  const harvestEntries = (state.harvestReports ?? []).map((report) => {
    const bonusLabels = report.bonus?.labels ?? [];
    const rareText = Object.keys(report.rareReward ?? {}).length ? rewardText(report.rareReward) : "Aucun";
    const unitsText = UNITS
      .map((unit) => [unit.name, report.units?.[unit.id] ?? 0])
      .filter(([, amount]) => amount > 0)
      .map(([name, amount]) => `${name} ${formatNumber(amount)}`)
      .join(", ") || "Aucune troupe";
    return {
      id: `harvest-${report.id}`,
      type: "harvest",
      tone: "victory",
      label: "Recolte",
      title: `Convoi revenu - ${report.node}`,
      subtitle: `Niv. ${report.level ?? 1} - ${report.heroNames ?? heroNames(report.lineup ?? [])}`,
      power: rewardText(report.reward ?? {}),
      createdAt: report.createdAt,
      shareText: `Recolte a ${report.node} | Butin ${rewardText(report.reward ?? {})} | Heros ${report.heroNames ?? heroNames(report.lineup ?? [])} | Escorte ${formatNumber(report.escortPower ?? 0)} | Duree ${formatTime(report.duration ?? 0)} | Bonus ${bonusLabels.join(", ") || "standard"}`,
      metrics: [
        ["Butin", rewardText(report.reward ?? {})],
        ["Bonus rare", rareText],
        ["Duree totale", formatTime(report.duration ?? 0)],
        ["Recolte / retour", `${formatTime(report.harvestDuration ?? 0)} / ${formatTime(report.returnDuration ?? 0)}`],
        ["Heros", report.heroNames ?? heroNames(report.lineup ?? [])],
        ["Escorte", `${formatNumber(report.escortPower ?? 0)} - ${unitsText}`],
        ["Bonus", `+${Math.round((report.bonus?.yield ?? 0) * 100)}% butin, +${Math.round((report.bonus?.speed ?? 0) * 100)}% vitesse`],
      ],
      advice: bonusLabels.length
        ? `Synergies actives: ${bonusLabels.join(" - ")}. Relance ce type d'escouade sur les gisements rares.`
        : "Ajoute Saya, Oren, Lyra ou des heros premium pour augmenter rendement, vitesse et bonus rares.",
      nodeId: report.nodeId,
    };
  });

  return [...battleEntries, ...defenseEntries, ...scoutEntries, ...harvestEntries]
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

function shareMilitaryReport(reportId) {
  const entry = militaryReportEntries().find((item) => item.id === reportId);
  if (!entry) {
    showToast("Rapport introuvable.");
    return;
  }
  state.sharedReports ??= [];
  if (state.sharedReports.includes(reportId)) {
    showToast("Rapport deja partage a l'alliance.");
    return;
  }
  const prefix = entry.type === "defense" ? "[Defense]" : entry.type === "scout" ? "[Scout]" : entry.type === "harvest" ? "[Recolte]" : "[Bataille]";
  state.chat = [
    { from: "Toi", text: `${prefix} ${entry.shareText}`, kind: "report", createdAt: Date.now() },
    ...state.chat,
  ].slice(0, 14);
  state.sharedReports = [reportId, ...state.sharedReports].slice(0, 40);
  state.guild.score += entry.tone === "victory" || entry.tone === "blocked" ? 14 : 8;
  addLog(`Rapport partage a l'alliance: ${entry.title}.`);
  showToast("Rapport partage dans le chat d'alliance.");
  saveGame(false);
  render();
}

function reportInsightCards(entries) {
  const latestDefenseLoss = entries.find((entry) => entry.type === "defense" && entry.tone === "defeat");
  const latestBattleLoss = entries.find((entry) => entry.type === "battle" && entry.tone === "defeat");
  const scoutCount = entries.filter((entry) => entry.type === "scout").length;
  const trapRatio = trapCapacity() > 0 ? totalTrapCount() / trapCapacity() : 0;
  return [
    {
      title: "Citadelle",
      status: latestDefenseLoss ? "Priorite haute" : "Stable",
      body: latestDefenseLoss
        ? "Une defense a ete percee recemment. Monte les pieges, assigne des heros premium aux remparts et soigne les blesses."
        : `Defense actuelle ${formatNumber(citadelDefensePower())}. Continue a remplir les pieges pour absorber les prochains raids.`,
    },
    {
      title: "Carte",
      status: latestBattleLoss ? "A ajuster" : "En controle",
      body: latestBattleLoss
        ? "Une marche recente a echoue. Relis la formation ennemie et utilise l'ecran de preparation avant de confirmer."
        : "Les derniers combats ne signalent pas de defaite majeure. Profite des events pour farm les cibles scoutees.",
    },
    {
      title: "Renseignement",
      status: `${scoutCount} rapports`,
      body: scoutCount > 0
        ? "Les eclaireurs donnent les faiblesses et les pertes attendues. Garde les cibles elites scoutees avant les rally."
        : "Aucun rapport d'eclaireur. Scout les cibles puissantes avant d'envoyer des troupes couteuses.",
    },
    {
      title: "Pieges",
      status: `${Math.round(trapRatio * 100)}% remplis`,
      body: trapRatio < 0.5
        ? "La capacite de pieges est sous-utilisee. Construis balistes, runes et fosses avant la prochaine attaque."
        : "Les pieges commencent a peser dans la defense. Ameliore Remparts et Tour de guet pour augmenter la capacite.",
    },
  ];
}

function renderReports() {
  if (!elements.reportCenter || !elements.reportInsights) {
    return;
  }
  const entries = militaryReportEntries();
  const filters = [
    { id: "all", label: "Tous", count: entries.length },
    { id: "battle", label: "Batailles", count: entries.filter((entry) => entry.type === "battle").length },
    { id: "defense", label: "Defense", count: entries.filter((entry) => entry.type === "defense").length },
    { id: "scout", label: "Eclaireurs", count: entries.filter((entry) => entry.type === "scout").length },
  ];
  const visible = selectedReportFilter === "all" ? entries : entries.filter((entry) => entry.type === selectedReportFilter);

  elements.reportCenter.innerHTML = `
    <div class="report-toolbar">
      ${filters.map((filter) => `
        <button class="${selectedReportFilter === filter.id ? "active" : ""}" type="button" data-report-filter="${filter.id}">
          ${filter.label}<span>${formatNumber(filter.count)}</span>
        </button>
      `).join("")}
    </div>
    <div class="report-list">
      ${visible.length ? visible.map((entry) => `
        <article class="military-report-card ${entry.tone}">
          <div class="report-card-head">
            <span>${entry.label}</span>
            <small>${reportAge(entry.createdAt)}</small>
          </div>
          <div class="card-top">
            <div>
              <h3>${entry.title}</h3>
              <p>${entry.subtitle}</p>
            </div>
            <strong>${entry.power}</strong>
          </div>
          <div class="report-metrics">
            ${entry.metrics.map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`).join("")}
          </div>
          <p>${entry.advice}</p>
          <div class="report-actions">
            <button class="mini-button report-share-button" type="button" data-share-report="${entry.id}" ${(state.sharedReports ?? []).includes(entry.id) ? "disabled" : ""}>
              ${(state.sharedReports ?? []).includes(entry.id) ? "Deja partage" : "Partager alliance"}
            </button>
            ${entry.nodeId ? `<button class="mini-button" type="button" data-report-node="${entry.nodeId}">Voir sur carte</button>` : ""}
          </div>
        </article>
      `).join("") : `<article class="military-report-card empty"><strong>Aucun rapport</strong><p>Combat, scout ou raid de citadelle pour alimenter l'etat-major.</p></article>`}
    </div>
  `;

  elements.reportInsights.innerHTML = `
    <div class="insight-stack">
      ${reportInsightCards(entries).map((item) => `
        <article class="report-insight-card">
          <div class="card-top">
            <h3>${item.title}</h3>
            <strong>${item.status}</strong>
          </div>
          <p>${item.body}</p>
        </article>
      `).join("")}
    </div>
  `;

  elements.reportCenter.querySelectorAll("[data-report-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedReportFilter = button.dataset.reportFilter;
      renderReports();
    });
  });
  elements.reportCenter.querySelectorAll("[data-report-node]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedNode = button.dataset.reportNode;
      switchView("world");
      renderWorld();
    });
  });
  elements.reportCenter.querySelectorAll("[data-share-report]").forEach((button) => {
    button.addEventListener("click", () => shareMilitaryReport(button.dataset.shareReport));
  });
}

function renderQuests() {
  elements.questList.innerHTML = QUESTS.map((quest) => {
    const done = quest.done(state);
    const claimed = state.claimedQuests.includes(quest.id);
    return `
      <article class="quest-card">
        <div class="card-top">
          <div>
            <h3>${quest.title}</h3>
            <p>Recompense: ${rewardText(quest.reward)}</p>
          </div>
          <strong>${claimed ? "Reclame" : done ? "Pret" : "En cours"}</strong>
        </div>
        <button class="mini-button" type="button" data-quest="${quest.id}" ${!done || claimed ? "disabled" : ""}>Reclamer</button>
      </article>
    `;
  }).join("");

  elements.questList.querySelectorAll("[data-quest]").forEach((button) => {
    button.addEventListener("click", () => claimQuest(button.dataset.quest));
  });

  elements.logList.innerHTML = state.log.map((entry) => `<div class="log-entry">${entry}</div>`).join("");
}

function switchView(viewId) {
  elements.tabs.forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  elements.views.forEach((view) => view.classList.toggle("active", view.id === viewId));
}

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchView(tab.dataset.view));
});

elements.syncBtn.addEventListener("click", cloudSync);
elements.saveBtn.addEventListener("click", () => saveGame(true));
elements.resetBtn.addEventListener("click", () => {
  if (!confirm("Recommencer le royaume depuis le debut ?")) {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  state = createInitialState();
  selectedBuilding = "castle";
  selectedNode = WORLD_NODES[0].id;
  render();
});

await loadCloudConfig();
await loadContentPack();
state = loadGame();
selectedNode = getNode(selectedNode)?.id ?? WORLD_NODES[0].id;
selectedBuilding = getBuilding(selectedBuilding)?.id ?? "castle";
await initializeAuthState();
applyOfflineProgress();
setupPwaInstall();
setupKingdomCanvas();
render();
setInterval(tick, 1000);
setInterval(() => saveGame(false), 15000);
