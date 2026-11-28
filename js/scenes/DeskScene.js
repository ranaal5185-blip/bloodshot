/* DeskScene (gigi): the desk after the player picks a path.
   Hacker -> red desk, Analyst -> green desk. PRESS goes on to the path's scene.
   Same animation as desk.html / desk_green.html, rewritten for Phaser. */

// everything that is different between the two desks
const DESKS = {
  hacker: {
    width: 1758, height: 894,
    next: 'NotifyScene', nextData: { role: 'hacker', show: 'inbox' },
    buttonColor: '#e00000', buttonX: 0.647, buttonY: 0.335,
    // loading bar
    doneBox: [897, 204, 486, 188], doneColor: 0x080404,
    barBox: [944, 328, 386, 30], barColor: 0x080404,
    blockX: 949, blockY: 332, blockW: 20, blockH: 22, blockColor: 0xe00000,
    emptyColor: null,
    // fingers: [x, width], copied from y and drawn 4px higher
    fingers: [[858, 33], [893, 26], [920, 28], [950, 50], [1178, 49], [1229, 26], [1257, 26], [1285, 28]],
    fingerY: 724, fingerH: 46,
    // cigarette smoke
    glow: [307, 627],
    puffX: 305, puffSpread: 0, puffY: 622, puffSize: 1.5,
    rise: 0.8, wiggle: 15, grow: 0.06, fade: 0.004,
    puffColor: 0xd2c8c8, puffAlpha: 0.14
  },
  analyst: {
    width: 1758, height: 895,
    next: 'NotifyScene', nextData: { show: 'inbox' },
    buttonColor: '#00a83c', buttonX: 0.644, buttonY: 0.38,
    doneBox: [904, 244, 456, 200], doneColor: 0x0b1511,
    barBox: [940, 327, 378, 34], barColor: 0x000000,
    blockX: 945, blockY: 331, blockW: 21, blockH: 26, blockColor: 0x09f950,
    emptyColor: 0x0d1914,
    fingers: [[1152, 58], [1212, 26], [1240, 28], [1270, 32]],
    fingerY: 694, fingerH: 40,
    // coffee steam
    glow: null,
    puffX: 640, puffSpread: 36, puffY: 586, puffSize: 2,
    rise: 0.7, wiggle: 12, grow: 0.07, fade: 0.006,
    puffColor: 0xdcf0e1, puffAlpha: 0.2
  }
};

class DeskScene extends Phaser.Scene {
  constructor() { super('DeskScene'); }

  init(data) {
    this.role = data.role;            // 'hacker' or 'analyst'
    this.desk = DESKS[this.role];
  }

  create() {
    const key = 'desk_' + this.role;

    // the photo is embedded in deskData.js; add it once, then build the scene
    if (this.textures.exists(key)) {
      this.build(key);
    } else {
      this.textures.once('addtexture-' + key, () => this.build(key));
      this.textures.addBase64(key, DESK_IMAGES[this.role]);
    }
  }

  build(key) {
    const d = this.desk;
    this.setupScreenSize(d.width, d.height);

    this.add.image(0, 0, key).setOrigin(0, 0);
    this.bar = this.add.graphics();

    // ===== 1. LOADING BAR =====
    this.blocks = 0;
    this.rounds = 0;
    this.loadingDone = false;

    // add one block every 50ms, start over when full
    this.time.addEvent({
      delay: 50, loop: true, callback: () => {
        if (this.loadingDone) return;
        this.blocks = this.blocks + 1;
        if (this.blocks > 17) {
          this.blocks = 0;
          this.rounds = this.rounds + 1;
          // after 2 rounds: stop loading and show the button
          if (this.rounds == 2) {
            this.loadingDone = true;
            this.button.setVisible(true);
          }
        }
      }
    });

    // PRESS button in the middle of the computer screen
    this.button = this.add.text(d.width * d.buttonX, d.height * d.buttonY, 'PRESS', {
      fontFamily: 'monospace', fontSize: '36px', color: '#ffffff',
      backgroundColor: d.buttonColor, padding: { x: 36, y: 10 }
    }).setOrigin(0.5).setVisible(false);
    // white border around the button (drawn in update)
    this.buttonBorder = this.add.graphics();
    this.button.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start(d.next, d.nextData));

    // ===== 2. FINGERS =====
    // a second copy of the photo, cropped to one finger, sitting 4px higher
    this.finger = this.add.image(0, -4, key).setOrigin(0, 0);
    this.movingFinger = 0;
    this.time.addEvent({
      delay: 150, loop: true, callback: () => {
        this.movingFinger = Math.floor(Math.random() * d.fingers.length);
      }
    });

    // ===== 3. SMOKE / STEAM =====
    this.smoke = [];
    this.puffs = this.add.graphics();

    this.ready = true;
  }

  update() {
    if (!this.ready) return;
    const d = this.desk;

    // loading bar
    const g = this.bar;
    g.clear();
    if (this.loadingDone) {
      // paint the window dark (hides "Loading" and the bar)
      g.fillStyle(d.doneColor).fillRect(...d.doneBox);
      const b = this.button.getBounds();
      this.buttonBorder.clear().lineStyle(4, 0xffffff).strokeRect(b.x, b.y, b.width, b.height);
    } else {
      this.buttonBorder.clear();
      g.fillStyle(d.barColor).fillRect(...d.barBox);
      for (let i = 0; i < 14; i++) {
        if (i < this.blocks) g.fillStyle(d.blockColor);
        else if (d.emptyColor !== null) g.fillStyle(d.emptyColor);
        else continue;
        g.fillRect(d.blockX + i * 27, d.blockY, d.blockW, d.blockH);
      }
    }

    // finger
    const f = d.fingers[this.movingFinger];
    this.finger.setCrop(f[0], d.fingerY, f[1], d.fingerH);

    // smoke / steam
    const p = this.puffs;
    p.clear();
    if (d.glow) {
      // the burning tip glows
      p.fillStyle(0xff7800, 0.4 + Math.random() * 0.4).fillCircle(d.glow[0], d.glow[1], 4);
    }
    // sometimes add a new puff
    if (Math.random() < 0.3) {
      this.smoke.push({ x: d.puffX + Math.random() * d.puffSpread, y: d.puffY, size: d.puffSize, life: 1 });
    }
    for (const puff of this.smoke) {
      // move up, wiggle left and right, get bigger, fade out
      puff.y = puff.y - d.rise;
      puff.x = puff.x + Math.sin(puff.y / d.wiggle) * 0.7;
      puff.size = puff.size + d.grow;
      puff.life = puff.life - d.fade;
      p.fillStyle(d.puffColor, puff.life * d.puffAlpha).fillCircle(puff.x, puff.y, puff.size);
    }
    // remove puffs that faded away
    this.smoke = this.smoke.filter(puff => puff.life > 0);
  }

  // make the game screen the size of the photo, and put it back when the scene ends
  // (same way AnalystScene does it)
  setupScreenSize(w, h) {
    const { scale } = this, canvas = this.game.canvas;
    const old = {
      w: scale.gameSize.width, h: scale.gameSize.height,
      mw: scale.displaySize.maxWidth, mh: scale.displaySize.maxHeight,
      style: canvas.style.imageRendering
    };
    const resize = (w, h, mw, mh) => {
      scale.displaySize.setMax(mw, mh);
      scale.setGameSize(w, h);
      scale.refresh();
    };

    resize(w, h, w, h);
    this.cameras.main.setSize(w, h);
    canvas.style.imageRendering = 'auto';

    this.events.once('shutdown', () => {
      canvas.style.imageRendering = old.style;
      resize(old.w, old.h, old.mw, old.mh);
    });
  }
}
