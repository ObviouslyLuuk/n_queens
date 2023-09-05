class Controller {
  constructor() {

    this.buttons = {
      reset: document.getElementById("reset_btn"),
      info: document.getElementById("info_btn"),
    }
  }

  init_buttons(game) {
    document.getElementById("speed_slider").oninput = function() {
      document.value.engine.setSlowMo(false);
      let time_step = this.value*this.value;
      document.value.engine.changeTimeStep(1000/time_step)      
    }

    this.buttons.reset.onclick = function() { document.value.game.reset() }

    this.buttons.info.onclick = function() {
      let div = document.getElementById("info_div")
      let display = div.style.display
      if (display == 'none') {
        div.style.display = 'block'
      } else {
        div.style.display = 'none'
      }      
    }
    document.getElementById("close_info_btn").onclick = function() {
      document.getElementById("info_div").style.display = 'none'
    }
  }

  init_settings() {
    this.settings_update_values()

    document.getElementById("N").onchange = function() {
      document.value.display.init_board(this.value)
      document.value.game.n = this.value
      document.value.game.reset()
    }
    document.getElementById("pop_size").onchange = function() {
      document.value.game.pop_size = this.value
      document.value.game.reset()
    }
  }

  settings_update_values() {
    document.getElementById("N").value = document.value.game.n
    document.getElementById("pop_size").value = document.value.game.pop_size
  }
}




