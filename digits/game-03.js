/**
 * Game class
 * 
 * This class is used to keep track of the state of the game.
 * The game in this case is the n queens problem.
 */
class Game {
    constructor(n, pop_size=20, max_move=null) {
        this.n = n
        this.pop_size = pop_size

        this.boards = []
        for (let i = 0; i < pop_size; i++) {
            this.boards.push(new Board(n))
        }

        this.max_move = max_move
        if (max_move == null) {
            this.max_move = n/2
        }

        this.top_scores = []
        this.avg_scores = []
    }

    step() {
        // Sort boards by fitness
        this.boards.sort((a, b) => {
            let a_pairs = a.get_attack_pairs()
            let b_pairs = b.get_attack_pairs()
            return a_pairs.length - b_pairs.length
        })

        // Add best score to scores
        this.top_scores.push(this.boards[0].get_attack_pairs().length)

        let avg_score = 0
        for (let i = 0; i < this.pop_size; i++) {
            avg_score += this.boards[i].get_attack_pairs().length
        }
        avg_score /= this.pop_size

        this.avg_scores.push(avg_score)

        // Remove worst boards
        this.boards.splice(Math.floor(this.pop_size/2), Math.ceil(this.pop_size/2))

        // Duplicate best boards
        for (let i = 0; i < this.pop_size/2; i++) {
            let board = this.boards[i]
            let new_board = new Board(board.n)
            let queens = board.queens.slice()
            // Copy queens by JSON
            new_board.queens = JSON.parse(JSON.stringify(queens))
            this.boards.push(new_board)
            this.mutate(new_board)
        }

        // Return attack pairs
        return {
            empty: this.boards[0].get_empty_squares(),
            conflicts: this.boards[0].get_attack_pairs(),
            correct: this.boards[0].check_win(),
        }
    }

    mutate(board) {
        // Select k queens to move
        let k = Math.floor(Math.random() * (this.max_move-1))+1
        let all_queens = board.queens.slice()
        let queen_selection = []
        for (let i = 0; i < k; i++) {
            let random_index = Math.floor(Math.random() * all_queens.length)
            let random_queen = all_queens[random_index]
            queen_selection.push(random_queen)
            all_queens.splice(random_index, 1)
        }

        // Move selected queens
        for (let i = 0; i < queen_selection.length; i++) {
            let queen = queen_selection[i]
            board.move_queen(queen)
        }

        return board
    }

    reset() {
        this.boards = []
        for (let i = 0; i < this.pop_size; i++) {
            this.boards.push(new Board(this.n))
        }
        this.top_scores = []
        this.avg_scores = []
    }
}

class Board {
    constructor(n=8) {
        this.n = n
        this.queens = []

        this.reset()
    }

    reset() {
        this.queens = []
        // Initialize queens
        for (let i = 0; i < this.n; i++) {
            this.queens.push(new Queen(i, 0))
        }
        // Randomize queens
        for (let i = 0; i < this.queens.length; i++) {
            this.move_queen(this.queens[i])
        }
    }

    move_queen(queen) {
        let empty_squares = this.get_empty_squares()
        let random_index = Math.floor(Math.random() * empty_squares.length)
        let random_square = empty_squares[random_index]
        queen.position = random_square
    }

    get_empty_squares() {
        let squares = []
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.n; j++) {
                squares.push(`${i},${j}`)
            }
        }
        // Remove squares with queens
        for (let i = 0; i < this.queens.length; i++) {
            let queen = this.queens[i]
            let index = squares.indexOf(queen.position.join(","))
            if (index > -1) {
                squares.splice(index, 1)
            }
        }
        // Make strings back into arrays
        squares = squares.map((square) => square.split(",").map((x) => parseInt(x)))
        return squares
    }

    get_attack_pairs() {
        let pairs = []
        for (let i = 0; i < this.queens.length; i++) {
            let queen = this.queens[i]
            let queen_pos = queen.position
            for (let j = 0; j < this.queens.length; j++) {
                if (i >= j) continue // Don't check pairs twice

                let other_queen = this.queens[j]
                let other_queen_pos = other_queen.position
                if (queen_pos[0] == other_queen_pos[0] || queen_pos[1] == other_queen_pos[1] || Math.abs(queen_pos[0] - other_queen_pos[0]) == Math.abs(queen_pos[1] - other_queen_pos[1])) {
                    pairs.push([queen_pos, other_queen_pos])
                }
            }
        }
        return pairs
    }

    check_win() {
        if (this.queens.length != this.n) return false

        let pairs = this.get_attack_pairs()
        if (pairs.length == 0) return true
        return false
    }
}

class Queen {
    constructor(x, y) {
        this.position = [x, y]
    }
}
