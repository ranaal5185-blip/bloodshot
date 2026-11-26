/** مشهد تجريبي فقط لاختبار الأنظمة. لا تدمجينه مع مشاهد الفريق. */
class SystemsDemoScene extends Phaser.Scene {
  constructor() { super('SystemsDemoScene'); }

  create() {
    const { width, height } = this.scale;
    const font = 'Courier New, monospace';

    // خلفية TileSprite من نسيج مولّد بالكود
    const pattern = this.add.graphics();
    pattern.fillStyle(0x202638, 1).fillRect(0, 0, 64, 64);
    pattern.fillStyle(0x293449, 1).fillRect(0, 0, 32, 32).fillRect(32, 32, 32, 32);
    pattern.generateTexture('demo-pattern', 64, 64);
    pattern.destroy();
    this.backgroundTiles = TileSpriteHelper.create(this, width / 2, height / 2, width, height, 'demo-pattern', { depth: -10 });

    this.add.text(width / 2, 28, 'STUDENT 2 - SYSTEMS TEST', { fontFamily: font, fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(width / 2, 56, 'Drag the blue tool onto the green zone', { fontFamily: font, fontSize: '13px', color: '#cbd5e1' }).setOrigin(0.5);

    // منطقة الإسقاط + الأداة (ترجع مكانها بعد الاستخدام)
    const zone = this.add.rectangle(380, 220, 150, 110, 0x285943).setStrokeStyle(3, 0x69db7c);
    this.add.text(zone.x, zone.y, 'SCANNER', { fontFamily: font, fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    const tool = this.add.rectangle(110, 220, 100, 70, 0x2878c8).setStrokeStyle(3, 0x9bd1ff);

    this.scans = 0;
    this.drag = new DragHelper(this);
    this.drag.addDropZone(zone, { accepts: ['scanner'] });
    this.drag.addDraggable(tool, {
      kind: 'scanner', returnOnDrop: true,
      onDrop: (valid) => {
        if (valid) { this.scans++; this.showMessage('Scan #' + this.scans + ' done. Tool returns.', '#8df0a5'); }
        else this.showMessage('Wrong place - tool returned.', '#ff9b9b');
      },
    });

    // كتابة بالكيبورد
    this.typedText = this.add.text(40, 340, '> _', { fontFamily: font, fontSize: '18px', color: '#39ff88' });
    this.add.text(40, 318, 'Type here (Backspace/Enter work):', { fontFamily: font, fontSize: '12px', color: '#94a3b8' });
    this.typing = InputHelper.onTyping(this, {
      maxLength: 10,
      onChange: (v) => this.typedText.setText('> ' + v + '_'),
      onSubmit: (v) => this.showMessage('Submitted: ' + v, '#ffd43b'),
    });

    // مؤثرات
    this.effects = new Effects(this);
    InputHelper.makeButton(this, 100, 590, 'SHAKE', () => this.effects.shake(0.02, 300));
    InputHelper.makeButton(this, 220, 590, 'GLITCH', () => this.effects.glitch(850, 10));
    InputHelper.makeButton(this, 340, 590, 'FLASH', () => this.effects.flash(0xff0000, 300, 0.5));
    InputHelper.makeButton(this, 470, 590, 'BG SCROLL', () => { this.bgSpeed = this.bgSpeed ? 0 : 1; });
    InputHelper.makeButton(this, width / 2, 640, 'OPEN CIPHER EXAMPLE', () => this.scene.start('HackerCipherDemo'));

    // صوت (يحتاج ملف في preload، هنا جاهز فقط)
    this.audio = new AudioManager(this);

    // فيزياء: مربع يسقط ويرتد
    const block = this.add.rectangle(510, 110, 28, 28, 0xf0b429);
    PhysicsHelper.enable(this, block, { gravityY: 450, bounce: 0.55, collideWorldBounds: true });
    const floor = this.add.rectangle(510, 300, 90, 16, 0x64748b);
    PhysicsHelper.enable(this, floor, { isStatic: true });
    PhysicsHelper.collider(this, block, floor);
    this.block = block;

    InputHelper.onKey(this, 'F2', () => this.effects.glitch(650, 8));
  }

  update() {
    if (this.bgSpeed) TileSpriteHelper.scroll(this.backgroundTiles, 1, 1);
  }

  showMessage(message, color) {
    if (this.feedback) this.feedback.destroy();
    this.feedback = this.add.text(this.scale.width / 2, 95, message, { fontFamily: 'Courier New, monospace', fontSize: '14px', color, backgroundColor: '#111827', padding: { x: 8, y: 6 } }).setOrigin(0.5).setDepth(100);
    this.time.delayedCall(1800, () => { if (this.feedback) this.feedback.destroy(); });
  }
}
