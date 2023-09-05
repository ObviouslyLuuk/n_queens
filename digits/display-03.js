const COOL_GREEN = '99, 255, 132'
const COOL_BLUE = '0, 115, 255'
const COOL_RED = '255, 99, 132'
const COOL_ORANGE = '255, 159, 64'

class Display {
  constructor(n) {

    this.initElements()

    // Init chess board as grid of square divs
    this.board = document.getElementById("board")
    this.init_board(n)

    this.canvas = {   
      graph:        document.getElementById("graph_canvas"),
    }

    this.graph = null
  }

  init_board(n) {
    this.board.innerHTML = ""
    this.board.style["grid-template-columns"] = `repeat(${n}, 1fr)`

    for (let i = 0; i < n*n; i++) {
      let square = document.createElement("div")
      square.classList.add("square")
      square.id = "square_" + i
      this.board.appendChild(square)
    }
    
    // Set style height of squares to the offsetWidth of the squares
    // Use existing style element for this
    let style = document.getElementById('square_height');
    style.innerHTML = `
    .square {
      height: ${this.board.children[0].offsetWidth}px !important;
    }
    `;
  }

  initElements() {
    document.body.style.color = 'white'
    document.body.style.display = 'grid'
    document.body.style.position = 'relative'
    document.body.style['align-items'] = 'center'

    let innerHTML = `
    <div id="content_wrapper" style="width:100%;height:100%;position:absolute;padding:10px">
    <div id="content_div" style="display: grid; align-items: center; justify-items: center; width:100%; height:100%; grid-template-rows: 40% 60%;">
      <div id="content_top_div" style="display: grid; align-items: end; justify-items: center; grid-template-columns: 50% 50%; width: 100%; height:100%; column-gap:5px">
        <div id="content_top_left_div" style="width: 100%; height:100%">
          <canvas id="graph_canvas"></canvas>
          <input id="speed_slider" type="range" min=0 max=10 value=5 style="width:100%;">
          <div id="content_top_right_bar_div" style="display: grid; grid-template-columns: 49% 49%; column-gap: 2%;">
            <button id="reset_btn" class="btn">Reset</button>
            <button id="info_btn" class="btn">Info</button>
          </div>
        </div>
        <div id="content_top_middle_div">
          <div id="content_top_middle_main_div" style="display: grid; justify-items: center; margin-bottom: 5px;">
            <div id="board"></div>
          </div>
        </div>
      </div>
    </div>
    </div> 
    `

    let highlights_info = ``

    let implementation_info = `
    `

    let controls_info = ``

    let visualization_info = ``

    let info_html = `
    <details>
      <summary><h4>HIGHLIGHTS</h4></summary>
      ${highlights_info}
    </details>
    <br>
    <details>
      <summary><h4>VISUALIZATION</h4></summary>
      ${visualization_info}
    </details>
    <br>
    <details>
      <summary><h4>CONTROLS</h4></summary>
      ${controls_info}
    </details>
    <br>
    <details>
      <summary><h4>IMPLEMENTATION</h4></summary>
      ${implementation_info}
    </details>    
    `

    let settings = `
    <div id="info_div" style="background-color: rgb(0,0,0,.95);width: 90%;height: 90%;border-radius: 20px;z-index: 1;position:absolute;justify-content: center;display:none;">
    <a id="close_info_btn">x</a>
    <div data-simplebar style="width: 100%;height: 100%;padding: 30px;">

      <h2>Info</h2>
      <p>${info_html}</p>
      <br>

      <div id="settings_div" style="border-radius:5px;display: grid;width: 100%;padding: 5px;background-color:rgb(255,255,255,.2);">

        <h2 style="justify-self: center;">Settings</h2>
        <br>
        <div class="settings_div">
          <div>
            <input id="N"> 
            <label for="N">N Queens</label>
            <p class="settings_expl">This is the number of queens, and size of the board.</p>
          </div>
          <div>
            <input id="pop_size"> 
            <label for="N">Population Size</label>
            <p class="settings_expl">This is the size of the population.</p>
          </div>      
        </div>
        <button id="set_default_btn" class="btn">Set Default</button>
      </div>
    </div>
    </div>
    `

    document.body.insertAdjacentHTML('beforeend', innerHTML)
    document.body.insertAdjacentHTML('beforeend', settings)
  }

  initGraph() {
    this.rendered_epoch = null
    let ctx = this.canvas.graph.getContext('2d')

    let graph = new Chart(ctx, {
      type: 'line',
      data: {
          labels: [],
          datasets: [{
              label: 'min conflicts',
              data: [],
              backgroundColor: [`rgba(${COOL_GREEN}, 0.2)`],
              borderColor: [`rgba(${COOL_GREEN}, 1)`],              
              borderWidth: 1
            },{
              label: 'avg conflicts',
              data: [],
              backgroundColor: [`rgba(${COOL_BLUE}, 0.2)`],
              borderColor: [`rgba(${COOL_BLUE}, 1)`],
              borderWidth: 1
            }
          ]
      },
      options: {
          scales: {
              y: {
                  position: 'right',
                  beginAtZero: true,
                  // max: 1,
              }
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },      
          animation: {
            duration: 0
          },   
      }
    });

    return graph
  }

  updateGraph(game) {
    let labels = []
    for (let i in game.top_scores) {labels.push(parseInt(i)+1)}

    this.graph.data.labels = labels
    this.graph.data.datasets[0].data = game.top_scores.slice()
    this.graph.data.datasets[1].data = game.avg_scores.slice()
    this.graph.update()
  }

  fillBoard(empty, n) {
    // Check whether empty square amount checks out
    if (empty.length != n*n-n) {
      return
    }
    // Check whether squares exist
    if (document.querySelectorAll(".square").length != n*n) {
      return
    }

    // Draw queens everywhere
    for (let i = 0; i < n*n; i++) {
      let square = document.getElementById("square_" + i)
      square.classList.add("queen")
      square.classList.remove("conflict")
    }

    // Remove queens from empty squares
    for (let i = 0; i < empty.length; i++) {
      let pos = empty[i]
      let nth_square = pos[0]*n + pos[1]
      let square = document.getElementById(`square_${nth_square}`)
      square.classList.remove("queen")
    }

    return true
  }

  drawConflicts(conflicts, n) {
    // Check whether squares exist
    if (document.querySelectorAll(".square").length != n*n) {
      return
    }

    // Make attacked queens red
    for (let i = 0; i < conflicts.length; i++) {
      let conflict = conflicts[i]
      for (let j = 0; j < conflict.length; j++) {
        let pos = conflict[j]
        let nth_square = pos[0]*n + pos[1]
        let square = document.getElementById(`square_${nth_square}`)
        square.classList.add("conflict")
      }
    }
  }

  resize(width, height, height_width_ratio) {

    let content_top_height = document.getElementById("content_top_div").offsetHeight
    if (!window.mobileCheck()) {
      let middle_width = document.getElementById("content_top_middle_div").offsetWidth
      let side_width = (width - middle_width) / 2

      if (this.graph) {
        this.graph.destroy() 
        this.canvas.graph.height = content_top_height
        this.canvas.graph.width = side_width
        this.graph = this.initGraph()
        this.updateGraph(document.value.nn)
      } else {
        this.canvas.graph.height = content_top_height
        this.canvas.graph.width = side_width
      }

    } else { // Mobile
      // If new mobile
      document.getElementsByClassName("settings_div").forEach(element => {
        element.style['grid-template-columns'] = "auto"
      })
      let content_div = document.getElementById("content_div")
      let graph_canvas = document.getElementById("graph_canvas")
      let top_right_div = document.getElementById("content_top_right_div")
      top_right_div.parentElement.removeChild(top_right_div)
      content_div.appendChild(top_right_div)
      graph_canvas.parentElement.removeChild(graph_canvas)
      content_div.appendChild(graph_canvas)

      content_div.style['grid-template-rows'] = 'auto'
      document.getElementById("content_top_div").style['grid-template-columns'] = 'auto'
      // -----    

    }

  }
}