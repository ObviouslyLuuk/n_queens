window.addEventListener("load", function(event) {

  "use strict";

    ///////////////////
   //// FUNCTIONS ////
  ///////////////////

  var resize = function(event) {

    display.resize(document.getElementById("content_div").offsetWidth, document.getElementById("content_div").offsetHeight, 9/16)
  }

  var render = function() {

    display.updateGraph(game)

    if (display.fillBoard(step_res.empty, game.n))
      display.drawConflicts(step_res.conflicts, game.n)
  }

  var update = function() {
    if (engine.slowmo) {
      engine.setSlowMo(false)
      game.reset()
    } else if (step_res.correct == true) {
      engine.setSlowMo()
      return
    }

    step_res = game.step()
  }

    /////////////////
   //// OBJECTS ////
  /////////////////

  let n = 8

  var display    = new Display(n)
  var controller = new Controller()
  var engine     = new Engine(1000/25, render, update)
  var game       = new Game(n)

  document.value = {
    game: game, 
    controller: controller,
    display: display,
    engine: engine,
  }

    ////////////////////
   //// INITIALIZE ////
  ////////////////////

  document.title = "N Queens"

  var step_res = {empty: [], conflicts: [], correct: false}

  resize()
  controller.init_buttons(game)
  controller.init_settings()
  display.graph = display.initGraph()

  engine.start()

  window.addEventListener("resize",  resize)

})
