const { Ship, Gameboard } = require("./controller");

let board;

beforeEach(() => {
  board = new Gameboard();
});

test("getHit() increases hitCount by 1", () => {
  const ship = new Ship(3);
  expect(ship.hitCount).toBe(0);
  ship.getHit();
  expect(ship.hitCount).toBe(1);
});

test("isSunk returns true when ship is hit enough times", () => {
  const ship = new Ship(3);
  ship.getHit();
  expect(ship.isSunk()).toBe(false);
  ship.getHit();
  expect(ship.isSunk()).toBe(false);
});

test("placeShip() correctly places ship in the right spot", () => {
  board.placeShip(board.ships.carrier, 0, 0, "horizontal");
  expect(board.board[0][0].ship).toBe(board.ships.carrier);
  expect(board.board[0][1].ship).toBe(board.ships.carrier);
  expect(board.board[0][2].ship).toBe(board.ships.carrier);
  expect(board.board[0][3].ship).toBe(board.ships.carrier);
  expect(board.board[0][4].ship).toBe(board.ships.carrier);
});

test("receiveAttack() is correctly registered", () => {
  board.placeShip(board.ships.carrier, 0, 0, "horizontal");
  board.receiveAttack(0, 0);
  board.receiveAttack(1, 1);
  expect(board.board[0][0]).toEqual({
    ship: board.ships.carrier,
    isHit: true,
  });
  expect(board.board[1][1]).toEqual({
    ship: null,
    isHit: false,
  });
  expect(board.board[0][0].ship.hitCount).toBe(1);
  expect(board.missedAttacks).toBe(1);
});

test("placeShip throws error when attempting to place ship over another ship", () => {
  board.placeShip(board.ships.carrier, 0, 0, "horizontal");
  expect(() => {
    board.placeShip(board.ships.submarine, 0, 0, "horizontal");
  }).toThrow("This ship has already been placed");
});

test("allShipsSunk() returns true when all ships are sunk", () => {
  board.placeShip(board.ships.destroyer, 0, 0, "horizontal");
  board.receiveAttack(0, 0);
  // expect(board.allShipsSunk()).toBe(false);
  board.receiveAttack(0, 1);

  expect(board.allShipsSunk()).toBe(true);
});
