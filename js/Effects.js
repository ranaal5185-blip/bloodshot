/**
 * Effects - مؤثرات الشاشة (اهتزاز، وميض، غلتش). Scripts عادية بدون import.
 *  this.effects = new Effects(this);   // داخل create()
 *  this.effects.shake(0.02, 300);      // اهتزاز الكاميرا
 *  this.effects.glitch(800, 8);        // تشويش
 *  this.effects.flash(0xff0000, 200, 0.5);
 */
class Effects {
  constructor(scene) {
    this.scene = scene;
    this.glitchObjects = [];
    this.glitchTween = null;
    this.flashObjects = [];
    this.destroyed = false;
    this._shutdown = () => this.destroy();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this._shutdown);
  }

  shake(intensity = 0.012, duration = 250) {
    if (this.destroyed) return;
    this.scene.cameras.main.shake(duration, intensity);
  }

  // وميض بلون فوق الشاشة (alpha يتحكم بقوته)
  flash(color = 0xffffff, duration = 180, alpha = 0.65) {
    if (this.destroyed) return;
    const { width, height } = this.scene.scale;
    const rect = this.scene.add.rectangle(0, 0, width, height, color, alpha)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(10001);
    this.flashObjects.push(rect);
    this.scene.tweens.add({
      targets: rect, alpha: 0, duration,
      onComplete: () => {
        this.flashObjects = this.flashObjects.filter((o) => o !== rect);
        rect.destroy();
      },
    });
  }

  glitch(duration = 700, intensity = 8) {
    if (this.destroyed) return null;
    this.stopGlitch();
    const { width, height } = this.scene.scale;
    const graphics = this.scene.add.graphics().setScrollFactor(0).setDepth(10000);
    this.glitchObjects.push(graphics);
    this.glitchTween = this.scene.tweens.addCounter({
      from: 0, to: duration, duration,
      onUpdate: () => {
        graphics.clear();
        for (let i = 0; i < 7; i++) {
          const y = Phaser.Math.Between(0, height - 5);
          const h = Phaser.Math.Between(2, Math.max(3, intensity));
          const x = Phaser.Math.Between(-intensity * 3, intensity * 3);
          graphics.fillStyle(i % 2 ? 0x00e5ff : 0xff1744, Phaser.Math.FloatBetween(0.12, 0.32));
          graphics.fillRect(x, y, width, h);
        }
        if (Math.random() > 0.45) {
          graphics.fillStyle(0xffffff, 0.08);
          graphics.fillRect(0, 0, width, height);
        }
      },
      onComplete: () => this.stopGlitch(),
    });
    return this.glitchTween;
  }

  stopGlitch() {
    if (this.glitchTween) this.glitchTween.stop();
    this.glitchTween = null;
    for (const o of this.glitchObjects) o.destroy();
    this.glitchObjects = [];
  }

  destroy() {
    this.stopGlitch();
    for (const o of this.flashObjects) o.destroy();
    this.flashObjects = [];
    this.destroyed = true;
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this._shutdown);
  }
}
