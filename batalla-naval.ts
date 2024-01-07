type BoatName = 's' | 'm' | 'l' | 'xl'

type BoatForm = (0 | 1)[]

type BoatPos = [number, number]

type BoatRotation = 'v' | 'h'

interface BoatI {
    name: BoatName;
    form: BoatForm;
    position: BoatPos;
    rotation: BoatRotation
    aliveCells: number
    isModified: boolean
}

interface GameBoats {
    [boatName: string]: Boat;
    s: Boat;
    m: Boat;
    l: Boat;
    xl: Boat;
}

class Boat implements BoatI {
    name: BoatName;
    form: BoatForm;
    position: BoatPos = [0, 0]
    rotation: BoatRotation = 'v'
    aliveCells: number = 0
    isModified: boolean = false

    constructor(boatName: BoatName, boatForm: BoatForm) {
        this.name = boatName;
        this.form = boatForm;
    }
}

class Player {
    name: string
    board: [number, BoatName | null][][]
    guideBoard: number[][]
    boats: GameBoats;
    boatsAlive: number = 0

    constructor(name: string, boardSize: number) {
        this.name = name
        this.board = Array.from({ length: boardSize }, () =>
            Array(boardSize).fill(null).map(() => [0, null])
        )
        this.guideBoard = [...this.board].map((row) => {
            return row.map((cell) => cell[0])
        })
        this.boats = {
            s: new Boat('s', [0, 0]),
            m: new Boat('m', [0, 0, 0]),
            l: new Boat('l', [0, 0, 0, 0]),
            xl: new Boat('xl', [0, 0, 0, 0, 0])
        }
    }

    changeBoardCell(rowPos: number, colPos: number, newValue: number, owner: BoatName): void {
        this.board[rowPos][colPos] = [newValue, owner]
    }

    updateBoat(boatName: BoatName, position: BoatPos, rotation: BoatRotation): void {
        this.boats[boatName].position = position
        this.boats[boatName].rotation = rotation
        this.boats[boatName].isModified = true
    }

    addBoatToBoard(boat: Boat): void {
        let rowPos: number = boat.position[0]
        let colPos: number = boat.position[1]
        let validBoatCells: number = 0

        boat.form.forEach(() => {
            if (this.checkCollision(rowPos, colPos)) return console.log(`board is not that large, boat ${boat.name} has lost a piece!`)
            this.changeBoardCell(rowPos, colPos, 1, boat.name)
            if (boat.rotation === 'v') rowPos++
            if (boat.rotation === 'h') colPos++
            validBoatCells++
            boat.aliveCells++
        })

        if (validBoatCells >= 1) this.boatsAlive++

        console.log(`${this.name} added boat ${boat.name}!`)
    }

    sinkCell(rowPos: number, colPos: number): boolean {
        this.board[rowPos][colPos][0] = 0

        if (this.board[rowPos][colPos][1] !== null) {
            const boatName: string = this.board[rowPos][colPos][1] as string
            this.boats[boatName].aliveCells--
            console.log('hit!')
            if (this.checkIfBoatSunk(boatName as BoatName)) {
                this.boatsAlive--
                console.log(`${this.name} ${this.boats[boatName].name} boat sunk!`)
            }
            this.board[rowPos][colPos][1] = null
            return true
        } else {
            console.log('water!')
            return false
        }
    }

    checkCollision(rowPos: number, colPos: number) {
        if (this.board[rowPos] === null) return true
        if (this.board[rowPos][colPos] === null) return true
        if (this.board[rowPos][colPos][0] === 1) return true

        return false
    }

    checkIfBoatSunk(boatName: BoatName): boolean {
        return this.boats[boatName as string].aliveCells == 0 ? true : false
    }

    checkIfAllBoatsArePlaced(): boolean {
        let response: boolean[] = []
        for (let boat in this.boats) {
            if (this.boats[boat].isModified) response.push(true)
            else console.log(`${this.boats[boat].name} of ${this.name} is not placed!`)
        }
        if (response.every(() => true) && response.length == 4) return true
        else return false
    }
}

class Game {

    private player1: Player
    private player2: Player
    private isGameInitialized: boolean = false
    private isGameReady: boolean = false
    private turn: 1 | 2 = 1
    private winner: string = ''

    constructor(name1: string, name2: string, private boardSize: number = 10) {
        this.player1 = new Player(name1, boardSize)
        this.player2 = new Player(name2, boardSize)
    }

    private checkGameEnded() {
        if (!this.isGameReady) return console.error('Game is not playing')
        if (this.player1.boatsAlive == 0) {
            this.winner = this.player2.name
            return true
        }
        else if (this.player2.boatsAlive == 0) {
            this.winner = this.player1.name
            return true
        }
        else {
            return false
        }
    }

    start() {
        this.isGameInitialized = true
        return console.log('Game started! Place boats with game.placeBoat(player: "p1" | "p2", boatName: BoatName, boatPos: BoatPos, boatRotation: BoatRotation)')
    }

    play() {
        if (!this.isGameInitialized) return console.error('game is not initialized')
        if (this.player1.checkIfAllBoatsArePlaced() && this.player2.checkIfAllBoatsArePlaced()) {
            console.log('All ready, Shot with game.shot(cellPosition: [rowPosition, colPosition])')
            console.log(`Player ${this.turn} starts...`)
            this.isGameReady = true
        }
        else {
            console.error('not all boats are placed! cant play game')
        }
    }

    shot(cellPosition: [number, number]) {
        if (!this.isGameReady) return console.error('Game is not playing')

        if (cellPosition[0] >= this.boardSize || cellPosition[1] >= this.boardSize) return console.log(`coordinates exceeds board limits! try again`)
        console.log(`player ${this.turn} shot at ${cellPosition}`)

        if (this.turn === 1) {
            if (!this.player2.sinkCell(cellPosition[0], cellPosition[1])) {
                this.player1.guideBoard[cellPosition[0]][cellPosition[1]] = 1
                this.turn = 2
            }
            else this.player1.guideBoard[cellPosition[0]][cellPosition[1]] = 2
        }
        else {
            if (!this.player1.sinkCell(cellPosition[0], cellPosition[1])) {
                this.player2.guideBoard[cellPosition[0]][cellPosition[1]] = 1
                this.turn = 1
            }
            else this.player2.guideBoard[cellPosition[0]][cellPosition[1]] = 2
        }

        if (!this.checkGameEnded()) console.log(`next turn: player ${this.turn}`)
        else console.log(`${this.winner} Won, sunk all enemy boats!`)
    }

    placeBoat(player: 'p1' | 'p2', boatName: BoatName, boatPos: BoatPos, boatRotation: BoatRotation) {
        if (!this.isGameInitialized) return console.error('game not initialized')
        if (player === 'p1') {
            if (this.player1.boats[boatName].isModified) return console.log(`boat ${this.player1.boats[boatName].name} already placed!`)
            this.player1.updateBoat(boatName, boatPos, boatRotation)
            this.player1.addBoatToBoard(this.player1.boats[boatName])
        }
        if (player === 'p2') {
            if (this.player2.boats[boatName].isModified) return console.log(`boat ${this.player2.boats[boatName].name} already placed!`)
            this.player2.updateBoat(boatName, boatPos, boatRotation)
            this.player2.addBoatToBoard(this.player2.boats[boatName])
        }
    }

    showBoard(player: number) {
        if (!this.isGameInitialized) return console.error('game not initialized')
        if (player == 1) {
            console.log(`player ${player} board: \n`, this.player1.board.map((row) => {
                return row.map((cell) => cell[0])
            }))
        }
        if (player == 2) {
            console.log(`player ${player} board: \n`, this.player2.board.map((row) => {
                return row.map((cell) => cell[0])
            }))
        }
    }

    showGuideBoard(player: number) {
        if (!this.isGameInitialized) return console.error('game not initialized')
        if (player == 1) {
            console.log(`player ${player} guide board: \n`, this.player1.guideBoard)
        }
        if (player == 2) {
            console.log(`player ${player} guide board: \n`, this.player2.guideBoard)
        }
    }
}

const game = new Game('p1', 'p2')

game.start()

game.placeBoat('p1', 's', [4, 5], 'v')
game.placeBoat('p1', 'm', [7, 7], 'h')
game.placeBoat('p1', 'l', [1, 6], 'v')
game.placeBoat('p1', 'xl', [5, 1], 'h')

game.placeBoat('p2', 's', [0, 0], 'h')
game.placeBoat('p2', 'm', [1, 0], 'h')
game.placeBoat('p2', 'l', [2, 0], 'h')
game.placeBoat('p2', 'xl', [3, 0], 'h')

game.play()

game.shot([0, 1])
game.shot([0, 15])

game.shot([1, 0])
game.shot([1, 1])
game.shot([1, 4])
/* game.shot([1,2])

game.shot([2,0])
game.shot([2,1])
game.shot([2,2])
game.shot([2,3])

game.shot([3,0])
game.shot([3,1])
game.shot([3,2])
game.shot([3,3])
game.shot([3,4]) */

game.showBoard(2)
game.showGuideBoard(1)