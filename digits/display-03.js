const COOL_GREEN = '99, 255, 132'
const COOL_BLUE = '0, 115, 255'
const COOL_RED = '255, 99, 132'
const COOL_ORANGE = '255, 159, 64'


function create_and_append(type, parent=null, id=null, class_=null) {
  if (parent == null)
      parent = document.body

  let element = document.createElement(type)

  if (id != null)
      element.id = id
  if (class_ != null)
      element.setAttribute('class', class_)

  parent.appendChild(element)
  return element
}

function create_incrementer(parent, id, def, title, expl=null) {
  let div = create_and_append("div", parent, id, "input-group")

  div.innerHTML += `<label style="margin-right:5px;" for=${id}>${title}</label>`

  let left_div = create_and_append("div", div, null, "input-group-prepend")
  let left_button = create_and_append("button", left_div, null, "btn")
  left_button.type = "button"
  left_button.setAttribute("onclick", `let elem = document.getElementById('${id}_input'); if (elem.value > elem.min) {elem.value -= 1; elem.dispatchEvent(new Event("change"))}`)
  create_and_append("span", left_button, null, "glyphicon glyphicon-minus")

  let input = create_and_append("input", div, id+"_input", "form-control")
  input.type = "number"
  input.setAttribute("value", def)
  input.max = 20
  input.min = 1   

  let right_div = create_and_append("div", div, null, "input-group-append")
  let right_button = create_and_append("button", right_div, null, "btn")
  right_button.type = "button"
  right_button.setAttribute("onclick", `let elem = document.getElementById('${id}_input'); if (+elem.value < +elem.max) { elem.value = +elem.value + 1; elem.dispatchEvent(new Event("change"))}`)
  create_and_append("span", right_button, null, "glyphicon glyphicon-plus")


  if (expl != null) {
    create_and_append("p", div, null, "settings_expl").innerHTML = expl
  }

  return input
}


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
  }

  initElements() {
    document.body.style.color = 'white'
    document.body.style.display = 'grid'
    document.body.style.position = 'relative'
    document.body.style['align-items'] = 'center'

    
    let settings_content = `
    <div id="settings_div" style="border-radius:5px;display: grid;width: 100%;padding: 5px;background-color:rgb(255,255,255,.2);">

      <h2 style="justify-self: center;">Settings</h2>
      <br>
      <div class="settings_div">
        <div id="n_input_container" class="setting_div">
          <!--
          <input id="N"> 
          <label for="N">N Queens</label>
          <p class="settings_expl">This is the number of queens, and size of the board.</p> -->
        </div>
        <div class="setting_div">
          <label for="pop_size">Population Size</label>
          <input id="pop_size"> 
          <p class="settings_expl">This is the size of the population.</p>
        </div>
      </div>
      <button id="set_default_btn" class="btn">Set Default</button>
      <input id="speed_slider" type="range" min=0 max=10 value=5 style="width:100%;">
      <div id="content_top_right_bar_div" style="display: grid; grid-template-columns: 49% 49%; column-gap: 2%;">
        <button id="reset_btn" class="btn">Reset</button>
        <button id="info_btn" class="btn">Info</button>
      </div>
    </div>
    `

    let innerHTML = `
    <div id="content_wrapper" style="width:100%;height:100%;position:absolute;padding:10px">
    <div id="content_div" style="display: grid; align-items: center; justify-items: center; width:100%; height:100%; grid-template-rows: 100%;">
      <div id="content_top_div" style="display: grid; align-items: end; justify-items: center; grid-template-columns: 50% 50%; width: 100%; height:100%; column-gap:5px">
        <div id="content_top_left_div" style="width: 100%; height:100%; align-items: center; display: grid;">
          ${settings_content}
          <canvas id="graph_canvas"></canvas>
        </div>
        <div id="content_top_middle_div" style="width: 100%; height: 100%; align-items: center; display: grid;">
          <div id="board"></div>
        </div>
      </div>
      <div id="content_bottom_div" style="width: 100%; height: 100%">
      </div>
    </div>
    </div> 
    `

    let highlights_info = ``

    let implementation_info = `
    <p>For this implementation, the (un)fitness of a board is the number of queens that can attack each other.</p>
    <p>Each generation, the best half of the board population is kept, and the worst half is removed.</p>
    <p>The best boards are duplicated, and then mutated.</p>
    <p>The mutation selects a number of queens to move randomly to an empty space.</p>
    `

    let controls_info = ``

    let visualization_info = ``

    let info_html = `
    <p>This is an evolutionary algorithm that solves the N Queens problem.</p>
    <p>The N Queens problem is a puzzle where you have to place N queens on an NxN chess board such that no queen can attack another queen.</p>
    
    <!--
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
    <br> -->
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

    </div>
    </div>
    `

    document.body.insertAdjacentHTML('beforeend', innerHTML)
    document.body.insertAdjacentHTML('beforeend', settings)

    // Create incrementer in n_input_container
    let n_input_container = document.getElementById("n_input_container")
    create_incrementer(n_input_container, "N", 8, "N Queens", "This is the number of queens, and size of the board.")
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
      let middle_height = document.getElementById("content_top_middle_div").offsetHeight

      let board = document.getElementById("board")
      let board_size = Math.min(middle_width, middle_height)*.9
      board.style.height = board_size + "px"
      board.style.width = board_size + "px"
      
      // Set style height of squares to the offsetWidth of the squares
      // Use existing style element for this
      let style = document.getElementById('square_height');
      style.innerHTML = `
        .square {
          height: ${board.children[0].offsetWidth}px !important;
        }
      `;

      let side_width = (width - middle_width) / 2

      if (this.graph) {
        this.graph.destroy() 
        // this.canvas.graph.height = content_top_height
        // this.canvas.graph.height = window.innerHeight / 2
        this.canvas.graph.width = side_width
        this.graph = this.initGraph()
        this.updateGraph(document.value.nn)
      } else {
        // this.canvas.graph.height = content_top_height
        // this.canvas.graph.height = window.innerHeight / 2
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