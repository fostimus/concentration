/*
 * DOM Manipulation
 */

const appendToCardContainer = deck => {
  const cardContainer = document.querySelector(".card-container");
  const cardContainerChildren = cardContainer.children;

  //remove all children
  for (let i = cardContainerChildren.length - 1; i >= 0; i--) {
    cardContainerChildren[i].remove();
  }

  // note: instead of removing the img from the container, just update the attribute
  console.log("length of deck: " + deck.length);
  for (const card of deck) {
    cardContainer.appendChild(card);
  }
};

const toggleImgSrc = card => {
  if (card.getAttribute("src").includes("card")) {
    card.setAttribute("src", "./images/back.png");
  } else {
    card.setAttribute(
      "src",
      "./images/card" + card.getAttribute("value") + ".png"
    );
  }
};

// figure out how to toggle src values
const cardClick = e => {
  const card = e.target;
  toggleImgSrc(card);
};

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
      cardImg.setAttribute("src", "./images/back.png");

      // TODO: nice to have stretch goal: hash value to hide value
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

      const card = this.initialDeck[randomIndex];
      card.onclick = cardClick;
      this.deck.push(card);
      // push card twice, to ensure a pair is in deck. use cloneNode() to generate a copy of the image
      const cloneCard = card.cloneNode();
      cloneCard.onclick = cardClick;
      this.deck.push(cloneCard);

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
  deal: function() {
    if (this.deck.length <= 0) {
      alert("No more cards in deck!");
      return;
    } else {
      //remove both current cards
      document.querySelector(".playerCard").remove();
      document.querySelector(".cpuCard").remove();

      // deal new player card, set class
      const newPlayerCard = this.deck.shift();
      newPlayerCard.setAttribute("class", "playerCard");

      // deal new cpu card, set class
      const newCpuCard = this.deck.shift();
      newCpuCard.setAttribute("class", "cpuCard");

      // append dealt cards to card container
      const cardContainer = document.querySelector(".container");
      cardContainer.appendChild(newPlayerCard);
      cardContainer.appendChild(newCpuCard);
    }
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
const pairs = 4;

// initialize deck
concentration.loadCards();
concentration.generateDeck(pairs);
concentration.log();

console.log("-----------");

concentration.shuffle();
concentration.log();

appendToCardContainer(concentration.deck);
