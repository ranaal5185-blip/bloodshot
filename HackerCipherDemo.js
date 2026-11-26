/**
 * مثال جاهز: لغز شيفرة سيزر بمؤقت 30 ثانية داخل Phaser (بدل نسخة الـ HTML).
 * لـ طالبة 5/6: انسخي الفكرة إلى HackerScene.
 * في اللعبة الحقيقية استبدلي finish() بـ:  this.scene.start('EndScene', { won })
 */
class HackerCipherDemo extends Phaser.Scene {
  constructor() { super('HackerCipherDemo'); }

  create() {
    const { width } = this.scale;
    const font = 'Courier New, monospace';
    this.ended = false;
    this.timeLeft = 30;
    this.pulsing = false;
    this.effects = new Effects(this);

    this.add.text(width / 2, 50, 'FINAL SECURITY CHECK', { fontFamily: font, fontSize: '22px', color: '#ff2020' }).setOrigin(0.5);
    this.timerText = this.add.text(width / 2, 100, 'TIME LEFT: 30', { fontFamily: font, fontSize: '20px', color: '#e8e8e8' }).setOrigin(0.5);
    this.add.text(width / 2, 190, 'ENCRYPTED MESSAGE', { fontFamily: font, fontSize: '14px', color: '#8a8a8f' }).setOrigin(0.5);
    this.add.text(width / 2, 235, 'FRGH', { fontFamily: font, fontSize: '40px', color: '#39ff88' }).setOrigin(0.5);
    this.add.text(width / 2, 290, 'Hint: shift each letter 3 positions backward', { fontFamily: font, fontSize: '13px', color: '#8a8a8f' }).setOrigin(0.5);
    this.answerText = this.add.text(width / 2, 360, '> _', { fontFamily: font, fontSize: '28px', color: '#ffffff' }).setOrigin(0.5);
    this.message = this.add.text(width / 2, 430, 'Type the answer then press ENTER', { fontFamily: font, fontSize: '14px', color: '#8a8a8f' }).setOrigin(0.5);

    this.typing = InputHelper.onTyping(this, {
      maxLength: 8,
      onChange: (v) => this.answerText.setText('> ' + v + '_'),
      onSubmit: () => this.check(),
    });

    this.timerEvent = this.time.addEvent({ delay: 1000, repeat: 29, callback: () => this.tick() });
    InputHelper.makeButton(this, width / 2, 640, 'BACK TO SYSTEMS TEST', () => this.scene.start('SystemsDemoScene'));
  }

  tick() {
    if (this.ended) return;
    this.timeLeft--;
    this.timerText.setText('TIME LEFT: ' + this.timeLeft);
    if (this.timeLeft <= 10 && !this.pulsing) {
      this.pulsing = true;
      this.timerText.setColor('#ff1744');
      this.tweens.add({ targets: this.timerText, scale: 1.2, yoyo: true, repeat: -1, duration: 350 });
    }
    if (this.timeLeft <= 0) this.finish(false);
  }

  check() {
    if (this.ended) return;
    if (this.typing.getValue() === 'CODE') {
      this.finish(true);
    } else {
      this.effects.shake(0.015, 250);
      this.effects.flash(0xff0000, 200, 0.35);
      this.message.setText('WRONG PASSWORD! TRY AGAIN').setColor('#ff3b5c');
      this.typing.clear();
    }
  }

  finish(won) {
    this.ended = true;
    this.timerEvent.remove();
    this.typing.setEnabled(false);
    this.tweens.killTweensOf(this.timerText);
    this.timerText.setScale(1);
    if (won) {
      this.message.setText('ACCESS GRANTED - SYSTEM UNLOCKED').setColor('#39ff88');
    } else {
      this.effects.glitch(900, 10);
      this.effects.shake(0.02, 400);
      this.message.setText('ACCESS DENIED - SECURITY ALERTED').setColor('#ff3b5c');
    }
    this.result = won ? 'won' : 'lost';
    // في اللعبة الحقيقية: this.scene.start('EndScene', { won });
  }
}
