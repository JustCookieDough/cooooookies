let localUser;
const port = chrome.runtime.connect({
    name: "main"
});

function updateBanner(e, a) {
    chrome.storage.local.get(["token"], t => console.log(t))
    const t = document.querySelector(`.${a}-banner`);
    t.innerText = e, t.classList.remove("hidden")
}

function removeLoading() {
    const e = document.getElementById("loading-box");
    e && e.parentElement.removeChild(e)
}

function removeErrors() {
    const e = [...document.getElementById("signup-form").querySelectorAll(".input-label-error")];
    e.forEach(e => e.parentElement.removeChild(e))
}

function addError(e, a) {
    const t = document.querySelector(`.input-label[data-target="${e}"]`);
    if (t) {
        const r = document.createElement("p");
        r.classList.add("input-label-error"), r.innerText = a, t.appendChild(r)
    }
}

function handleFormErrors(e) {
    switch (e.message) {
        case "exists-error":
            addError("username", "Username has been taken");
            break;
        case "invalid-email-error":
            addError("email", "Email is not valid");
            break;
        case "invalid-error":
        case "naughty-word-error":
            addError("username", "Username is not valid");
            break;
        default:
            addError("username", "There was a problem")
    }
}

function authenticate(e, a, t) {
    toggleForm(!0), port.postMessage({
        messageType: "authentication",
        username: e,
        email: a
    })
}

function getLatestUpdates() {
    port.postMessage({
        messageType: "getLatestUpdates"
    })
}

function toggleForm(e = !0) {
    document.getElementById("signup-form").querySelector("fieldset").disabled = e
}

function showSignup() {
    document.getElementById("signup-form").classList.remove("hidden"), document.getElementById("signup-form").addEventListener("submit", function(e) {
        e.preventDefault(), removeErrors(), authenticate(e.target.username.value, e.target.email.value)
    })
}

function updatePopup(e, a, t) {
    chrome.storage.local.get(["token"], t => console.log(t))
    localUser = e, togglePopupHTML(), setLeaderboard(a, e.username), setPersonalChart(t), getWinner(), getBanners()
}

function getWinner() {
    port.postMessage({
        messageType: "winnerCheck"
    })
}

function getBanners() {
    port.postMessage({
        messageType: "bannerCheck"
    })
}

function convertCookiesNumber(e) {
    return 1e4 < e ? `${(e / 1e3).toFixed(1)}k` : e.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function setPersonalChart(e) {
    const a = document.querySelector(".personal-frame .heading .left span");
    a.innerText = localUser.username, document.querySelector(".chart-header-score").innerText = convertCookiesNumber(e.total);
    const t = Object.entries(e.counted),
        r = document.querySelector(".chart-content");
    r.innerHTML = "", t.forEach(([e, a]) => {
        a && (a = ((e, a) => {
            const t = document.createElement("div");
            t.classList.add("chart-item");
            let r = 1;
            1 < a && (r = 3);
            var n = new Array(r).fill(0).map((e, a) => '<span class="chart-item-cookies-icon">&#x1F36A</span>').join("");
            return t.innerHTML = `
      <div class="chart-item-cookies">
        ${n}
      </div>
      <div class="chart-item-counter">x${a}</div>
      <div class="chart-item-info">${e}</div>
    `, t
        })(e, a), r.appendChild(a))
    })
}

function togglePopupHTML() {
    document.getElementById("signup-form").classList.add("hidden"), document.getElementById("cookie-tracker").classList.remove("hidden");
    const e = document.querySelector('.tab-headings-btn[data-target="personal"]'),
        a = document.querySelector('.tab-headings-btn[data-target="leaderboard"]');
    e.addEventListener("click", () => {
        e.classList.add("active"), a.classList.remove("active"), openPersonalTab()
    }, !1), a.addEventListener("click", () => {
        e.classList.remove("active"), a.classList.add("active"), openLeaderboardTab()
    }, !1)
}

function updateWinner({
    username: e = "someone",
    links: a = "loads of",
    image: t
}) {
    document.querySelector(".leaderboard-frame").classList.add("winner-frame");
    const r = document.querySelector(".leaderboard-frame .content");
    e !== localUser.username ? (r.innerHTML = `
    <p class="winner-frame-title">The Game<br/>has ended</p>

    <p class="winner-frame-description">${e} won with a final score of ${a} cookies accepted.</p>
  `, t && (r.innerHTML += `
      <div class="winner-frame-image">
        <img src="${t}" alt=""/>
      </div>
    `)) : (r.classList.add("winner"), r.innerHTML = `
    <p class="winner-frame-title">You won<br/>the game!</p>

    <p class="winner-frame-description">We will contact you via ${localUser.email} to coordinate your 500lb cookie shipment!</p>
  `), document.querySelector(".leaderboard-frame .left span").innerText = "Game over", document.querySelector(".logo-frame .left #countdown-wrapper").innerText = "Game ended"
}

function openPersonalTab() {
    document.querySelector(".personal-frame").classList.remove("hidden"), document.querySelector(".leaderboard-frame").classList.add("hidden")
}

function openLeaderboardTab() {
    document.querySelector(".personal-frame").classList.add("hidden"), document.querySelector(".leaderboard-frame").classList.remove("hidden")
}

function setLeaderboard(e = []) {
    const a = e.slice(0, 10),
        t = document.getElementById("leaderboard");
    a.forEach((e, a) => {
        e = ((e, a, t) => {
            const r = document.createElement("div");
            return r.classList.add("leaderboard-item"), r.innerHTML = `
      <div class="leaderboard-item-position"><span>${e}</span></div>
      <div class="leaderboard-item-info">
        <span class="leaderboard-item-name">${a}</span>
        <span class="leaderboard-item-score">Cookies accepted:<br/>${t}</span>
      </div>
    `, localUser.username === a && r.classList.add("leaderboard-item--active"), r
        })(a + 1, e.username, e.trimmed);
        t.appendChild(e)
    })
}

function updateTimer(e = []) {
    const a = new Date(Date.UTC(...e)),
        t = new Date;
    var r = a.getTime() - t.getTime(),
        n = Math.floor(r / 864e5),
        o = Math.floor(r % 864e5 / 36e5),
        s = Math.floor(r % 36e5 / 6e4),
        d = Math.floor(r % 6e4 / 1e3),
        r = e => Math.floor(e).toString().padStart(2, "0"),
        d = [r(n), r(o), r(s), r(d)].join(":");
    document.getElementById("countdown").innerText = d, setTimeout(() => updateTimer(e), 1e3)
}

function reset() {
    port.postMessage({
        messageType: "reset"
    })
}
port.postMessage({
    messageType: "loginCheck"
}), getWinner(), chrome.runtime.onConnect.addListener(function(e) {
    console.assert("main" == e.name), e.onMessage.addListener(e => {
        switch (e.messageType) {
            case "latestUpdates":
                removeLoading(), updatePopup(e.user, e.data, e.cookies);
                break;
            case "signupError":
                toggleForm(!1), handleFormErrors(e.data);
                break;
            case "signupSuccess":
                break;
            case "notSignedUp":
                removeLoading(), showSignup();
                break;
            case "loginStatus":
                e.isLoggedIn && (removeLoading(), getLatestUpdates());
                break;
            case "resetSuccess":
            case "generalError":
                window.location.reload();
                break;
            case "winnerUpdate":
                e.winner ? updateWinner(e.winner) : updateTimer(e.end);
                break;
            case "bannerUpdate":
                e.chart && updateBanner(e.chart, "chart"), e.leaderboard && updateBanner(e.leaderboard, "leaderboard")
        }
    })
}), window.reset = reset;