/** TileSpriteHelper - خلفيات متكررة (مثل الكود النازل على الشاشة). */
class TileSpriteHelper {
  static create(scene, x, y, width, height, textureKey, options = {}) {
    const tile = scene.add.tileSprite(x, y, width, height, textureKey);
    tile.setOrigin(options.originX !== undefined ? options.originX : 0.5, options.originY !== undefined ? options.originY : 0.5);
    if (options.depth !== undefined) tile.setDepth(options.depth);
    if (options.alpha !== undefined) tile.setAlpha(options.alpha);
    if (options.scrollX !== undefined) tile.tilePositionX = options.scrollX;
    if (options.scrollY !== undefined) tile.tilePositionY = options.scrollY;
    return tile;
  }
  // استدعيها داخل update(): TileSpriteHelper.scroll(this.bg, 0, 2)
  static scroll(tileSprite, x = 0, y = 0) {
    tileSprite.tilePositionX += x;
    tileSprite.tilePositionY += y;
  }
}
