/* HackerScreen (gigi): the hacker path before the game.
   1. red desk: cigarette smoke, typing fingers, loading twice, then PRESS
   2. computer: red desktop -> the red "extremely sensitive" folder goes to HackerScene,
      rule book opens the hacker rules, red X closes them
   Uses ScreenHelpers.js, deskData.js and notifyData.js. */

const HACKER_DESK = {
  buttonColor: '#e00000', buttonX: 0.647, buttonY: 0.335,
  doneBox: [897, 204, 486, 188], doneColor: 0x080404,
  barBox: [944, 328, 386, 30], barColor: 0x080404,
  blockX: 949, blockY: 332, blockW: 20, blockH: 22, blockColor: 0xe00000,
  emptyColor: null,
  fingers: [[858, 33], [893, 26], [920, 28], [950, 50], [1178, 49], [1229, 26], [1257, 26], [1285, 28]],
  fingerY: 724, fingerH: 46,
  glow: [307, 627],                                              // cigarette tip + smoke
  puffX: 305, puffSpread: 0, puffY: 622, puffSize: 1.5,
  rise: 0.8, wiggle: 15, grow: 0.06, fade: 0.004,
  puffColor: 0xd2c8c8, puffAlpha: 0.14
};

const HACKER_COMPUTER = {
  home: 'h_desktop', rules: 'h_rule_book', next: 'HackerScene',
  openBox: [1340, 418, 130, 135],   // red folder
  rulesBox: [285, 540, 120, 125],   // rule book icon
  closeBox: [1340, 188, 52, 48]     // red X on the rule book
};

class HackerScreen extends Phaser.Scene {
  constructor() { super('HackerScreen'); }

  create() {
    ScreenHelpers.addImages(this, { hacker: DESK_IMAGES.hacker }, 'desk_', () =>
      ScreenHelpers.addImages(this, NOTIFY_IMAGES, 'n_', () => {
        ScreenHelpers.screenSize(this);
        ScreenHelpers.desk(this, HACKER_DESK, 'desk_hacker', () => {
          ScreenHelpers.clearDesk(this);
          ScreenHelpers.computer(this, HACKER_COMPUTER);
        });
      }));
  }

  update() { ScreenHelpers.updateDesk(this); }
}
