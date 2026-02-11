Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZGE2Yzg1MS1mMzQyLTRhNWEtYTc3Yy00YWFiODIyZDRlYzMiLCJpZCI6Mzg4OTMyLCJpYXQiOjE3NzA2NzU5MDB9.6NG66iG87BwlR4KYC5rnzmGpXAxorcmC6R0mrK1KliQ";

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startGame");
    const setupSection = document.querySelector(".setup");
    const gameSection = document.querySelector(".game");
    const wagerInput = document.getElementById("wager");
    const winningsDisplay = document.getElementById("winningsDisplay");
    const replayBtn = document.getElementById("replayBtn");

    let wagerAmount = 0;
    let gameLocked = false;
    let roundWinner = null;
    let isSpinning = false;
    let spinInterval = null;


    const player1Input = document.getElementById("player1");
    const player2Input = document.getElementById("player2");

    const player1NameEl = document.getElementById("player1Name");
    const player2NameEl = document.getElementById("player2Name");

    const coinEl = document.getElementById("coin");
    const coinChoiceDiv = document.getElementById("coinChoice");
    const callerPrompt = document.getElementById("callerPrompt");
    const emojiButtons = document.querySelectorAll(".emojiChoice");

    const globeContainer = document.getElementById("globeContainer");
    const tempSection = document.getElementById("tempSection");
    const player1GuessSection = document.getElementById("player1GuessSection");
    const player2GuessSection = document.getElementById("player2GuessSection");

    const tempPrompt = document.getElementById("tempPrompt");
    const higherLowerPrompt = document.getElementById("higherLowerPrompt");

    const tempInput = document.getElementById("tempGuess");
    const submitGuessBtn = document.getElementById("submitGuess");
    const higherBtn = document.getElementById("higherBtn");
    const lowerBtn = document.getElementById("lowerBtn");
    const finalResult = document.getElementById("finalResult");

    let viewer, caller, coinWinner, selectedCity, player1Guess, actualTemp;


    // ---------------- Start Game ----------------
    startBtn.addEventListener("click", () => {
        const p1 = player1Input.value || "Player 1";
        const p2 = player2Input.value || "Player 2";
        wagerAmount = Number(wagerInput.value) || 0;


        setupSection.style.display = "none";
        gameSection.style.display = "block";

        player1NameEl.textContent = p1;
        player2NameEl.textContent = p2;

        viewer = new Cesium.Viewer("globe", {
            animation: false,
            timeline: false,
            baseLayerPicker: false
        });

        pickCoinCaller();
    });

    function fairCoin() {
        return crypto.getRandomValues(new Uint8Array(1))[0] % 2 === 0 ? "Heads" : "Tails";
    }

    function pickCoinCaller() {
        caller = Math.random() < 0.5 ? "player1" : "player2";
        const name = caller === "player1" ? player1NameEl.textContent : player2NameEl.textContent;
        callerPrompt.textContent = `${name}, choose 🔥 or ❄️`;
        coinChoiceDiv.style.display = "block";
    }

    emojiButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const playerPick = btn.dataset.choice;
            coinChoiceDiv.style.display = "none";

            // Animate coin flip
            coinEl.style.transform = "rotateY(0deg)";
            coinEl.classList.add("flip");

            setTimeout(() => {
                coinEl.classList.remove("flip");
                const result = fairCoin(); // Heads or Tails
                coinEl.style.transform = result === "Heads" ? "rotateY(0deg)" : "rotateY(180deg)";

                coinWinner = playerPick === result ? caller : (caller === "player1" ? "player2" : "player1");

                // Append coin emoji to winner
                const winnerEl = coinWinner === "player1" ? player1NameEl : player2NameEl;
                winnerEl.querySelectorAll(".winner-coin").forEach(c => c.remove());
                const coinFaceEl = document.createElement("span");
                coinFaceEl.classList.add("winner-coin");
                coinFaceEl.textContent = result === "Heads" ? "🔥" : "❄️";
                winnerEl.appendChild(coinFaceEl);

                // Show globe
                globeContainer.style.display = "block";
            }, 2000);
        });
    });

    // ---------------- Globe Spin ----------------
    const spinBtn = document.getElementById("spinCity");

    spinBtn.addEventListener("click", () => {
        if (gameLocked || isSpinning) return;

        isSpinning = true;
        spinBtn.disabled = true;

        const start = Date.now();

        spinInterval = setInterval(() => {
            viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, 0.05);

            if ((Date.now() - start) / 1000 > 3) {
                clearInterval(spinInterval);
                spinInterval = null;
                pickRandomCity();
            }
        }, 16);
    });




    function randomCoordinates() {
        const u = Math.random();
        const v = Math.random();

        const lat = Math.asin(2 * u - 1) * (180 / Math.PI);
        const lon = 360 * v - 180;

        return { lat, lon };
    }

    async function pickRandomCity() {
        const apiKey = "63b77ed365bd0d35dba55f456d174d34";
        const maxAttempts = 12;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {

            const { lat, lon } = randomCoordinates();

            try {
                const res = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
                );

                const data = await res.json();

                if (!data.name || !data.main) {
                    await new Promise(r => setTimeout(r, 200)); // throttle retries
                    continue;
                }

                selectedCity = {
                    name: data.name,
                    lat,
                    lon
                };

                actualTemp = Math.round(data.main.temp); // reuse later!

                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(lon, lat, 3000000),
                    complete: () => {
                        isSpinning = false;
                        spinBtn.disabled = false;
                        onSpinComplete();
                    }
                });

                document.getElementById("cityDisplay").textContent =
                    `City: ${selectedCity.name}`;

                return;

            } catch (err) {
                console.error("Retrying random location...");
                await new Promise(r => setTimeout(r, 200));
            }
        }

        // fail-safe cleanup
        console.error("Could not find city.");
        isSpinning = false;
        spinBtn.disabled = false;
    }




    function onSpinComplete() {
        tempSection.style.display = "block";
        player1GuessSection.style.display = "block";
        player2GuessSection.style.display = "none";

        const name = coinWinner === "player1" ? player1NameEl.textContent : player2NameEl.textContent;
        tempPrompt.textContent = `${name}, guess the temperature in ${selectedCity.name}`;
    }

    // ---------------- Temperature Phase ----------------
    submitGuessBtn.addEventListener("click", () => {
        if (gameLocked) return;
        player1Guess = Number(tempInput.value);
        if (!player1Guess) return alert("Enter a number!");

        player1GuessSection.style.display = "none";
        player2GuessSection.style.display = "block";

        const other = coinWinner === "player1" ? "player2" : "player1";
        const otherName = other === "player1" ? player1NameEl.textContent : player2NameEl.textContent;
        higherLowerPrompt.textContent = `${otherName}, higher or lower than ${player1Guess}?`;
    });

    [higherBtn, lowerBtn].forEach(btn => {
        btn.addEventListener("click", () => {
            if (gameLocked) return;

            const guessHigher = btn.id === "higherBtn";
            const other = coinWinner === "player1" ? "player2" : "player1";

            const player2Correct =
                (guessHigher && actualTemp > player1Guess) ||
                (!guessHigher && actualTemp < player1Guess);

            roundWinner = player2Correct ? other : coinWinner;

            const winnerName =
                roundWinner === "player1"
                    ? player1NameEl.textContent
                    : player2NameEl.textContent;

            finalResult.textContent =
                `Actual: ${actualTemp}°F — Winner: ${winnerName}`;

            winningsDisplay.textContent =
                `💰 ${winnerName} wins $${wagerAmount}`;

            document.getElementById("roundEnd").style.display = "block";

            gameLocked = true;
            player2GuessSection.style.display = "none";
        });
    });

    replayBtn.addEventListener("click", () => {
        gameLocked = false;
        roundWinner = null;

        finalResult.textContent = "";
        winningsDisplay.textContent = "";
        document.getElementById("roundEnd").style.display = "none";

        tempSection.style.display = "none";
        globeContainer.style.display = "none";
        coinChoiceDiv.style.display = "block";

        // reset coin visuals
        coinEl.style.transform = "rotateY(0deg)";

        // remove winner coins
        player1NameEl.querySelectorAll(".winner-coin").forEach(c => c.remove());
        player2NameEl.querySelectorAll(".winner-coin").forEach(c => c.remove());

        pickCoinCaller();
    });


});


