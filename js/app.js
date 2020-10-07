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

  /*
   * 6 - 2 rows, 3 columns
   * 12 - 4 rows, 3 columns
   * 18 - 3 rows, 6 columns
   * 24 - 4 rows, 6 columns
   * 30 - 5 rows, 6 columns
   */

  let rows;
  let cols;
  let sixcol = null;
  switch (deck.length) {
    case 6:
      rows = 2;
      cols = 3;
      break;
    case 12:
      rows = 4;
      cols = 3;
      break;
    case 18:
      rows = 3;
      cols = 6;
      sixcol = "sixcol";
      break;
    case 24:
      rows = 4;
      cols = 6;
      sixcol = "sixcol";
      break;
    case 30:
      rows = 5;
      cols = 6;
      sixcol = "sixcol";
      break;
  }

  let index = 0;
  for (let i = 0; i < rows; i++) {
    const newContainer = document.createElement("div");
    newContainer.classList.add("row");
    for (let j = 0; j < cols; j++) {
      newContainer.appendChild(deck[index]);
      index++;
    }
    cardContainer.appendChild(newContainer);
  }

  if (sixcol !== null) {
    document.querySelector(".main").classList.add(sixcol);
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

let pauseTimer = false;

//next round button only enabled when previous round completes, see start button click handler
const nextRoundBtn = document.querySelector(".next-round-btn");
nextRoundBtn.disabled = true;

nextRoundBtn.addEventListener("click", () => {
  pauseTimer = false;
  concentration.deal();
  nextRoundBtn.disabled = true;
});

const startBtn = document.querySelector(".start-btn");

startBtn.addEventListener("click", () => {
  concentration.gameStarted = true;
  startBtn.disabled = true;
  concentration.deal();

  const timer = setInterval(() => {
    if (!pauseTimer) {
      const timerDiv = document.querySelector(".timer");

      // if a round expires, clear the timer, set the round to 1, and enable the start button
      if (concentration.rounds[concentration.currentRound - 1].timeLeft === 0) {
        timerDiv.textContent = "------";
        clearInterval(timer);
        concentration.currentRound = 1;
        startBtn.disabled = false;
      }
      // if the round is completed, pause the timer, clear the completed deck, and enable the next round button
      else if (concentration.rounds[concentration.currentRound - 1].completed) {
        timerDiv.textContent = "------";
        concentration.completeDeck = [];
        // if completed, move on to next round and PAUSE until click
        concentration.currentRound++;
        nextRoundBtn.disabled = false;
        pauseTimer = true;
      } else {
        concentration.rounds[concentration.currentRound - 1].timeLeft--;
        timerDiv.innerHTML =
          "<h2>" +
          concentration.rounds[concentration.currentRound - 1].timeLeft +
          " seconds left</h2> in round: <strong>" +
          concentration.currentRound +
          "</strong> of " +
          concentration.rounds.length;
      }
    }
  }, 1000);
});

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
    this.deck = [];
    if (this.initialDeck.length < numberOfPairs) {
      const msg =
        "Error! Not enough cards loaded. Add more to initialDeck. initialDeck size: " +
        this.initialDeck.length +
        " and number of pairs requested: " +
        numberOfPairs;
      console.error(msg);

      return msg;
    }

    const cloneInitialDeck = [];
    for (const item of this.initialDeck) {
      cloneInitialDeck.push(item.cloneNode());
    }

    // randomly select cards from initialDeck
    for (let i = 0; i < numberOfPairs; i++) {
      const randomIndex = Math.floor(Math.random() * cloneInitialDeck.length);

      const cards = copyCard(cloneInitialDeck[randomIndex], this);

      this.deck = this.deck.concat(cards);
      cloneInitialDeck.splice(randomIndex, 1);
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
    this.resetChosen();
  },
  deal: function() {
    console.log("ROUND " + this.currentRound);
    // initialize deck
    this.generateDeck(this.rounds[this.currentRound - 1].pairs);
    this.shuffle();
    nextRoundBtn.setAttribute("value", this.currentRound);
    appendToCardContainer(this.deck);
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
      timeLeft: 40,
      completed: false
    },
    {
      number: 3,
      pairs: 9,
      timeLeft: 60,
      completed: false
    },
    {
      number: 4,
      pairs: 12,
      timeLeft: 80,
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
  log: function(deck) {
    if (deck === null) {
      deck = this.deck;
    }

    for (let i = 0; i < deck.length; i++) {
      console.log(
        deck[i].getAttribute("value") +
          " - " +
          deck[i].getAttribute("unique-id")
      );
    }
  }
};

// load cards into JS
concentration.loadCards();
