import React from "react";
import Card from "./Card";
import styles from "./Hand.module.css";

interface Props {
  cards: Array<string>;
  manualTransform?: string;
}

function Hand(props: Props) {
  // 3 cards = 6-9
  // 6 cards = 11-15
  // 8 cards = 12-17
  // 10 cards = 14-19
  // higher maxrot and higher card count both contribute to taller spread
  // past 10 cards this starts to get ridiculous, but we would need to adjust margin etc at that point
  const maxRot = props.cards.length + 5;
  // const maxSlide = 2 * props.cards.length;

  // TODO should restructure this to push edges down instead, or to do something in between
  // since it only pushes center up ATM single cards are really low on the screen comparatively
  const CARD_WIDTH = 30;// em
  const CARD_MARGIN = -3;// em
  const largestOffset = (props.cards.length - 1) * (CARD_WIDTH + CARD_MARGIN * 2) / 2;
  const distFromCenterpoint = largestOffset / Math.sin(maxRot * Math.PI / 180);
  const centerpointY = Math.sqrt(distFromCenterpoint*distFromCenterpoint - largestOffset*largestOffset);

  // TODO this is almost TOO circular. not sure how to make it slighly less so,
  // but that would help make each card stick out a bit more (i.e. being able
  // to see all the card corners would help with visual parsing)

  return (
    <div className={styles.hand} style={{
      transform: `${props.manualTransform}`,// translate(0em, ${maxSlide}em)`,
    }}>
      {props.cards.map((card, i) => (
        <Card img={card} handTransform={calcCardTransform(
          i / (props.cards.length - 1),
          largestOffset,
          centerpointY,
          distFromCenterpoint,
        )} />
      ))}
    </div>
  );
}

const calcCardTransform = (
  ratio: number,
  largestOffset: number,
  centerpointY: number,
  distFromCenterpoint: number,
): string => {
  if (largestOffset === 0) {
    return "";
  }
  const distFromCenter = (ratio - 0.5) * 2;

  const rot = Math.asin((distFromCenter * largestOffset) / distFromCenterpoint);
  const offsetY = distFromCenterpoint * Math.cos(rot) - centerpointY;

  return `translate(0em, ${
    -offsetY
  }em) rotate(${
    rot * 180 / Math.PI
  }deg)`;
};

export default Hand;
