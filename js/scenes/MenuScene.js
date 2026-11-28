/* ===================== MenuScene ===================== */
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.cameras.main.setBackgroundColor(0x030303);
    const EYE = [60, 5], ST = [170, 510];
    this.eye = this.add.image(EYE[0], EYE[1], 'eye0').setOrigin(0, 0);
    this.stImg = this.add.image(ST[0], ST[1], 'st0').setOrigin(0, 0);
    ['title', 'tag'].forEach(k => { const b = VIDEO.static[k][0]; this.add.image(b[0], b[1], 's_' + k).setOrigin(0, 0); });

    const mk = (k, scene) => {
      const b = VIDEO.static[k][0];
      this.add.image(b[0], b[1], 's_' + k).setOrigin(0, 0);
      const w = b[2] - b[0], h = b[3] - b[1];
      const hl = this.add.rectangle(b[0], b[1], w, h, 0xffffff, 0).setOrigin(0, 0);
      hl.setInteractive({ useHandCursor: true })
        .on('pointerover', () => hl.setFillStyle(0xffffff, 0.14))
        .on('pointerout', () => hl.setFillStyle(0xffffff, 0))
        .on('pointerdown', () => this.scene.start('DeskScene', { role: k }));   // gigi: desk first, its PRESS opens the path
    };
    mk('hacker', 'HackerScene');
    mk('analyst', 'AnalystScene');

    this.ei = 0; this.si = 0; this.t0 = this.time.now;
  }

  update(time) {
    const t = ((time - this.t0) / 1000) % VIDEO.loop;
    const pick = (arr, i) => {
      if (arr[i] && arr[i][0] > t) i = 0;                      
      while (i + 1 < arr.length && arr[i + 1][0] <= t) i++;
      return i;
    };
    const ei = pick(VIDEO.eye, this.ei), si = pick(VIDEO.st, this.si);
    if (ei !== this.ei) { this.ei = ei; this.eye.setTexture('eye' + ei); }
    if (si !== this.si) { this.si = si; this.stImg.setTexture('st' + si); }
  }
}
