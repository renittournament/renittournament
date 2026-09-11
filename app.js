/* =========================================
   RENIT TOURNAMENT
   Supabase Auth + Tournament Frontend
   ========================================= */

const APP_KEY = "renit_tournament_v3";

const matches = [
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


/* =========================================
   SAFE SUPABASE CHECK
   ========================================= */

function getSupabase() {
  if (
    typeof window === "undefined" ||
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
  ) {
    return null;
  }

  if (
    typeof SUPABASE_URL === "undefined" ||
    typeof SUPABASE_KEY === "undefined"
  ) {
    return null;
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return null;
  }

  try {
    if (!window.__renitSupabase) {
      window.__renitSupabase =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );
    }

    return window.__renitSupabase;
  } catch (error) {
    console.error("Supabase error:", error);
    return null;
  }
}

const supabaseClient = getSupabase();


/* =========================================
   LOCAL STATE
   ========================================= */

function loadLocalState() {
  try {
    const saved = localStorage.getItem(APP_KEY);

    if (saved) {
      const data = JSON.parse(saved);

      return {
        balance:
          typeof data.balance === "number"
            ? data.balance
            : 0,

        joined:
          Array.isArray(data.joined)
            ? data.joined
            : []
      };
    }
  } catch (error) {
    console.log("Local state error:", error);
  }

  return {
    balance: 0,
    joined: []
  };
}

let state = loadLocalState();

function saveLocalState() {
  try {
    localStorage.setItem(
      APP_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.log("Save error:", error);
  }
}


/* =========================================
   HELPERS
   ========================================= */

function esc(value) {
  return String(value).replace(
    /[&<>"']/g,
    function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    }
  );
}

function app() {
  return document.getElementById("app");
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


/* =========================================
   AUTH
   ========================================= */

let currentUser = null;

async function getCurrentUser() {
  if (!supabaseClient) {
    return null;
  }

  try {
    const result =
      await supabaseClient.auth.getUser();

    if (result.error) {
      console.log(
        "User check:",
        result.error.message
      );

      return null;
    }

    return result.data.user || null;

  } catch (error) {
    console.error(error);
    return null;
  }
}


/* =========================================
   PROFILE
   ========================================= */

async function createProfile(user, username) {
  if (!supabaseClient || !user) {
    return;
  }

  try {
    const { data: existing, error: findError } =
      await supabaseClient
        .from("Profiles")
        .select("id, username")
        .eq("id", user.id)
        .maybeSingle();

    if (findError) {
      console.log(
        "Profile check:",
        findError.message
      );
    }

    if (existing) {
      return;
    }

    const safeUsername =
      username ||
      user.email
        ?.split("@")[0]
        ?.replace(/[^a-zA-Z0-9_]/g, "")
        ?.slice(0, 20) ||
      "Player";

    const { error } =
      await supabaseClient
        .from("Profiles")
        .insert({
          id: user.id,
          username: safeUsername
        });

    if (error) {
      console.log(
        "Profile creation:",
        error.message
      );
    }

  } catch (error) {
    console.log(
      "Profile error:",
      error
    );
  }
}


/* =========================================
   LOGIN PAGE
   ========================================= */

function showAuth() {
  app().innerHTML = `
    <div class="shell">
      <main>

        <div class="hero" style="
          margin-top:70px;
          text-align:center;
          padding:35px 20px;
        ">
          <div style="
            font-size:50px;
            margin-bottom:10px;
          ">
            🎮
          </div>

          <h1 style="
            font-size:32px;
            margin-bottom:8px;
          ">
            RENIT TOURNAMENT
          </h1>

          <p>
            Login or create your account to continue.
          </p>
        </div>


        <div class="card" style="
          margin-top:20px;
          padding:25px;
        ">

          <h2 id="authTitle">
            Login
          </h2>


          <div id="usernameBox" style="
            display:none;
            margin-top:18px;
          ">
            <input
              id="username"
              type="text"
              placeholder="Username"
              autocomplete="username"
              style="
                width:100%;
                box-sizing:border-box;
              "
            >
          </div>


          <div style="margin-top:18px;">
            <input
              id="email"
              type="email"
              placeholder="Email"
              autocomplete="email"
              style="
                width:100%;
                box-sizing:border-box;
              "
            >
          </div>


          <div style="margin-top:14px;">
            <input
              id="password"
              type="password"
              placeholder="Password"
              autocomplete="current-password"
              style="
                width:100%;
                box-sizing:border-box;
              "
            >
          </div>


          <button
            id="authButton"
            class="primary"
            onclick="loginUser()"
            style="
              width:100%;
              margin-top:18px;
            "
          >
            Login
          </button>


          <button
            id="switchButton"
            class="join"
            onclick="switchAuthMode()"
            style="
              width:100%;
              margin-top:12px;
            "
          >
            Create Account
          </button>


          <p
            id="authMessage"
            style="
              margin-top:15px;
              color:#9b94aa;
              line-height:1.5;
            "
          >
            Use a valid email address and password.
          </p>

        </div>

      </main>
    </div>
  `;

  window.authMode = "login";
}


function switchAuthMode() {
  window.authMode =
    window.authMode === "login"
      ? "signup"
      : "login";

  const title =
    document.getElementById("authTitle");

  const button =
    document.getElementById("authButton");

  const switchButton =
    document.getElementById("switchButton");

  const usernameBox =
    document.getElementById("usernameBox");

  const message =
    document.getElementById("authMessage");

  if (window.authMode === "signup") {

    title.textContent = "Create Account";

    button.textContent = "Create Account";

    button.onclick = signupUser;

    switchButton.textContent = "Back to Login";

    usernameBox.style.display = "block";

    message.textContent =
      "Create your RENIT Tournament player account.";

  } else {

    title.textContent = "Login";

    button.textContent = "Login";

    button.onclick = loginUser;

    switchButton.textContent = "Create Account";

    usernameBox.style.display = "none";

    message.textContent =
      "Use a valid email address and password.";
  }
}


/* =========================================
   SIGN UP
   ========================================= */

async function signupUser() {

  const email =
    document.getElementById("email")
      ?.value
      .trim();

  const password =
    document.getElementById("password")
      ?.value;

  const username =
    document.getElementById("username")
      ?.value
      .trim();

  const message =
    document.getElementById("authMessage");


  if (!supabaseClient) {
    message.textContent =
      "Supabase connection is not available.";

    return;
  }


  if (!username) {
    message.textContent =
      "Please enter a username.";

    return;
  }


  if (!email) {
    message.textContent =
      "Please enter your email.";

    return;
  }


  if (!password || password.length < 6) {
    message.textContent =
      "Password must be at least 6 characters.";

    return;
  }


  message.textContent =
    "Creating your account...";


  try {

    const { data, error } =
      await supabaseClient.auth.signUp({
        email: email,
        password: password
      });


    if (error) {
      console.error(error);

      message.textContent =
        error.message;

      return;
    }


    if (!data.user) {
      message.textContent =
        "Account could not be created.";

      return;
    }


    /*
      If email confirmation is OFF,
      session will exist immediately.
    */

    if (data.session) {

      currentUser = data.user;

      await createProfile(
        data.user,
        username
      );

      toast("Account created successfully!");

      await startApp();

      return;
    }


    /*
      Email confirmation is ON.
    */

    message.innerHTML = `
      <b style="color:#fff;">
        Account created successfully.
      </b>
      <br><br>
      Please check your email and confirm
      your account.
      <br><br>
      After confirmation, come back and Login.
    `;

  } catch (error) {

    console.error(error);

    message.textContent =
      "Something went wrong. Please try again.";
  }
}


/* =========================================
   LOGIN
   ========================================= */

async function loginUser() {

  const email =
    document.getElementById("email")
      ?.value
      .trim();

  const password =
    document.getElementById("password")
      ?.value;

  const message =
    document.getElementById("authMessage");


  if (!supabaseClient) {
    message.textContent =
      "Supabase connection is not available.";

    return;
  }


  if (!email || !password) {
    message.textContent =
      "Please enter email and password.";

    return;
  }


  message.textContent =
    "Logging in...";


  try {

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });


    if (error) {

      console.error(error);

      message.textContent =
        error.message;

      return;
    }


    if (!data.user) {

      message.textContent =
        "Login failed.";

      return;
    }


    currentUser = data.user;


    await createProfile(
      data.user,
      data.user.email
        ?.split("@")[0]
    );


    toast("Login successful!");

    await startApp();

  } catch (error) {

    console.error(error);

    message.textContent =
      "Login failed. Please try again.";
  }
}


/* =========================================
   HOME
   ========================================= */

function home() {

  const userName =
    currentUser?.email
      ?.split("@")[0] ||
    "Player";


  app().innerHTML = `
    <div class="shell">

      <header class="header">

        <div class="logo">
          🎮
        </div>

        <div class="brand">
          <b>RENIT TOURNAMENT</b>
          <small>
            Play • Compete • Win
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

        <div class="hero">

          <h1>
            Ready to compete?
          </h1>

          <p>
            Welcome, ${esc(userName)}
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
                matches.filter(function (match) {
                  return match.game === game;
                }).length;

              return `
                <article
                  class="game"
                  onclick="showMatches('${esc(game)}')"
                >

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
            Upcoming Matches
          </h2>

          <button
            class="link"
            onclick="showMatches()"
          >
            View all
          </button>

        </div>


        <div id="homeMatches">

          ${matches
            .slice(0, 3)
            .map(matchCard)
            .join("")}

        </div>


        <button
          class="join"
          onclick="logoutUser()"
          style="
            width:100%;
            margin-top:25px;
          "
        >
          Logout
        </button>

      </main>


      ${navigation("home")}

    </div>
  `;
}


/* =========================================
   GAMES
   ========================================= */

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


/* =========================================
   MATCH CARD
   ========================================= */

function matchCard(match) {

  const full =
    match.joined >= match.slots;

  const alreadyJoined =
    state.joined.includes(match.id);


  return `
    <article class="match">

      <div class="matchtop">

        <h3>
          ${esc(match.title)}
        </h3>

        <span class="status">
          ${
            full
              ? "FULL"
              : esc(match.status)
          }
        </span>

      </div>


      <p style="
        color:#9b94aa;
        margin-top:5px;
      ">
        ${esc(match.game)}
        •
        ${esc(match.time)}
      </p>


      <div class="meta">

        <div>
          <span>
            Entry
          </span>

          <b>
            ${
              match.fee === 0
                ? "FREE"
                : "৳" + match.fee
            }
          </b>
        </div>


        <div>
          <span>
            Prize
          </span>

          <b>
            ৳${match.prize}
          </b>
        </div>


        <div>
          <span>
            Slots
          </span>

          <b>
            ${match.joined}/${match.slots}
          </b>
        </div>

      </div>


      <button
        class="join"
        onclick="openMatch(${match.id})"
        ${
          full
            ? "disabled"
            : ""
        }
      >

        ${
          full
            ? "Full"
            : alreadyJoined
            ? "Joined"
            : "View & Join"
        }

      </button>

    </article>
  `;
}


/* =========================================
   MATCHES
   ========================================= */

function showMatches(game) {

  const selected =
    game || "ALL";


  const list =
    matches.filter(function (match) {

      return (
        selected === "ALL" ||
        match.game === selected
      );

    });


  app().innerHTML = `
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
          ৳ ${state.balance}
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


        <h2 style="margin-bottom:20px;">
          ${
            selected === "ALL"
              ? "All Matches"
              : esc(selected)
          }
        </h2>


        ${
          list.length
            ? list
                .map(matchCard)
                .join("")
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


/* =========================================
   OPEN MATCH
   ========================================= */

function openMatch(id) {

  const match =
    matches.find(function (item) {
      return item.id === id;
    });


  if (!match) {

    toast("Match not found");

    return;
  }


  const joined =
    state.joined.includes(id);


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


    <p style="
      color:#9b94aa;
      margin-top:6px;
    ">
      ${esc(match.game)}
      •
      ${esc(match.time)}
    </p>


    <div class="meta">

      <div>
        <span>
          Entry
        </span>

        <b>
          ${
            match.fee === 0
              ? "FREE"
              : "৳" + match.fee
          }
        </b>
      </div>


      <div>
        <span>
          Prize
        </span>

        <b>
          ৳${match.prize}
        </b>
      </div>


      <div>
        <span>
          Players
        </span>

        <b>
          ${match.joined}/${match.slots}
        </b>
      </div>

    </div>


    ${
      joined

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
          >
            ${
              match.fee === 0
                ? "Join Free Match"
                : "Join for ৳" + match.fee
            }
          </button>
        `
    }

  `);
}


/* =========================================
   JOIN MATCH
   ========================================= */

function joinMatch(id) {

  const match =
    matches.find(function (item) {
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


  if (state.balance < match.fee) {

    toast(
      "Not enough wallet balance"
    );

    return;
  }


  state.balance -= match.fee;

  state.joined.push(id);

  saveLocalState();

  closeModal();

  toast(
    "Joined successfully!"
  );

  home();
}


/* =========================================
   WALLET
   ========================================= */

function openWallet() {

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


    <p style="
      margin:15px 0;
      color:#b9b1c3;
    ">
      Current balance:
      <b>
        ৳${state.balance}
      </b>
    </p>


    <p style="
      color:#8f879d;
      line-height:1.6;
    ">
      Real wallet and payment system
      will be connected to Supabase
      transactions and bKash/Nagad
      gateway.
    </p>

  `);
}


/* =========================================
   RESULTS
   ========================================= */

function showResults() {

  app().innerHTML = `
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

          Results will appear here
          after tournaments finish.

        </div>

      </main>


      ${navigation("results")}

    </div>
  `;
}


/* =========================================
   PROFILE
   ========================================= */

async function showProfile() {

  const email =
    currentUser?.email ||
    "Player";


  let username =
    email.split("@")[0];


  if (supabaseClient && currentUser) {

    try {

      const { data } =
        await supabaseClient
          .from("Profiles")
          .select("username")
          .eq("id", currentUser.id)
          .maybeSingle();


      if (data?.username) {
        username = data.username;
      }

    } catch (error) {

      console.log(
        "Profile loading:",
        error
      );

    }
  }


  const joinedMatches =
    state.joined
      .map(function (id) {

        return matches.find(
          function (match) {
            return match.id === id;
          }
        );

      })
      .filter(Boolean);


  app().innerHTML = `
    <div class="shell">

      <header class="header">

        <div class="logo">
          👤
        </div>

        <div class="brand">

          <b>
            ${esc(username)}
          </b>

          <small>
            ${esc(email)}
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

          <h2>
            My Matches
          </h2>

        </div>


        ${
          joinedMatches.length

            ? joinedMatches
                .map(matchCard)
                .join("")

            : `
              <div class="empty">
                You have not joined any
                match yet.
              </div>
            `
        }


        <button
          class="join"
          onclick="logoutUser()"
          style="
            width:100%;
            margin-top:25px;
          "
        >
          Logout
        </button>

      </main>


      ${navigation("profile")}

    </div>
  `;
}


/* =========================================
   NAVIGATION
   ========================================= */

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


/* =========================================
   HOME FILTER
   ========================================= */

function filterHome(game, button) {

  document
    .querySelectorAll(".chip")
    .forEach(function (chip) {

      chip.classList.remove(
        "active"
      );

    });


  if (button) {
    button.classList.add("active");
  }


  const list =
    matches.filter(function (match) {

      return (
        game === "ALL" ||
        match.game === game
      );

    });


  const container =
    document.getElementById(
      "homeMatches"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    list.length

      ? list
          .map(matchCard)
          .join("")

      : `
        <div class="empty">
          No matches.
        </div>
      `;
}


/* =========================================
   MODAL
   ========================================= */

function openModal(html) {

  closeModal();


  const modal =
    document.createElement("div");


  modal.className =
    "modal";


  modal.id =
    "modal";


  modal.innerHTML = `
    <div class="sheet">
      ${html}
    </div>
  `;


  document.body.appendChild(
    modal
  );
}


function closeModal() {

  const modal =
    document.getElementById(
      "modal"
    );


  if (modal) {
    modal.remove();
  }
}


/* =========================================
   LOGOUT
   ========================================= */

async function logoutUser() {

  if (supabaseClient) {

    try {

      await supabaseClient.auth.signOut();

    } catch (error) {

      console.log(
        "Logout:",
        error
      );

    }
  }


  currentUser = null;

  showAuth();

  toast(
    "Logged out successfully"
  );
}


/* =========================================
   START APP
   ========================================= */

async function startApp() {

  try {

    currentUser =
      await getCurrentUser();


    if (!currentUser) {

      showAuth();

      return;
    }


    await createProfile(
      currentUser,
      currentUser.email
        ?.split("@")[0]
    );


    home();

  } catch (error) {

    console.error(
      "START APP ERROR:",
      error
    );


    /*
      VERY IMPORTANT:
      Even if Supabase has an error,
      the page will NOT remain blank.
    */

    showAuth();
  }
}


/* =========================================
   AUTH STATE LISTENER
   ========================================= */

if (supabaseClient) {

  supabaseClient.auth.onAuthStateChange(
    function (event, session) {

      console.log(
        "Auth event:",
        event
      );

      if (session?.user) {
        currentUser =
          session.user;
      }

    }
  );

}


/* =========================================
   ESCAPE KEY
   ========================================= */

document.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Escape") {
      closeModal();
    }

  }
);


/* =========================================
   START
   ========================================= */

startApp();
