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

const checkCards = (card1, card2) => {
  if (card1 !== null && card2 !== null) {
    const val1 = card1.getAttribute("value");
    const val2 = card2.getAttribute("value");

    const uniqueIds = [];
    uniqueIds.push(card1.getAttribute("unique-id"));
    uniqueIds.push(card2.getAttribute("unique-id"));

    if (
      val1 === val2 &&
      uniqueIds.length === 2 &&
      uniqueIds.includes("1") &&
      uniqueIds.includes("2")
    ) {
      return true;
    }
  }
  return false;
};

const clearIntervalAndCards = (interval, card) => {
  clearInterval(interval);
  card.onclick = null;
  concentration.clearSelected();
};

/*
 * Game Object
 */
let concentration = {
  selectedCard1: null,

  selectedCard2: null,

  initialDeck: [],

  deck: [],

  completeDeck: [],

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

      //push both cards in the pair to the deck
      const card = this.initialDeck[randomIndex];
      //set unique ID per card in pair
      card.setAttribute("unique-id", 1);
      this.deck.push(card);

      // push card twice, to ensure a pair is in deck. use cloneNode() to generate a copy of the image
      const cloneCard = card.cloneNode();
      //set unique ID per card in pair
      cloneCard.setAttribute("unique-id", 2);
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

  clearSelected: function() {
    this.selectedCard1 = null;
    this.selectedCard2 = null;
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
const pairs = 3;

// initialize deck
concentration.loadCards();
concentration.generateDeck(pairs);
concentration.shuffle();

for (const card of concentration.deck) {
  card.addEventListener("click", () => {
    if (concentration.selectedCard1 === null) {
      concentration.selectedCard1 = card;
    } else if (concentration.selectedCard2 === null) {
      concentration.selectedCard2 = card;
    }

    console.log(concentration.selectedCard1);
    // console.log(concentration.selectedCard2);

    if (card.getAttribute("src").includes("back")) {
      toggleImgSrc(card);

      //show card for this many seconds
      let showCard = 1;
      const timerInterval = setInterval(() => {
        if (showCard === 0) {
          if (concentration.completeDeck.includes(card)) {
            clearIntervalAndCards(timerInterval, card);
          } else {
            if (!card.getAttribute("src").includes("back")) {
              toggleImgSrc(card);
            }
            clearInterval(timerInterval);

            //clear the card from concentration object when timer expires
            //NOTE: choosing a card immediately after the first two cards won't match. need to prevent clickability of new cards after 2 in a row are chosen, OR enable continuous 2 card clicking
            console.log(card);
            console.log(concentration.selectedCard1);
            concentration.clearSelected();
          }
          // if card is already part of complete deck
        } else if (concentration.completeDeck.includes(card)) {
          clearIntervalAndCards(timerInterval, card);
        } else {
          showCard--;
        }
      }, 1000);
    } else {
      toggleImgSrc(card);
    }
  });

  //event listener for setting up win condition
  card.addEventListener("click", () => {
    const selectedCard1 = concentration.selectedCard1;
    const selectedCard2 = concentration.selectedCard2;

    if (checkCards(selectedCard1, selectedCard2)) {
      const val1 = selectedCard1.getAttribute("value");
      const val2 = selectedCard2.getAttribute("value");
      //permanently keep it face up
      selectedCard1.setAttribute("src", "./images/card" + val1 + ".png");
      selectedCard2.setAttribute("src", "./images/card" + val2 + ".png");

      //add card to complete deck
      if (!concentration.completeDeck.includes(selectedCard1)) {
        concentration.completeDeck.push(selectedCard1);
      }
      if (!concentration.completeDeck.includes(selectedCard2)) {
        concentration.completeDeck.push(selectedCard2);
      }

      concentration.clearSelected();
    }
  });
}

appendToCardContainer(concentration.deck);

//after pushing start
// appendToCardContainer(concentration.deck);
