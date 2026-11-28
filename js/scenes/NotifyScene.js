/* NotifyScene (gigi): the computer screens before and after each path.
   data.role: 'analyst' (default) or 'hacker'
   data.show: 'inbox'   -> start screen. Open goes to the path's game, "rule book" opens the rules.
              'success' -> success glows, click to go on to EndScene.
              'failed'  -> screen breaks, 3 warning signs, "faild" glows, click to go on to EndScene. */

// everything that is different between the two paths (boxes are [x, y, width, height] in the picture)
const NOTIFY = {
  analyst: {
    home: 'new_message', rules: 'rule_book',
    openBox: [795, 350, 230, 215], next: 'AnalystScene',     // envelope + "open"
    rulesBox: [250, 525, 145, 145],                            // rule book icon
    closeBox: [1320, 168, 55, 48],                             // red X on the rule book
    win: 'secured', lose: 'fired'
  },
  hacker: {
    home: 'h_desktop', rules: 'h_rule_book',
    openBox: [1340, 418, 130, 135], next: 'HackerScene',     // red "extremely sensitive" folder
    rulesBox: [285, 540, 120, 125],
    closeBox: [1340, 188, 52, 48],
    win: 'granted', lose: 'caught'
  }
};

class NotifyScene extends Phaser.Scene {
  constructor() { super('NotifyScene'); }

  init(data) {
    this.role = data.role || 'analyst';
    this.show = data.show || 'inbox';
    this.cfg = NOTIFY[this.role];
  }

  create() {
    // the images are embedded in notifyData.js; add the ones we still need, then build
    const keys = Object.keys(NOTIFY_IMAGES).filter(k => !this.textures.exists('n_' + k));
    let left = keys.length;
    if (left === 0) return this.build();
    this.textures.on('addtexture', () => { if (--left === 0) this.build(); });
    keys.forEach(k => this.textures.addBase64('n_' + k, NOTIFY_IMAGES[k]));
  }

  build() {
    this.textures.off('addtexture');
    // same screen trick as DeskScene / AnalystScene: game size = picture size
    DeskScene.prototype.setupScreenSize.call(this, 1757, 895);

    if (this.show === 'inbox') this.inbox();
    if (this.show === 'success') this.success();
    if (this.show === 'failed') this.failed();
  }

  // invisible clickable box
  hotspot(box, onClick) {
    return this.add.zone(box[0], box[1], box[2], box[3]).setOrigin(0, 0)
      .setInteractive({ useHandCursor: true }).on('pointerdown', onClick);
  }

  // ===== START SCREEN + RULE BOOK =====
  inbox() {
    const c = this.cfg;
    const screen = this.add.image(0, 0, 'n_' + c.home).setOrigin(0, 0);

    // open -> the path's game
    const open = this.hotspot(c.openBox, () => this.scene.start(c.next));

    // rule book icon -> show the rules
    const rules = this.hotspot(c.rulesBox, () => {
      screen.setTexture('n_' + c.rules);
      open.disableInteractive();
      rules.disableInteractive();
      close.setInteractive({ useHandCursor: true });
    });

    // red X on the rule book -> close it
    const close = this.hotspot(c.closeBox, () => {
      screen.setTexture('n_' + c.home);
      open.setInteractive({ useHandCursor: true });
      rules.setInteractive({ useHandCursor: true });
      close.disableInteractive();
    });
    close.disableInteractive();
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
      const dark = this.add.rectangle(0, 0, 1757, 895, 0x000000, 0.88).setOrigin(0, 0);
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
