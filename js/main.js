/* ===================== إعداد اللعبة ===================== */
new Phaser.Game({
  type: Phaser.AUTO,
  width: 576,
  height: 690,
  backgroundColor: '#030303',
  pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, max: { width: 576, height: 690 } },
  scene: [BootScene, MenuScene, AnalystScene, HackerScene, EndScene]
});
