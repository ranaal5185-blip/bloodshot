/** PhysicsHelper - إعداد Arcade Physics. لازم تفعّلين الفيزياء في main.js (انظري README). */
class PhysicsHelper {
  static enable(scene, gameObject, options = {}) {
    scene.physics.add.existing(gameObject, options.isStatic || false);
    const body = gameObject.body;
    if (options.immovable !== undefined) body.setImmovable(options.immovable);
    if (options.allowGravity !== undefined) body.setAllowGravity(options.allowGravity);
    if (options.gravityY !== undefined) body.setGravityY(options.gravityY);
    if (options.velocity) body.setVelocity(options.velocity.x || 0, options.velocity.y || 0);
    if (options.bounce !== undefined) body.setBounce(options.bounce);
    if (options.collideWorldBounds) body.setCollideWorldBounds(true);
    if (options.size) body.setSize(options.size.width, options.size.height, options.size.center !== false);
    return body;
  }
  static collider(scene, a, b, callback, process, context) { return scene.physics.add.collider(a, b, callback, process, context); }
  static overlap(scene, a, b, callback, process, context) { return scene.physics.add.overlap(a, b, callback, process, context); }
}
