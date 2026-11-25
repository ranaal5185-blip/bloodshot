/* ===================== BootScene: تحميل الإطارات ===================== */
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create() {
    this.cameras.main.setBackgroundColor(0x030303);
    const items = [];
    VIDEO.eye.forEach((f, i) => items.push(['eye' + i, f[1]]));
    VIDEO.st.forEach((f, i) => items.push(['st' + i, f[1]]));
    Object.keys(VIDEO.static).forEach(k => items.push(['s_' + k, VIDEO.static[k][1]]));
    let left = items.length;
    const done = () => { if (--left === 0) this.scene.start('MenuScene'); };
    this.textures.on('onload', done);
    this.textures.on('onerror', done);
    items.forEach(([k, d]) => this.textures.addBase64(k, d));
  }
}
