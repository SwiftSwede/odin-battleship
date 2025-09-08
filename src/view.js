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

  getCells() {
    return document.querySelectorAll(".cell");
  }

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

    cells.forEach((cell) => {
      cell.addEventListener("mouseleave", (e) => {
        const targetCell = e.target;
        e.target.classList.remove("hovered");
      });
    });
  }

  previewShip(positions) {
    const playerBoard = document.getElementById("player-board");
    console.log("Player board exists:", !!playerBoard);
    console.log("Player board:", playerBoard);

    console.log("previewShip called with positions:", positions);
    console.log("Number of positions:", positions.length);

    positions.forEach((pos) => {
      console.log("Looking for cell at:", pos.x, pos.y);
      const cell = document.querySelector(
        `#player-board [data-x="${pos.x}"][data-y="${pos.y}"]`
      );
      if (cell) {
        cell.classList.add("hovered");
        console.log("Found and highlighted cell:", pos.x, pos.y);
      } else {
        console.log("Cell not found for:", pos.x, pos.y);
      }
    });
  }

  bindToggleShipPreview(handler) {
    const cells = this.getCells();
  }

  bindPlaceShip(handler) {
    const cells = this.getCells();

    cells.forEach((cell) => {
      cell.addEventListener("click", (e) => {
        const targetCell = e.target;

        targetCell.classList.toggle("clicked");

        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);

        handler(x, y);
      });
    });
  }
}

export default toDoView;
