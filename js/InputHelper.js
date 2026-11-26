/** InputHelper - كيبورد وماوس. Scripts عادية بدون import. */
class InputHelper {
  // مفتاح واحد: InputHelper.onKey(this, 'G', () => ...)  أسماء خاصة: SPACE, ENTER, ESC, UP, DOWN, LEFT, RIGHT, F1..F12
  // يرجع دالة لإلغاء الاستماع. (أحداث المتصفح، لأن Phaser 3.85 يكرر الضغطات بعد بدء مشهد من زر)
  static onKey(scene, keyName, callback) {
    const names = { SPACE: ' ', ENTER: 'Enter', ESC: 'Escape', ESCAPE: 'Escape', UP: 'ArrowUp', DOWN: 'ArrowDown', LEFT: 'ArrowLeft', RIGHT: 'ArrowRight', BACKSPACE: 'Backspace', TAB: 'Tab' };
    const upper = String(keyName).toUpperCase();
    const target = names[upper] || (upper.length === 1 ? upper.toLowerCase() : upper);
    const handler = (event) => {
      if (event.repeat) return;
      const k = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (k === target) callback(event);
    };
    window.addEventListener('keydown', handler);
    const off = () => window.removeEventListener('keydown', handler);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, off);
    return off;
  }

  static onPointer(scene, eventName, callback) {
    const allowed = ['pointerdown', 'pointerup', 'pointermove', 'gameobjectdown', 'gameobjectup'];
    if (!allowed.includes(eventName)) throw new Error(`InputHelper: حدث غير مدعوم: ${eventName}`);
    scene.input.on(eventName, callback);
    return () => scene.input.off(eventName, callback);
  }

  /**
   * كتابة نص بالكيبورد (للغز الشيفرة / كلمات المرور).
   *  const t = InputHelper.onTyping(this, { maxLength: 8, onChange: v => txt.setText(v), onSubmit: v => check(v) });
   *  t.getValue()  t.clear()  t.setEnabled(false)
   * ملاحظة: نستخدم أحداث المتصفح (window) وليس scene.input.keyboard.on('keydown')،
   * لأن Phaser 3.85 يكرر ضغطات المفاتيح لو المشهد بدأ من ضغطة زر (اختبرنا ذلك).
   */
  static onTyping(scene, options = {}) {
    const opts = Object.assign({ maxLength: 12, allowed: /^[a-z0-9]$/i, uppercase: true, onChange: null, onSubmit: null }, options);
    let value = '';
    let enabled = true;
    const handler = (event) => {
      if (!enabled || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Backspace') { event.preventDefault(); value = value.slice(0, -1); }
      else if (event.key === 'Enter') { event.preventDefault(); if (!event.repeat && opts.onSubmit) opts.onSubmit(value); return; }
      else if (event.key.length === 1 && opts.allowed.test(event.key)) {
        if (value.length >= opts.maxLength) return;
        value += opts.uppercase ? event.key.toUpperCase() : event.key;
      } else return;
      if (opts.onChange) opts.onChange(value);
    };
    window.addEventListener('keydown', handler);
    const api = {
      getValue: () => value,
      setValue: (v) => { value = String(v); if (opts.onChange) opts.onChange(value); },
      clear: () => api.setValue(''),
      setEnabled: (on) => { enabled = !!on; },
      destroy: () => window.removeEventListener('keydown', handler),
    };
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, api.destroy);
    return api;
  }

  static makeButton(scene, x, y, label, callback, options = {}) {
    const button = scene.add.text(x, y, label, {
      fontFamily: options.fontFamily || 'Courier New, monospace', fontSize: options.fontSize || '16px',
      color: options.color || '#ffffff', backgroundColor: options.backgroundColor || '#333333',
      padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    button.on('pointerdown', callback);
    button.on('pointerover', () => button.setAlpha(0.75));
    button.on('pointerout', () => button.setAlpha(1));
    return button;
  }
}
