/* HackerScene: طالبة 5 و 6 تشتغلان هنا */
class HackerScene extends Phaser.Scene {
  constructor() { super('HackerScene'); }
  create() {
    const cx = this.scale.width / 2;
    this.add.text(cx, 260, 'HACKER SCENE\n(Student 5 & 6)', { fontFamily: FONT, fontSize: '22px', color: '#e8e8e8', align: 'center' }).setOrigin(0.5);
    this.btn(cx, 400, 'TEST: GRANTED', () => this.scene.start('EndScene', { result: 'granted' }));
    this.btn(cx, 450, 'TEST: CAUGHT', () => this.scene.start('EndScene', { result: 'caught' }));
  }
  btn(x, y, t, f) { this.add.text(x, y, '[ ' + t + ' ]', { fontFamily: FONT, fontSize: '18px', color: '#e01020' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', f); }
}
