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
    this.view.bindPlaceShip((x, y) => {
      console.log("Clicked at", x, y);
    });

    this.view.initPreviewShip((x, y) => {
      console.log("Hovered at", x, y);
      this.handlePreviewShip(x, y);
    });
  }

  handlePlaceShip(ship, x, y, direction) {
    console.log("placing ship");
  }

  handlePreviewShip(x, y) {
    const shipName = Object.keys(this.model.gameboard.ships)[this.currentShip];
    const ship = this.model.gameboard.ships[shipName]; // Add this line to get the ship object
    const direction = this.currentDirection;

    //Calculate positions in controller
    const positions = this.model.gameboard.calculateShipPosition(
      ship,
      x,
      y,
      direction
    );

    //Pass positions to view
    this.view.previewShip(positions);
  }

  toggleShipPreview(ship, x, y, direction) {}
}
