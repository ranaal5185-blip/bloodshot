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
        const w = this.scale.width;   // 1552
        const h = this.scale.height;  // 790
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

    // centered text helper (keeps font/size boilerplate in one place)
    txt(x, y, str, size, color, extra = {}) {
        return this.add.text(x, y, str, {
            fontFamily: this.fontName,
            fontSize: size + 'px',
            color: color,
            ...extra
        }).setOrigin(0.5);
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
        const colWidth = 22;
        const rowHeight = 22;
        const cols = Math.floor(w / colWidth);
        const rows = Math.floor(h / rowHeight);

        ctx.font = 'bold 18px monospace';

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
                ctx.fillText(ch, c * colWidth + 2, r * rowHeight + 18);
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

        this.clearTimerAndPulse();

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

        // layout: image on the left, text column on the right
        const imgX = 460, imgY = 405;
        const colX = 840, colW = 572;

        const stepTxt = this.txt(cx, 38, 'BACKSTORY (' + (this.currentSlide + 1) + '/3)', 20, '#e01020');
        const titleTxt = this.txt(cx, 90, slide.title, 34, '#ffffff');

        let img;
        if (this.textures.exists(slide.imgKey)) {
            img = this.add.image(imgX, imgY, slide.imgKey).setDisplaySize(640, 360);
        } else {
            img = this.add.rectangle(imgX, imgY, 640, 360, 0x151515).setStrokeStyle(3, 0xcc0000);
        }

        const bodyTxt = this.txt(colX, 380, slide.text, 24, '#e8e8e8', {
            lineSpacing: 10,
            wordWrap: { width: colW }
        }).setOrigin(0, 0.5);

        const clueTxt = this.txt(colX, 565, slide.clue, 22, '#ff3b5c').setOrigin(0, 0.5);

        const nextBtn = this.txt(colX + colW - 110, 680, '[ NEXT > ]', 26, '#ffffff', {
            backgroundColor: '#cc0000',
            padding: { x: 36, y: 16 }
        }).setInteractive({ useHandCursor: true });

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

        const header = this.txt(cx, 60, stageTitle, 34, '#ff2020');

        const hint = this.txt(cx, 125, hintMsg, 20, '#cccccc', {
            align: 'center',
            lineSpacing: 8,
            wordWrap: { width: 900 }
        });

        const scannerX = cx;
        const scannerY = 290;
        const scannerW = 520;
        const scannerH = 240;

        const scannerBox = this.add.rectangle(scannerX, scannerY, scannerW, scannerH, 0x101214, 0.9)
            .setStrokeStyle(4, 0xcc0000);

        const scannerLabel = this.txt(scannerX, scannerY, 'BIOMETRIC SCANNER\n(Drop Evidence Here)', 22, '#ff4d4d', {
            align: 'center',
            lineSpacing: 8
        });

        const dropZone = this.add.zone(scannerX, scannerY, scannerW, scannerH).setRectangleDropZone(scannerW, scannerH);

        const feedback = this.txt(cx, 450, '', 24, '#ffffff');

        this.stageObjects.push(header, hint, scannerBox, scannerLabel, dropZone, feedback);

        const cardW = 280;
        const cardH = 160;
        const cardY = 620;
        const gap = 380;
        const positions = [
            { x: cx - gap, y: cardY },
            { x: cx,       y: cardY },
            { x: cx + gap, y: cardY }
        ];

        samples.forEach((item, i) => {
            const pos = positions[i];
            const container = this.add.container(pos.x, pos.y);

            if (this.textures.exists(item.key)) {
                const card = this.add.image(0, 0, item.key).setDisplaySize(cardW, cardH);
                container.add(card);
            } else {
                const box = this.add.rectangle(0, 0, cardW, cardH, 0x1d1d24).setStrokeStyle(3, 0xcc0000);
                const label = this.txt(0, 0, item.label, 20, '#ffffff', { align: 'center' });
                container.add([box, label]);
            }

            container.setSize(cardW, cardH);
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
                scannerBox.setStrokeStyle(4, 0x39ff88);
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

        const header = this.txt(cx, 75, 'STAGE 2: SECURITY CHECK', 34, '#ff2020');

        const qText = this.txt(cx, 190, 'What is the Manager\'s ID number?', 30, '#ffffff', {
            align: 'center',
            wordWrap: { width: 900 }
        });

        const feedback = this.txt(cx, 670, '', 24, '#ffffff');

        this.stageObjects.push(header, qText, feedback);

        const options = [
            { text: 'A) MGR-2210', correct: false },
            { text: 'B) MGR-4471', correct: true },
            { text: 'C) MGR-8890', correct: false }
        ];

        options.forEach((opt, i) => {
            const btn = this.txt(cx, 305 + (i * 110), opt.text, 28, '#ffffff', {
                backgroundColor: '#1c1c22',
                align: 'center',
                fixedWidth: 520,
                padding: { x: 0, y: 20 }
            }).setInteractive({ useHandCursor: true });

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

        const title = this.txt(cx, 55, 'FINAL SECURITY CHECK', 34, '#ffffff');
        const sub = this.txt(cx, 103, 'CAESAR CIPHER', 20, '#cccccc');
        const timerTxt = this.txt(cx, 165, 'TIME LEFT: 30', 34, '#ff2020');

        const box = this.add.rectangle(cx, 445, 760, 430, 0x121214, 0.92).setStrokeStyle(3, 0xcc0000);

        const encLabel = this.txt(cx, 285, 'ENCRYPTED MESSAGE', 20, '#ffffff');
        const cipherTxt = this.txt(cx, 360, 'F R G H', 64, '#ff2020');

        const hintTxt = this.txt(cx, 430, 'Hint: Shift each letter 3 positions backward.', 18, '#cccccc', {
            align: 'center',
            wordWrap: { width: 680 }
        });

        const inputBox = this.add.rectangle(cx, 510, 480, 64, 0x080808).setStrokeStyle(3, 0xcc0000);
        const inputTxt = this.txt(cx, 510, 'TYPE ANSWER...', 28, '#777777');

        const submitBtn = this.txt(cx, 590, '[ DECRYPT ]', 26, '#ffffff', {
            backgroundColor: '#cc0000',
            padding: { x: 40, y: 14 }
        }).setInteractive({ useHandCursor: true });

        const msgTxt = this.txt(cx, 725, '', 24, '#ffffff');

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
