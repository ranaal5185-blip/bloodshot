/* ==========================================================================
   AnalystScene
   Part 1 (Student 3): core gameplay - messages, answers, mistakes, end result
   Part 2 (Student 4): analyst tools - interface, scanner, activity log, effects
   ========================================================================== */

const MAX_MISTAKES = 3;
const SCREEN = { w: 1552, h: 790 };
const HOME = { x: 1446, y: 207 };   // scanner resting position

/* ==========================================================================
   PART 1 - CORE GAMEPLAY
   ========================================================================== */
class AnalystScene extends Phaser.Scene {
  constructor() {
    super('AnalystScene');
    this.currentIndex = 0;
    this.mistakes = 0;
    this.busy = false;
  }

  // Load the messages data and the interface background
  preload() {
    this.load.json('analystMessages', 'js/data/messages.json');
    this.load.image('analystReference', 'assets/images/analyst-reference.png');
  }

  // Reset the state, shuffle the messages, build the tools, show the first message
  create() {
    this.currentIndex = 0;
    this.mistakes = 0;
    this.busy = false;
    this.messages = Phaser.Utils.Array.Shuffle(
      this.cache.json.get('analystMessages').slice()
    );
    this.createAnalystTools();
    this.showMessage();
  }

  // Show the next message, or finish the game if there are no more
  showMessage() {
    if (this.currentIndex >= this.messages.length) {
      this.scene.start('EndScene', { result: 'secured' });
      return;
    }
    this.progressText.setText(`MESSAGE ${this.currentIndex + 1} / ${this.messages.length}`);
    this.updateMistakesText();
    this.feedbackText.setText('');
    this.busy = false;
    this.renderEmail();
    this.resetScanner();
  }

  updateMistakesText() {
    this.mistakesText.setText(`MISTAKES: ${this.mistakes} / ${MAX_MISTAKES}`);
  }

  // Check the player's answer (Approve = 'safe', Block = 'threat')
  checkAnswer(answer) {
    if (this.busy || this.dragging || this.scanning) return;
    this.busy = true;

    const correct = answer === this.messages[this.currentIndex].type;
    if (!correct) this.mistakes++;

    // Approving a real threat = breach (hammer animation, so we wait longer)
    const breach = !correct && answer === 'safe';
    const delay = breach ? 1400 : 700;
    if (breach) this.playHammer();

    this.feedbackText
      .setColor(correct ? '#35ed76' : '#ff303d')
      .setText(correct ? 'CORRECT - ACCESS VERIFIED' : 'WRONG CLASSIFICATION');
    this.updateMistakesText();

    // Too many mistakes = fired
    if (this.mistakes >= MAX_MISTAKES) {
      this.cameras.main.shake(650, 0.018);
      this.cameras.main.flash(350, 170, 0, 0);
      this.time.delayedCall(delay, () => this.scene.start('EndScene', { result: 'fired' }));
      return;
    }

    // Otherwise move to the next message
    this.time.delayedCall(delay, () => {
      this.currentIndex++;
      this.showMessage();
    });
  }

  // Text button (used for the wide Approve / Block buttons)
  createButton(x, y, label, color, callback) {
    return this.add.text(x, y, label, {
      fontFamily: 'Consolas, monospace',
      fontSize: '24px',
      color
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', callback);
  }
}

/* ==========================================================================
   PART 2 - ANALYST TOOLS
   ========================================================================== */
Object.assign(AnalystScene.prototype, {

  /* ---------- Setup ---------- */
  createAnalystTools() {
    Object.assign(this, {
      ruleOpen: true,        // rulebook panel open at the start
      scans: 3,              // scanner batteries
      dragging: false,       // player is holding the scanner
      scanning: false,       // a scan is running
      holdingScanner: false,
      scannerTween: null
    });
    this.setupScreenSize();
    this.add.image(0, 0, 'analystReference').setOrigin(0);   // approved interface
    this.createInterface();
    this.createActivityLog();
    this.createScanner();
    this.createScannerInput();
  },

  // Enlarge the game screen for this scene and restore it when the scene ends
  setupScreenSize() {
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

    resize(SCREEN.w, SCREEN.h, SCREEN.w, SCREEN.h);
    this.cameras.main.setSize(SCREEN.w, SCREEN.h);
    canvas.style.imageRendering = 'auto';

    this.events.once('shutdown', () => {
      canvas.style.imageRendering = old.style;
      resize(old.w, old.h, old.mw, old.mh);
    });
  },

  // Email texts, wide email view, and all the buttons
  createInterface() {
    // Wide email view (shown when the rulebook is closed)
    this.expanded = this.add.graphics().setVisible(false);
    this.expanded.fillStyle(0x050305).fillRect(435, 80, 975, 700);
    this.expanded.lineStyle(3, 0xa90b1b)
      .strokeRoundedRect(445, 88, 950, 76, 12)
      .strokeRoundedRect(445, 187, 950, 471, 12);
    this.expanded.lineStyle(2, 0x9b0b17).lineBetween(465, 315, 1375, 315);
    this.expandedTitle = this.txt(920, 125, 'EMAIL ANALYSIS', 34).setOrigin(0.5).setVisible(false);

    // Status texts
    this.progressText = this.txt(445, 22, '', 20);
    this.mistakesText = this.txt(770, 22, '', 20, '#ff3645');
    this.feedbackText = this.txt(700, 762, '', 19).setOrigin(0.5);

    // Email texts
    this.fromText = this.txt(565, 222, '', 19, '#b7b7b7');
    this.subjectText = this.txt(565, 262, '', 20);
    this.messageText = this.txt(480, 337, '', 21);
    this.attachmentText = this.txt(480, 600, '', 17, '#aebbc5');

    // Approve / Block: small (rulebook open) and wide (rulebook closed)
    const safe = () => this.checkAnswer('safe'), threat = () => this.checkAnswer('threat');
    this.approve = this.hit(447, 676, 249, 75, safe);
    this.block = this.hit(717, 676, 229, 75, threat);
    this.wideApprove = this.createButton(685, 710, '✓ APPROVE', '#35ed76', safe).setVisible(false);
    this.wideBlock = this.createButton(1150, 710, '✕ BLOCK', '#ff303d', threat).setVisible(false);

    // Rulebook buttons
    this.closeRule = this.hit(1327, 116, 57, 55, () => this.toggleRule(false));
    this.hit(1424, 572, 126, 166, () => this.toggleRule(!this.ruleOpen));
  },

  // Live activity log: 5 employees, refreshed every 2.4 seconds
  createActivityLog() {
    // The background image already draws the rows, so we only add text
    this.logRows = [1042, 1073, 1098, 1120, 1156].map((id, i) => {
      const y = 232 + i * 84;
      return {
        name: this.txt(145, y + 15, `EMP-${id}`, 20),
        activity: this.txt(145, y + 44, '', 17, '#a4a4a4'),
        status: this.txt(340, y + 15, '', 16, '#35ed76')
      };
    });
    this.updateLog();
    this.time.addEvent({ delay: 2400, loop: true, callback: () => this.updateLog() });

    // Log button: refresh and flash the names
    this.hit(1424, 357, 126, 196, () => {
      this.updateLog();
      this.tweens.add({ targets: this.logRows.map(r => r.name), alpha: 0.35, duration: 120, yoyo: true });
    });
  },

  // Deep ID scanner: magnifier + eye, 3 batteries, labels
  createScanner() {
    this.scanner = this.add.container(HOME.x, HOME.y).setDepth(50);
    this.scannerGlow = this.add.graphics();
    this.scannerEye = this.add.image(0, 0, 'eye0').setDisplaySize(51, 51);
    this.scannerRing = this.add.graphics();
    this.eyeLid = this.add.graphics().setVisible(false);
    this.eyeLid.fillStyle(0x19ff65, 1).fillRoundedRect(-27, -19, 54, 38, 18);
    this.eyeLid.lineStyle(3, 0x087b35, 1).lineBetween(-23, 0, 23, 0);
    this.scanner.add([this.scannerGlow, this.scannerEye, this.eyeLid, this.scannerRing]);
    this.drawScanner(0xaaaaaa);

    // Original eye scale (used by the eye animations)
    this.eyeBaseX = this.scannerEye.scaleX;
    this.eyeBaseY = this.scannerEye.scaleY;

    this.batteries = this.add.graphics().setDepth(51);
    this.updateBatteries();

    // Labels under the scanner
    const label = (y, text, size, color) => this.txt(HOME.x, y, text, size, color).setOrigin(0.5).setDepth(51);
    label(258, 'DEEP ID', 13, '#f2f2f2');
    label(274, 'SCANNER', 13, '#f2f2f2');
    this.scanResult = label(292, '', 10, '#ff3045');

    // Invisible area the player grabs
    this.scannerHit = this.add.rectangle(1388, 164, 116, 132, 0xffffff, 0)
      .setOrigin(0).setDepth(60).setInteractive({ cursor: 'grab' });
  },

  // Grab -> drag -> release
  createScannerInput() {
    this.scannerHit.on('pointerdown', pointer => {
      if (this.scans <= 0 || this.busy || this.scanning || this.holdingScanner) return;
      this.holdingScanner = this.dragging = true;
      this.scanResult.setText('');
      this.scanner.setPosition(pointer.worldX, pointer.worldY).setScale(1.05);
      this.startScannerGlow(0xffffff);
      this.blinkEye();
      this.input.setDefaultCursor('grabbing');
    });
    this.input.on('pointermove', p => this.holdingScanner && this.scanner.setPosition(p.worldX, p.worldY));
    this.input.on('pointerup', p => this.holdingScanner && this.finishScan(p));
    this.input.on('pointerupoutside', () => this.holdingScanner && this.resetScanner());
  },

  /* ---------- Helpers ---------- */

  // Create a text object
  txt(x, y, text, size, color = '#e8e8e8') {
    return this.add.text(x, y, text, { fontFamily: 'Consolas, Arial, sans-serif', fontSize: `${size}px`, color });
  },

  // Create an invisible clickable area
  hit(x, y, w, h, fn) {
    return this.add.rectangle(x, y, w, h, 0xffffff, 0).setOrigin(0)
      .setInteractive({ useHandCursor: true }).on('pointerdown', fn);
  },

  /* ---------- Email and rulebook ---------- */

  // Show the current message (smaller text when the rulebook is open)
  renderEmail() {
    const m = this.messages[this.currentIndex];
    if (!m) return;
    const open = this.ruleOpen, bodyWidth = open ? 420 : 850;

    this.fromText.setText('From: ' + m.sender).setWordWrapWidth(open ? 335 : 760).setFontSize(open ? 18 : 21);
    this.subjectText.setText('Subject: ' + m.subject).setWordWrapWidth(open ? 335 : 760).setFontSize(open ? 19 : 22);
    this.messageText.setText(m.text).setWordWrapWidth(bodyWidth).setFontSize(open ? 21 : 22);

    // Shrink long messages until they fit in the panel
    while (this.messageText.height > 250 && parseInt(this.messageText.style.fontSize) > 15) {
      this.messageText.setFontSize(parseInt(this.messageText.style.fontSize) - 1);
    }
    this.attachmentText
      .setText(m.attachment ? '[Attachment / Link] ' + m.attachment : '')
      .setWordWrapWidth(bodyWidth);
  },

  // Open / close the rulebook (swaps between the small and wide layouts)
  toggleRule(open) {
    if (this.busy || this.scanning || this.dragging) return;
    this.ruleOpen = open;
    [this.closeRule, this.approve, this.block].forEach(o => o.setVisible(open));
    [this.expanded, this.expandedTitle, this.wideApprove, this.wideBlock].forEach(o => o.setVisible(!open));
    this.renderEmail();
  },

  // Fill the log with random activity (employee 4 often shows an alert)
  updateLog() {
    const options = ['Normal Activity', 'Accessing Email', 'File Download', 'System Update', 'Session Idle'];
    this.logRows.forEach((row, i) => {
      const alert = i === 3 && Math.random() < 0.7;
      row.activity.setText(alert ? 'Multiple Login Attempts' : Phaser.Utils.Array.GetRandom(options));
      row.status.setText(alert ? '● Alert' : '● Online').setColor(alert ? '#ff303d' : '#25ed55');
    });
  },

  /* ---------- Deep ID scanner ---------- */

  // Draw the magnifier (and a glow around it when glow = true)
  drawScanner(color, glow = false) {
    const g = this.scannerGlow.clear().setAlpha(1);
    if (glow) {
      for (let i = 7; i >= 1; i--) g.lineStyle(5, color, 0.07 * (8 - i)).strokeCircle(0, 0, 32 + i * 4);   // rings
      g.lineStyle(3, color, 0.6);
      for (let i = 0; i < 12; i++) {                                                                       // rays
        const a = i * Math.PI / 6;
        g.lineBetween(Math.cos(a) * 40, Math.sin(a) * 40, Math.cos(a) * 59, Math.sin(a) * 59);
      }
    }
    this.scannerRing.clear()
      .lineStyle(8, 0x343438).strokeCircle(0, 0, 32)          // frame
      .lineStyle(5, color).strokeCircle(0, 0, 32)
      .lineStyle(12, 0x55555a).lineBetween(23, 24, 47, 48)    // handle
      .lineStyle(5, color).lineBetween(23, 24, 47, 48);
  },

  // Pulsing glow in the given color
  startScannerGlow(color) {
    if (this.scannerTween) this.scannerTween.stop();
    this.drawScanner(color, true);
    this.scannerTween = this.tweens.add({
      targets: this.scannerGlow, alpha: { from: 1, to: 0.25 }, duration: 180, yoyo: true, repeat: -1
    });
  },

  // Player released the scanner: scan only if it was dropped on the email
  finishScan({ worldX: x, worldY: y }) {
    this.holdingScanner = this.dragging = false;
    this.input.setDefaultCursor('default');

    const onEmail = x >= 440 && x <= (this.ruleOpen ? 950 : 1395) && y >= 185 && y <= 658;
    if (!onEmail || this.scans <= 0 || this.busy) return this.resetScanner();

    this.scanning = true;
    this.scans--;                       // use one battery
    this.updateBatteries();
    const safe = this.messages[this.currentIndex].type === 'safe';

    // 1) white "scanning" glow
    this.startScannerGlow(0xffffff);
    this.scanResult.setColor('#ffffff').setText('SCANNING...');
    this.blinkEye();

    // 2) show the result
    this.time.delayedCall(650, () => {
      this.animateEyeResult(safe);
      this.time.delayedCall(550, () => this.startScannerGlow(safe ? 0x19ff65 : 0xff182e));
      this.scanResult.setColor(safe ? '#19ff65' : '#ff182e').setText(safe ? 'TRUSTED' : 'UNTRUSTED');

      // 3) send the scanner back home
      this.time.delayedCall(1500, () => {
        this.scanner.setPosition(HOME.x, HOME.y).setScale(0.88);
        this.scanning = false;
        if (this.scans <= 0) {
          this.scannerHit.disableInteractive();
          this.scanResult.setText('OUT OF ENERGY').setColor('#ff303d');
        }
      });
    });
  },

  // Draw 3 batteries (green = available, gray = used)
  updateBatteries() {
    const g = this.batteries.clear().fillStyle(0x080508).fillRect(1400, 307, 92, 22);   // covers the old counter
    for (let i = 0; i < 3; i++) {
      const x = 1405 + i * 29, full = i < this.scans, c = full ? 0x19ff65 : 0x444448;
      g.lineStyle(2, c).strokeRoundedRect(x, 311, 20, 12, 3).fillStyle(c).fillRect(x + 20, 315, 3, 4);   // body + terminal
      if (full) g.fillStyle(c, 0.18).fillRoundedRect(x - 2, 309, 25, 16, 4).fillStyle(c).fillRoundedRect(x + 3, 314, 14, 6, 2);   // glow + charge
    }
  },

  // Put the scanner back to its original state
  resetScanner() {
    if (this.scannerTween) this.scannerTween.stop();
    this.scannerTween = null;
    this.dragging = this.scanning = this.holdingScanner = false;

    this.scanner.setPosition(HOME.x, HOME.y).setScale(0.88);
    this.scannerGlow.setAlpha(1);
    this.tweens.killTweensOf(this.scannerEye);
    this.scannerEye.setScale(this.eyeBaseX, this.eyeBaseY).clearTint();
    this.eyeLid.setVisible(false).setScale(1, 0);
    this.scanResult.setText(this.scans ? '' : 'OUT OF ENERGY');
    this.drawScanner(0xaaaaaa);
    this.updateBatteries();
    this.input.setDefaultCursor('default');

    if (this.scans > 0) this.scannerHit.setInteractive({ cursor: 'grab' });
    else this.scannerHit.disableInteractive();
  },

  /* ---------- Eye animations ---------- */

  // Quick double blink
  blinkEye() {
    this.tweens.killTweensOf(this.scannerEye);
    this.scannerEye.setScale(this.eyeBaseX, this.eyeBaseY);
    this.tweens.add({ targets: this.scannerEye, scaleY: this.eyeBaseY * 0.08, duration: 110, yoyo: true, repeat: 1 });
  },

  // Trusted = nothing on the eye (the tool glows green) | Untrusted = shocked eye, arrow hit, blood
  animateEyeResult(safe) {
    const eye = this.scannerEye;
    this.tweens.killTweensOf(eye);
    eye.setScale(this.eyeBaseX, this.eyeBaseY).setAlpha(1);
    this.eyeLid.setVisible(false).setScale(1, 0);

    if (safe) return;   // trusted: the eye stays normal, only the tool glows green

    // The eye opens in shock
    this.tweens.add({ targets: eye, scaleY: this.eyeBaseY * 1.2, duration: 110, yoyo: true, ease: 'Back.easeOut' });

    // An arrow flies into the eye
    const arrow = this.add.graphics();
    arrow.lineStyle(4, 0xf2f2f2).lineBetween(-30, 0, 12, 0);
    arrow.fillStyle(0xf2f2f2).fillTriangle(12, -7, 25, 0, 12, 7);
    this.scanner.add(arrow);
    arrow.setPosition(-70, -8).setRotation(0.25);

    this.tweens.add({
      targets: arrow, x: -13, y: 0, duration: 230, delay: 100, ease: 'Cubic.easeIn',
      onComplete: () => {
        // Hit: red eye, blood, red flash, scanner shake
        eye.setTint(0xff182e);
        this.bloodBurst(this.ruleOpen ? 700 : 920, 420);
        this.cameras.main.flash(120, 255, 20, 45);
        this.tweens.add({ targets: this.scanner, x: this.scanner.x + 5, duration: 45, yoyo: true, repeat: 3 });
        this.time.delayedCall(350, () => arrow.destroy());
      }
    });
  },

  /* ---------- Effects ---------- */

  // Blood spray: 22 small droplets + 5 big splashes
  bloodBurst(x, y) {
    const layer = this.add.container(0, 0).setDepth(120);
    const colors = [0x9e0018, 0xd00025, 0xf01838];
    const { Between, FloatBetween } = Phaser.Math;

    // Add a shape to the layer and fade it out
    const fade = (shape, props) => {
      layer.add(shape);
      this.tweens.add({ targets: shape, alpha: 0, onComplete: () => shape.destroy(), ...props });
    };

    for (let i = 0; i < 22; i++) {
      const angle = FloatBetween(-Math.PI, Math.PI), distance = Between(45, 230), size = Between(2, 7);
      const drop = this.add.ellipse(
        x, y, size * FloatBetween(0.8, 1.8), size * 2.2, Phaser.Utils.Array.GetRandom(colors), 0.95
      ).setRotation(angle);
      fade(drop, {
        x: x + Math.cos(angle) * distance, y: y + Math.sin(angle) * distance * 0.62,
        scale: 0.35, duration: Between(420, 760), ease: 'Cubic.easeOut'
      });
    }
    for (let i = 0; i < 5; i++) {
      const splash = this.add.circle(x + Between(-85, 85), y + Between(-65, 65), Between(5, 11), 0xb90020, 0.9);
      fade(splash, { scale: 1.8, duration: 900, delay: 120 });
    }
    this.time.delayedCall(1150, () => layer.destroy());
  },

  // ===== START: PHYSICS (hammer + broken glass) =====
  // Hammer smashes the screen when a real threat is approved
  playHammer() {
    const ix = this.ruleOpen ? 700 : 920, iy = 430;   // impact point
    const hammer = this.add.container(ix - 185, iy + 185).setDepth(110);
    const g = this.add.graphics();

    // Wooden handle (3 layers) + end cap
    [[34, 0x49301f, 1, -142, 137, -22, 18], [25, 0xb9824b, 1, -142, 137, -22, 18], [5, 0xd6a36a, 0.8, -132, 126, -28, 23]]
      .forEach(([w, c, a, x1, y1, x2, y2]) => g.lineStyle(w, c, a).lineBetween(x1, y1, x2, y2));
    g.fillStyle(0x49301f).fillCircle(-142, 137, 17);

    // Steel head (4 layers), outline, and neck
    [[0x20242b, -42, -76, 62, 142, 12], [0x69727d, -38, -72, 54, 134, 10], [0xc4cbd2, -34, -68, 13, 126, 6], [0x414852, 1, -67, 12, 124, 5]]
      .forEach(([c, x, y, w, h, r]) => g.fillStyle(c).fillRoundedRect(x, y, w, h, r));
    g.lineStyle(3, 0xe0e5e9, 0.75).strokeRoundedRect(-38, -72, 54, 134, 10);
    g.fillStyle(0x343941).fillRoundedRect(-39, 5, 28, 34, 6);
    hammer.add(g);

    // The hammer falls, then the screen cracks
    this.tweens.add({
      targets: hammer, x: ix, y: iy, duration: 390, ease: 'Cubic.easeIn',
      onComplete: () => {
        this.cameras.main.shake(340, 0.018);
        this.cameras.main.flash(170, 180, 0, 15);

        const cracks = this.drawCracks(ix, iy);
        const warning = this.txt(ix, iy + 150, 'SECURITY BREACH', 30, '#ff263d').setOrigin(0.5).setDepth(112);
        const all = [hammer, cracks, warning];

        this.tweens.add({ targets: all, alpha: 0, delay: 620, duration: 380, onComplete: () => all.forEach(o => o.destroy()) });
      }
    });
  },

  // Glass cracks: 16 main fractures with 2 branches each, plus an impact ring
  drawCracks(cx, cy) {
    const cracks = this.add.graphics().setDepth(105);

    for (let i = 0; i < 16; i++) {
      const a = (Math.PI * 2 * i) / 16 + Phaser.Math.FloatBetween(-0.09, 0.09);
      const dx = Math.cos(a), dy = Math.sin(a);
      const reach = Phaser.Math.Between(190, 285), bend = Phaser.Math.FloatBetween(-30, 30);
      const p1 = { x: cx + dx * 62 - dy * bend, y: cy + dy * 62 + dx * bend };
      const p2 = { x: cx + dx * 145 + dy * bend, y: cy + dy * 145 - dx * bend };

      // Main fracture
      cracks.lineStyle(4, 0xff263d, 0.98).beginPath().moveTo(cx, cy)
        .lineTo(p1.x, p1.y).lineTo(p2.x, p2.y).lineTo(cx + dx * reach, cy + dy * reach).strokePath();

      // Two thin branches
      cracks.lineStyle(2.2, 0xff5264, 0.9);
      [-1, 1].forEach((side, n) => {
        const t = 0.35 + n * 0.35;
        const bx = p1.x + (p2.x - p1.x) * t, by = p1.y + (p2.y - p1.y) * t;
        cracks.beginPath().moveTo(bx, by)
          .lineTo(bx + Math.cos(a + side * 0.72) * 58, by + Math.sin(a + side * 0.72) * 58)
          .lineTo(bx + Math.cos(a + side * 0.92) * 92, by + Math.sin(a + side * 0.92) * 92).strokePath();
      });
    }
    cracks.lineStyle(3, 0xff9aa5, 0.9).strokeCircle(cx, cy, 34);   // impact ring
    return cracks;
  }
  // ===== END: PHYSICS =====
});
