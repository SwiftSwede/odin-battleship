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

  placeTestShips() {
    console.log("placeTestShips called");
    const testShips = [
      { name: "carrier", x: 0, y: 0, direction: "horizontal" },
      { name: "battleship", x: 0, y: 6, direction: "horizontal" },
      { name: "cruiser", x: 2, y: 0, direction: "horizontal" },
    ];

    testShips.forEach((ship) => {
      console.log(
        `Placing ${ship.name} at ${ship.x},${ship.y} ${ship.direction}`
      );
      const shipObject = this.model.opponentGameboard.ships[ship.name];

      // Check if any of the positions are already occupied
      const positions = this.model.opponentGameboard.calculateShipPosition(
        shipObject,
        ship.x,
        ship.y,
        ship.direction
      );

      console.log(`Positions for ${ship.name}:`, positions);

      positions.forEach((pos) => {
        const cellHasShip =
          this.model.opponentGameboard.board[pos.x][pos.y].ship !== null;
        console.log(`Position ${pos.x},${pos.y} has ship:`, cellHasShip);
      });

      this.model.opponentGameboard.placeShip(
        shipObject,
        ship.x,
        ship.y,
        ship.direction
      );
    });

    console.log(
      "Test ships placed on opponent board:",
      this.model.opponentGameboard.board
    );
    console.log("Opponent ships object:", this.model.opponentGameboard.ships);
  }

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
      this.placeTestShips();
      this.view.displayOpponentShips(this.model.opponentGameboard);
      this.testShipsPlaced = true; // Mark as placed to prevent multiple calls
    }
  }

  handleReceiveAttack(x, y) {
    const attackResult = this.model.opponentGameboard.receiveAttack(x, y);
    this.view.receiveAttack(x, y, attackResult);
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
}
