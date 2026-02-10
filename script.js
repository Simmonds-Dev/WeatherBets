Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ZGE2Yzg1MS1mMzQyLTRhNWEtYTc3Yy00YWFiODIyZDRlYzMiLCJpZCI6Mzg4OTMyLCJpYXQiOjE3NzA2NzU5MDB9.6NG66iG87BwlR4KYC5rnzmGpXAxorcmC6R0mrK1KliQ";

function showStep(stepEl) {
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    stepEl.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {

    // ---------------- DOM ----------------
    const startBtn = document.getElementById("startGame");
    const setupSection = document.querySelector(".setup");
    const gameSection = document.querySelector(".game");

    const player1Input = document.getElementById("player1");
    const player2Input = document.getElementById("player2");

    const player1NameEl = document.getElementById("player1Name");
    const player2NameEl = document.getElementById("player2Name");

    const coinEl = document.getElementById("coin");
    const coinResult = document.getElementById("coinResult");

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

    let viewer;
    let caller;
    let coinWinner;
    let selectedCity;
    let player1Guess;
    let actualTemp;

    // ---------------- Game Start ----------------
    startBtn.addEventListener("click", () => {
        const p1 = player1Input.value || "Player 1";
        const p2 = player2Input.value || "Player 2";

        setupSection.style.display = "none";
        gameSection.style.display = "block";
        pickCoinCaller();



        player1NameEl.textContent = p1;
        player2NameEl.textContent = p2;

        viewer = new Cesium.Viewer("globe", {
            animation: false,
            timeline: false,
            baseLayerPicker: false
        });

        pickCoinCaller();
    });

    // ---------------- Coin Toss ----------------
    function fairCoin() {
        return crypto.getRandomValues(new Uint8Array(1))[0] % 2 === 0 ? "Heads" : "Tails";
    }

    function pickCoinCaller() {
        caller = Math.random() < 0.5 ? "player1" : "player2";
        const name = caller === "player1" ? player1NameEl.textContent : player2NameEl.textContent;
        callerPrompt.textContent = `${name}, choose 🔥 or ❄️`;
        showStep(coinChoiceDiv);
    }

    emojiButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const playerPick = btn.dataset.choice;

            coinEl.classList.add("flip");
            coinEl.style.display = "block";

            setTimeout(() => {
                coinEl.classList.remove("flip");
                coinEl.style.display = "none";

                const result = fairCoin();
                const emoji = result === "Heads" ? "🔥" : "❄️";

                coinWinner =
                    playerPick === result
                        ? caller
                        : caller === "player1"
                            ? "player2"
                            : "player1";

                const winnerEl =
                    coinWinner === "player1" ? player1NameEl : player2NameEl;

                winnerEl.textContent += ` ${emoji}`;

                coinResult.textContent = `Coin: ${result} ${emoji}`;

                globeContainer.style.display = "block";
                showStep(tempSection);


            }, 1000);
        });
    });

    // ---------------- Cities ----------------
    const cities = [
        { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
        { name: "London", lat: 51.5074, lon: -0.1278 },
        { name: "New York", lat: 40.7128, lon: -74.0060 },
        { name: "Paris", lat: 48.8566, lon: 2.3522 },
        { name: "Sydney", lat: -33.8688, lon: 151.2093 },
        { name: "Moscow", lat: 55.7558, lon: 37.6173 },
        { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729 },
        { name: "Cairo", lat: 30.0444, lon: 31.2357 },
        { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
        { name: "Beijing", lat: 39.9042, lon: 116.4074 },
        { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
        { name: "Berlin", lat: 52.5200, lon: 13.4050 },
        { name: "Toronto", lat: 43.6532, lon: -79.3832 },
        { name: "Dubai", lat: 25.2048, lon: 55.2708 },
        { name: "Singapore", lat: 1.3521, lon: 103.8198 },
        { name: "Barcelona", lat: 41.3851, lon: 2.1734 },
        { name: "Rome", lat: 41.9028, lon: 12.4964 },
        { name: "Seoul", lat: 37.5665, lon: 126.9780 },
        { name: "Bangkok", lat: 13.7563, lon: 100.5018 },
        { name: "Istanbul", lat: 41.0082, lon: 28.9784 },
        { name: "Mexico City", lat: 19.4326, lon: -99.1332 },
        { name: "Lagos", lat: 6.5244, lon: 3.3792 },
        { name: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
    ];

    function pickRandomCity() {
        selectedCity = cities[Math.floor(Math.random() * cities.length)];

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                selectedCity.lon,
                selectedCity.lat,
                3000000
            )
        });

        document.getElementById("cityDisplay").textContent =
            `City: ${selectedCity.name}`;

        onSpinComplete();
    }

    function spinGlobe() {
        const start = Date.now();

        const spin = setInterval(() => {
            viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z, 0.05);

            if ((Date.now() - start) / 1000 > 3) {
                clearInterval(spin);
                pickRandomCity();
            }
        }, 16);
    }

    document.getElementById("spinCity").addEventListener("click", spinGlobe);

    // ---------------- Temperature Phase ----------------
    function onSpinComplete() {
        showStep(tempSection);


        const name =
            coinWinner === "player1"
                ? player1NameEl.textContent
                : player2NameEl.textContent;

        tempPrompt.textContent =
            `${name}, guess temperature in ${selectedCity.name}`;
    }

    submitGuessBtn.addEventListener("click", async () => {
        player1Guess = Number(tempInput.value);
        if (!player1Guess) return alert("Enter a number!");

        const apiKey = "63b77ed365bd0d35dba55f456d174d34";
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity.name}&units=imperial&appid=${apiKey}`
        );
        const data = await res.json();

        actualTemp = Math.round(data.main.temp);

        player1GuessSection.classList.add("hidden-section");
        player2GuessSection.classList.remove("hidden-section");


        const other =
            coinWinner === "player1" ? "player2" : "player1";

        const otherName =
            other === "player1"
                ? player1NameEl.textContent
                : player2NameEl.textContent;

        higherLowerPrompt.textContent =
            `${otherName}, higher or lower than ${player1Guess}?`;
    });

    [higherBtn, lowerBtn].forEach(btn => {
        btn.addEventListener("click", () => {
            const guessHigher = btn.id === "higherBtn";

            const other =
                coinWinner === "player1" ? "player2" : "player1";

            const player2Correct =
                (guessHigher && actualTemp > player1Guess) ||
                (!guessHigher && actualTemp < player1Guess);

            const winner =
                player2Correct ? other : coinWinner;

            const winnerName =
                winner === "player1"
                    ? player1NameEl.textContent
                    : player2NameEl.textContent;

            finalResult.textContent =
                `Actual: ${actualTemp}°F — Winner: ${winnerName}`;

            player2GuessSection.classList.add("hidden-section");
        });
    });

});
