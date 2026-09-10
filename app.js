const KEY = "renit_tournament_v2";

const seedMatches = [
  {
    id: 1,
    game: "BR MATCH",
    title: "BR Solo #001",
    fee: 20,
    prize: 150,
    slots: 48,
    joined: 12,
    time: "Today • 9:00 PM",
    status: "OPEN"
  },
  {
    id: 2,
    game: "BR-DUO",
    title: "BR Duo Night",
    fee: 30,
    prize: 250,
    slots: 24,
    joined: 8,
    time: "Today • 10:00 PM",
    status: "OPEN"
  },
  {
    id: 3,
    game: "FREE FIRE",
    title: "Free Fire Clash",
    fee: 10,
    prize: 100,
    slots: 48,
    joined: 31,
    time: "Tomorrow • 8:00 PM",
    status: "OPEN"
  },
  {
    id: 4,
    game: "CS 4 VS 4",
    title: "CS Squad War",
    fee: 50,
    prize: 500,
    slots: 16,
    joined: 12,
    time: "Tomorrow • 10:00 PM",
    status: "OPEN"
  },
  {
    id: 5,
    game: "LONE WOLF",
    title: "Lone Wolf Challenge",
    fee: 15,
    prize: 120,
    slots: 24,
    joined: 5,
    time: "Tomorrow • 9:00 PM",
    status: "OPEN"
  },
  {
    id: 6,
    game: "SPECIAL MATCH",
    title: "Special Night Cup",
    fee: 25,
    prize: 300,
    slots: 32,
    joined: 10,
    time: "Friday • 10:00 PM",
    status: "OPEN"
  }
];

function loadState() {
  try {
    const saved = localStorage.getItem(KEY);

    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.log(error);
  }

  return {
    matches: seedMatches,
    joined: [],
    balance: 40,
    user: "Player"
  };
}

let state = loadState();

function saveState() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char];
  });
}

function toast(message) {
  const old = document.querySelector(".toast");

  if (old) {
    old.remove();
  }

  const box = document.createElement("div");

  box.className = "toast";
  box.textContent = message;

  document.body.appendChild(box);

  setTimeout(function () {
    box.remove();
  }, 1800);
}

function getGames() {
  return [
    "BR MATCH",
    "BR-DUO",
    "FREE FIRE",
    "CS 4 VS 4",
    "LONE WOLF",
    "SPECIAL MATCH"
  ];
}

function matchCard(match) {
  const full = match.joined >= match.slots;

  return `
    <article class="match">

      <div class="matchtop">
        <h3>${esc(match.title)}</h3>

        <span class="status">
          ${full ? "FULL" : esc(match.status)}
        </span>
      </div>

      <p style="color:#9b94aa;margin-top:5px">
        ${esc(match.game)} • ${esc(match.time)}
      </p>

      <div class="meta">

        <div>
          <span>Entry</span>
          <b>৳${match.fee}</b>
        </div>

        <div>
          <span>Prize</span>
          <b>৳${match.prize}</b>
        </div>

        <div>
          <span>Slots</span>
          <b>${match.joined}/${match.slots}</b>
        </div>

      </div>

      <button
        class="join"
        onclick="openMatch(${match.id})"
      >
        ${full ? "Full" : "View & Join"}
      </button>

    </article>
  `;
}

/* =========================
   HOME
========================= */

function home() {
  document.getElementById("app").innerHTML = `

    <div class="shell">

      <header class="header">

        <div class="logo">🎮</div>

        <div class="brand">
          <b>RENIT TOURNAMENT</b>
          <small>Play • Compete • Win</small>
        </div>

        <button
          class="wallet"
          onclick="openWallet()"
        >
          ৳ ${state.balance}
        </button>

      </header>

      <main>

        <div class="hero">

          <h1>Ready to compete?</h1>

          <p>
            Join a match, play fair and win rewards.
          </p>

          <div class="chips">

            <button
              class="chip active"
              onclick="filterHome('ALL', this)"
            >
              All
            </button>

            <button
              class="chip"
              onclick="filterHome('BR MATCH', this)"
            >
              BR
            </button>

            <button
              class="chip"
              onclick="filterHome('BR-DUO', this)"
            >
              Duo
            </button>

            <button
              class="chip"
              onclick="filterHome('FREE FIRE', this)"
            >
              Free Fire
            </button>

            <button
              class="chip"
              onclick="filterHome('CS 4 VS 4', this)"
            >
              CS
            </button>

          </div>

        </div>

        <div class="section">

          <h2>Games</h2>

          <button
            class="link"
            onclick="showMatches()"
          >
            All Matches
          </button>

        </div>

        <section class="grid">

          ${getGames().map(function (game) {

            const count = state.matches.filter(function (m) {
              return m.game === game;
            }).length;

            return `
              <article
                class="game"
                onclick="showMatches('${game}')"
              >

                ${
                  game === "BR MATCH" ||
                  game === "BR-DUO" ||
                  game === "FREE FIRE"
                    ? '<span class="badge">LIVE</span>'
                    : ""
                }

                <div>
                  <b>${game}</b>
                  <small>${count} matches</small>
                </div>

              </article>
            `;

          }).join("")}

        </section>

        <div class="section">

          <h2>Upcoming matches</h2>

          <button
            class="link"
            onclick="showMatches()"
          >
            View all
          </button>

        </div>

        <div id="homeMatches">

          ${state.matches
            .slice(0, 3)
            .map(matchCard)
            .join("")}

        </div>

      </main>

      ${navigation("home")}

    </div>
  `;
}

/* =========================
   MATCHES
========================= */

function showMatches(game) {

  const selectedGame = game || "ALL";

  const list = state.matches.filter(function (match) {
    return (
      selectedGame === "ALL" ||
      match.game === selectedGame
    );
  });

  document.getElementById("app").innerHTML = `

    <div class="shell">

      <header class="header">

        <div class="logo">🎮</div>

        <div class="brand">

          <b>Matches</b>

          <small>
            Choose your tournament
          </small>

        </div>

        <button
          class="wallet"
          onclick="openWallet()"
        >
          ৳ ${state.balance}
        </button>

      </header>

      <main>

        <div class="adminbar">

          <button
            onclick="showMatches()"
          >
            All
          </button>

          <button
            onclick="showMatches('BR MATCH')"
          >
            BR
          </button>

          <button
            onclick="showMatches('BR-DUO')"
          >
            Duo
          </button>

          <button
            onclick="showMatches('FREE FIRE')"
          >
            Free Fire
          </button>

          <button
            onclick="showMatches('CS 4 VS 4')"
          >
            CS
          </button>

          <button
            onclick="showMatches('LONE WOLF')"
          >
            Lone Wolf
          </button>

        </div>

        <div style="margin-bottom:20px">

          ${
            selectedGame === "ALL"
              ? "<h2>All Matches</h2>"
              : `<h2>${esc(selectedGame)}</h2>`
          }

        </div>

        ${
          list.length
            ? list.map(matchCard).join("")
            : `
              <div class="empty">
                No matches available.
              </div>
            `
        }

      </main>

      ${navigation("matches")}

    </div>
  `;
}

/* =========================
   MATCH DETAILS
========================= */

function openMatch(id) {

  const match = state.matches.find(function (item) {
    return item.id === id;
  });

  if (!match) {
    toast("Match not found");
    return;
  }

  const alreadyJoined =
    state.joined.includes(id);

  const full =
    match.joined >= match.slots;

  openModal(`

    <button
      class="close"
      onclick="closeModal()"
    >
      ✕
    </button>

    <h2>
      ${esc(match.title)}
    </h2>

    <p style="color:#9b94aa;margin-top:6px">
      ${esc(match.game)} • ${esc(match.time)}
    </p>

    <div class="meta">

      <div>
        <span>Entry</span>
        <b>৳${match.fee}</b>
      </div>

      <div>
        <span>Prize</span>
        <b>৳${match.prize}</b>
      </div>

      <div>
        <span>Players</span>
        <b>${match.joined}/${match.slots}</b>
      </div>

    </div>

    <p style="
      color:#c8c0d2;
      line-height:1.6;
    ">

      Join this tournament using your wallet.
      Room information will be published by
      the admin when the match is ready.

    </p>

    ${
      alreadyJoined
        ? `
          <button
            class="primary"
            disabled
          >
            Already Joined
          </button>
        `
        : `
          <button
            class="primary"
            onclick="joinMatch(${match.id})"
            ${full ? "disabled" : ""}
          >
            ${
              full
                ? "Match Full"
                : "Join for ৳" + match.fee
            }
          </button>
        `
    }

  `);
}

/* =========================
   JOIN
========================= */

function joinMatch(id) {

  const match = state.matches.find(function (item) {
    return item.id === id;
  });

  if (!match) {
    toast("Match not found");
    return;
  }

  if (state.joined.includes(id)) {
    toast("Already joined");
    return;
  }

  if (match.joined >= match.slots) {
    toast("Match is full");
    return;
  }

  if (state.balance < match.fee) {
    toast("Not enough balance");
    return;
  }

  state.balance -= match.fee;

  match.joined += 1;

  state.joined.push(id);

  saveState();

  closeModal();

  toast("Joined successfully!");

  home();
}

/* =========================
   RESULTS
========================= */

function showResults() {

  document.getElementById("app").innerHTML = `

    <div class="shell">

      <header class="header">

        <div class="logo">🏆</div>

        <div class="brand">
          <b>Results</b>
          <small>Recent tournament results</small>
        </div>

      </header>

      <main>

        <div class="empty">

          Results will appear here after
          the admin publishes winners.

        </div>

      </main>

      ${navigation("results")}

    </div>
  `;
}

/* =========================
   PROFILE
========================= */

function showProfile() {

  const joinedMatches = state.joined
    .map(function (id) {

      return state.matches.find(function (match) {
        return match.id === id;
      });

    })
    .filter(Boolean);

  document.getElementById("app").innerHTML = `

    <div class="shell">

      <header class="header">

        <div class="logo">👤</div>

        <div class="brand">

          <b>${esc(state.user)}</b>

          <small>
            Player profile
          </small>

        </div>

      </header>

      <main>

        <div class="hero">

          <h1>
            ৳ ${state.balance}
          </h1>

          <p>
            Wallet balance
          </p>

          <button
            class="primary"
            onclick="openWallet()"
          >
            Wallet
          </button>

        </div>

        <div class="section">

          <h2>My matches</h2>

        </div>

        ${
          joinedMatches.length
            ? joinedMatches.map(matchCard).join("")
            : `
              <div class="empty">
                You have not joined any match yet.
              </div>
            `
        }

      </main>

      ${navigation("profile")}

    </div>
  `;
}

/* =========================
   WALLET
========================= */

function openWallet() {

  openModal(`

    <button
      class="close"
      onclick="closeModal()"
    >
      ✕
    </button>

    <h2>Wallet</h2>

    <p style="
      margin:12px 0;
      color:#b9b1c3;
    ">

      Current balance:

      <b>
        ৳${state.balance}
      </b>

    </p>

    <button
      class="primary"
      onclick="addDemoMoney()"
    >
      Add ৳50 Demo
    </button>

    <p style="
      color:#8f879d;
      font-size:12px;
      margin-top:10px;
    ">

      Demo wallet only.
      Real bKash/Nagad payment will be
      connected later.

    </p>

  `);
}

function addDemoMoney() {

  state.balance += 50;

  saveState();

  closeModal();

  toast("৳50 demo balance added");

  showProfile();
}

/* =========================
   HOME FILTER
========================= */

function filterHome(game, button) {

  document
    .querySelectorAll(".chip")
    .forEach(function (chip) {
      chip.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }

  const list = state.matches.filter(function (match) {
    return (
      game === "ALL" ||
      match.game === game
    );
  });

  const container =
    document.getElementById("homeMatches");

  if (!container) {
    return;
  }

  container.innerHTML = list.length
    ? list.map(matchCard).join("")
    : `
      <div class="empty">
        No matches.
      </div>
    `;
}

/* =========================
   NAVIGATION
========================= */

function navigation(active) {

  return `

    <nav class="nav">

      <button
        class="${active === "home" ? "active" : ""}"
        onclick="home()"
      >
        <i>⌂</i>
        Home
      </button>

      <button
        class="${active === "matches" ? "active" : ""}"
        onclick="showMatches()"
      >
        <i>🎮</i>
        Matches
      </button>

      <button
        class="${active === "results" ? "active" : ""}"
        onclick="showResults()"
      >
        <i>🏆</i>
        Results
      </button>

      <button
        class="${active === "profile" ? "active" : ""}"
        onclick="showProfile()"
      >
        <i>👤</i>
        Profile
      </button>

    </nav>
  `;
}

/* =========================
   MODAL
========================= */

function openModal(html) {

  closeModal();

  const modal =
    document.createElement("div");

  modal.className = "modal";
  modal.id = "modal";

  modal.innerHTML = `
    <div class="sheet">
      ${html}
    </div>
  `;

  document.body.appendChild(modal);
}

function closeModal() {

  const modal =
    document.getElementById("modal");

  if (modal) {
    modal.remove();
  }
}

/* =========================
   KEYBOARD
========================= */

document.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Escape") {
      closeModal();
    }

  }
);

/* =========================
   START
========================= */

home();
