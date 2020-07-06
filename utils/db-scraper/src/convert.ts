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
    typeSpecificData = parseHeroInfo(infoLineParts, typeLineParts);
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
  return {
    type: "building",
    infoParts,
    typeParts,
  };
};

const parseHeroInfo = (
  infoParts: Array<string>,
  typeParts: Array<string>,
) => {
  return {
    type: "hero",
    infoParts,
    typeParts,
  };
};

const parseSpellInfo = (
  infoParts: Array<string>,
  typeParts: Array<string>,
) => {
  return {
    type: "spell",
    infoParts,
    typeParts,
  };
};

const parseUnitInfo = (
  infoParts: Array<string>,
  typeParts: Array<string>,
) => {
  return {
    type: "unit",
    infoParts,
    typeParts,
  };
};

const parseUpgradeInfo = (
  infoParts: Array<string>,
  typeParts: Array<string>,
) => {
  return {
    type: "upgrade",
    infoParts,
    typeParts,
  };
};

main();
