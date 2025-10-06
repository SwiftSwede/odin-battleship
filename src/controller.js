//Connects model and view (traffic controller)

export default class toDoController {
  constructor(model, view) {
    console.log("Controller loaded");
    this.model = model;
    this.view = view;

    //state variables to be passed to the view
    this.currentShip = 0;
    this.currentDirection = "horizontal";
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

    document.addEventListener("keydown", (e) => {
      if (e.key === "r" || e.key === "R") {
        this.handleToggleShip();
      }
    });
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

    const positions = this.model.gameboard.calculateShipPosition(
      ship,
      x,
      y,
      direction
    );

    if (this.currentShip >= totalShips) {
      return; // Don't show preview if all ships are placed
    }

    if (!shipName) {
      return; // No more ships to place
    }

    if (!ship) {
      return; // Ship doesn't exist
    }

    this.model.gameboard.placeShip(ship, x, y, this.currentDirection);

    this.view.placeShip(positions);

    this.currentShip++;

    this.updatePlayerFeedback();
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
