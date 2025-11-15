//Connects model and view (traffic controller)

export default class toDoController {
  constructor(model, view) {
    console.log("Controller loaded");
    this.model = model;
    this.view = view;

    //state variables to be passed to the view
    this.currentShip = 0;
    this.currentDirection = "horizontal";
    this.testShipsPlaced = false; // Add flag to prevent multiple calls
    this.currentTurn = 0;
  }

  init() {
    this.view.setUpBoards();
    this.view.createPlayerMessage();
    this.view.initPlaceShip((x, y) => {
      console.log("Clicked at", x, y);
      this.handlePlaceShip(x, y);
    });

    this.view.initPreviewShip((x, y) => {
      console.log("Hovered at", x, y);
      this.handlePreviewShip(x, y);
    });

    this.view.initAttack((x, y) => {
      console.log("Attacked at", x, y);
      this.handleReceiveAttack(x, y);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "r" || e.key === "R") {
        this.handleToggleShip();
      }
    });
  }

  // placeTestShips() {
  //   console.log("placeTestShips called");
  //   const testShips = [
  //     { name: "carrier", x: 0, y: 0, direction: "horizontal" },
  //     { name: "battleship", x: 0, y: 6, direction: "horizontal" },
  //     { name: "cruiser", x: 2, y: 0, direction: "horizontal" },
  //   ];

  //   testShips.forEach((ship) => {
  //     console.log(
  //       `Placing ${ship.name} at ${ship.x},${ship.y} ${ship.direction}`
  //     );
  //     const shipObject = this.model.opponentGameboard.ships[ship.name];

  //     // Check if any of the positions are already occupied
  //     const positions = this.model.opponentGameboard.calculateShipPosition(
  //       shipObject,
  //       ship.x,
  //       ship.y,
  //       ship.direction
  //     );

  //     console.log(`Positions for ${ship.name}:`, positions);

  //     positions.forEach((pos) => {
  //       const cellHasShip =
  //         this.model.opponentGameboard.board[pos.x][pos.y].ship !== null;
  //       console.log(`Position ${pos.x},${pos.y} has ship:`, cellHasShip);
  //     });

  //     this.model.opponentGameboard.placeShip(
  //       shipObject,
  //       ship.x,
  //       ship.y,
  //       ship.direction
  //     );
  //   });

  //   console.log(
  //     "Test ships placed on opponent board:",
  //     this.model.opponentGameboard.board
  //   );
  //   console.log("Opponent ships object:", this.model.opponentGameboard.ships);
  // }

  handlePreviewShip(x, y) {
    const totalShips = Object.keys(this.model.gameboard.ships).length;
    if (this.currentShip >= totalShips) {
      return; // Don't show preview if all ships are placed
    }

    const shipName = Object.keys(this.model.gameboard.ships)[this.currentShip];
    if (!shipName) {
      return; // No more ships to place
    }
    const ship = this.model.gameboard.ships[shipName]; // Add this line to get the ship object
    if (!ship) {
      return; // Ship doesn't exist
    }

    const direction = this.currentDirection;

    //Calculate positions in controller
    const positions = this.model.gameboard.calculateShipPosition(
      ship,
      x,
      y,
      direction
    );

    //pass positions to view
    this.view.previewShip(positions);
  }

  handleToggleShip() {
    this.currentDirection =
      this.currentDirection === "horizontal" ? "vertical" : "horizontal";

    // Use the model's logic to recalculate positions
    const hoveredCell = document.querySelector(".cell:hover");
    if (hoveredCell) {
      const x = parseInt(hoveredCell.dataset.x);
      const y = parseInt(hoveredCell.dataset.y);

      // Get ship info
      const shipName = Object.keys(this.model.gameboard.ships)[
        this.currentShip
      ];
      const ship = this.model.gameboard.ships[shipName];

      // Use existing model logic
      const positions = this.model.gameboard.calculateShipPosition(
        ship,
        x,
        y,
        this.currentDirection
      );

      // Use existing view logic
      this.view.previewShip(positions);
    }
  }

  handlePlaceShip(x, y) {
    console.log("placing ship");
    const shipName = Object.keys(this.model.gameboard.ships)[this.currentShip];
    const ship = this.model.gameboard.ships[shipName];
    const totalShips = Object.keys(this.model.gameboard.ships).length;
    const direction = this.currentDirection;

    if (!shipName) {
      return; // No more ships to place
    }

    if (!ship) {
      return; // Ship doesn't exist
    }

    const positions = this.model.gameboard.calculateShipPosition(
      ship,
      x,
      y,
      direction
    );

    this.model.gameboard.placeShip(ship, x, y, this.currentDirection);

    this.view.placeShip(positions);

    this.currentShip++;

    this.updatePlayerFeedback();

    console.log(
      `Current ship: ${this.currentShip}, Total ships: ${totalShips}`
    );

    // Check if all ships are placed AFTER incrementing
    if (this.currentShip >= totalShips && !this.testShipsPlaced) {
      console.log(
        "All ships placed! Calling placeTestShips and displayOpponentShips"
      );
      // this.placeTestShips();
      this.placeAllAIShips();
      this.view.displayOpponentShips(this.model.opponentGameboard);
      this.testShipsPlaced = true; // Mark as placed to prevent multiple calls
    }
  }

  placeAllAIShips() {
    const shipNames = Object.keys(this.model.opponentGameboard.ships);

    shipNames.forEach((shipName) => {
      const ship = this.model.opponentGameboard.ships[shipName];
      const shipLength = ship.length;

      // Find all valid positions for this ship
      const validPositions = this.getValidPositions(shipLength);

      // Pick a random valid position
      const randomPosition =
        validPositions[Math.floor(Math.random() * validPositions.length)];

      // Place the ship
      this.model.opponentGameboard.placeShip(
        ship,
        randomPosition.x,
        randomPosition.y,
        randomPosition.direction
      );
    });
  }

  getValidPositions(shipLength) {
    //Create an array to store valid positions
    const validPositions = [];

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        // Check horizontal placement and break if the ship can't be placed
        if (y + shipLength <= 10) {
          let canPlace = true;
          for (let i = 0; i < shipLength; i++) {
            if (this.model.opponentGameboard.board[x][y + i].ship !== null) {
              canPlace = false;
              break;
            }
          }
          //If the ship can be placed, add the position to the validPositions array
          if (canPlace) {
            validPositions.push({ x, y, direction: "horizontal" });
          }
        }

        // Check vertical placement
        if (x + shipLength <= 10) {
          let canPlace = true;
          for (let i = 0; i < shipLength; i++) {
            if (this.model.opponentGameboard.board[x + i][y].ship !== null) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            validPositions.push({ x, y, direction: "vertical" });
          }
        }
      }
    }

    return validPositions;
  }

  handleReceiveAttack(x, y) {
    if (this.currentTurn !== 0) return;

    const attackResult = this.model.opponentGameboard.receiveAttack(x, y);
    this.view.showAttackResult(x, y, attackResult);

    if (attackResult.result === "already hit") return;
    if (this.checkWin(this.model.opponentGameboard)) {
    }
    this.currentTurn = 1;
    this.handleComputerAttack();
  }

  handleComputerAttack() {
    if (this.currentTurn !== 1) return;

    let attackResult;
    let x, y;

    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      attackResult = this.model.gameboard.receiveAttack(x, y);
    } while (attackResult.result === "already hit");

    this.view.showOpponenetAttackResult(x, y, attackResult);

    if (this.checkWin(this.model.gameboard)) {
    }
    this.currentTurn = 0;
    // this.handleReceiveAttack();
  }

  updatePlayerFeedback() {
    const feedbackText = document.getElementById("feedback-text");
    const totalShips = Object.keys(this.model.gameboard.ships).length;

    if (this.currentShip >= totalShips) {
      feedbackText.textContent =
        "All ships placed successfully! Ready to start the game.";
    } else {
      const nextShip = Object.keys(this.model.gameboard.ships)[
        this.currentShip
      ];
      feedbackText.textContent = `Placing: ${nextShip} (${
        this.model.gameboard.ships[nextShip].length
      } cells). Ships left: ${totalShips - this.currentShip}`;
    }
  }

  checkWin(gameboard) {
    return gameboard.allShipsSunk();
  }
}
