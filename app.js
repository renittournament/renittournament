/* =========================================================
   RENIT TOURNAMENT
   Supabase Auth + Profiles
   ========================================================= */

const supabaseClient = window.supabaseClient;

/* ---------- App State ---------- */

let state = {
  user: null,
  profile: null,
  matches: []
};

/* ---------- Demo Match Data ----------
   Tournament database connect করার আগ পর্যন্ত
   এগুলো frontend-এর match display data।
--------------------------------------------------------- */

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
  },
  {
    id: 7,
    game: "CUSTOM 2VS2 HEADSHOOT",
    title: "Custom 2VS2 Headshoot",
    fee: 20,
    prize: 200,
    slots: 16,
    joined: 4,
    time: "Friday • 8:00 PM",
    status: "OPEN"
  },
  {
    id: 8,
    game: "LONE WOLF HEADSHOOT",
    title: "Lone Wolf Headshoot",
    fee: 15,
    prize: 150,
    slots: 24,
    joined: 6,
    time: "Friday • 9:00 PM",
    status: "OPEN"
  },
  {
    id: 9,
    game: "LOST TO WIN",
    title: "Lost To Win",
    fee: 10,
    prize: 100,
    slots: 48,
    joined: 12,
    time: "Saturday • 8:00 PM",
    status: "OPEN"
  },
  {
    id: 10,
    game: "FREE MATCH",
    title: "Free Match",
    fee: 0,
    prize: 100,
    slots: 48,
    joined: 10,
    time: "Saturday • 9:00 PM",
    status: "OPEN"
  }
];

state.matches = seedMatches;


/* =========================================================
   HELPERS
   ========================================================= */

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char];
  });
}

function money(value) {
  const number = Number(value || 0);
  return "৳" + number.toFixed(2);
}

function username() {
  if (state.profile && state.profile.username) {
    return state.profile.username;
  }

  if (state.user && state.user.email) {
    return state.user.email.split("@")[0];
  }

  return "Player";
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
    if (box) {
      box.remove();
    }
  }, 2200);
}


/* =========================================================
   PROFILE
   ========================================================= */

async function loadProfile() {
  if (!state.user) {
    state.profile = null;
    return;
  }

  const { data, error } = await supabaseClient
    .from("Profiles")
    .select("id, username, email, balance, created_at")
    .eq("id", state.user.id)
    .maybeSingle();

  if (error) {
    console.error("Profile load error:", error);
    toast("Profile load failed");
    return;
  }

  state.profile = data;

  /*
    যদি কোনো কারণে Profile row না থাকে,
    তাহলে manually create করার চেষ্টা করবে।
  */

  if (!state.profile) {
    const newProfile = {
      id: state.user.id,
      username: state.user.email
        ? state.user.email.split("@")[0]
        : "Player",
      email: state.user.email || "",
      balance: 0
    };

    const { data: created, error: createError } =
      await supabaseClient
        .from("Profiles")
        .insert(newProfile)
        .select()
        .single();

    if (createError) {
      console.error("Profile create error:", createError);
      toast("Could not create profile");
      return;
    }

    state.profile = created;
  }
}


/* =========================================================
   AUTH
   ========================================================= */

function showAuth() {
  document.getElementById("app").innerHTML = `
    <div class="shell auth-shell">

      <div class="auth-hero">
        <div class="auth-logo">🎮</div>

        <h1>RENIT TOURNAMENT</h1>

        <p>
          Login or create your account to continue.
        </p>
      </div>

      <div class="auth-card">

        <h2>Login</h2>

        <input
          id="authEmail"
          class="auth-input"
          type="email"
          placeholder="Email"
          autocomplete="email"
        >

        <input
          id="authPassword"
          class="auth-input"
          type="password"
          placeholder="Password"
          autocomplete="current-password"
        >

        <button
          class="primary"
          onclick="loginUser()"
        >
          Login
        </button>

        <button
          class="primary"
          onclick="createAccount()"
        >
          Create Account
        </button>

        <p class="auth-help">
          Use a valid email address and password.
        </p>

      </div>

    </div>
  `;
}


async function loginUser() {
  const emailInput = document.getElementById("authEmail");
  const passwordInput = document.getElementById("authPassword");

  const email = emailInput
    ? emailInput.value.trim()
    : "";

  const password = passwordInput
    ? passwordInput.value
    : "";

  if (!email || !password) {
    toast("Email and password required");
    return;
  }

  if (!email.includes("@")) {
    toast("Enter a valid email");
    return;
  }

  const button = document.querySelector(".auth-card .primary");

  if (button) {
    button.disabled = true;
    button.textContent = "Logging in...";
  }

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

  if (error) {
    console.error("Login error:", error);

    if (button) {
      button.disabled = false;
      button.textContent = "Login";
    }

    toast(error.message);
    return;
  }

  state.user = data.user;

  await loadProfile();

  toast("Login successful!");

  home();
}


async function createAccount() {
  const emailInput = document.getElementById("authEmail");
  const passwordInput = document.getElementById("authPassword");

  const email = emailInput
    ? emailInput.value.trim()
    : "";

  const password = passwordInput
    ? passwordInput.value
    : "";

  if (!email || !password) {
    toast("Email and password required");
    return;
  }

  if (!email.includes("@")) {
    toast("Enter a valid email");
    return;
  }

  if (password.length < 6) {
    toast("Password must be at least 6 characters");
    return;
  }

  const buttons = document.querySelectorAll(
    ".auth-card .primary"
  );

  buttons.forEach(function (button) {
    button.disabled = true;
  });

  const { data, error } =
    await supabaseClient.auth.signUp({
      email: email,
      password: password
    });

  if (error) {
    console.error("Signup error:", error);

    buttons.forEach(function (button) {
      button.disabled = false;
    });

    toast(error.message);
    return;
  }

  /*
    Email confirmation ON থাকলে Supabase session immediately
    নাও দিতে পারে।
  */

  if (!data.session) {
    document.getElementById("app").innerHTML = `
      <div class="shell">

        <div class="auth-card success-card">

          <div style="font-size:52px">
            📧
          </div>

          <h2>Account Created</h2>

          <p>
            We sent a confirmation email to:
          </p>

          <strong>
            ${esc(email)}
          </strong>

          <p class="auth-help">
            Please open your email and confirm
            your account. Then come back and login.
          </p>

          <button
            class="primary"
            onclick="showAuth()"
          >
            Back to Login
          </button>

        </div>

      </div>
    `;

    return;
  }

  state.user = data.user;

  await loadProfile();

  toast("Account created!");

  home();
}


async function logoutUser() {
  const { error } =
    await supabaseClient.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    toast("Logout failed");
    return;
  }

  state.user = null;
  state.profile = null;

  showAuth();
}


/* =========================================================
   GAMES
   ========================================================= */

function getGames() {
  return [
    "BR MATCH",
    "BR-DUO",
    "FREE FIRE",
    "CS 4 VS 4",
    "LONE WOLF",
    "SPECIAL MATCH",
    "CUSTOM 2VS2 HEADSHOOT",
    "LONE WOLF HEADSHOOT",
    "LOST TO WIN",
    "FREE MATCH"
  ];
}


/* =========================================================
   MATCH CARD
   ========================================================= */

function matchCard(match) {
  const full =
    Number(match.joined) >= Number(match.slots);

  return `
    <article class="match">

      <div class="matchtop">

        <h3>
          ${esc(match.title)}
        </h3>

        <span class="status">
          ${full ? "FULL" : esc(match.status)}
        </span>

      </div>

      <p style="color:#9b94aa;margin-top:5px">
        ${esc(match.game)}
        •
        ${esc(match.time)}
      </p>

      <div class="meta">

        <div>
          <span>Entry</span>
          <b>
            ${
              Number(match.fee) === 0
                ? "FREE"
                : "৳" + Number(match.fee)
            }
          </b>
        </div>

        <div>
          <span>Prize</span>
          <b>
            ৳${Number(match.prize)}
          </b>
        </div>

        <div>
          <span>Slots</span>
          <b>
            ${Number(match.joined)}/${Number(match.slots)}
          </b>
        </div>

      </div>

      <button
        class="join"
        onclick="openMatch(${match.id})"
        ${full ? "disabled" : ""}
      >
        ${full ? "Full" : "View & Join"}
      </button>

    </article>
  `;
}


/* =========================================================
   HOME
   ========================================================= */

function home() {
  if (!state.user) {
    showAuth();
    return;
  }

  const balance = state.profile
    ? Number(state.profile.balance || 0)
    : 0;

  document.getElementById("app").innerHTML = `
    <div class="shell">

      <header class="header">

        <div class="logo">
          🎮
        </div>

        <div class="brand">

          <b>
            RENIT TOURNAMENT
          </b>

          <small>
            Play • Compete • Win
          </small>

        </div>

        <button
          class="wallet"
          onclick="openWallet()"
        >
          ৳ ${balance.toFixed(2)}
        </button>

      </header>

      <main>

        <div class="hero">

          <h1>
            Ready to compete?
          </h1>

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

          <h2>
            Games
          </h2>

          <button
            class="link"
            onclick="showMatches()"
          >
            All Matches
          </button>

        </div>


        <section class="grid">

          ${getGames()
            .map(function (game) {

              const count =
                state.matches.filter(function (match) {
                  return match.game === game;
                }).length;

              return `
                <article
                  class="game"
                  onclick="showMatches('${esc(game)}')"
                >

                  ${
                    game === "BR MATCH" ||
                    game === "BR-DUO" ||
                    game === "FREE FIRE" ||
                    game === "CUSTOM 2VS2 HEADSHOOT"
                      ? '<span class="badge">LIVE</span>'
                      : ""
                  }

                  <div>

                    <b>
                      ${esc(game)}
                    </b>

                    <small>
                      ${count}
                      ${count === 1 ? "match" : "matches"}
                    </small>

                  </div>

                </article>
              `;
            })
            .join("")}

        </section>


        <div class="section">

          <h2>
            Upcoming matches
          </h2>

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


/* =========================================================
   MATCHES
   ========================================================= */

function showMatches(game) {
  if (!state.user) {
    showAuth();
    return;
  }

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

        <div class="logo">
          🎮
        </div>

        <div class="brand">

          <b>
            Matches
          </b>

          <small>
            Choose your tournament
          </small>

        </div>

        <button
          class="wallet"
          onclick="openWallet()"
        >
          ৳ ${
            state.profile
              ? Number(state.profile.balance || 0).toFixed(2)
              : "0.00"
          }
        </button>

      </header>


      <main>

        <div class="adminbar">

          <button onclick="showMatches()">
            All
          </button>

          <button onclick="showMatches('BR MATCH')">
            BR
          </button>

          <button onclick="showMatches('BR-DUO')">
            Duo
          </button>

          <button onclick="showMatches('FREE FIRE')">
            Free Fire
          </button>

          <button onclick="showMatches('CS 4 VS 4')">
            CS
          </button>

          <button onclick="showMatches('LONE WOLF')">
            Lone Wolf
          </button>

          <button onclick="showMatches('SPECIAL MATCH')">
            Special
          </button>

          <button onclick="showMatches('CUSTOM 2VS2 HEADSHOOT')">
            2VS2
          </button>

          <button onclick="showMatches('LONE WOLF HEADSHOOT')">
            LW HS
          </button>

          <button onclick="showMatches('LOST TO WIN')">
            Lost
          </button>

          <button onclick="showMatches('FREE MATCH')">
            Free
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
            : `<div class="empty">
                No matches available.
              </div>`
        }

      </main>

      ${navigation("matches")}

    </div>
  `;
}


/* =========================================================
   MATCH DETAILS
   ========================================================= */

function openMatch(id) {
  const match = state.matches.find(function (item) {
    return item.id === id;
  });

  if (!match) {
    toast("Match not found");
    return;
  }

  const balance = state.profile
    ? Number(state.profile.balance || 0)
    : 0;

  const full =
    Number(match.joined) >= Number(match.slots);

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
      ${esc(match.game)}
      •
      ${esc(match.time)}
    </p>

    <div class="meta">

      <div>
        <span>Entry</span>
        <b>
          ${
            Number(match.fee) === 0
              ? "FREE"
              : "৳" + Number(match.fee)
          }
        </b>
      </div>

      <div>
        <span>Prize</span>
        <b>
          ৳${Number(match.prize)}
        </b>
      </div>

      <div>
        <span>Players</span>
        <b>
          ${Number(match.joined)}/${Number(match.slots)}
        </b>
      </div>

    </div>

    <p style="color:#c8c0d2;line-height:1.6">

      Join this tournament when registration
      and wallet payment are enabled.

      Room information will be published by
      the admin when the match is ready.

    </p>

    ${
      full
        ? `
          <button
            class="primary"
            disabled
          >
            Match Full
          </button>
        `
        : Number(match.fee) > balance
        ? `
          <button
            class="primary"
            onclick="openWallet()"
          >
            Add Money to Join
          </button>
        `
        : `
          <button
            class="primary"
            onclick="joinMatch(${match.id})"
          >
            ${
              Number(match.fee) === 0
                ? "Join Free Match"
                : "Join for ৳" + Number(match.fee)
            }
          </button>
        `
    }

  `);
}


/*
  IMPORTANT:

  এখনো real wallet transaction backend তৈরি হয়নি।
  তাই paid match থেকে client-side balance কাটছি না।
*/

async function joinMatch(id) {
  const match = state.matches.find(function (item) {
    return item.id === id;
  });

  if (!match) {
    toast("Match not found");
    return;
  }

  if (Number(match.fee) > 0) {
    toast("Payment system is being connected");
    closeModal();
    openWallet();
    return;
  }

  closeModal();

  toast("Free match registration will be connected next");
}


/* =========================================================
   RESULTS
   ========================================================= */

function showResults() {
  if (!state.user) {
    showAuth();
    return;
  }

  document.getElementById("app").innerHTML = `
    <div class="shell">

      <header class="header">

        <div class="logo">
          🏆
        </div>

        <div class="brand">

          <b>
            Results
          </b>

          <small>
            Tournament results
          </small>

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


/* =========================================================
   PROFILE
   ========================================================= */

async function showProfile() {
  if (!state.user) {
    showAuth();
    return;
  }

  await loadProfile();

  const balance = state.profile
    ? Number(state.profile.balance || 0)
    : 0;

  document.getElementById("app").innerHTML = `
    <div class="shell">

      <header class="header">

        <div class="logo">
          👤
        </div>

        <div class="brand">

          <b>
            ${esc(username())}
          </b>

          <small>
            Player profile
          </small>

        </div>

        <button
          class="wallet"
          onclick="openWallet()"
        >
          ৳ ${balance.toFixed(2)}
        </button>

      </header>


      <main>

        <div class="hero">

          <h1>
            ${esc(username())}
          </h1>

          <p>
            ${esc(state.profile?.email || state.user.email || "")}
          </p>

        </div>


        <div class="profile-card">

          <div class="profile-row">

            <span>
              Wallet Balance
            </span>

            <b>
              ৳ ${balance.toFixed(2)}
            </b>

          </div>

          <div class="profile-row">

            <span>
              Account
            </span>

            <b>
              Active
            </b>

          </div>

        </div>


        <button
          class="primary"
          onclick="openWallet()"
        >
          Wallet
        </button>


        <button
          class="secondary"
          onclick="editUsername()"
        >
          Edit Username
        </button>


        <button
          class="secondary"
          onclick="logoutUser()"
        >
          Logout
        </button>

      </main>

      ${navigation("profile")}

    </div>
  `;
}


/* =========================================================
   EDIT USERNAME
   ========================================================= */

function editUsername() {
  const current = username();

  openModal(`
    <button
      class="close"
      onclick="closeModal()"
    >
      ✕
    </button>

    <h2>
      Edit Username
    </h2>

    <input
      id="newUsername"
      class="auth-input"
      type="text"
      value="${esc(current)}"
      maxlength="30"
      placeholder="Username"
    >

    <button
      class="primary"
      onclick="saveUsername()"
    >
      Save Username
    </button>
  `);
}


async function saveUsername() {
  const input =
    document.getElementById("newUsername");

  if (!input) {
    return;
  }

  const newName = input.value.trim();

  if (!newName) {
    toast("Username required");
    return;
  }

  if (newName.length < 3) {
    toast("Username must be at least 3 characters");
    return;
  }

  if (newName.length > 30) {
    toast("Username is too long");
    return;
  }

  const { data, error } =
    await supabaseClient
      .from("Profiles")
      .update({
        username: newName
      })
      .eq("id", state.user.id)
      .select()
      .single();

  if (error) {
    console.error("Username update error:", error);
    toast(error.message);
    return;
  }

  state.profile = data;

  closeModal();

  toast("Username updated");

  showProfile();
}


/* =========================================================
   WALLET
   ========================================================= */

function openWallet() {
  const balance = state.profile
    ? Number(state.profile.balance || 0)
    : 0;

  openModal(`
    <button
      class="close"
      onclick="closeModal()"
    >
      ✕
    </button>

    <h2>
      Wallet
    </h2>

    <div
      style="
        font-size:32px;
        font-weight:800;
        margin:18px 0;
      "
    >
      ৳ ${balance.toFixed(2)}
    </div>

    <p
      style="
        color:#b9b1c3;
        line-height:1.6;
      "
    >
      Your wallet balance is stored
      in your RENIT profile.
    </p>

    <button
      class="primary"
      onclick="closeModal(); toast('Payment system coming next')"
    >
      Add Money
    </button>

    <p
      style="
        color:#8f879d;
        font-size:12px;
        margin-top:10px;
      "
    >
      bKash / Nagad payment gateway
      will be connected in the next stage.
    </p>
  `);
}


/* =========================================================
   HOME FILTER
   ========================================================= */

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
    : `<div class="empty">No matches.</div>`;
}


/* =========================================================
   NAVIGATION
   ========================================================= */

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


/* =========================================================
   MODAL
   ========================================================= */

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


document.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Escape") {
      closeModal();
    }

  }
);


/* =========================================================
   AUTH SESSION
   ========================================================= */

async function startApp() {
  if (!window.supabaseClient) {

    document.getElementById("app").innerHTML = `
      <div class="shell">
        <div class="empty">
          <h2>Configuration Error</h2>
          <p>
            Supabase configuration could not be loaded.
          </p>
        </div>
      </div>
    `;

    return;
  }

  const {
    data,
    error
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Session error:", error);
    showAuth();
    return;
  }

  if (data.session && data.session.user) {

    state.user = data.session.user;

    await loadProfile();

    home();

  } else {

    showAuth();

  }


  /*
    Login / logout / email confirmation-এর পর
    session change হলে app automatically update হবে।
  */

  supabaseClient.auth.onAuthStateChange(
    async function (event, session) {

      if (session && session.user) {

        state.user = session.user;

        await loadProfile();

        /*
          INITIAL_SESSION / SIGNED_IN-এর সময়
          already-rendered page আবার render করার দরকার নেই
          যদি user page-এ থাকে।
        */

        if (
          event === "SIGNED_IN" &&
          !document.querySelector(".nav")
        ) {
          home();
        }

      } else {

        state.user = null;
        state.profile = null;

        showAuth();

      }

    }
  );
}


/* =========================================================
   START
   ========================================================= */

startApp();
