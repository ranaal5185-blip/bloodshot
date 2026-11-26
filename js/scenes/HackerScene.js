class HackerScene extends Phaser.Scene {
    constructor() {
        super('HackerScene');
    }

    preload() {
    
        if (!this.textures.exists('coffe1')) {
            this.load.image('coffe1', 'assets/coffe1.jpeg');
        }
        if (!this.textures.exists('voice1')) {
            this.load.image('voice1', 'assets/voice1.jpeg');
        }
        if (!this.textures.exists('manager1')) {
            this.load.image('manager1', 'assets/manager1.jpeg');
        }
    }

    init() {
        this.currentSlide = 0;
        this.stageObjects = [];
        this.timerEvent = null;
        this.pulseTween = null;
        this.keyHandler = null;
        this.matrixBg = null;
        this.matrixActive = false;
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;
        this.fontName = (typeof FONT !== 'undefined') ? FONT : 'monospace';

        // base background
        if (this.textures.exists('hacker_bg')) {
            this.add.image(w / 2, h / 2, 'hacker_bg').setDisplaySize(w, h);
            this.add.rectangle(w / 2, h / 2, w, h, 0x050508, 0.72);
        } else {
            this.add.rectangle(w / 2, h / 2, w, h, 0x050705);
        }

        // falling matrix code background (TileSprite - hidden until evidence is collected)
        this.createMatrixTexture();
        this.matrixBg = this.add.tileSprite(w / 2, h / 2, w, h, 'matrix_rain').setAlpha(0);

        // Student 6 backstory data
        this.slides = [
            {
                title: 'THE FIRST CLUE',
                imgKey: 'coffe1',
                text: 'After being fired by the company, the hacker began planning his revenge.\n\nOne night, he found his manager\'s coffee cup in the trash. It might contain his fingerprints.',
                clue: 'The first clue was found.'
            },
            {
                title: 'THE VOICE RECORDING',
                imgKey: 'voice1',
                text: 'The hacker found an old voice recording of his manager.\n\nThe recording could help him pass the voice verification system.',
                clue: 'The second clue was found.'
            },
            {
                title: 'THE MANAGER\'S PHOTO',
                imgKey: 'manager1',
                text: 'The hacker found a photo of his manager (Faisal Alharbi, ID: MGR-4471).\n\nHe kept it as evidence to access the manager\'s account.',
                clue: 'The final clue was found.'
            }
        ];

        this.showBackstory();
    }

    update() {
        // scroll the matrix code downward smoothly
        if (this.matrixBg && this.matrixActive) {
            this.matrixBg.tilePositionY -= 1.8;
        }
    }

    createMatrixTexture() {
        if (this.textures.exists('matrix_rain')) return;

        const w = this.scale.width;
        const h = this.scale.height;
        const canvasTex = this.textures.createCanvas('matrix_rain', w, h);
        const ctx = canvasTex.getContext();

        ctx.fillStyle = '#030603';
        ctx.fillRect(0, 0, w, h);

        const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%@&*+=<>';
        const colWidth = 18;
        const rowHeight = 18;
        const cols = Math.floor(w / colWidth);
        const rows = Math.floor(h / rowHeight);

        ctx.font = 'bold 14px monospace';

        for (let c = 0; c < cols; c++) {
            if (Math.random() < 0.22) continue;

            const startRow = Math.floor(Math.random() * rows);
            const streamLen = 8 + Math.floor(Math.random() * 14);

            for (let i = 0; i < streamLen; i++) {
                const r = (startRow + i) % rows;
                const ch = chars[Math.floor(Math.random() * chars.length)];
                const fade = (i + 1) / streamLen;

                if (i === streamLen - 1) {
                    ctx.fillStyle = 'rgba(200, 255, 210, 0.95)';
                } else {
                    ctx.fillStyle = 'rgba(0, 220, 75, ' + (fade * 0.78).toFixed(2) + ')';
                }
                ctx.fillText(ch, c * colWidth + 2, r * rowHeight + 14);
            }
        }

        canvasTex.refresh();
    }

    activateMatrixBg() {
        if (this.matrixActive) return;
        this.matrixActive = true;
        this.tweens.add({
            targets: this.matrixBg,
            alpha: 0.42,
            duration: 800
        });
    }

    clearStage() {
        this.stageObjects.forEach(obj => {
            if (obj && obj.destroy) obj.destroy();
        });
        this.stageObjects = [];

        this.input.off('drag');
        this.input.off('drop');
        this.input.off('dragend');

        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = null;
        }
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
        if (this.keyHandler) {
            this.input.keyboard.off('keydown', this.keyHandler);
            this.keyHandler = null;
        }
    }

    // ==================== 1. BACKSTORY (3 SLIDES) ====================
    showBackstory() {
        this.clearStage();
        const cx = this.scale.width / 2;
        const slide = this.slides[this.currentSlide];

        const stepTxt = this.add.text(cx, 40, 'BACKSTORY (' + (this.currentSlide + 1) + '/3)', {
            fontFamily: this.fontName,
            fontSize: '14px',
            color: '#e01020'
        }).setOrigin(0.5);

        const titleTxt = this.add.text(cx, 78, slide.title, {
            fontFamily: this.fontName,
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        let img;
        if (this.textures.exists(slide.imgKey)) {
            img = this.add.image(cx, 225, slide.imgKey).setDisplaySize(380, 215);
        } else {
            img = this.add.rectangle(cx, 225, 380, 215, 0x151515).setStrokeStyle(2, 0xcc0000);
        }

        const bodyTxt = this.add.text(cx, 415, slide.text, {
            fontFamily: this.fontName,
            fontSize: '14px',
            color: '#e8e8e8',
            align: 'center',
            lineSpacing: 6,
            wordWrap: { width: 490 }
        }).setOrigin(0.5);

        const clueTxt = this.add.text(cx, 535, slide.clue, {
            fontFamily: this.fontName,
            fontSize: '14px',
            color: '#ff3b5c'
        }).setOrigin(0.5);

        const nextBtn = this.add.text(cx, 610, '[ NEXT > ]', {
            fontFamily: this.fontName,
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#cc0000',
            padding: { x: 24, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        nextBtn.on('pointerdown', () => {
            this.currentSlide++;
            if (this.currentSlide < this.slides.length) {
                this.showBackstory();
            } else {
                this.activateMatrixBg();
                this.startStage1();
            }
        });

        this.stageObjects.push(stepTxt, titleTxt, img, bodyTxt, clueTxt, nextBtn);
    }

    // ==================== 2. STAGE 1: EMPLOYEE GATE ====================
    startStage1() {
        const samples = [
            { key: 'coffe1', label: 'COFFEE CUP', isCorrect: true },
            { key: 'voice1', label: 'VOICE CLIP', isCorrect: false },
            { key: 'manager1', label: 'MANAGER ID', isCorrect: false }
        ];

        this.setupScannerStage(
            'STAGE 1: EMPLOYEE GATE',
            'Required: Fingerprint Sample.\nDrag the right evidence to the scanner.',
            samples,
            () => this.startStage2()
        );
    }

    // ==================== 3. STAGE 2: MANAGER ACCOUNT ====================
    startStage2() {
        const samples = [
            { key: 'coffe1', label: 'COFFEE CUP', isCorrect: false },
            { key: 'voice1', label: 'VOICE CLIP', isCorrect: true },
            { key: 'manager1', label: 'MANAGER ID', isCorrect: false }
        ];

        this.setupScannerStage(
            'STAGE 2: MANAGER ACCOUNT',
            'Required: Voice Verification.\nDrag the right evidence to the scanner.',
            samples,
            () => this.showSecurityQuestion()
        );
    }

    setupScannerStage(stageTitle, hintMsg, samples, onSuccess) {
        this.clearStage();
        const cx = this.scale.width / 2;

        const header = this.add.text(cx, 48, stageTitle, {
            fontFamily: this.fontName,
            fontSize: '20px',
            color: '#ff2020'
        }).setOrigin(0.5);

        const hint = this.add.text(cx, 95, hintMsg, {
            fontFamily: this.fontName,
            fontSize: '13px',
            color: '#cccccc',
            align: 'center',
            lineSpacing: 5,
            wordWrap: { width: 500 }
        }).setOrigin(0.5);

        const scannerX = cx;
        const scannerY = 240;

        const scannerBox = this.add.rectangle(scannerX, scannerY, 260, 150, 0x101214, 0.9)
            .setStrokeStyle(3, 0xcc0000);

        const scannerLabel = this.add.text(scannerX, scannerY, 'BIOMETRIC SCANNER\n(Drop Evidence Here)', {
            fontFamily: this.fontName,
            fontSize: '13px',
            color: '#ff4d4d',
            align: 'center'
        }).setOrigin(0.5);

        const dropZone = this.add.zone(scannerX, scannerY, 260, 150).setRectangleDropZone(260, 150);

        const feedback = this.add.text(cx, 355, '', {
            fontFamily: this.fontName,
            fontSize: '15px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.stageObjects.push(header, hint, scannerBox, scannerLabel, dropZone, feedback);

        const positions = [
            { x: cx - 175, y: 495 },
            { x: cx,       y: 495 },
            { x: cx + 175, y: 495 }
        ];

        samples.forEach((item, i) => {
            const pos = positions[i];
            const container = this.add.container(pos.x, pos.y);

            if (this.textures.exists(item.key)) {
                const card = this.add.image(0, 0, item.key).setDisplaySize(160, 95);
                container.add(card);
            } else {
                const box = this.add.rectangle(0, 0, 160, 95, 0x1d1d24).setStrokeStyle(2, 0xcc0000);
                const txt = this.add.text(0, 0, item.label, {
                    fontFamily: this.fontName,
                    fontSize: '12px',
                    color: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5);
                container.add([box, txt]);
            }

            container.setSize(160, 95);
            container.setInteractive({ draggable: true, useHandCursor: true });
            container.startX = pos.x;
            container.startY = pos.y;
            container.isCorrect = item.isCorrect;

            this.input.setDraggable(container);
            this.stageObjects.push(container);
        });

        let solved = false;

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (solved) return;
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('drop', (pointer, gameObject) => {
            if (solved) return;

            if (gameObject.isCorrect) {
                solved = true;
                gameObject.x = scannerX;
                gameObject.y = scannerY;
                scannerBox.setStrokeStyle(3, 0x39ff88);
                feedback.setText('VERIFIED! ACCESS GRANTED').setColor('#39ff88');

                this.time.delayedCall(900, () => {
                    onSuccess();
                });
            } else {
                feedback.setText('ACCESS DENIED - WRONG SAMPLE').setColor('#ff3b5c');
                this.cameras.main.shake(200, 0.012);
                gameObject.x = gameObject.startX;
                gameObject.y = gameObject.startY;
            }
        });

        this.input.on('dragend', (pointer, gameObject, dropped) => {
            if (!dropped && !solved) {
                gameObject.x = gameObject.startX;
                gameObject.y = gameObject.startY;
            }
        });
    }

    // ==================== 4. SECURITY QUESTION ====================
    showSecurityQuestion() {
        this.clearStage();
        const cx = this.scale.width / 2;

        const header = this.add.text(cx, 65, 'STAGE 2: SECURITY CHECK', {
            fontFamily: this.fontName,
            fontSize: '20px',
            color: '#ff2020'
        }).setOrigin(0.5);

        const qText = this.add.text(cx, 155, 'What is the Manager\'s ID number?', {
            fontFamily: this.fontName,
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 480 }
        }).setOrigin(0.5);

        const feedback = this.add.text(cx, 540, '', {
            fontFamily: this.fontName,
            fontSize: '15px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.stageObjects.push(header, qText, feedback);

        const options = [
            { text: 'A) MGR-2210', correct: false },
            { text: 'B) MGR-4471', correct: true },
            { text: 'C) MGR-8890', correct: false }
        ];

        options.forEach((opt, i) => {
            const btn = this.add.text(cx, 260 + (i * 80), opt.text, {
                fontFamily: this.fontName,
                fontSize: '17px',
                color: '#ffffff',
                backgroundColor: '#1c1c22',
                padding: { x: 35, y: 14 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            btn.on('pointerdown', () => {
                if (opt.correct) {
                    feedback.setText('MANAGER ACCOUNT UNLOCKED!').setColor('#39ff88');
                    this.time.delayedCall(900, () => {
                        this.startFinalPuzzle();
                    });
                } else {
                    feedback.setText('WRONG ANSWER. TRY AGAIN.').setColor('#ff3b5c');
                    this.cameras.main.shake(200, 0.012);
                }
            });

            this.stageObjects.push(btn);
        });
    }

    // ==================== 5. FINAL PUZZLE (STUDENT 6) ====================
    startFinalPuzzle() {
        this.clearStage();
        const cx = this.scale.width / 2;

        let timeLeft = 30;
        let typedAnswer = '';
        let puzzleEnded = false;

        const title = this.add.text(cx, 55, 'FINAL SECURITY CHECK', {
            fontFamily: this.fontName,
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const sub = this.add.text(cx, 92, 'CAESAR CIPHER', {
            fontFamily: this.fontName,
            fontSize: '14px',
            color: '#cccccc'
        }).setOrigin(0.5);

        const timerTxt = this.add.text(cx, 150, 'TIME LEFT: 30', {
            fontFamily: this.fontName,
            fontSize: '22px',
            color: '#ff2020'
        }).setOrigin(0.5);

        const box = this.add.rectangle(cx, 370, 490, 320, 0x121214, 0.92).setStrokeStyle(2, 0xcc0000);

        const encLabel = this.add.text(cx, 245, 'ENCRYPTED MESSAGE', {
            fontFamily: this.fontName,
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const cipherTxt = this.add.text(cx, 305, 'F R G H', {
            fontFamily: this.fontName,
            fontSize: '36px',
            color: '#ff2020'
        }).setOrigin(0.5);

        const hintTxt = this.add.text(cx, 365, 'Hint: Shift each letter 3 positions backward.', {
            fontFamily: this.fontName,
            fontSize: '12px',
            color: '#cccccc',
            align: 'center',
            wordWrap: { width: 440 }
        }).setOrigin(0.5);

        const inputBox = this.add.rectangle(cx, 430, 340, 48, 0x080808).setStrokeStyle(2, 0xcc0000);

        const inputTxt = this.add.text(cx, 430, 'TYPE ANSWER...', {
            fontFamily: this.fontName,
            fontSize: '18px',
            color: '#777777'
        }).setOrigin(0.5);

        const submitBtn = this.add.text(cx, 495, '[ DECRYPT ]', {
            fontFamily: this.fontName,
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#cc0000',
            padding: { x: 28, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const msgTxt = this.add.text(cx, 575, '', {
            fontFamily: this.fontName,
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.stageObjects.push(title, sub, timerTxt, box, encLabel, cipherTxt, hintTxt, inputBox, inputTxt, submitBtn, msgTxt);

        const checkAnswer = () => {
            if (puzzleEnded) return;

            if (typedAnswer.trim().toUpperCase() === 'CODE') {
                puzzleEnded = true;
                this.clearTimerAndPulse();
                msgTxt.setText('ACCESS GRANTED! SYSTEM UNLOCKED').setColor('#39ff88');

                this.time.delayedCall(1000, () => {
                    this.scene.start('EndScene', { result: 'granted' });
                });
            } else {
                msgTxt.setText('WRONG PASSWORD! TRY AGAIN').setColor('#ff3b5c');
                this.cameras.main.shake(200, 0.015);
            }
        };

        submitBtn.on('pointerdown', checkAnswer);

        this.keyHandler = (event) => {
            if (puzzleEnded) return;

            if (event.key === 'Enter') {
                checkAnswer();
            } else if (event.key === 'Backspace') {
                typedAnswer = typedAnswer.slice(0, -1);
            } else if (/^[a-zA-Z]$/.test(event.key) && typedAnswer.length < 10) {
                typedAnswer += event.key.toUpperCase();
            }

            if (typedAnswer.length === 0) {
                inputTxt.setText('TYPE ANSWER...').setColor('#777777');
            } else {
                inputTxt.setText(typedAnswer).setColor('#ffffff');
            }
        };
        this.input.keyboard.on('keydown', this.keyHandler);

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            repeat: 29,
            callback: () => {
                if (puzzleEnded) return;
                timeLeft--;
                timerTxt.setText('TIME LEFT: ' + timeLeft);

                if (timeLeft <= 10 && timeLeft > 0 && !this.pulseTween) {
                    timerTxt.setColor('#ff1744');
                    this.pulseTween = this.tweens.add({
                        targets: timerTxt,
                        scale: 1.18,
                        duration: 450,
                        yoyo: true,
                        repeat: -1
                    });
                }

                if (timeLeft <= 0) {
                    puzzleEnded = true;
                    this.clearTimerAndPulse();
                    msgTxt.setText('TIME UP! SECURITY ALERTED').setColor('#ff1744');
                    this.cameras.main.shake(350, 0.02);

                    this.time.delayedCall(1000, () => {
                        this.scene.start('EndScene', { result: 'caught' });
                    });
                }
            }
        });
    }

    clearTimerAndPulse() {
        if (this.timerEvent) {
            this.timerEvent.remove(false);
            this.timerEvent = null;
        }
        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
    }
}
