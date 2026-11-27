/* ResultPopup (gigi): the pop-up after each game.
   data.role: 'analyst' (default) or 'hacker'
   data.show: 'success' -> analyst: "success" glows / hacker: red folder turns green, "success" glows
              'failed'  -> (hacker: desktop cracks first) screen breaks, 3 warning signs, "faild" glows
   Click to go on to EndScene. Uses ScreenHelpers.js and notifyData.js. */

const RESULTS = {
  analyst: { win: 'secured', lose: 'fired' },
  hacker:  { win: 'granted', lose: 'caught' }
};

class ResultPopup extends Phaser.Scene {
  constructor() { super('ResultPopup'); }

  init(data) {
    this.role = data.role || 'analyst';
    this.show = data.show || 'success';
    this.cfg = RESULTS[this.role];
  }

  create() {
    ScreenHelpers.addImages(this, NOTIFY_IMAGES, 'n_', () => {
      ScreenHelpers.screenSize(this);
      if (this.show === 'success') this.success();
      else this.failed();
    });
  }

  // ===== SUCCESS =====
  success() {
    if (this.role === 'analyst') {
      this.add.image(0, 0, 'n_success').setOrigin(0, 0);
      this.glow('n_success', 270, 320, 1250, 190);
      this.time.delayedCall(800, () => this.clickToGoOn(this.cfg.win));
      return;
    }

    // hacker: the red folder turns green, then "success" glows
    this.add.image(0, 0, 'n_h_desktop').setOrigin(0, 0);
    const green = this.add.image(0, 0, 'n_h_success').setOrigin(0, 0).setAlpha(0);
    this.tweens.add({ targets: green, alpha: 1, duration: 900, delay: 400 });

    this.time.delayedCall(1400, () => {
      const style = { fontFamily: '"Courier New", monospace', fontSize: '170px', fontStyle: 'bold', color: '#6dff8a',
                      padding: { x: 90, y: 90 } };   // room so the glow is not cut off
      // centered on the screen (between the left edge and the folders)
      const word = this.add.text(870, 440, 'success', style).setOrigin(0.5).setAlpha(0)
        .setShadow(0, 0, '#00ff44', 60, true, true);
      const shine = this.add.text(870, 440, 'success', style).setOrigin(0.5).setAlpha(0)
        .setShadow(0, 0, '#00ff44', 90, true, true).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: word, alpha: 1, duration: 500 });
      // glow pulses brighter and a little bigger, again and again
      this.tweens.add({ targets: shine, alpha: { from: 0.25, to: 0.95 }, scale: { from: 1, to: 1.04 },
                        duration: 650, delay: 500, yoyo: true, repeat: -1 });
      this.time.delayedCall(800, () => this.clickToGoOn(this.cfg.win));
    });
  }

  // ===== FAILED =====
  failed() {
    // hacker: the desktop cracks first
    const start = this.role === 'hacker' ? 1000 : 0;
    if (this.role === 'hacker') {
      this.add.image(0, 0, 'n_h_cracked').setOrigin(0, 0);
      this.cameras.main.flash(250, 255, 255, 255);
      this.cameras.main.shake(500, 0.02);
    }

    this.time.delayedCall(start, () => {
      this.add.image(0, 0, 'n_failed').setOrigin(0, 0);

      // 1. the screen breaks: white flash + shake, then the broken screen in the dark
      const dark = this.add.rectangle(0, 0, SCREEN_W, SCREEN_H, 0x000000, 0.88).setOrigin(0, 0);
      this.cameras.main.flash(250, 255, 255, 255);
      this.cameras.main.shake(500, 0.02);

      // 2. three warning signs show up one by one (copies of the signs, cut to a triangle)
      const signs = [
        [[230, 140], [60, 445], [400, 445]],      // left
        [[1610, 0], [1440, 222], [1757, 222]],    // top right
        [[1535, 528], [1362, 832], [1712, 832]]   // bottom right
      ];
      signs.forEach((tri, i) => {
        this.time.delayedCall(800 + i * 600, () => {
          const shape = this.make.graphics({ add: false });
          shape.fillStyle(0xffffff).fillTriangle(tri[0][0], tri[0][1], tri[1][0], tri[1][1], tri[2][0], tri[2][1]);
          const sign = this.add.image(0, 0, 'n_failed').setOrigin(0, 0);
          sign.setMask(shape.createGeometryMask());
          this.cameras.main.shake(150, 0.01);
        });
      });

      // 3. "faild" glows in the center
      this.time.delayedCall(800 + 3 * 600, () => {
        this.tweens.add({ targets: dark, alpha: 0, duration: 600 });
        this.glow('n_failed', 360, 300, 1030, 250);
        this.time.delayedCall(800, () => this.clickToGoOn(this.cfg.lose));
      });
    });
  }

  // brighten one area again and again (added on top, so dark parts stay dark)
  glow(key, x, y, w, h) {
    const copy = this.add.image(0, 0, key).setOrigin(0, 0)
      .setCrop(x, y, w, h).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
    this.tweens.add({ targets: copy, alpha: 0.55, duration: 700, yoyo: true, repeat: -1 });
  }

  // click anywhere -> the end screen
  clickToGoOn(result) {
    this.input.once('pointerdown', () => this.scene.start('EndScene', { result }));
  }
}
