/**
 * DragHelper - سحب وإفلات لـ Phaser 3 (نسخة Scripts عادية، بدون import/export)
 * ------------------------------------------------------------
 *  const drag = new DragHelper(this);                       // داخل create()
 *  drag.addDropZone(obj, { accepts: ['scanner'], onDrop })  // مكان الإسقاط
 *  drag.addDraggable(obj, { kind: 'scanner', returnOnDrop: true, onDrop })
 *  drag.removeDraggable(obj)   // قبل ما تحذفين العنصر (مثلاً الرسالة)
 */
class DragHelper {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.options = Object.assign({
      returnDuration: 180,
      hoverTint: 0xffd43b, invalidTint: 0xff6b6b,       // لتلوين الصور
      hoverStroke: 0xffd43b, invalidStroke: 0xff6b6b,   // لتلوين حدود المستطيلات
    }, options);
    this.items = new Map();
    this.zones = new Map();
    this.destroyed = false;
    scene.input.setTopOnly(true);
    this._shutdown = () => this.destroy();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this._shutdown);
  }

  /**
   * config: kind (نوع العنصر)، returnOnDrop (يرجع مكانه الأصلي بعد إسقاط صحيح)،
   *         onDrop(valid, zoneObject, item)، onDragStart، onDragEnd
   */
  addDraggable(gameObject, config = {}) {
    if (!gameObject || !gameObject.setInteractive) throw new Error('DragHelper: العنصر لازم يكون Phaser Game Object.');
    if (gameObject.type === 'Container' && !gameObject.width) throw new Error('DragHelper: الـ Container لازم تسوين له setSize(عرض, ارتفاع) قبل السحب.');
    if (this.items.has(gameObject)) this.removeDraggable(gameObject);

    const data = {
      kind: config.kind !== undefined ? config.kind : 'default',
      home: { x: gameObject.x, y: gameObject.y },
      start: { x: gameObject.x, y: gameObject.y },
      depth: gameObject.depth,
      returnOnDrop: !!config.returnOnDrop,
      onDrop: config.onDrop, onDragStart: config.onDragStart, onDragEnd: config.onDragEnd,
      enabled: true, handlers: {},
    };

    data.handlers.dragstart = (pointer) => {
      if (!data.enabled) return;
      this.scene.tweens.killTweensOf(gameObject);
      data.start = { x: gameObject.x, y: gameObject.y };
      gameObject.setDepth(1000);
      if (data.onDragStart) data.onDragStart(gameObject, pointer);
    };
    data.handlers.drag = (_pointer, dragX, dragY) => {
      if (!data.enabled) return;
      gameObject.setPosition(dragX, dragY);
      this._highlightAt(gameObject);
    };
    data.handlers.dragend = (pointer) => {
      if (!data.enabled) return;
      const zone = this._findZone(gameObject);
      const valid = !!zone && this._accepts(zone.config, data.kind);
      if (valid) {
        if (zone.config.onDrop) zone.config.onDrop(gameObject, zone.object, pointer);
        if (data.onDrop) data.onDrop(true, zone.object, gameObject);
      } else if (data.onDrop) {
        data.onDrop(false, zone ? zone.object : null, gameObject);
      }
      this._clearHighlights();
      // لو انحذف العنصر أو أُزيل من السحب داخل onDrop نوقف هنا
      if (!gameObject.active || !this.items.has(gameObject)) return;
      gameObject.setDepth(data.depth);
      if (!valid) this._returnTo(gameObject, data.start);
      else if (data.returnOnDrop) this._returnTo(gameObject, data.home);
      if (data.onDragEnd) data.onDragEnd(gameObject, valid, zone ? zone.object : null);
    };

    this.items.set(gameObject, data);
    gameObject.setInteractive({ useHandCursor: true, draggable: true });
    this.scene.input.setDraggable(gameObject);
    gameObject.on('dragstart', data.handlers.dragstart);
    gameObject.on('drag', data.handlers.drag);
    gameObject.on('dragend', data.handlers.dragend);
    return gameObject;
  }

  /** مكان الإسقاط. accepts: '*' أو نوع أو مصفوفة أنواع */
  addDropZone(gameObject, config = {}) {
    if (!gameObject || !gameObject.getBounds) throw new Error('DragHelper: منطقة الإسقاط لازم تكون Phaser Game Object.');
    this.zones.set(gameObject, {
      object: gameObject,
      config: { accepts: config.accepts !== undefined ? config.accepts : '*', onDrop: config.onDrop, onEnter: config.onEnter, onLeave: config.onLeave },
      highlighted: false,
      look: this._readLook(gameObject),
    });
    return gameObject;
  }

  /** غيّري المكان الأصلي الذي يرجع له العنصر (returnOnDrop) */
  setHome(gameObject, x, y) {
    const d = this.items.get(gameObject);
    if (d) d.home = { x, y };
  }

  setEnabled(gameObject, enabled) {
    const d = this.items.get(gameObject);
    if (d) d.enabled = !!enabled;
  }

  removeDraggable(gameObject) {
    const d = this.items.get(gameObject);
    if (!d) return;
    gameObject.off('dragstart', d.handlers.dragstart);
    gameObject.off('drag', d.handlers.drag);
    gameObject.off('dragend', d.handlers.dragend);
    if (gameObject.input) this.scene.input.setDraggable(gameObject, false);
    this.items.delete(gameObject);
  }

  removeDropZone(gameObject) { this.zones.delete(gameObject); }

  _accepts(config, kind) {
    const a = config.accepts;
    return a === '*' || (Array.isArray(a) ? a.includes(kind) : a === kind);
  }

  // نختار المنطقة اللي يتقاطع معها العنصر بأكبر مساحة
  _findZone(item) {
    const itemBounds = item.getBounds();
    const tmp = new Phaser.Geom.Rectangle();
    let best = null, bestArea = 0;
    for (const entry of this.zones.values()) {
      if (!entry.object.active) continue;
      tmp.setTo(0, 0, 0, 0);
      Phaser.Geom.Intersects.GetRectangleIntersection(itemBounds, entry.object.getBounds(), tmp);
      const area = tmp.width * tmp.height;
      if (area > bestArea) { best = entry; bestArea = area; }
    }
    return best;
  }

  _readLook(o) {
    return {
      isShape: typeof o.setStrokeStyle === 'function',
      stroked: o.isStroked, lineWidth: o.lineWidth, strokeColor: o.strokeColor, strokeAlpha: o.strokeAlpha,
      hasTint: typeof o.setTint === 'function', tinted: o.isTinted, tint: o.tintTopLeft,
    };
  }

  _applyHighlight(entry, ok) {
    const o = entry.object, look = entry.look;
    if (!o.active) return;
    if (look.isShape) o.setStrokeStyle(4, ok ? this.options.hoverStroke : this.options.invalidStroke);
    else if (look.hasTint) o.setTint(ok ? this.options.hoverTint : this.options.invalidTint);
  }

  _restoreLook(entry) {
    const o = entry.object, look = entry.look;
    if (!o.active) return;
    if (look.isShape) {
      if (look.stroked) o.setStrokeStyle(look.lineWidth, look.strokeColor, look.strokeAlpha);
      else o.setStrokeStyle();
    } else if (look.hasTint) {
      if (look.tinted) o.setTint(look.tint); else o.clearTint();
    }
  }

  _highlightAt(item) {
    const zone = this._findZone(item);
    const kind = this.items.has(item) ? this.items.get(item).kind : undefined;
    for (const entry of this.zones.values()) {
      if (entry === zone) {
        if (!entry.highlighted && entry.config.onEnter) entry.config.onEnter(item, entry.object);
        entry.highlighted = true;
        this._applyHighlight(entry, this._accepts(entry.config, kind));
      } else if (entry.highlighted) {
        if (entry.config.onLeave) entry.config.onLeave(item, entry.object);
        entry.highlighted = false;
        this._restoreLook(entry);
      }
    }
  }

  _clearHighlights() {
    for (const entry of this.zones.values()) {
      if (entry.highlighted) {
        if (entry.config.onLeave) entry.config.onLeave(null, entry.object);
        entry.highlighted = false;
        this._restoreLook(entry);
      }
    }
  }

  _returnTo(item, pos) {
    this.scene.tweens.killTweensOf(item);
    this.scene.tweens.add({ targets: item, x: pos.x, y: pos.y, duration: this.options.returnDuration, ease: 'Back.Out' });
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const item of Array.from(this.items.keys())) this.removeDraggable(item);
    this.zones.clear();
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this._shutdown);
  }
}
