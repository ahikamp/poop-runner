const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scale: {
    mode: Phaser.Scale.FIT,            // ממלא את כל החלון
    autoCenter: Phaser.Scale.CENTER_BOTH,  // ומרכז
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 500 }, debug: false }
  },
  scene: { preload, create, update }
};

new Phaser.Game(config);

// משתנים גלובליים
let player, cursors;
let poopGroup, coinGroup;
let score = 0, scoreText;
let gameOverText, playButtonContainer;
let poopTimer, coinTimer, difficultyTimer;

// טווחי מהירות התחלתיים
let poopSpeedMin = 30, poopSpeedMax = 80;
let coinSpeedMin = 40, coinSpeedMax = 80;

function preload() {
  this.load.image('bg',    'assets/sky.png');
  this.load.image('player','assets/player.png');
  this.load.image('poop',  'assets/shit.png');
  this.load.image('coin',  'assets/coin.png');
}

function create() {
  // איפוס פרמטרים
  score = 0;
  poopSpeedMin = 30; poopSpeedMax = 80;
  coinSpeedMin = 40; coinSpeedMax = 80;

  // רקע
  this.add.image(400, 300, 'bg').setDisplaySize(800, 600);

  // שחקן
  player = this.physics.add.sprite(400, 500, 'player')
               .setDisplaySize(64, 64)
               .setCollideWorldBounds(true);

  // מונה
  scoreText = this.add.text(16, 16, 'Coins: 0', {
    fontSize: '24px', fontFamily: 'Arial', color: '#ffffff',
    stroke: '#000000', strokeThickness: 3
  });

  // קלט
  cursors = this.input.keyboard.createCursorKeys();

  // קבוצות
  poopGroup = this.physics.add.group();
  coinGroup = this.physics.add.group();

  // התנגשויות
  this.physics.add.overlap(player, coinGroup, collectCoin, null, this);
  this.physics.add.overlap(player, poopGroup, hitPoop,    null, this);

  // שמירת הטיימרים
  poopTimer = this.time.addEvent({ delay: 1000, callback: dropPoop,  callbackScope: this, loop: true });
  coinTimer = this.time.addEvent({ delay: 1500, callback: dropCoin,  callbackScope: this, loop: true });
  difficultyTimer = this.time.addEvent({ delay: 5000, callback: increaseDifficulty, callbackScope: this, loop: true });

  // טקסט Game Over
  gameOverText = this.add.text(400, 240, 'Game Over', {
    fontSize: '48px', fontFamily: 'Arial',
    color: '#ff4444', stroke: '#000', strokeThickness: 6
  }).setOrigin(0.5).setVisible(false);

  // Container לכפתור Play Again
  playButtonContainer = this.add.container(400, 320).setVisible(false);
  const bgRect = this.add.rectangle(0, 0, 200, 60, 0x00aa00)
    .setStrokeStyle(4, 0x004400)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });
  const btnText = this.add.text(0, 0, 'Play Again', {
    fontSize: '28px', fontFamily: 'Arial', color: '#ffffff'
  }).setOrigin(0.5);
  playButtonContainer.add([ bgRect, btnText ]);
  bgRect
    .on('pointerover', () => bgRect.setFillStyle(0x00cc00))
    .on('pointerout',  () => bgRect.setFillStyle(0x00aa00))
    .on('pointerup',   () => this.scene.restart());
}

function update() {
  if      (cursors.left.isDown)  player.setVelocityX(-300);
  else if (cursors.right.isDown) player.setVelocityX(300);
  else                            player.setVelocityX(0);
}

function dropPoop() {
  const x = Phaser.Math.Between(50, 750);
  poopGroup.create(x, 0, 'poop')
    .setVelocityY(Phaser.Math.Between(poopSpeedMin, poopSpeedMax))
    .setDisplaySize(64, 64);
}

function dropCoin() {
  const x = Phaser.Math.Between(50, 750);
  coinGroup.create(x, 0, 'coin')
    .setVelocityY(Phaser.Math.Between(coinSpeedMin, coinSpeedMax))
    .setDisplaySize(64, 64);
}

function collectCoin(player, coin) {
  coin.destroy();
  score += 1;
  scoreText.setText('Coins: ' + score);
}

function hitPoop(player, poop) {
  // עצירת פיזיקה
  this.physics.pause();

  // הסרת טיימרים ופריטים
  poopTimer.remove();
  coinTimer.remove();
  difficultyTimer.remove();
  poopGroup.clear(true, true);
  coinGroup.clear(true, true);

  // Game Over
  player.setTint(0xff0000);
  gameOverText.setVisible(true);
  playButtonContainer.setVisible(true);
}

function increaseDifficulty() {
  poopSpeedMin *= 1.1;
  poopSpeedMax *= 1.1;
  coinSpeedMin *= 1.1;
  coinSpeedMax *= 1.1;
}
