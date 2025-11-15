//Controls the DOM (eyes and hands)

class toDoView {
  constructor() {
    this.container = document.getElementById("container");
  }

  setUpBoards() {
    const boardsContainer = document.getElementById("boards-container");
    const playerBoard = this.createGameboard("player-board");
    const opponentBoard = this.createGameboard("opponent-board");

    boardsContainer.appendChild(playerBoard);
    boardsContainer.appendChild(opponentBoard);
  }

  createGameboard(boardId) {
    const gameboard = document.createElement("div");
    gameboard.id = boardId;
    gameboard.classList.add("gameboard");

    for (let i = 0; i < 10 * 10; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      //Calculates the x coordinate
      cell.dataset.x = Math.floor(i / 10);
      //Calculates the y coordinate
      cell.dataset.y = i % 10;
      gameboard.appendChild(cell);
    }

    return gameboard;
  }

  createPlayerMessage() {
    const feedbackDiv = document.createElement("div");
    feedbackDiv.id = "user-feedback";
    feedbackDiv.classList.add("feedback");

    const feedbackText = document.createElement("p");
    feedbackText.id = "feedback-text";
    feedbackText.textContent = "Feedback will be displayed here";
    feedbackDiv.appendChild(feedbackText);

    const mainContainer = document.getElementById("container");
    mainContainer.appendChild(feedbackDiv);

    return feedbackDiv;
  }

  getCells() {
    return document.querySelectorAll("#player-board .cell");
  }

  //Adds event listeners in order to detect position of the ship
  initPreviewShip(handler) {
    // Add hover effects
    const cells = this.getCells();

    cells.forEach((cell) => {
      cell.addEventListener("mouseenter", (e) => {
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        handler(x, y); // ✅ Call the handler to trigger ship preview
      });
    });
  }

  initPlaceShip(handler) {
    const cells = document.querySelectorAll("#player-board .cell");
    console.log("initPlaceShip called, found cells:", cells.length);

    cells.forEach((cell) => {
      cell.addEventListener("click", (e) => {
        console.log("Cell clicked!");
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        console.log("Click coordinates:", x, y);
        handler(x, y);
      });
    });
  }

  initAttack(handler) {
    const cells = document.querySelectorAll("#opponent-board .cell");
    cells.forEach((cell) => {
      cell.addEventListener("click", (e) => {
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        handler(x, y);
      });
    });
  }

  previewShip(positions) {
    const playerBoard = document.getElementById("player-board");

    document.querySelectorAll(".hovered").forEach((cell) => {
      cell.classList.remove("hovered");
    });

    positions.forEach((pos) => {
      console.log("Looking for cell at:", pos.x, pos.y);
      const cell = document.querySelector(
        `#player-board [data-x="${pos.x}"][data-y="${pos.y}"]`
      );
      if (cell) {
        cell.classList.add("hovered");
      } else {
        console.log("Cell not found for:", pos.x, pos.y);
      }
    });
  }

  toggleShip() {
    // Clear previous highlights
    document.querySelectorAll(".hovered").forEach((cell) => {
      cell.classList.remove("hovered");
    });

    // Add new highlights
    positions.forEach((pos) => {
      const cell = document.querySelector(
        `#player-board [data-x="${pos.x}"][data-y="${pos.y}"]`
      );
      if (cell) {
        cell.classList.add("hovered");
      }
    });
  }

  placeShip(positions) {
    const playerBoard = document.getElementById("player-board");

    document.querySelectorAll(".hovered").forEach((cell) => {
      cell.classList.remove("hovered");
    });

    positions.forEach((pos) => {
      console.log("Looking for cell at:", pos.x, pos.y);
      const cell = document.querySelector(
        `#player-board [data-x="${pos.x}"][data-y="${pos.y}"]`
      );
      if (cell) {
        cell.classList.add("clicked");
      } else {
        console.log("Cell not found for:", pos.x, pos.y);
      }
    });
  }

  receiveAttack(x, y, attackResult) {
    const cell = document.querySelector(
      `#opponent-board [data-x="${x}"][data-y="${y}"]`
    );
    if (cell) {
      if (attackResult.result === "hit" || attackResult.result === "sunk") {
        cell.classList.add("hit");
      } else {
        cell.classList.add("miss");
      }
    }
  }

  displayOpponentShips(opponentGameboard) {
    console.log("displayOpponentShips called with:", opponentGameboard);
    const cells = document.querySelectorAll("#opponent-board .cell");
    console.log("Found cells:", cells.length);

    cells.forEach((cell) => {
      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      const hasShip = opponentGameboard.board[x][y].ship !== null;
      console.log(`Cell ${x},${y} has ship:`, hasShip);
      if (hasShip) {
        console.log(`Adding opponent-ship class to cell ${x},${y}`);
        cell.classList.add("opponent-ship");
      }
    });
  }
}

export default toDoView;
