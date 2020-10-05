/*
 * DOM Manipulation
 */

const cardContainer = document.querySelector(".card-container");

/*
 * Game Object
 */
let concentration = {
  initialDeck: [],

  deck: [],

  loadCards: function() {
    // load card imgs into initial deck
    // TODO: going to need more cards. MAX pairs at the moment: 13
    for (let i = 2; i < 15; i++) {
      const cardImg = document.createElement("img");
      cardImg.setAttribute("src", "./images/card" + i + ".png");
      cardImg.setAttribute("value", i);
      this.initialDeck.push(cardImg);
    }
  },

  generateDeck: function(numberOfPairs) {
    if (this.initialDeck.length < numberOfPairs) {
      return "Error! Not enough cards loaded. Add more to initialDeck";
    }

    // randomly select cards from initialDeck
    for (let i = 0; i < numberOfPairs; i++) {
      const randomIndex = Math.floor(Math.random() * this.initialDeck.length);

      // push card twice, to ensure a pair is in deck
      this.deck.push(this.initialDeck[randomIndex]);
      this.deck.push(this.initialDeck[randomIndex]);

      this.initialDeck.splice(randomIndex, 1);
    }
  },
  // Shuffle Method
  shuffle: function() {
    const positions = [];
    const newDeck = [];
    for (let i = 0; i < this.deck.length; i++) {
      positions.push(i);
      newDeck.push(-1);
    }

    // for every card in the deck (for loop), randomize the length of the card position array (get a random index)
    for (const card of this.deck) {
      const randomIndex = Math.floor(Math.random() * positions.length);

      // push original card into new deck at randomized index
      newDeck[positions[randomIndex]] = card;

      // remove random index from position array
      positions.splice(randomIndex, 1);
    }

    this.deck = newDeck;
  },

  log: function() {
    for (let i = 0; i < this.deck.length; i++) {
      console.log(this.deck[i].getAttribute("value"));
    }
  }
};

/*
 * Game Play
 */
concentration.loadCards();
concentration.generateDeck(4);
concentration.log();

console.log("-----------");

concentration.shuffle();
concentration.log();
