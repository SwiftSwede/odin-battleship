//game logic (the brain)
export class Ship {
  constructor(length) {
    this.length = length;
    this.hitCount = 0;
    this.sunk = null;
    this.placed = false;
  }

  getHit() {
    this.hitCount++;
  }

  isSunk() {
    return this.hitCount >= this.length;
  }
}

export class Gameboard {
  constructor() {
    this.board = Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }, () => ({ ship: null, isHit: false }))
    );
    this.ships = {
      carrier: new Ship(5),
      battleship: new Ship(4),
      cruiser: new Ship(3),
      submarine: new Ship(3),
      destroyer: new Ship(2),
    };
    this.missedAttacks = 0;
  }

  calculateShipPosition(ship, startX, startY, direction) {
    const positions = [];
    for (let i = 0; i < ship.length; i++) {
      let x = startX;
      let y = startY;
      if (direction === "horizontal") {
        y += i;
      } else if (direction === "vertical") {
        x += i;
      }
      positions.push({ x, y });
    }
    return positions;
  }

  placeShip(ship, startX, startY, direction) {
    if (ship.placed) {
      throw new Error("This ship has already been placed");
    }

    const positions = this.calculateShipPosition(
      ship,
      startX,
      startY,
      direction
    );

    //Check if any cell in the ship's path is already occupied
    positions.forEach((position) => {
      if (this.board[position.x][position.y].ship !== null) {
        throw new Error("This ship has already been placed");
      }
    });

    //place the ship
    positions.forEach((pos) => {
      this.board[pos.x][pos.y].ship = ship;
    });

    //Check if any cell in the ship's path is already occupied
    // for (let i = 0; i < ship.length; i++) {
    //   let x = startX;
    //   let y = startY;

    //   if (direction === "horizontal") {
    //     y += i;
    //   } else if (direction === "vertical") {
    //     x += i;
    //   }

    //   if (this.board[x][y].ship !== null) {
    //     throw new Error("This ship has already been placed");
    //   }
    // }

    // for (let i = 0; i < ship.length; i++) {
    //   if (direction === "horizontal") {
    //     this.board[startX][startY + i].ship = ship;
    //   } else if (direction === "vertical") {
    //     this.board[startX + i][startY].ship = ship;
    //   }
    // }

    ship.placed = true;
  }

  receiveAttack(xCoordinate, yCoordinate) {
    const cell = this.board[xCoordinate][yCoordinate];
    //Check if already hit
    if (cell.isHit) return;
    //Apply hit to ships hit counter
    if (cell.ship) {
      cell.ship.getHit();
      cell.isHit = true;
      if (cell.ship.isSunk()) {
      }
    } else {
      this.missedAttacks++;
      return "miss";
    }
  }

  allShipsSunk() {
    // return Object.values(this.ships).every((ship) => ship.isSunk());
    return Object.values(this.ships)
      .filter((ship) => ship.placed) // only check ships actually placed
      .every((ship) => ship.isSunk());
  }
}

export class Player {
  constructor() {
    this.players = {
      player1: {
        board: new Gameboard(),
        type: "human",
      },
      player2: {
        board: new Gameboard(),
        type: "computer",
      },
    };
  }
}

export default class toDoModel {
  constructor() {
    this.gameboard = new Gameboard();
    this.opponentGameboard = new Gameboard();
    console.log("Model initialized");
  }
}
