let currentUser = null;

async function checkAuth() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    currentUser = data.session.user;
    showAuthenticatedApp();
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById("app").innerHTML = `
    <div class="shell">
      <main>
        <div class="hero" style="margin-top:60px">
          <h1>🎮 RENIT TOURNAMENT</h1>
          <p>Login or create your account to continue.</p>
        </div>

        <div class="match">
          <h2>Login</h2>

          <input
            id="authEmail"
            type="email"
            placeholder="Email"
            style="width:100%;padding:14px;margin:10px 0;border-radius:10px;border:1px solid #333;background:#17131d;color:white"
          >

          <input
            id="authPassword"
            type="password"
            placeholder="Password"
            style="width:100%;padding:14px;margin:10px 0;border-radius:10px;border:1px solid #333;background:#17131d;color:white"
          >

          <button class="primary" onclick="loginUser()">
            Login
          </button>

          <button
            class="primary"
            onclick="signupUser()"
            style="margin-top:10px"
          >
            Create Account
          </button>

          <p style="color:#8f879d;font-size:12px;margin-top:15px">
            Use a valid email address and password.
          </p>
        </div>
      </main>
    </div>
  `;
}

async function loginUser() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

  if (error) {
    alert(error.message);
    return;
  }

  currentUser = data.user;
  showAuthenticatedApp();
}

async function signupUser() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  const { data, error } =
    await supabaseClient.auth.signUp({
      email: email,
      password: password
    });

  if (error) {
    alert(error.message);
    return;
  }

  if (data.user && !data.session) {
    alert("Account created. Please check your email to confirm your account.");
    return;
  }

  currentUser = data.user;
  showAuthenticatedApp();
}

function showAuthenticatedApp() {
  home();
}
const KEY = "renit_tournament_v2";

/* =========================================================
   TOURNAMENT DATA
========================================================= */

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


/* =========================================================
   LOAD / SAVE
========================================================= */

function loadState() {
  try {
    const saved = localStorage.getItem(KEY);

    if (saved) {
      const data = JSON.parse(saved);

      return {
        matches: Array.isArray(data.matches)
          ? data.matches
          : seedMatches,

        joined: Array.isArray(data.joined)
          ? data.joined
          : [],

        balance:
          typeof data.balance === "number"
            ? data.balance
            : 40,

        user:
          typeof data.user === "string"
            ? data.user
            : "Player"
      };
    }
  } catch (error) {
    console.log("State load error:", error);
  }

  return {
    matches: seedMatches,
    joined: [],
    balance: 40,
    user: "Player"
  };
}


let state = loadState();


/* =========================================================
   ADD NEW GAME CATEGORIES TO OLD SAVED DATA
========================================================= */

const newMatches = seedMatches.filter(function (newMatch) {

  return !state.matches.some(function (oldMatch) {

    return oldMatch.id === newMatch.id;

  });

});


newMatches.forEach(function (newMatch) {

  state.matches.push(newMatch);

});


saveState();


/* =========================================================
   SAVE STATE
========================================================= */

function saveState() {

  try {

    localStorage.setItem(
      KEY,
      JSON.stringify(state)
    );

  } catch (error) {

    console.log("State save error:", error);

  }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

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


/* =========================================================
   TOAST MESSAGE
========================================================= */

function toast(message) {

  const old =
    document.querySelector(".toast");

  if (old) {
    old.remove();
  }


  const box =
    document.createElement("div");

  box.className = "toast";

  box.textContent = message;

  document.body.appendChild(box);


  setTimeout(function () {

    if (box) {
      box.remove();
    }

  }, 1800);

}


/* =========================================================
   ALL GAME CATEGORIES
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
    match.joined >= match.slots;


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
            ${match.fee === 0
              ? "FREE"
              : "৳" + match.fee}
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
        ${full ? "disabled" : ""}
      >

        ${full
          ? "Full"
          : "View & Join"}

      </button>

    </article>

  `;

}


/* =========================================================
   HOME
========================================================= */

function home() {

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

          ৳ ${state.balance}

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


          ${getGames().map(function (game) {

            const count =
              state.matches.filter(function (match) {

                return match.game === game;

              }).length;


            return `

              <article
                class="game"
                onclick="showMatches('${game}')"
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

          }).join("")}


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
   MATCHES PAGE
========================================================= */

function showMatches(game) {

  const selectedGame =
    game || "ALL";


  const list =
    state.matches.filter(function (match) {

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


          <button
            onclick="showMatches('SPECIAL MATCH')"
          >
            Special
          </button>


          <button
            onclick="showMatches('CUSTOM 2VS2 HEADSHOOT')"
          >
            2VS2
          </button>


          <button
            onclick="showMatches('LONE WOLF HEADSHOOT')"
          >
            LW HS
          </button>


          <button
            onclick="showMatches('LOST TO WIN')"
          >
            Lost
          </button>


          <button
            onclick="showMatches('FREE MATCH')"
          >
            Free
          </button>


        </div>



        <div style="
          margin-bottom:20px;
        ">


          ${
            selectedGame === "ALL"

              ? "<h2>All Matches</h2>"

              : `
                <h2>
                  ${esc(selectedGame)}
                </h2>
              `
          }


        </div>



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


/* =========================================================
   MATCH DETAILS
========================================================= */

function openMatch(id) {

  const match =
    state.matches.find(function (item) {

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
          ${match.fee === 0
            ? "FREE"
            : "৳" + match.fee}
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

                : match.fee === 0

                  ? "Join Free Match"

                  : "Join for ৳" + match.fee
            }

          </button>

        `
    }


  `);

}


/* =========================================================
   JOIN MATCH
========================================================= */

function joinMatch(id) {

  const match =
    state.matches.find(function (item) {

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


/* =========================================================
   RESULTS
========================================================= */

function showResults() {

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
            Recent tournament results
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

function showProfile() {

  const joinedMatches =
    state.joined
      .map(function (id) {

        return state.matches.find(
          function (match) {

            return match.id === id;

          }
        );

      })
      .filter(Boolean);



  document.getElementById("app").innerHTML = `

    <div class="shell">


      <header class="header">


        <div class="logo">
          👤
        </div>


        <div class="brand">

          <b>
            ${esc(state.user)}
          </b>

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

          <h2>
            My matches
          </h2>

        </div>



        ${
          joinedMatches.length

            ? joinedMatches
                .map(matchCard)
                .join("")

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


/* =========================================================
   WALLET
========================================================= */

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


/* =========================================================
   DEMO MONEY
========================================================= */

function addDemoMoney() {

  state.balance += 50;


  saveState();


  closeModal();


  toast("৳50 demo balance added");


  showProfile();

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


  const list =
    state.matches.filter(function (match) {

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

        <i>
          ⌂
        </i>

        Home

      </button>



      <button
        class="${active === "matches" ? "active" : ""}"
        onclick="showMatches()"
      >

        <i>
          🎮
        </i>

        Matches

      </button>



      <button
        class="${active === "results" ? "active" : ""}"
        onclick="showResults()"
      >

        <i>
          🏆
        </i>

        Results

      </button>



      <button
        class="${active === "profile" ? "active" : ""}"
        onclick="showProfile()"
      >

        <i>
          👤
        </i>

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


  modal.className =
    "modal";


  modal.id =
    "modal";


  modal.innerHTML = `

    <div class="sheet">

      ${html}

    </div>

  `;


  document.body.appendChild(modal);

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

  const modal =
    document.getElementById("modal");


  if (modal) {

    modal.remove();

  }

}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Escape") {

      closeModal();

    }

  }
);


/* =========================================================
   START WEBSITE
========================================================= */

checkAuth();
