const backstoryScenes = [
    {
        title: "THE FIRST CLUE",
        image: "images/coffe1.jpeg",
        text: "After being fired by the company, the hacker began planning his revenge.",
        description: "One night, he found his manager's coffee cup in the trash. He kept it because it might contain the manager's fingerprints.",
        clue: "The first clue was found."
   },
    {
        title: "THE VOICE RECORDING",
        image: "images/voice1.jpeg",
        text: "The hacker found an old voice recording of his manager.",
        description: "The recording could help him pass the voice verification system.",
        clue: "The second clue was found."
    },
    {
        title: "THE MANAGER'S PHOTO",
        image: "images/manager1.jpeg",
        text: "The hacker found a photo of his manager.",
        description: "He kept the photo as another piece of evidence to help him access the manager's account.",
        clue: "The final clue was found."
    }
];
let currentScene = 0;

const storyScreen = document.getElementById("backstoryScreen");
const gameScreen = document.querySelector(".game-container");
const nextButton = document.getElementById("nextStoryBtn");

function showStory() {
    const scene = backstoryScenes[currentScene];

    document.getElementById("storyTitle").textContent = scene.title;
    document.getElementById("storyImage").src = scene.image;
    document.getElementById("storyText").textContent = scene.text;
    document.getElementById("storyDescription").textContent = scene.description;
    document.getElementById("storyClue").textContent = scene.clue;
}

showStory();

nextButton.addEventListener("click", function () {
    currentScene++;

    if (currentScene < backstoryScenes.length) {
        showStory();
    } else {
        storyScreen.style.display = "none";
        gameScreen.style.display = "block";
        startTimer();
    }
});