/* ScreenHelpers (gigi): shared tools for AnalystScreen, HackerScreen and ResultPopup.
   - screenSize: make the game the size of the photos, put it back when the scene ends
   - addImages:  add the embedded photos (deskData.js / notifyData.js), then call done
   - hotspot:    invisible clickable box
   - desk:       the animated desk (loading bar, PRESS button, moving finger, smoke/steam) */

const SCREEN_W = 1758, SCREEN_H = 895;

const ScreenHelpers = {

  screenSize(scene) {
    const { scale } = scene, canvas = scene.game.canvas;
    const old = {
      w: scale.gameSize.width, h: scale.gameSize.height,
      mw: scale.displaySize.maxWidth, mh: scale.displaySize.maxHeight,
      style: canvas.style.imageRendering
    };
    const resize = (w, h, mw, mh) => { scale.displaySize.setMax(mw, mh); scale.setGameSize(w, h); scale.refresh(); };
    resize(SCREEN_W, SCREEN_H, SCREEN_W, SCREEN_H);
    scene.cameras.main.setSize(SCREEN_W, SCREEN_H);
    canvas.style.imageRendering = 'auto';
    scene.events.once('shutdown', () => {
      canvas.style.imageRendering = old.style;
      resize(old.w, old.h, old.mw, old.mh);
    });
  },

  // images = { key: base64 }, added as prefix + key
  addImages(scene, images, prefix, done) {
    const keys = Object.keys(images).filter(k => !scene.textures.exists(prefix + k));
    let left = keys.length;
    if (left === 0) return done();
    const onAdd = () => { if (--left === 0) { scene.textures.off('addtexture', onAdd); done(); } };
    scene.textures.on('addtexture', onAdd);
    keys.forEach(k => scene.textures.addBase64(prefix + k, images[k]));
  },

  hotspot(scene, box, onClick) {
    return scene.add.zone(box[0], box[1], box[2], box[3]).setOrigin(0, 0)
      .setInteractive({ useHandCursor: true }).on('pointerdown', onClick);
  },

  // ===== THE ANIMATED DESK =====
  // d = the desk settings, key = the photo, onPress = what PRESS does.
  // The scene must call ScreenHelpers.updateDesk(this) in its update().
  desk(scene, d, key, onPress) {
    const s = { d, blocks: 0, rounds: 0, loadingDone: false, movingFinger: 0, smoke: [] };
    scene.deskState = s;

    scene.add.image(0, 0, key).setOrigin(0, 0);
    s.bar = scene.add.graphics();

    // loading: one block every 50ms, after 2 full rounds the PRESS button shows
    scene.time.addEvent({ delay: 50, loop: true, callback: () => {
      if (s.loadingDone) return;
      s.blocks++;
      if (s.blocks > 17) {
        s.blocks = 0;
        s.rounds++;
        if (s.rounds == 2) { s.loadingDone = true; s.button.setVisible(true); }
      }
    }});

    s.button = scene.add.text(SCREEN_W * d.buttonX, SCREEN_H * d.buttonY, 'PRESS', {
      fontFamily: 'monospace', fontSize: '36px', color: '#ffffff',
      backgroundColor: d.buttonColor, padding: { x: 36, y: 10 }
    }).setOrigin(0.5).setVisible(false)
      .setInteractive({ useHandCursor: true }).on('pointerdown', onPress);
    s.border = scene.add.graphics();

    // a copy of the photo cropped to one finger, 4px higher
    s.finger = scene.add.image(0, -4, key).setOrigin(0, 0);
    scene.time.addEvent({ delay: 150, loop: true, callback: () => {
      s.movingFinger = Math.floor(Math.random() * d.fingers.length);
    }});

    s.puffs = scene.add.graphics();
  },

  updateDesk(scene) {
    const s = scene.deskState;
    if (!s) return;
    const d = s.d, g = s.bar;

    // loading bar
    g.clear();
    if (s.loadingDone) {
      g.fillStyle(d.doneColor).fillRect(...d.doneBox);   // dark window hides "Loading"
      const b = s.button.getBounds();
      s.border.clear().lineStyle(4, 0xffffff).strokeRect(b.x, b.y, b.width, b.height);
    } else {
      g.fillStyle(d.barColor).fillRect(...d.barBox);
      for (let i = 0; i < 14; i++) {
        if (i < s.blocks) g.fillStyle(d.blockColor);
        else if (d.emptyColor !== null) g.fillStyle(d.emptyColor);
        else continue;
        g.fillRect(d.blockX + i * 27, d.blockY, d.blockW, d.blockH);
      }
    }

    // finger
    const f = d.fingers[s.movingFinger];
    s.finger.setCrop(f[0], d.fingerY, f[1], d.fingerH);

    // smoke / steam
    const p = s.puffs;
    p.clear();
    if (d.glow) p.fillStyle(0xff7800, 0.4 + Math.random() * 0.4).fillCircle(d.glow[0], d.glow[1], 4);
    if (Math.random() < 0.3) s.smoke.push({ x: d.puffX + Math.random() * d.puffSpread, y: d.puffY, size: d.puffSize, life: 1 });
    for (const puff of s.smoke) {
      puff.y -= d.rise;
      puff.x += Math.sin(puff.y / d.wiggle) * 0.7;
      puff.size += d.grow;
      puff.life -= d.fade;
      p.fillStyle(d.puffColor, puff.life * d.puffAlpha).fillCircle(puff.x, puff.y, puff.size);
    }
    s.smoke = s.smoke.filter(puff => puff.life > 0);
  },

  // remove the desk so the computer screen can show
  clearDesk(scene) {
    scene.deskState = null;
    scene.time.removeAllEvents();
    scene.children.removeAll(true);
  },

  // the computer screen: home picture, one thing to open, rule book with a red X
  computer(scene, c) {
    const screen = scene.add.image(0, 0, 'n_' + c.home).setOrigin(0, 0);
    const open = ScreenHelpers.hotspot(scene, c.openBox, () => scene.scene.start(c.next));
    const rules = ScreenHelpers.hotspot(scene, c.rulesBox, () => {
      screen.setTexture('n_' + c.rules);
      open.disableInteractive(); rules.disableInteractive();
      close.setInteractive({ useHandCursor: true });
    });
    const close = ScreenHelpers.hotspot(scene, c.closeBox, () => {
      screen.setTexture('n_' + c.home);
      open.setInteractive({ useHandCursor: true }); rules.setInteractive({ useHandCursor: true });
      close.disableInteractive();
    });
    close.disableInteractive();
  }
};
