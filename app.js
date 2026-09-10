const KEY = "renit_tournament_v1";

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
  }
];

function getState() {
  try {
    const saved = localStorage.getItem(KEY);

    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.log("Storage error:", error);
  }

  return {
    matches: seedMatches,
    joined: [],
    balance: 40,
    user: "Player"
  };
}

function saveState() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (error) {
    console.log("Save error:", error);
  }
}

let state = getState();

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
  const oldToast = document.querySelector(".toast");

  if (oldToast) {
    oldToast.remove();
  }

  const box = document.createElement("div");

  box.className = "toast";

  box.textContent = message;

  document.body.appendChild(box);

  setTimeout(function () {
    box.remove();
  }, 1800);
}

function games() {
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
        onclick="details(${match.id})"
      >
        ${full ? "Full" : "View & Join"}
      </button>

    </article>
  `;
}

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
          onclick="wallet()"
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
              onclick="filterMatches('ALL', this)"
            >
              All
            </button>

            <button
              class="chip"
              onclick="filterMatches('BR MATCH', this)"
            >
              BR
            </button>

            <button
              class="chip"
              onclick="filterMatches('BR-DUO', this)"
            >
              Duo
            </button>

            <button
              class="chip"
              onclick="filterMatches('FREE FIRE', this)"
            >
              Free Fire
            </button>

            <button
              class="chip"
              onclick="filterMatches('CS 4 VS 4', this)"
            >
              CS
            </button>

          </div>

        </div>

        <div class="section">

          <h2>Games</h2>

          <button
            class="link"
            onclick="matches()"
          >
            All Matches
          </button>

        </div>

        <section class="grid">

          ${games().map(function (game) {

            const count = state.matches.filter(function (m) {
              return m.game === game;
            }).length;

            return `
              <article
                class="game"
                onclick="matches('${game}')"
              >

                ${
                  game.includes("BR") ||
                  game.includes("FREE")
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
            onclick="matches()"
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

      ${nav("home")}

    </div>
  `;
}

function matches(game) {

  game = game || "ALL";

  const list = state.matches.filter(function (match) {
    return game === "ALL" || match.game === game;
  });

  document.getElementById("app").innerHTML = `

    <div class="shell">

      <header class="header">

        <div class="logo">🎮</div>

        <div class="brand">
          <b>Matches</b>
          <small>Choose your tournament</small>
        </div>

      </header>

      <main>

        <div class="adminbar">

          <button onclick="matches('ALL')">
            All
          </button>

          <button onclick="matches('BR MATCH')">
            BR
          </button>

          <button onclick="matches('BR-DUO')">
            Duo
          </button>

          <button onclick="matches('FREE FIRE')">
            Free Fire
          </button>

          <button onclick="matches('CS 4 VS 4')">
            CS
          </button>

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

      ${nav("matches")}

    </div>
  `;
}

function details(id) {

  const match = state.matches.find(function (item) {
    return item.id === id;
  });

  if (!match) {
    toast("Match not found");
    return;
  }

  const alreadyJoined = state.joined.includes(id);
  const full = match.joined >= match.slots;

  openModal(`

    <button
      class="close"
      onclick="closeModal()"
    >
      ✕
    </button>

    <h2>${esc(match.title)}</h2>

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

    <p style="color:#c8c0d2;line-height:1.6">

      Join this tournament using your wallet.
      Room information will be published by the admin
      when the match is ready.

    </p>

    ${
      alreadyJoined
        ? `
          <button class="primary" disabled>
            Already Joined
          </button>
        `
        : `
          <button
            class="primary"
            onclick="joinMatch(${match.id})"
          >
            ${full ? "Match Full" : "Join for ৳" + match.fee}
          </button>
        `
    }

  `);
}

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

function results() {

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

      ${nav("results")}

    </div>
  `;
}

function profile() {

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
            onclick="wallet()"
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

      ${nav("profile")}

    </div>
  `;
}

function wallet() {

  openModal(`

    <button
      class="close"
      onclick="closeModal()"
    >
      ✕
    </button>

    <h2>Wallet</h2>

    <p style="margin:12px 0;color:#b9b1c3">

      Current balance:

      <b>
        ৳${state.balance}
      </b>

    </p>

    <button
      class="primary"
      onclick="addDemoBalance()"
    >
      Add ৳50 Demo
    </button>

    <p style="
      color:#8f879d;
      font-size:12px;
      margin-top:10px;
    ">
      Demo wallet only.
      Real bKash/Nagad payment will be connected
      after the backend and payment gateway are ready.
    </p>

  `);
}

function addDemoBalance() {

  state.balance += 50;

  saveState();

  closeModal();

  toast("৳50 demo balance added");

  profile();
}

function filterMatches(game, button) {

  document
    .querySelectorAll(".chip")
    .forEach(function (chip) {
      chip.classList.remove("active");
    });

  if (button) {
    button.classList.add("active");
  }

  const list = state.matches.filter(function (match) {
    return game === "ALL" || match.game === game;
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

function nav(active) {

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
        onclick="matches()"
      >
        <i>🎮</i>
        Matches
      </button>

      <button
        class="${active === "results" ? "active" : ""}"
        onclick="results()"
      >
        <i>🏆</i>
        Results
      </button>

      <button
        class="${active === "profile" ? "active" : ""}"
        onclick="profile()"
      >
        <i>👤</i>
        Profile
      </button>

    </nav>
  `;
}

function openModal(html) {

  closeModal();

  const modal = document.createElement("div");

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

function admin() {

  openModal(`

    <button
      class="close"
      onclick="closeModal()"
    >
      ✕
    </button>

    <h2>Admin Demo</h2>

    <p style="color:#9b94aa;margin:8px 0 14px">

      Local demo admin panel.
      Real admin authentication will be added later.

    </p>

    <div class="field">

      <label>Game</label>

      <select id="adminGame">

        <option>BR MATCH</option>
        <option>BR-DUO</option>
        <option>FREE FIRE</option>
        <option>CS 4 VS 4</option>

      </select>

    </div>

    <div class="field">

      <label>Match title</label>

      <input
        id="adminTitle"
        placeholder="BR Solo #002"
      >

    </div>

    <div class="field">

      <label>Entry fee</label>

      <input
        id="adminFee"
        type="number"
        value="20"
      >

    </div>

    <div class="field">

      <label>Prize</label>

      <input
        id="adminPrize"
        type="number"
        value="150"
      >

    </div>

    <div class="field">

      <label>Slots</label>

      <input
        id="adminSlots"
        type="number"
        value="48"
      >

    </div>

    <div class="field">

      <label>Time</label>

      <input
        id="adminTime"
        value="Today • 11:00 PM"
      >

    </div>

    <button
      class="primary"
      onclick="addMatch()"
    >
      Create Match
    </button>

  `);
}

function addMatch() {

  const game =
    document.getElementById("adminGame").value;

  const title =
    document.getElementById("adminTitle").value;

  const fee =
    Number(document.getElementById("adminFee").value) || 0;

  const prize =
    Number(document.getElementById("adminPrize").value) || 0;

  const slots =
    Number(document.getElementById("adminSlots").value) || 1;

  const time =
    document.getElementById("adminTime").value;

  const match = {

    id: Date.now(),

    game: game,

    title: title || "New Match",

    fee: fee,

    prize: prize,

    slots: slots,

    joined: 0,

    time: time || "Upcoming",

    status: "OPEN"

  };

  state.matches.unshift(match);

  saveState();

  closeModal();

  toast("Match created");

  matches();
}

document.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Escape") {
      closeModal();
    }

  }
);

/* Start application */
home();
