/* AnalystScene: طالبة 3 و 4 تشتغلان هنا */
class AnalystScene extends Phaser.Scene {
  constructor() { super('AnalystScene'); }
  create() {
    const cx = this.scale.width / 2;
    this.add.text(cx, 260, 'ANALYST SCENE\n(Student 3 & 4)', { fontFamily: FONT, fontSize: '22px', color: '#e8e8e8', align: 'center' }).setOrigin(0.5);
    // اختبار: فشل -> EndScene
    this.btn(cx, 400, 'TEST: FIRED', () => this.scene.start('EndScene', { result: 'fired' }));
    this.btn(cx, 450, 'TEST: SECURED', () => this.scene.start('EndScene', { result: 'secured' }));
  }
  btn(x, y, t, f) { this.add.text(x, y, '[ ' + t + ' ]', { fontFamily: FONT, fontSize: '18px', color: '#e01020' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', f); }
}
