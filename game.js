//Get game elements
const timerElement = document.getElementById("timer");
const answerInput = document.getElementById("answer");
const submitButton = document.getElementById("submitBtn");
const messageElement = document.getElementById("message");

let timeLeft = 30;
let gameEnded = false;
let countdown;

function startTimer() {
    countdown = setInterval(function () {
        if (gameEnded) {
            clearInterval(countdown);
            return;
        }

        timeLeft--;
        timerElement.textContent = timeLeft;

        if (timeLeft <= 10 && timeLeft > 0) {
            timerElement.style.color = "#ff1744";
            timerElement.classList.add("timer-danger");
        }

        if (timeLeft <= 0) {
            clearInterval(countdown);
            gameEnded = true;

            document.getElementById("failureScreen").classList.remove("hidden");

            answerInput.disabled = true;
            submitButton.disabled = true;
        }
    }, 1000);
}


function checkAnswer() {
    if (gameEnded) return;

    const playerAnswer = answerInput.value.trim().toUpperCase();

    if (playerAnswer === "CODE") {
        gameEnded = true;
        clearInterval(countdown);

        messageElement.textContent = "ACCESS GRANTED! SYSTEM UNLOCKED";
        messageElement.style.color = "#39ff88";

        document.getElementById("successScreen").classList.remove("hidden");

        answerInput.disabled = true;
        submitButton.disabled = true;
    } else {
        messageElement.textContent = "WRONG PASSWORD! TRY AGAIN";
        messageElement.style.color = "#ff3b5c";
    }
}

submitButton.addEventListener("click", checkAnswer);

answerInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") checkAnswer();
});
// Restart the game
document.getElementById("retrySuccess").addEventListener("click", function() {
    location.reload();
});

document.getElementById("retryFailure").addEventListener("click", function() {
    location.reload();
});