let concentration = {
  deck: [],

  generateDeck: function(numberOfCards) {
    if (numberOfCards % 2 !== 0) {
      return "Error! Number of cards must be even";
    }

    // load card imgs into initial deck
    const initialDeck = [];
    // TODO: going to need more cards. MAX pairs at the moment: 13
    for (let i = 2; i < 15; i++) {
      const cardImg = document.createElement("img");
      cardImg.setAttribute("src", "./images/card" + i + ".png");
      cardImg.setAttribute("value", i);
      initialDeck.push(cardImg);
    }

    // randomly select cards from initialDeck
    for (let i = 0; i < numberOfCards / 2; i++) {
      const randomIndex = Math.floor(Math.random() * initialDeck.length);

      // push card twice, to ensure a pair is in deck
      this.deck.push(initialDeck[randomIndex]);
      this.deck.push(initialDeck[randomIndex]);

      initialDeck.splice(randomIndex, 1);
    }
  },

  log: function() {
    for (let i = 0; i < this.deck.length; i++) {
      console.log(this.deck[i].getAttribute("value"));
    }
  }
};

concentration.generateDeck(24);
concentration.log();
