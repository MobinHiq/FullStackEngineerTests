export const DEFAULT_GAME_SETTINGS = {
  game: {
    title: "Asteroid Adventure",
    version: "1.0.0",
    screen: {
      width: 1024,
      height: 768,
      fullscreen: false
    },
    audio: {
      backgroundMusicVolume: 0.8,
      soundEffectsVolume: 0.7
    }
  },
  player: {
    lives: 3,
    shipSpeed: 5.0,
    turnSpeed: 2.5,
    fireRate: 0.5,
    bulletSpeed: 10.0
  },
  asteroids: {
    spawnRate: 1.5,
    minSize: 20,
    maxSize: 100,
    speed: {
      minSpeed: 1.0,
      maxSpeed: 5.0
    },
    splitFactor: 2
  },
  controls: {
    moveUp: "W",
    moveDown: "S",
    rotateLeft: "A",
    rotateRight: "D",
    fire: "SPACE",
    pause: "ESC"
  },
  difficulty: {
    easy: {
      asteroidSpeedMultiplier: 0.8,
      enemySpawnRate: 0.5,
      playerLives: 5
    },
    medium: {
      asteroidSpeedMultiplier: 1.0,
      enemySpawnRate: 1.0,
      playerLives: 3
    },
    hard: {
      asteroidSpeedMultiplier: 1.2,
      enemySpawnRate: 1.5,
      playerLives: 2
    }
  },
  ui: {
    showScore: true,
    showLives: true,
    showFPS: false
  }
}; 