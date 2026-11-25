# BLOODSHOT
لعبة 2D عن الأمن السيبراني (Phaser 3). *Every system has a weakness. Who will find it first?*

## التشغيل
افتحي `index.html` في المتصفح مباشرة (ما يحتاج سيرفر).

## توزيع الملفات (كل وحدة تشتغل على ملفها فقط)
| الملف | المسؤولة |
|---|---|
| `js/scenes/MenuScene.js` + `EndScene.js` + `main.js` + `index.html` | طالبة 1 |
| `js/scenes/AnalystScene.js` (+ أدواتها وبياناتها) | طالبة 3 و 4 |
| `js/scenes/HackerScene.js` (+ اللغز) | طالبة 5 و 6 |
| الصور والأصوات | طالبة 7 (مجلد `assets/`) |
| الدوال المشتركة (سحب وإسقاط، اهتزاز، ...) | طالبة 2 (`js/shared/`) |

## أسماء الـ Scenes (لا تتغير)
`BootScene` → `MenuScene` → `AnalystScene` أو `HackerScene` → `EndScene`

## تمرير النتيجة لـ EndScene
```js
this.scene.start('EndScene', { result: 'fired' });   // المحلل أخطأ 3 مرات
this.scene.start('EndScene', { result: 'secured' }); // المحلل أنهى كل الرسائل
this.scene.start('EndScene', { result: 'granted' }); // الهكر نجح
this.scene.start('EndScene', { result: 'caught' });  // الهكر فشل
```

## قواعد العمل
- لا أحد تعدل على ملف غيرها. أي ملف جديد تضيفينه وتضيفين سطر `<script>` له في `index.html` قبل `main.js`.
- كل وحدة تشتغل على Branch باسمها، وطالبة 1 تدمج يوميًا.
- لا تحطين نص عربي داخل اللعبة (Phaser ما يدعم العربي)، الإنجليزي فقط.
- حجم اللعبة 576×690، والألوان والخط في `js/config.js`.
