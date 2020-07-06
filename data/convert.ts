import * as fs from "fs";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const main = async () => {
  const raw = JSON.parse(await readFile("./dump.json", "utf8"));
  const out = raw.map(convertCard);
  await writeFile("./data.json", JSON.stringify(out, undefined, 2));
};

const convertCard = (
  raw: {
    name: string,
    image: string,
    infoLine: string,
    cardText: string,
    typeLine: string,
    cardRulings: Array<string>,
  },
) => {
  const infoLineParts = raw.infoLine.split("•").map(p => p.trim());
  const typeLineParts = raw.typeLine.split("•").map(p => p.trim());

  const firstInfoPart = infoLineParts[0];
  let typeSpecificData;
  if (firstInfoPart.includes("Unit")) {
    typeSpecificData = parseUnitInfo(infoLineParts, typeLineParts);
  } else if (firstInfoPart.includes("Spell")) {
    typeSpecificData = parseSpellInfo(infoLineParts, typeLineParts);
  } else if (firstInfoPart.includes("Building")) {
    typeSpecificData = parseBuildingInfo(infoLineParts, typeLineParts);
  } else if (firstInfoPart.includes("Upgrade")) {
    typeSpecificData = parseUpgradeInfo(infoLineParts, typeLineParts);
  } else if (firstInfoPart.includes("Hero")) {
    typeSpecificData = parseHeroInfo(raw.cardText, typeLineParts);
  } else {
    throw new Error(`Unable to parse card: ${raw.infoLine}`);
  }

  return {
    name: raw.name,
    image: raw.image.slice("//res.cloudinary.com/rgdelato/image/fetch/f_auto/http://codexcards-assets.surge.sh/images/".length),
    cost: parseInt(parse(/^Cost: (\d+)$/, infoLineParts[1])),
    ...typeSpecificData,
    cardText: raw.cardText,
    cardRulings: raw.cardRulings,
  };
};

const parse = (
  regex: RegExp,
  raw: string,
) => {
  const match = raw.match(regex);
  if (match == null) {
    throw new Error(`Failed to parse "${raw}"`);
  }
  return match[1];
};

const parseBuildingInfo = (
  infoParts: Array<string>,
  typeParts: Array<string>,
) => {
  const { fullType, tags } = parseTagsAndFullType(infoParts[0]);
  const legendary = fullType.includes("Legendary");
  
  const health = parseInt(parse(/^HP: (\d+)$/, infoParts[2]));

  return {
    type: "building",
    ...parseTechCardTypeLine(typeParts),
    health,
    tags,
    legendary,
  };
};

const parseHeroInfo = (
  cardText: string,
  typeParts: Array<string>,
) => {
  const color = typeParts[0].toLowerCase();
  const spec = parse(/^(\w+) Hero$/, typeParts[1]).toLowerCase();

  const lowBand = cardText.substring(0, cardText.search(/\dLevel/) + 1);
  cardText = cardText.substring(lowBand.length);
  const midBand = cardText.substring(0, cardText.search(/\dLevel/) + 1);
  const maxBand = cardText.substring(midBand.length);

  const lowBandParts = lowBand.split("•").map(p => p.trim());
  const midBandParts = midBand.split("•").map(p => p.trim());
  const maxBandParts = maxBand.split("•").map(p => p.trim());

  const levelBands = [lowBandParts, midBandParts, maxBandParts].map(parts => {
    const level = parseInt(parse(/^Level (\d+)/, parts[0]));
    const bandText = parse(/:(.*)$/, parts[0]).trim();
    const attack = parseInt(parse(/^ATK: (\d+)$/, parts[1]));
    const health = parseInt(parse(/^HP: (\d+)$/, parts[2]));

    return {
      level,
      attack,
      health,
      bandText,
    };
  });

  return {
    type: "hero",
    color,
    spec,
    levelBands,
  };
};

const parseSpellInfo = (
  infoParts: Array<string>,
  typeParts: Array<string>,
) => {
  let color: string;
  let spec: string | null;
  if (typeParts[0].includes("Magic")) {
    color = parse(/^(\w+) Magic$/, typeParts[0]).toLowerCase();
    spec = null;
  } else {
    color = typeParts[0].toLowerCase();
    spec = parse(/^(\w+) (Ultimate )?Magic$/, typeParts[1]).toLowerCase();
  }

  const { fullType, tags } = parseTagsAndFullType(infoParts[0]);
  const ultimate = fullType.includes("Ultimate");
  const ongoing = fullType.includes("Ongoing");

  return {
    type: "spell",
    color,
    spec,
    tags,
    ultimate,
    ongoing,
  };
};

const parseUnitInfo = (
  infoParts: Array<string>,
  typeParts: Array<string>,
) => {
  const { fullType, tags } = parseTagsAndFullType(infoParts[0]);
  const legendary = fullType.includes("Legendary");

  const attack = parseInt(parse(/^ATK: (\d+)$/, infoParts[2]));
  const health = parseInt(parse(/^HP: (\d+)$/, infoParts[3]));

  return {
    type: "unit",
    ...parseTechCardTypeLine(typeParts),
    attack,
    health,
    tags,
    legendary,
  };
};

const parseUpgradeInfo = (
  infoParts: Array<string>,
  typeParts: Array<string>,
) => {
  const { fullType, tags } = parseTagsAndFullType(infoParts[0]);
  const legendary = fullType.includes("Legendary");

  return {
    type: "upgrade",
    ...parseTechCardTypeLine(typeParts),
    legendary,
    // Note that upgrades never actually have tags
    tags,
  };
};

const parseTagsAndFullType = (
  line: string,
) => {
  let fullType: string;
  let tags: Array<string>;
  if (line.includes("—")) {
    fullType = parse(/^([\w ]+) —/, line);
    tags = parse(/— ([\w ]+)$/, line).toLowerCase().split(" ");
  } else {
    fullType = line;
    tags = [];
  }
  return {
    fullType,
    tags,
  };
};

const parseTechCardTypeLine = (
  typeParts: Array<string>,
) => {
  let color: string;
  let spec: string | null;
  let tech: number;
  if (typeParts[0].includes("Tech 0")) {
    color = parse(/^(\w+) Tech 0$/, typeParts[0]).toLowerCase();
    spec = null;
    tech = 0;
  } else {
    color = typeParts[0].toLowerCase();
    spec = parse(/^(\w+) Tech I+$/, typeParts[1]).toLowerCase();
    tech = parse(/^\w+ Tech (I+)$/, typeParts[1]).length;
  }
  return {
    color,
    spec,
    tech,
  };
}

main();
