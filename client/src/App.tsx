import React from 'react';
import './App.css';

import Hand from "./components/Hand";

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
      </header> */}
      <Hand cards={[
        "0001_nautical_dog.jpg",
        "0002_mad_man.jpg",
        "0003_bombaster.jpg",
        "0004_careless_musketeer.jpg",
        "0005_bloodrage_ogre.jpg",
      ]} manualTransform="rotate(180deg)" />
      <Hand cards={[
        "0000_merfolk_prospector.jpg",
        "0001_tiger_cub.jpg",
        "0002_young_treant.jpg",
        "0003_playful_panda.jpg",
        "0004_ironbark_treant.jpg",
        "0005_spore_shambler.jpg",
        "0006_verdant_tree.jpg",
        "0007_rich_earth.jpg",
        "0008_rampant_growth.jpg",
        "0009_forests_favor.jpg",
      ]} />
    </div>
  );
}

export default App;
