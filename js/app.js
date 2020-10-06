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

const convertSeconds = seconds => {
  if (seconds < 1) {
    return seconds * 1000;
  }
  return seconds;
};

/*
 * Game Object
 */
let concentration = {
  // turnSpeed is in seconds, takes decimals as well.
  turnSpeed: 0.25,

  selectedCards: [],

  initialDeck: [],

  deck: [],

  completeDeck: [],

  gameStarted: false,

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
    this.selectedCards = [];
  },

  resetChosen: function() {
    for (const card of this.selectedCards) {
      if (!card.getAttribute("src").includes("back")) {
        toggleImgSrc(card);
      }
    }

    this.clearSelected();
  },

  round: {
    number: 1,
    timeLeft: 30
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
    if (
      concentration.gameStarted &&
      concentration.selectedCards.length < 2 &&
      !concentration.completeDeck.includes(card)
    ) {
      toggleImgSrc(card);
      // only allow the second card chosen that is flipped up to use the timer
      if (
        !card.getAttribute("src").includes("back") &&
        concentration.selectedCards.length === 1
      ) {
        let showCards =
          concentration.turnSpeed >= 1 ? concentration.turnSpeed : 1;
        const timerInterval = setInterval(
          () => {
            if (showCards === 0) {
              console.log(timerInterval);
              clearInterval(timerInterval);
              concentration.resetChosen();
            } else {
              showCards--;
            }
          },
          concentration.turnSpeed >= 1
            ? 1000
            : convertSeconds(concentration.turnSpeed)
        );
      }

      // if the card is flipped up, add the card to selected cards
      if (!card.getAttribute("src").includes("back")) {
        concentration.selectedCards.push(card);
      } // if the card selected is already in selected cards, clear all (turn over)
      else if (concentration.selectedCards.includes(card)) {
        concentration.resetChosen();
      }
    }
  });

  //event listener for setting up win condition
  card.addEventListener("click", () => {
    if (
      concentration.selectedCards.length === 2 &&
      checkCards(concentration.selectedCards[0], concentration.selectedCards[1])
    ) {
      const selectedCard1 = concentration.selectedCards[0];
      const selectedCard2 = concentration.selectedCards[1];

      const val1 = selectedCard1.getAttribute("value");
      const val2 = selectedCard2.getAttribute("value");
      //permanently keep it face up
      selectedCard1.setAttribute("src", "./images/card" + val1 + ".png");
      selectedCard2.setAttribute("src", "./images/card" + val2 + ".png");

      console.log(selectedCard2);
      //add card to complete deck
      if (!concentration.completeDeck.includes(selectedCard1)) {
        concentration.completeDeck.push(selectedCard1);
      }
      if (!concentration.completeDeck.includes(selectedCard2)) {
        concentration.completeDeck.push(selectedCard2);
      }

      concentration.clearSelected();

      if (concentration.completeDeck.length === concentration.deck.length) {
        console.log("heheeeellloo");
        const newDiv = document.createElement("div");

        newDiv.innerHTML = "You win!";

        document.querySelector(".game-play").appendChild(newDiv);
      }
    }

    console.log(concentration.completeDeck);
  });
}

document.querySelector(".start-btn").addEventListener("click", () => {
  concentration.gameStarted = true;

  const timer = setInterval(() => {
    if (concentration.round.timeLeft === 0) {
      clearInterval(timer);
    } else {
      const timerDiv = document.querySelector(".timer");
      timerDiv.textContent = concentration.round.timeLeft + "s";
      concentration.round.timeLeft--;
    }
  }, 1000);
});

appendToCardContainer(concentration.deck);

//after pushing start
// appendToCardContainer(concentration.deck);
