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

    //AI state variables
    this.ai = {
      mode: "hunt",
      attacked: Set(),
      queue: [],
      lastHit: null,
      orientation: null,
    };
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

    //helper function that picks a cell to attack
    const attackCell = () => {
      let cell;
      if (this.ai.mode === "hunt") {
        cell = this.pickHuntCell(); // parity + not in attacked
      } else {
        // 'target'
        while (this.ai.queue.length && !cell) {
          const c = this.ai.queue.shift();
          if (!this.ai.attacked.has(`${c.x},${c.y}`)) cell = c;
        }
        if (!cell) {
          this.ai.mode = "hunt";
          cell = this.pickHuntCell();
        }
      }
      return cell;
    };

    const cell = attackCell();
    const result = this.model.gameboard.receiveAttack(cell.x, cell.y);
    this.ai.attacked.add(`${cell.x},${cell.y}`);
    this.view.showPlayerBoardAttack(cell.x, cell.y, result);

    if (this.checkWin(this.model.gameboard)) {
      this.handleGameOver("computer");
      return;
    }

    if (result.result === "hit" || result.result === "sunk") {
      if (this.ai.mode === "hunt") {
        this.ai.mode = "target";
        this.ai.lastHit = { x: cell.x, y: cell.y };
        this.ai.orientation = null;
        this.ai.queue = [];
        this.seedNeighbors({ x: cell.x, y: cell.y }); // must enqueue to this.ai.queue
      } else {
        // target
        if (!this.ai.orientation && this.ai.lastHit) {
          this.ai.orientation = this.inferOrientation(this.ai.lastHit, cell); // 'horizontal'|'vertical'
        }
        this.extendLine(cell, this.ai.orientation); // enqueue along line, skipping attacked/out-of-bounds
        this.ai.lastHit = { x: cell.x, y: cell.y };
      }
      if (result.result === "sunk") {
        this.ai.mode = "hunt";
        this.ai.lastHit = null;
        this.ai.orientation = null;
        this.ai.queue = [];
      }
    } else if (result.result === "miss") {
      // in target mode, just continue next time; do not reset attacked
      // if queue empties next call → mode flips to 'hunt' in attackCell()
    }

    this.currentTurn = 0;
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

  //Helper functions
  checkWin(gameboard) {
    return gameboard.allShipsSunk();
  }

  isInBounds(x, y) {
    return x >= 0 && x < 10 && y >= 0 && y < 10;
  }

  hasBeenAttacked(x, y) {
    return this.model.gameboard.board[x][y].isHit;
  }

  markAttacked(x, y) {
    this.ai.attacked.add(`${x},${y}`);
  }

  enqueueIfValid(x, y) {
    if (this.isInBounds(x, y) && !this.hasBeenAttacked(x, y)) {
      return { x, y };
    }
    return null;
  }

  pickHuntCell() {
    const validCells = [];
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        if (this.enqueueIfValid(x, y)) {
          validCells.push({ x, y });
        }
      }
    }
  }

  seedNeighbors(x, y) {
    const neighbors = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx !== 0 || dy !== 0) {
          neighbors.push({ x: x + dx, y: y + dy });
        }
      }
    }
  }

  seedNeighbor(x, y) {
    const neighbors = this.seedNeighbors(x, y);
    neighbors.forEach((neighbor) => {
      if (this.enqueueIfValid(neighbor.x, neighbor.y)) {
        validCells.push(neighbor);
      }
    });
  }

  inferOrientation(x, y) {
    const neighbors = this.seedNeighbors(x, y);
    const orientations = [];
    neighbors.forEach((neighbor) => {
      if (this.enqueueIfValid(neighbor.x, neighbor.y)) {
        orientations.push(neighbor);
      }
    });
  }

  extendLine(from, orientation) {
    const line = [];
    for (let i = 0; i < 10; i++) {
      line.push({
        x: from.x + i * orientation.x,
        y: from.y + i * orientation.y,
      });
    }
    return line;
  }
}
