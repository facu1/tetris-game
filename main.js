import './style.css'

// 1. Initialize canvas
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const scoreSpan = document.querySelector('span')
const startSection = document.querySelector('section')
const music = new window.Audio('./song.mp3')
music.volume = 0.3

const BLOCK_SIZE = 20
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)

// 2. Board
const board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0))

// 3. Pieces
const PIECES = [
  [
    [1, 1, 1, 1]
  ],
  [
    [1, 1, 1],
    [0, 0, 1]
  ],
  [
    [1, 1, 1],
    [1, 0, 0]
  ],
  [
    [1, 1],
    [1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ]
]
const actualPiece = {
  position: { x: 4, y: 0 },
  shape: [
    [1, 1],
    [1, 1]
  ]
}

// 3. Game loop
function draw () {
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = 'green'
        context.fillRect(x, y, 1, 1)
      }
    })
  })

  actualPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = 'green'
        context.fillRect(x + actualPiece.position.x, y + actualPiece.position.y, 1, 1)
      }
    })
  })

  scoreSpan.innerText = score
}

let dropCounter = 0
let lastTime = 0

function update (time = 0) {
  const deltaTime = time - lastTime
  lastTime = time
  dropCounter += deltaTime

  if (dropCounter >= 1000) {
    actualPiece.position.y++
    if (checkCollision()) {
      actualPiece.position.y--
      solidifyPiece()
      removeRows()
    }
    dropCounter = 0
  }

  draw()
  window.requestAnimationFrame(update)
}

// Events listeners
document.addEventListener('keydown', (event) => {
  console.info({ key: event.key })
  switch (event.key) {
    case 'ArrowLeft':
      actualPiece.position.x--
      if (checkCollision()) actualPiece.position.x++
      break
    case 'ArrowRight':
      actualPiece.position.x++
      if (checkCollision()) actualPiece.position.x--
      break
    case 'ArrowDown':
      actualPiece.position.y++
      if (checkCollision()) {
        actualPiece.position.y--
        solidifyPiece()
        removeRows()
      }
      break
    case 'ArrowUp':{
      const newShape = []

      for (let i = actualPiece.shape.length - 1; i >= 0; i--) {
        const row = actualPiece.shape[i]
        for (let j = 0; j < row.length; j++) {
          const value = row[j]
          !newShape[j] ? newShape[j] = [value] : newShape[j].push(value)
        }
      }

      const oldShape = actualPiece.shape
      actualPiece.shape = newShape
      if (checkCollision()) {
        actualPiece.shape = oldShape
      }
      break
    }
    case ' ': {
      while (!checkCollision()) {
        actualPiece.position.y++
      }
      actualPiece.position.y--
      solidifyPiece()
      removeRows()
    }
  }
})

function checkCollision () {
  return actualPiece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 &&
        (!board[y + actualPiece.position.y] ||
        board[y + actualPiece.position.y][x + actualPiece.position.x] !== 0)
      )
    })
  })
}

function solidifyPiece () {
  actualPiece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + actualPiece.position.y][x + actualPiece.position.x] = 1
      }
    })
  })

  actualPiece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
  actualPiece.position.x = 4
  actualPiece.position.y = 0

  if (checkCollision()) {
    window.alert('GAME OVER!!')
    board.forEach((row) => row.fill(0))
  }
}

let score = 0

const pointsByLines = [40, 100, 300, 1200]

function removeRows () {
  const rowsToRemove = []

  board.forEach((row, y) => {
    if (row.every((value) => value === 1)) rowsToRemove.push(y)
  })

  if (rowsToRemove.length) score += pointsByLines[rowsToRemove.length - 1]
  console.info({ score })

  rowsToRemove.forEach((y) => {
    board.splice(y, 1)
    const newRow = Array(BOARD_WIDTH).fill(0)
    board.unshift(newRow)
  })
}

startSection.addEventListener('click', () => {
  update()
  music.play()
  startSection.remove()
})
