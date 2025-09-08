//Initializes everything and kicks off the app
//Import the model, view and controller
//Initiate the controller

import toDoController from "./controller.js";
import toDoView from "./view.js";
import toDoModel, { Ship, Gameboard, Player } from "./model.js";
import "./styles.css";

document.addEventListener("DOMContentLoaded", () => {
  const model = new toDoModel();
  const view = new toDoView();
  const controller = new toDoController(model, view);

  controller.init();
});
