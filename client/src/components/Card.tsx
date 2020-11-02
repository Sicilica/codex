import React from "react";
import styles from "./Card.module.css";

const BASE_URL = "https://res.cloudinary.com/rgdelato/image/fetch/f_auto/http://codexcards-assets.surge.sh/images";

interface Props {
  handTransform: string;
  img: string;
}

function Card(props: Props) {
  return (
    <div className={styles.card_wrapper} style={{
      transform: props.handTransform,
    }}>
      <div className={styles.card} style={{
        backgroundImage: `url(${BASE_URL}/${props.img})`,
      }}></div>
    </div>
  );
}

export default Card;
