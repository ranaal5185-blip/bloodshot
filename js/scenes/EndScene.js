/* ===================== EndScene (مشتركة) ===================== */
// تستقبل: this.scene.start('EndScene', { result: 'fired' | 'secured' | 'granted' | 'caught' })
class EndScene extends Phaser.Scene {
  constructor() { super('EndScene'); }
  init(data) { this.result = data.result || 'fired'; }
  create() {
    const cx = this.scale.width / 2, cy = this.scale.height / 2;
    const M = {
      fired:   { title: 'You are fired', sub: 'The manager has spoken.', color: '#e01020' },
      secured: { title: 'SYSTEM SECURED', sub: 'All threats blocked.', color: '#33ff77' },
      granted: { title: 'ACCESS GRANTED', sub: 'You are in.', color: '#33ff77' },
      caught:  { title: 'SECURITY ALERT', sub: 'Security is on the way.', color: '#e01020' }
    }[this.result];

    if (this.result === 'fired' || this.result === 'caught') this.cameras.main.shake(500, 0.02);
    this.add.text(cx, cy - 30, M.title, { fontFamily: FONT, fontSize: '34px', fontStyle: 'bold', color: M.color }).setOrigin(0.5);
    this.add.text(cx, cy + 20, M.sub, { fontFamily: FONT, fontSize: '16px', color: '#777777' }).setOrigin(0.5);
    this.add.text(cx, cy + 100, '[ BACK TO MENU ]', { fontFamily: FONT, fontSize: '18px', color: '#e8e8e8' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
