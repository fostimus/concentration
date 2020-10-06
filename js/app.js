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

const attachCardClickListeners = (card, concentration) => {
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
        const newDiv = document.createElement("div");

        newDiv.innerHTML = "You win!";

        document.querySelector(".game-play").appendChild(newDiv);

        // round is over, update round object boolean
        concentration.rounds[concentration.currentRound - 1].completed = true;
      }
    }

    console.log(concentration.completeDeck);
  });
  return card;
};

const copyCard = (card, concentration) => {
  const cardHolder = [];
  //set unique ID per card in pair
  card.setAttribute("unique-id", 1);
  cardHolder.push(attachCardClickListeners(card, concentration));

  // push card twice, to ensure a pair is in deck. use cloneNode() to generate a copy of the image
  const cloneCard = card.cloneNode();
  //set unique ID per card in pair
  cloneCard.setAttribute("unique-id", 2);
  cardHolder.push(attachCardClickListeners(cloneCard, concentration));

  return cardHolder;
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
      const card = document.createElement("img");
      card.setAttribute("src", "./images/back.png");

      // TODO: nice to have stretch goal: hash value to hide value
      card.setAttribute("value", i);

      this.initialDeck.push(card);
    }
  },

  generateDeck: function(numberOfPairs) {
    if (this.initialDeck.length < numberOfPairs) {
      return "Error! Not enough cards loaded. Add more to initialDeck";
    }

    // randomly select cards from initialDeck
    for (let i = 0; i < numberOfPairs; i++) {
      const randomIndex = Math.floor(Math.random() * this.initialDeck.length);

      const cards = copyCard(this.initialDeck[randomIndex], this);

      this.deck = this.deck.concat(cards);

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
    console.log("ROUND " + this.currentRound);
    // initialize deck
    this.generateDeck(this.rounds[this.currentRound - 1].pairs);
    this.shuffle();
    appendToCardContainer(concentration.deck);
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
  currentRound: 1,
  rounds: [
    {
      number: 1,
      pairs: 3,
      timeLeft: 20,
      completed: false
    },
    {
      number: 2,
      pairs: 6,
      timeLeft: 30,
      completed: false
    },
    {
      number: 3,
      pairs: 9,
      timeLeft: 40,
      completed: false
    },
    {
      number: 4,
      pairs: 12,
      timeLeft: 50,
      completed: false
    }
    // ,
    // {
    //   number: 5,
    //   pairs: 15,
    //   timeLeft: 60,
    //   completed: false
    // }
  ],
  log: function() {
    for (let i = 0; i < this.deck.length; i++) {
      console.log(this.deck[i].getAttribute("value"));
    }
  }
};

// load cards into JS
concentration.loadCards();

/*
 * Game Play
 */

let testRound = false;

document.querySelector(".start-btn").addEventListener("click", () => {
  concentration.gameStarted = true;
  concentration.deal();

  const timer = setInterval(() => {
    const timerDiv = document.querySelector(".timer");
    timerDiv.textContent = concentration.rounds[0].timeLeft + "s";

    if (concentration.rounds[0].timeLeft === 0) {
      clearInterval(timer);
    } else {
      concentration.rounds[0].timeLeft--;
    }

    if (concentration.rounds[concentration.currentRound - 1].completed) {
      concentration.currentRound++;
    }
  }, 1000);
});
