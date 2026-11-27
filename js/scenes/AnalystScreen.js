/* AnalystScreen (gigi): the analyst path before the game.
   1. green desk: coffee steam, typing finger, loading twice, then PRESS
   2. computer: "new message" -> Open goes to AnalystScene, rule book opens the rules, red X closes them
   Uses ScreenHelpers.js, deskData.js and notifyData.js. */

const ANALYST_DESK = {
  buttonColor: '#00a83c', buttonX: 0.644, buttonY: 0.38,
  doneBox: [904, 244, 456, 200], doneColor: 0x0b1511,
  barBox: [940, 327, 378, 34], barColor: 0x000000,
  blockX: 945, blockY: 331, blockW: 21, blockH: 26, blockColor: 0x09f950,
  emptyColor: 0x0d1914,
  fingers: [[1152, 58], [1212, 26], [1240, 28], [1270, 32]],   // right hand: [x, width]
  fingerY: 694, fingerH: 40,
  glow: null,                                                    // coffee steam
  puffX: 640, puffSpread: 36, puffY: 586, puffSize: 2,
  rise: 0.7, wiggle: 12, grow: 0.07, fade: 0.006,
  puffColor: 0xdcf0e1, puffAlpha: 0.2
};

const ANALYST_COMPUTER = {
  home: 'new_message', rules: 'rule_book', next: 'AnalystScene',
  openBox: [795, 350, 230, 215],    // envelope + "open"
  rulesBox: [250, 525, 145, 145],   // rule book icon
  closeBox: [1320, 168, 55, 48]     // red X on the rule book
};

class AnalystScreen extends Phaser.Scene {
  constructor() { super('AnalystScreen'); }

  create() {
    ScreenHelpers.addImages(this, { analyst: DESK_IMAGES.analyst }, 'desk_', () =>
      ScreenHelpers.addImages(this, NOTIFY_IMAGES, 'n_', () => {
        ScreenHelpers.screenSize(this);
        ScreenHelpers.desk(this, ANALYST_DESK, 'desk_analyst', () => {
          ScreenHelpers.clearDesk(this);
          ScreenHelpers.computer(this, ANALYST_COMPUTER);
        });
      }));
  }

  update() { ScreenHelpers.updateDesk(this); }
}
