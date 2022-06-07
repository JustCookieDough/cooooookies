let localUser, cookieCollection = {},
    listening = !1;

// recreated
function e(e) { //  q
    let n = [4 * Math.ceil(25 * Math.random())]; // = 1 item array containing 4*(int on 1 - 25 inclusive)
    for (let e = 1; e < n[0] / 4; e++) n.push(Math.round(100 * Math.random()));
    return e.split("").forEach((e, t) => {
        n.push(e.charCodeAt(0) + parseInt([56, 82, 44, 92, 35, 4, 75, 32, 38, 86, 65, 86, 48][t % 13]))
    }), n.join(".")  // okay i recreated this in python
}

function debounce(e, t = 250) { // idk what the fuck this is or what it does but ill be damned if im not gonna find out
    let n = -1;
    return function() {
        clearTimeout(n), n = setTimeout(() => {
            e(...arguments)
        }, t)
    }
}
const debouncedSetBadgeText = debounce(async e => {
        if ("string" == typeof e) chrome.browserAction.setBadgeText({
            text: e ? e.substring(0, 4) : ""
        });
        else if ("function" == typeof e) {
            const t = await Promise.resolve(e());
            chrome.browserAction.setBadgeText({
                text: t ? t.toString().substring(0, 4) : ""
            })
        }
        chrome.browserAction.setBadgeBackgroundColor({
            color: "#6e3cd9"
        })
    }, 250),
    debouncedSaveDictionary = debounce(e => {
        saveCookieCollection(e)
    }, 250),
    getCurrentTime = () => {
        const e = new Date;
        return 60 * e.getUTCHours() * 60 + 60 * e.getUTCMinutes() + e.getUTCSeconds() // returns seconds since 12:00 am?
    };


// recreated
let accumulatedScore = 0,
    scoreTimer = -1;
const debouncedUpdateScore = t => {
    clearTimeout(scoreTimer), accumulatedScore += t, scoreTimer = setTimeout(() => {  // this function must be purposly written to be hard to read
        let n = accumulatedScore;
        (accumulatedScore = 0) < n && chrome.storage.local.get(["token"], async function(t) {
            t.token && (t = e(JSON.stringify({
                token: t.token,
                value: n,
                time: getCurrentTime()
            })), console.log(t), fetch(`${endpoint}/value`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    value: t
                })
            }).then(e => e.json()).catch(e => {
                console.error(e)
            }))
        })
    }, 250)
};

function getCookieCollection() {
    return new Promise((t, e) => {
        chrome.storage.local.get(["domains"], e => {
            t(e.domains || {})
        })
    })
}

function saveCookieCollection(e) {
    return new Promise(t => {
        chrome.storage.local.set({
            domains: e
        }, e => {
            t()
        })
    })
}

function addCookie(e, t) { // im sorry what the fuck is this exactly
    t[e.domain] || (t[e.domain] = 0), t[e.domain]++, debouncedUpdateScore(1)
}

function removeCookie(e, t) { // none of this makes any sense
    e.domain in t && debouncedUpdateScore(-1), t[e.domain] && 0 < t[e.domain] ? t[e.domain]-- : delete t[e.domain]
}

async function countCookies() { // whatttttttttttt why what huh
    return getCookieCollection().then(e => {
        return {
            total: Object.values(e).reduce((e, t) => e + t, 0),
            counted: e
        }
    })
}

function convertNum(e, t = 1) { // i should have sticked to python what the fuck is this nonsense
    return 1e6 < e && 1 !== t ? `${(e/1e5).toFixed(3)}m` : 1e6 < e ? `${(e/1e6).toFixed(1)}m` : 1e4 < e && 1 !== t ? `${(e/1e3).toFixed(2)}k` : 1e4 < e ? `${e/1e3}k` : 1e3 < e ? `${(e/1e3).toFixed(1)}k` : `${e}`
}

async function listenForCookies() {  
    listening || (listening = !0, cookieCollection = await getCookieCollection(), chrome.cookies.onChanged.addListener(async e => {
        const {
            cause: t,
            cookie: n,
            removed: o
        } = e;
        n.domain.includes("localhost") || ("explicit" === t && (o || addCookie(n, cookieCollection)), debouncedSaveDictionary(cookieCollection), debouncedSetBadgeText(() => {
            return convertNum(Object.values(cookieCollection).reduce((e, t) => e + t, 0))
        }))
    }))
}

// recreated
async function queryLeaderboardAPI() {
    const e = chrome.runtime.connect({
        name: "main"
    });
    var t = await countCookies(),
        {
            items: n = []
        } = await fetch(`${endpoint}/leaderboard`).then(e => e.json());
    e.postMessage({
        messageType: "latestUpdates",
        data: n,
        cookies: t,
        user: localUser
    })
}

// recreated
async function authenticateUser(e, t) {
    const n = chrome.runtime.connect({
        name: "main"
    });
    e = await fetch(`${endpoint}/signup`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: t,
            email: e
        })
    }).then(e => e.json());
    e.status ? chrome.storage.local.set({
        token: e.token
    }, e => {
        n.postMessage({
            messageType: "signupSuccess"
        }), checkLoginStatus(), isLoggedIn = !0
    }) : n.postMessage({
        messageType: "signupError",
        data: e
    })
}

//recreated
function getMe(e) {
    return fetch(`${endpoint}/me`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            token: e
        })
    }).then(e => e.json())
}

function checkLoginStatus() {
    const t = chrome.runtime.connect({
        name: "main"
    });
    chrome.storage.local.get(["token"], async function(e) {
        e.token ? getMe(e.token).then(e => {
            if (!e.status) throw new Error("get me");
            localUser = {
                username: e.username,
                email: e.email
            }, queryLeaderboardAPI(), listenForCookies()
        }).catch(() => {
            t.postMessage({
                messageType: "generalError"
            })
        }) : t.postMessage({
            messageType: "notSignedUp"
        })
    })
}

// recreated
function checkWinnerStatus() {
    const t = chrome.runtime.connect({
        name: "main"
    });
    return fetch(`${endpoint}/winner`).then(e => e.json()).then(e => {
        e.status && t.postMessage({
            messageType: "winnerUpdate",
            ...e
        })
    })
}

// recreated
function checkBanners() {
    const t = chrome.runtime.connect({
        name: "main"
    });
    return fetch(`${endpoint}/banners`).then(e => e.json()).then(e => {
        e.status && t.postMessage({
            messageType: "bannerUpdate",
            ...e
        })
    })
}

function devReset() {
    const e = chrome.runtime.connect({
        name: "main"
    });
    chrome.storage.local.remove(["token", "domains"], function() {
        e.postMessage({
            messageType: "resetSuccess"
        })
    })
}

const endpoint = "https://hb8ausjesa.execute-api.us-east-1.amazonaws.com/dev";
chrome.runtime.onConnect.addListener(function(e) {
    console.assert("main" == e.name), e.onMessage.addListener(e => {
        switch (e.messageType) {
            case "getLatestUpdates":
                queryLeaderboardAPI();
                chrome.storage.local.get(["token"], t => console.log(t))
                break;
            case "authentication":
                authenticateUser(e.email, e.username);
                chrome.storage.local.get(["token"], t => console.log(t))
                break;
            case "loginCheck":
                checkLoginStatus();
                chrome.storage.local.get(["token"], t => console.log(t))
                break;
            case "winnerCheck":
                checkWinnerStatus();
                break;
            case "bannerCheck":
                checkBanners();
                break;
            case "reset":
                break;
        }
    })
}), chrome.runtime.onInstalled.addListener(e => {
    "install" === e.reason && chrome.tabs.create({
        url: chrome.extension.getURL("install.html")
    })
});