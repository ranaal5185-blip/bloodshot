// إعداد تجريبي مطابق لـ js/main.js عند الفريق (نفس الحجم والـ Scale) + تفعيل الفيزياء
window.demoGame = new Phaser.Game({
  type: Phaser.AUTO,
  width: 576,
  height: 690,
  backgroundColor: '#030303',
  pixelArt: true,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, max: { width: 576, height: 690 } },
  scene: [SystemsDemoScene, HackerCipherDemo]
});
