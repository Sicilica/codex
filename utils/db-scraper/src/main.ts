import * as fs from "fs";
import { chromium } from "playwright";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);

const sections = [
  "red",
  "green",
  "blue",
  "black",
  "white",
  "purple",
  "neutral",
];

const main = async () => {
  const browser = await chromium.launch({ 
    headless: false,
  });
  try {
    const page = await browser.newPage();

    const cardPages = [];
  
    for (const section of sections) {
      await page.goto(`https://www.codexcarddb.com/color/${section}/images/`);
  
      const cardLinks = await page.$$("[data-reactroot] > div  > div > p + div > div > a");
      for (const cardLink of cardLinks) {
        cardPages.push(await cardLink.getAttribute("href"));
      }
    }

    const cards = [];
    for (const cardPage of cardPages) {
      await page.goto(`https://www.codexcarddb.com/${cardPage}`);

      const root = await page.$("[data-reactroot] > div + div > div");
      const left = await root.$("h1 + div > div:first-child");
      const right = await root.$("h1 + div > div:nth-child(2)");
      
      const name = await (await root.$("h1")).textContent();
      const image = await (await left.$("img")).getAttribute("src");
      // "Unit — Dog • Cost: 1 • ATK: 1 • HP: 1"
      const infoLine = await (await right.$("p:first-child")).textContent();

      const cardTextEl = await right.$("blockquote:nth-child(2)");
      const cardText = cardTextEl == null ? "" : await cardTextEl.textContent();

      const typeLine = await (await right.$(`p:nth-child(${(
        cardTextEl == null ? 3 : 4
      )})`)).textContent();

      const cardRulings = [];
      const cardRulingEls = await right.$$("blockquote:nth-child(n+3)");
      for (const cardRulingEl of cardRulingEls) {
        cardRulings.push(await cardRulingEl.textContent());
      }
      
      console.log(`Parsed ${name}`);
      cards.push({
        name,
        image,
        infoLine,
        cardText,
        typeLine,
        cardRulings,
      });
    }

    console.log("Writing to file");
    await writeFile("./dump.json", JSON.stringify(cards, undefined, 2));
  } finally {
    await browser.close();
  }
};

main();
