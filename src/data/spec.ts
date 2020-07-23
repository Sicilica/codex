import { CardID, Color, Spec } from "../framework/types";

export const getSpecStarters = (spec: Spec): Array<CardID> => {
  return colorStarters[colorMap[spec]];
};

export const getSpecHero = (spec: Spec): CardID => {
  return heroes[spec];
};

const colorMap: Record<Spec, Color> = {
  ANARCHY: "RED",
  BLOOD: "RED",
  FIRE: "RED",

  BALANCE: "GREEN",
  FERAL: "GREEN",
  GROWTH: "GREEN",

  LAW: "BLUE",
  PEACE: "BLUE",
  TRUTH: "BLUE",

  DEMONOLOGY: "BLACK",
  DISEASE: "BLACK",
  NECROMANCY: "BLACK",

  DISCIPLINE: "WHITE",
  NINJUTSU: "WHITE",
  STRENGTH: "WHITE",

  PAST: "PURPLE",
  PRESENT: "PURPLE",
  FUTURE: "PURPLE",

  BASHING: "NEUTRAL",
  FINESSE: "NEUTRAL",
};

const heroes: Record<Spec, CardID> = {
  ANARCHY: "Captain Zane",
  BLOOD: "Drakk Ramhorn",
  FIRE: "Jaina Stormborne",

  BALANCE: "Master Midori",
  FERAL: "Calamandra Moss",
  GROWTH: "Argagarg Garg",

  LAW: "Bigby Hayes",
  PEACE: "General Onimaru",
  TRUTH: "Sirus Quince",

  DEMONOLOGY: "Vandy Anadrose",
  DISEASE: "Orpal Gloor",
  NECROMANCY: "Garth Torken",

  DISCIPLINE: "Grave Stormborne",
  NINJUTSU: "Setsuki Hiruki",
  STRENGTH: "Garus Rook",

  PAST: "Prynn Pasternaak",
  PRESENT: "Max Geiger",
  FUTURE: "Vir Garbarean",

  BASHING: "Troq Bashar",
  FINESSE: "River Montoya",
};

const colorStarters: Record<Color, Array<CardID>> = {
  RED: [
    "Nautical Dog",
    "Mad Man",
    "Bombaster",
    "Careless Musketeer",
    "Bloodrage Ogre",
    "Makeshift Rambaster",
    "Bloodburn",
    "Scorch",
    "Charge",
    "Pillage",
  ],
  GREEN: [
    "Merfolk Prospector",
    "Tiger Cub",
    "Young Treant",
    "Playful Panda",
    "Ironbark Treant",
    "Spore Shambler",
    "Verdant Tree",
    "Rich Earth",
    "Rampant Growth",
    "Forest's Favor",
  ],
  BLUE: [
    "Building Inspector",
    "Spectral Aven",
    "Bluecoat Musketeer",
    "Traffic Director",
    "Porkhand Magistrate",
    "Reputable Newsman",
    "Jail",
    "Lawful Search",
    "Arrest",
    "Manufactured Truth",
  ],
  BLACK: [
    "Pestering Haunt",
    "Skeleton Javelineer",
    "Poisonblade Rogue",
    "Thieving Imp",
    "Jandra, the Negator",
    "Graveyard",
    "Skeletal Archery",
    "Deteriorate",
    "Summon Skeletons",
    "Sacrifice the Weak",
  ],
  WHITE: [
    "Smoker",
    "Savior Monk",
    "Fox Viper",
    "Aged Sensei",
    "Morningstar Flagbearer",
    "Fox Primus",
    "Safe Attacking",
    "Sensei's Advice",
    "Grappling Hook",
    "Snapback",
  ],
  PURPLE: [
    "Neo Plexus",
    "Plasmodium",
    "Nullcraft",
    "Fading Argonaut",
    "Tinkerer",
    "Hardened Mox",
    "Battle Suits",
    "Time Spiral",
    "Temporal Research",
    "Forgotten Fighter",
  ],
  NEUTRAL: [
    "Timely Messenger",
    "Tenderfoot",
    "Older Brother",
    "Brick Thief",
    "Helpful Turtle",
    "Granfalloon Flagbearer",
    "Fruit Ninja",
    "Spark",
    "Bloom",
    "Wither",
  ],
};
