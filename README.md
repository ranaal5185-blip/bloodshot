<div align="center">

  <img src="./assets/images/bloodshot-eye-intro.gif" width="380" alt="BLOODSHOT Animated Intro" />

  <h1><font color="#E01020">B L O O D S H O T</font></h1>

  <p><i>Every system has a weakness. Who will find it first?</i></p>

  <code>PHASER 3</code> &nbsp; / &nbsp;
  <code>JAVASCRIPT</code> &nbsp; / &nbsp;
  <code>CYBERSECURITY</code> &nbsp; / &nbsp;
  <code>2D GAME</code>

</div>

<br>

<h2><font color="#E01020">01 — About the Game</font></h2>

BLOODSHOT is a 2D cybersecurity game that explores
a security incident from two opposing perspectives:
a cybersecurity analyst protecting a company and
a former employee attempting to compromise its system.

The game combines storytelling, interactive challenges,
email analysis, identity verification, and cryptography
within a dark, pixel-art-inspired environment.

Rather than presenting cybersecurity concepts through
traditional questions, BLOODSHOT allows players to
experience them through decisions and their consequences.

---

<h2><font color="#E01020">02 — The Story</font></h2>

After being dismissed from the company, a former
employee begins planning his revenge.

He collects information about his manager, searching
for weaknesses that could allow him to bypass the
company's security system.

Meanwhile, the cybersecurity analyst at RADXIS
is responsible for monitoring employee activity,
investigating suspicious emails, and preventing
potential security breaches.

Two different perspectives.
Two different objectives.
One company at risk.

---

<h2><font color="#E01020">03 — Choose Your Role</font></h2>

<h3><font color="#FF3548">Cybersecurity Analyst</font></h3>

The analyst is responsible for protecting RADXIS
against internal and external security threats.

Players investigate incoming emails and decide
whether each message should be approved or blocked.

<div align="center">

  <img src="./assets/images/analyst-reference.png" width="850" alt="Cybersecurity Analyst Interface" />

  <br>
  <sub>The Analyst Workspace</sub>

</div>

<br>

#### Email Analysis

The analyst receives ten different emails divided
into three categories:

- 3 insider threats
- 4 external phishing attempts
- 3 legitimate messages

Each email contains information such as the sender,
subject, message content, and attachments or links.

Players must examine these details before making
a security decision.

#### Deep ID Scanner

An interactive investigation tool that can be dragged
over an email to verify whether it is trusted or untrusted.

The scanner has a limited energy supply of three uses,
encouraging players to investigate carefully rather
than relying on the tool for every decision.

The scanner includes:

- Drag-and-drop interaction.
- Animated scanning effects.
- Green and red verification indicators.
- Battery consumption and energy tracking.
- An animated eye that reacts to scan results.

#### Live Activity Log

A continuously updated monitoring panel that displays
simulated employee activity within the company.

The log provides additional context through employee
IDs, activity records, online indicators, and alerts
for suspicious behavior.

#### Security Rulebook

An interactive reference panel containing guidelines
for identifying insider threats, external phishing,
and legitimate communication.

The panel can be opened or closed, allowing the
email workspace to expand when additional reading
space is needed.

#### Decision System

Each classification affects the player's progress.

Correct decisions allow the analyst to continue,
while incorrect decisions increase the mistake counter.

Approving a malicious message triggers a visual
security breach effect, including a hammer impact
and screen cracks.

The analyst must complete all ten messages without
reaching three mistakes.

---

<h3><font color="#FF3548">Hacker</font></h3>

The hacker follows a different path, attempting
to gain unauthorized access to the company's system.

This role focuses on identity verification,
security challenges, and cryptography.

#### The Backstory

Before entering the system, the player discovers
three pieces of information connected to the manager:

- A discarded coffee cup.
- A voice recording.
- A photograph.

These clues form part of the hacker's storyline
and introduce the identity verification challenges.

#### Identity Verification

The player progresses through interactive
verification stages using simulated identity samples.

Correct selections unlock the next stage, while
incorrect selections display access-denied feedback.

#### Security Question

After completing the verification stages, the
player must answer a security question to unlock
the manager's account.

#### The Final Cipher

The final challenge introduces a Caesar cipher puzzle.

The player must decode the encrypted information
and submit the correct answer before the timer expires.

Solving the puzzle grants access to the system.
Running out of time triggers a security alert.

---

<h2><font color="#E01020">04 — The Game Experience</font></h2>

BLOODSHOT was developed as a sequence of connected
interactive scenes rather than a single game screen.

The experience begins with an animated eye and
a role-selection menu, followed by a desktop
environment that introduces the selected path.

<div align="center">

  <pre>
           MAIN MENU
               |
          DESK SCENE
               |
      +--------+--------+
      |                 |
   ANALYST            HACKER
      |                 |
      +--------+--------+
               |
        NOTIFICATION
               |
           END SCENE
  </pre>

</div>

Each path includes its own interface, interactions,
challenges, feedback, and possible outcomes.

---

<h2><font color="#E01020">05 — Visual Design</font></h2>

The visual identity of BLOODSHOT was designed around
a dark cybersecurity atmosphere.

The interface combines black backgrounds, red warning
indicators, green verification feedback, pixel-art
elements, and animated visual effects.

Visual features include:

- Animated eye introduction.
- Interactive desktop environments.
- Custom cybersecurity dashboard.
- Matrix-inspired hacker background.
- Scanner glow and verification animations.
- Hammer impact and screen-cracking effects.
- Security notifications and result screens.

The visual feedback changes according to the
player's actions throughout the game.

---

<h2><font color="#E01020">06 — Game Outcomes</font></h2>

| Role | Successful Outcome | Failed Outcome |
| :--- | :--- | :--- |
| Analyst | SYSTEM SECURED | YOU ARE FIRED |
| Hacker | ACCESS GRANTED | SECURITY ALERT |

The final outcome depends on the player's
performance throughout the selected path.

Players can return to the main menu and experience
the incident from the opposite perspective.

---

<h2><font color="#E01020">07 — Behind the Development</font></h2>

The project was developed using Phaser 3 and
JavaScript, with separate scenes responsible for
different stages of the game.

The development process included:

- Designing and implementing the game interfaces.
- Creating interactive email classification mechanics.
- Developing identity verification challenges.
- Implementing a timed cryptography puzzle.
- Managing game states and scene transitions.
- Creating custom animations and visual feedback.
- Organizing email scenarios using JSON.
- Loading embedded animation frames as game textures.
- Integrating multiple game components into one experience.

The project was developed collaboratively, with
individual responsibilities distributed across
game mechanics, interfaces, assets, shared utilities,
and scene management.

---

<h2><font color="#E01020">08 — Project Structure</font></h2>

    bloodshot/
    |
    +-- assets/
    |   +-- images/
    |   +-- Story assets
    |
    +-- js/
    |   +-- data/
    |   |   +-- messages.json
    |   |   +-- videoData.js
    |   |   +-- deskData.js
    |   |   +-- notifyData.js
    |   |
    |   +-- scenes/
    |   |   +-- BootScene.js
    |   |   +-- MenuScene.js
    |   |   +-- DeskScene.js
    |   |   +-- AnalystScene.js
    |   |   +-- HackerScene.js
    |   |   +-- NotifyScene.js
    |   |   +-- EndScene.js
    |   |
    |   +-- config.js
    |   +-- main.js
    |
    +-- index.html
    +-- README.md

The scene-based architecture separates the game's
interfaces and mechanics, while external data files
store messages and animation assets.

---

<h2><font color="#E01020">09 — Technologies</font></h2>

<div align="center">

  <img src="https://img.shields.io/badge/Phaser-3-151515?style=for-the-badge&labelColor=8B0000" />
  <img src="https://img.shields.io/badge/JavaScript-ES6-151515?style=for-the-badge&labelColor=8B0000" />
  <img src="https://img.shields.io/badge/HTML-5-151515?style=for-the-badge&labelColor=8B0000" />
  <img src="https://img.shields.io/badge/JSON-Data-151515?style=for-the-badge&labelColor=8B0000" />
  <img src="https://img.shields.io/badge/Git-Version_Control-151515?style=for-the-badge&labelColor=8B0000" />

</div>

---

<h2><font color="#E01020">10 — Run the Game</font></h2>

1. Clone or download the repository.
2. Open the `bloodshot` folder in Visual Studio Code.
3. Launch `index.html` using the Live Server extension.
4. Select either the Analyst or Hacker role.

No additional package installation is required.
An internet connection is required to load Phaser
from the CDN used by the main HTML file.

<br>

---

<div align="center">

  <h2><font color="#E01020">B L O O D S H O T</font></h2>

  <p><i>Protect the system. Or become its weakness.</i></p>

  <sub>A collaborative cybersecurity game project.</sub>

</div>
