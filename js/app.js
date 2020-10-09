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

  let root = document.documentElement;
  root.style.setProperty("--main-flex", "flex");
};

const toggleImgSrc = card => {
  if (card.getAttribute("style").includes("card")) {
    const style =
      concentration.themes && concentration.themes.length > 0
        ? concentration.themes[concentration.currentTheme].cardBack
        : "./images/base-theme/back.png";

    setStyle(card, style);
  } else {
    const cardSrc = interpolateFront(card.getAttribute("value"));

    setStyle(card, cardSrc);
  }
};

/**
 * helper functions
 */
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

const createModal = (cssClass, text, children) => {
  const newModal = document.createElement("div");

  if (cssClass !== null) {
    if (Array.isArray(cssClass)) {
      for (const css of cssClass) {
        newModal.classList.add(css);
      }
    } else {
      newModal.classList.add(cssClass);
    }
  }

  if (text !== null) {
    newModal.textContent = text;
  }

  if (children !== null) {
    if (Array.isArray(children)) {
      for (const child of children) {
        newModal.appendChild(child);
      }
    } else {
      newModal.appendChild(children);
    }
  }

  return newModal;
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

const interpolateFront = imgValue => {
  let newSrc =
    concentration.themes && concentration.themes.length > 0
      ? concentration.themes[concentration.currentTheme].cardFront
      : "./images/base-theme/cardx.png";

  return newSrc.replace("x", imgValue);
};

const setStyle = (card, style) => {
  card.setAttribute("style", 'background: no-repeat url("' + style + '");');
};

const initializeThemes = themesArray => {
  if (themesArray) {
    return themesArray;
  }
  return [];
};

/**
 * buttons and click listeners
 */
const nextThemeBtn = document.querySelector(".next-theme");
nextThemeBtn.addEventListener("click", () => {
  concentration.toggleTheme(false);
});

const randomizeThemeBtn = document.querySelector(".randomize-theme");
randomizeThemeBtn.addEventListener("click", () => {
  concentration.toggleTheme(true);
});

let pauseTimer = false;

//next round button only enabled when previous round completes, see start button click handler
const nextRoundBtn = document.createElement("button");
nextRoundBtn.textContent = "Next Round";
nextRoundBtn.classList.add("next-round-btn");
nextRoundBtn.disabled = true;

nextRoundBtn.addEventListener("click", () => {
  // un pause timer, deal new deck
  pauseTimer = false;
  concentration.deal();
  nextRoundBtn.disabled = true;

  // remove modal from screen
  document.querySelector(".round-win-parent").remove();
});

const startBtn = document.querySelector(".start-btn");

startBtn.addEventListener("click", () => {
  // remove any modals from screen
  const modals = document.querySelectorAll(".modal");
  for (const modal of modals) {
    //remove parent, used for positioning
    modal.parentElement.remove();
  }

  //start button only pressed once at the beginning of the game --> reset the game object
  concentration.resetGame();

  // deal new deck
  concentration.gameStarted = true;
  startBtn.disabled = true;
  concentration.deal();

  const timer = setInterval(() => {
    if (!pauseTimer) {
      const timerDiv = document.querySelector(".timer");

      // if a round expires, clear the timer, set the round to 1, and enable the start button
      if (concentration.rounds[concentration.currentRound - 1].timeLeft === 0) {
        timerDiv.textContent = "";
        clearInterval(timer);

        startBtn.disabled = false;
        //round lost, go back to round 1
        const roundWinModal = createModal(
          "round-win-parent",
          null,
          createModal(
            ["lose", "modal"],
            "Time ran out 😞 Back to Round 1.",
            startBtn
          )
        );

        document.querySelector(".game-play").appendChild(roundWinModal);
      }
      // if the round is completed, pause the timer, clear the completed deck, and enable the next round button
      else if (concentration.rounds[concentration.currentRound - 1].completed) {
        concentration.completeDeck = [];
        // if completed, move on to next round
        concentration.currentRound++;

        // if current round is greater than the length of the round array, all rounds completed = game over (Win!).
        if (concentration.currentRound > concentration.rounds.length) {
          clearInterval(timer);
        }
        //otherwise, enable the next round button and unpause the timer
        //and PAUSE until click
        else {
          nextRoundBtn.disabled = false;
          pauseTimer = true;
        }
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

/**
 * Card click listeners
 */
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
        !card.getAttribute("style").includes("back.png") &&
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
      if (!card.getAttribute("style").includes("back.png")) {
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

      //set up values to use to permanently keep card up
      const card1Src = interpolateFront(selectedCard1.getAttribute("value"));
      const card2Src = interpolateFront(selectedCard2.getAttribute("value"));

      //permanently keep it face up
      interpolateFront(selectedCard1, card1Src);
      interpolateFront(selectedCard2, card2Src);

      //add card to complete deck
      if (!concentration.completeDeck.includes(selectedCard1)) {
        concentration.completeDeck.push(selectedCard1);
      }
      if (!concentration.completeDeck.includes(selectedCard2)) {
        concentration.completeDeck.push(selectedCard2);
      }

      concentration.clearSelected();

      if (concentration.completeDeck.length === concentration.deck.length) {
        // if the current round is the same as the length as the round array, the game is over
        if (concentration.currentRound === concentration.rounds.length) {
          startBtn.disabled = false;
          //append end modal
          const endModal = createModal(
            "end-modal-parent",
            null,
            createModal(
              ["end", "modal"],
              "YOU BEAT THE GAME! Play again?",
              startBtn
            )
          );

          document.querySelector(".main").appendChild(endModal);
        }
        // otherwise, the end of the round is over
        else {
          const roundWinModal = createModal(
            "round-win-parent",
            null,
            createModal(
              ["round-win", "modal"],
              "You won round " + concentration.currentRound + "!",
              nextRoundBtn
            )
          );

          //insert next round modal
          document.querySelector(".game-play").appendChild(roundWinModal);
        }

        // round is over, update round object boolean
        concentration.rounds[concentration.currentRound - 1].completed = true;
      }
    }
  });
  return card;
};

/*
 * Game Object
 */
let concentration = {
  // turnSpeed is in seconds, takes decimals as well.
  turnSpeed: 0.2,

  selectedCards: [],

  initialDeck: [],

  deck: [],

  completeDeck: [],

  gameStarted: false,

  currentTheme: 0,

  // note: the theme functionality requires `themes.js` to be loaded before this file
  themes: themes,

  currentRound: 1,

  rounds: [
    {
      number: 1,
      pairs: 3,
      originalTimeLeft: 20,
      timeLeft: 20,
      completed: false
    },
    {
      number: 2,
      pairs: 6,
      originalTimeLeft: 40,
      timeLeft: 40,
      completed: false
    },
    {
      number: 3,
      pairs: 9,
      originalTimeLeft: 60,
      timeLeft: 60,
      completed: false
    },
    {
      number: 4,
      pairs: 12,
      originalTimeLeft: 80,
      timeLeft: 80,
      completed: false
    }
    // ,
    // {
    //   number: 5,
    //   pairs: 15,
    // originalTimeLeft: 100,
    //   timeLeft: 100,
    //   completed: false
    // }
  ],

  loadCards: function() {
    // load card imgs into initial deck
    // TODO: going to need more cards. MAX pairs at the moment: 13
    for (let i = 2; i < 15; i++) {
      const card = document.createElement("div");
      if (this.themes && this.themes.length > 0) {
        setStyle(card, this.themes[this.currentTheme].cardBack);
      } else {
        setStyle(card, "./images/base-theme/back.png");
      }

      // TODO: nice to have stretch goal: hash value to hide value
      card.setAttribute("value", i);
      card.classList.add("card");

      this.initialDeck.push(card);
    }
  },

  generateDeck: function(numberOfPairs) {
    this.deck = [];
    this.initialDeck = [];

    this.loadCards();

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
      if (!card.getAttribute("style").includes("back.png")) {
        toggleImgSrc(card);
      }
    }

    this.clearSelected();
  },
  resetGame: function() {
    this.completeDeck = [];
    for (const round of this.rounds) {
      round.timeLeft = round.originalTimeLeft;
      round.completed = false;
    }
    this.currentRound = 1;
  },
  toggleTheme: function(randomize) {
    if (this.themes && this.themes.length > 0) {
      let root = document.documentElement;
      //randomly select theme
      if (randomize) {
        this.currentTheme = Math.floor(Math.random() * this.themes.length);
      } else {
        this.currentTheme++;
        if (this.currentTheme === this.themes.length) {
          this.currentTheme = 0;
        }
      }

      root.style.setProperty(
        "--bg-color",
        this.themes[this.currentTheme].bgColor
      );
      root.style.setProperty(
        "--text-color",
        this.themes[this.currentTheme].textColor
      );
      root.style.setProperty(
        "--modal-bg-color",
        this.themes[this.currentTheme].modalBgColor
      );
      root.style.setProperty(
        "--modal-text-color",
        this.themes[this.currentTheme].modalTextColor
      );
      root.style.setProperty(
        "--modal-border-color",
        this.themes[this.currentTheme].modalBorderColor
      );
      root.style.setProperty(
        "--btn-bg-color",
        this.themes[this.currentTheme].btnBgColor
      );
      root.style.setProperty(
        "--btn-text-color",
        this.themes[this.currentTheme].btnTextColor
      );
      root.style.setProperty(
        "--btn-hover-color",
        this.themes[this.currentTheme].btnHoverColor
      );
      root.style.setProperty(
        "--btn-border-color",
        this.themes[this.currentTheme].btnBorderColor
      );
      root.style.setProperty("--font", this.themes[this.currentTheme].font);

      // change card images
      // contains back? change to appropriate themed img also has back

      for (const card of this.deck) {
        if (card.getAttribute("style").includes("back.png")) {
          setStyle(card, this.themes[this.currentTheme].cardBack);
        } else {
          const newSrc = interpolateFront(card.getAttribute("value"));

          setStyle(card, newSrc);
        }
      }
    }
  },
  log: function(deck) {
    if (deck === undefined) {
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

if (!concentration.themes) {
  nextThemeBtn.disabled = true;
  randomizeThemeBtn.disabled = true;
}
if (concentration.themes <= 0) {
  nextThemeBtn.disabled = true;
  randomizeThemeBtn.disabled = true;
}
