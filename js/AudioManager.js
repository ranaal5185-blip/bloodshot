/**
 * AudioManager - تحميل وتشغيل الأصوات. Scripts عادية بدون import.
 *  preload():  AudioManager.load(this, { alarm: 'assets/audio/alarm.mp3' });
 *  create():   this.audio = new AudioManager(this);  this.audio.play('alarm');
 */
class AudioManager {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.sounds = new Map();
    this.masterVolume = options.volume !== undefined ? options.volume : 1;
    this.muted = options.muted || false;
    this.destroyed = false;
    this._shutdown = () => this.destroy();
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this._shutdown);
  }

  static load(scene, files = {}) {
    for (const [key, path] of Object.entries(files)) scene.load.audio(key, path);
  }

  register(key, config = {}) {
    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`[AudioManager] الصوت "${key}" غير محمّل. حمّليه في preload().`);
      return null;
    }
    const sound = this.scene.sound.add(key, {
      volume: (config.volume !== undefined ? config.volume : 1) * this.masterVolume,
      loop: config.loop || false,
      rate: config.rate !== undefined ? config.rate : 1,
    });
    this.sounds.set(config.name || key, sound);
    return sound;
  }

  play(name, config = {}) {
    if (this.muted || this.destroyed) return null;
    let sound = this.sounds.get(name);
    if (!sound) sound = this.register(name, config);
    if (!sound) return null;
    sound.setVolume((config.volume !== undefined ? config.volume : 1) * this.masterVolume);
    if (config.rate !== undefined) sound.setRate(config.rate);
    if (config.loop !== undefined) sound.setLoop(config.loop);
    if (config.restart) sound.stop();
    sound.play({ delay: config.delay || 0, seek: config.seek || 0 });
    return sound;
  }

  stop(name) { const s = this.sounds.get(name); if (s) s.stop(); }
  stopAll() { for (const s of this.sounds.values()) s.stop(); }
  setVolume(value) {
    this.masterVolume = Phaser.Math.Clamp(value, 0, 1);
    for (const s of this.sounds.values()) s.setVolume(this.masterVolume);
  }
  mute(value = true) {
    this.muted = value;
    this.scene.sound.setMute(value);
  }
  destroy() {
    this.stopAll();
    for (const s of this.sounds.values()) s.destroy();
    this.sounds.clear();
    this.destroyed = true;
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this._shutdown);
  }
}
