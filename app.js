const app = document.getElementById("app");

function showError(message) {
  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#080b12;
      color:white;
      padding:30px 20px;
      font-family:Arial,sans-serif;
      text-align:center;
    ">
      <h2 style="color:#ff4d67;">RENIT Tournament</h2>
      <p style="color:#bbb;line-height:1.6;">${message}</p>
    </div>
  `;
}

if (!window.supabase) {
  showError("Supabase library load হয়নি।");
  throw new Error("Supabase library missing");
}

if (!window.supabaseClient) {
  showError("Supabase configuration পাওয়া যায়নি।");
  throw new Error("supabaseClient missing");
}

const db = window.supabaseClient;

let currentUser = null;
let currentProfile = null;

const games = [
  "BR MATCH",
  "BR-DUO",
  "Custom Team vs Team Headshot",
  "CS 4 VS 4",
  "LONE WOLF",
  "SPECIAL MATCH",
  "CUSTOM 2VS2 HEADSHOOT",
  "LONE WOLF HEADSHOOT",
  "LOST TO WIN",
  "FREE MATCH"
];

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pageShell(content) {
  setTimeout(updateNotificationBadge, 0);

  return `
    <div style="
      min-height:100vh;
      background:#080b12;
      color:#fff;
      font-family:Arial,sans-serif;
    ">
      <header style="
        padding:18px 16px;
        background:#101521;
        border-bottom:1px solid #202838;
        display:flex;
        justify-content:space-between;
        align-items:center;
      ">
        <div>
          <div style="font-size:21px;font-weight:800;">RENIT</div>
          <div style="font-size:11px;color:#8892a5;">TOURNAMENT</div>
        </div>

        <button onclick="showNotifications()" style="
          position:relative;
          background:#171e2b;
          color:white;
          border:1px solid #293346;
          border-radius:10px;
          padding:12px 14px;
          font-size:20px;
        ">
          🔔
          <span
            id="notificationBadge"
            style="
              display:none;
              position:absolute;
              top:-6px;
              right:-6px;
              background:red;
              color:white;
              border-radius:999px;
              min-width:18px;
              height:18px;
              padding:0 4px;
              font-size:11px;
              font-weight:bold;
              line-height:18px;
              text-align:center;
              border:2px solid #0b0f17;
            "
          >0</span>
        </button>

        <button onclick="showProfile()" style="
          background:#171e2b;
          color:white;
          border:1px solid #293346;
          border-radius:10px;
          padding:9px 13px;
        ">Profile</button>
      </header>

      ${content}

      <nav style="
        position:fixed;
        bottom:0;
        left:0;
        right:0;
        background:#101521;
        border-top:1px solid #202838;
        display:flex;
        justify-content:space-around;
        padding:10px 4px;
      ">
        <button onclick="home()" style="${navBtn()}">Home</button>
        <button onclick="showMatches()" style="${navBtn()}">Matches</button>
        <button onclick="openWallet()" style="${navBtn()}">Wallet</button>
        <button onclick="showResults()" style="${navBtn()}">Results</button>
        <button onclick="showLeaderboard()" style="${navBtn()}">Ranking</button>
      </nav>
    </div>
  `;
}
async function updateNotificationBadge() {
  const badge = document.getElementById("notificationBadge");

  if (!badge || !currentUser) return;

  const { count, error } = await db
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", currentUser.id)
    .eq("is_read", false);

  if (error) {
    console.error(error);
    badge.style.display = "none";
    return;
  }

  if (count > 0) {
    badge.textContent = count > 99 ? "99+" : count;
    badge.style.display = "inline-flex";
  } else {
    badge.style.display = "none";
  }
}
async function showNotifications() {
  if (!currentUser) {
    loginPage();
    return;
  }

  const { data, error } = await db
    .from("notifications")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    alert("Notifications load করা যায়নি: " + error.message);
    return;
  }
  if (data && data.length) {
    const { error: readError } = await db
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", currentUser.id)
      .eq("is_read", false);

    if (readError) {
      console.error(readError);
    }
  }
  app.innerHTML = pageShell(`
    <main style="padding:18px 16px 90px;">
      <button onclick="home()" style="
        background:none;
        border:0;
        color:#9ba6b8;
        padding:0;
        margin-bottom:15px;
        font-size:16px;
      ">
        ← Back
      </button>

      <h2>🔔 Notifications</h2>

      ${
        data && data.length
          ? data.map(n => `
            <div style="
              background:#101521;
              border:1px solid #202838;
              border-radius:14px;
              padding:16px;
              margin-bottom:12px;
            ">
              <div style="
                font-size:17px;
                font-weight:bold;
                margin-bottom:6px;
              ">
                ${esc(n.title)}
              </div>

              <div style="
                color:#aeb8c8;
                margin-bottom:8px;
              ">
                ${esc(n.message)}
              </div>

              <div style="
                color:#68748a;
                font-size:12px;
              ">
                ${new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          `).join("")
          : `
            <div style="
              background:#101521;
              border:1px solid #202838;
              border-radius:14px;
              padding:25px;
              text-align:center;
              color:#8f9bb0;
            ">
              এখনো কোনো notification নেই।
            </div>
          `
      }
    </main>
  `);
}
function navBtn() {
  return `
    background:none;
    border:0;
    color:#cbd3e1;
    font-size:12px;
    padding:7px;
  `;
}

function primaryBtn(text, action) {
  return `
    <button onclick="${action}" style="
      width:100%;
      background:#e94560;
      color:white;
      border:0;
      border-radius:10px;
      padding:13px;
      font-size:15px;
      font-weight:700;
      margin-top:10px;
    ">${text}</button>
  `;
}

function inputField(type, id, placeholder) {
  return `
    <input
      id="${id}"
      type="${type}"
      placeholder="${placeholder}"
      style="
        width:100%;
        box-sizing:border-box;
        background:#111722;
        color:white;
        border:1px solid #293346;
        border-radius:10px;
        padding:13px;
        margin-top:10px;
        outline:none;
      "
    >
  `;
}

function loginPage() {
  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#080b12;
      color:white;
      padding:30px 20px;
      font-family:Arial,sans-serif;
      display:flex;
      align-items:center;
      justify-content:center;
    ">
      <div style="width:100%;max-width:420px;">
        <div style="text-align:center;margin-bottom:25px;">
          <div style="font-size:34px;font-weight:900;">RENIT</div>
          <div style="color:#8892a5;margin-top:5px;">TOURNAMENT</div>
        </div>

        <div style="
          background:#101521;
          border:1px solid #202838;
          border-radius:16px;
          padding:20px;
        ">
          <h2 style="margin-top:0;">Login</h2>

          ${inputField("email","loginEmail","Email")}
          ${inputField("password","loginPassword","Password")}

          ${primaryBtn("Login","login()")}

          <button onclick="signupPage()" style="
            width:100%;
            margin-top:12px;
            padding:12px;
            background:transparent;
            color:#cbd3e1;
            border:1px solid #293346;
            border-radius:10px;
          ">Create Account</button>

          <div id="authMessage" style="
            margin-top:14px;
            color:#9ba6b8;
            font-size:13px;
            text-align:center;
          "></div>
        </div>
      </div>
    </div>
  `;
}

function signupPage() {
  app.innerHTML = `
    <div style="
      min-height:100vh;
      background:#080b12;
      color:white;
      padding:30px 20px;
      font-family:Arial,sans-serif;
      display:flex;
      align-items:center;
      justify-content:center;
    ">
      <div style="width:100%;max-width:420px;">
        <div style="text-align:center;margin-bottom:25px;">
          <div style="font-size:34px;font-weight:900;">RENIT</div>
          <div style="color:#8892a5;">CREATE ACCOUNT</div>
        </div>

        <div style="
          background:#101521;
          border:1px solid #202838;
          border-radius:16px;
          padding:20px;
        ">
          <h2 style="margin-top:0;">Create Account</h2>

          ${inputField("text","signupUsername","Username")}
          ${inputField("email","signupEmail","Email")}
          ${inputField("password","signupPassword","Password")}

          ${primaryBtn("Create Account","signup()")}

          <button onclick="loginPage()" style="
            width:100%;
            margin-top:12px;
            padding:12px;
            background:transparent;
            color:#cbd3e1;
            border:1px solid #293346;
            border-radius:10px;
          ">Back to Login</button>

          <div id="authMessage" style="
            margin-top:14px;
            color:#9ba6b8;
            font-size:13px;
            text-align:center;
          "></div>
        </div>
      </div>
    </div>
  `;
}

async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const msg = document.getElementById("authMessage");
  msg.textContent = "Logging in...";

  const { error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    msg.textContent = error.message;
    return;
  }

  await startApp();
}

async function signup() {
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  const msg = document.getElementById("authMessage");

  if (!username || !email || !password) {
    msg.textContent = "সব ঘর পূরণ করুন।";
    return;
  }

  if (password.length < 6) {
    msg.textContent = "Password কমপক্ষে 6 characters হতে হবে।";
    return;
  }

  msg.textContent = "Account তৈরি হচ্ছে...";

  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username
      }
    }
  });

  if (error) {
    msg.textContent = error.message;
    return;
  }

  if (data.user && !data.session) {
    msg.textContent =
      "Account created. Email confirmation করে তারপর Login করুন।";
    return;
  }

  await startApp();
}

async function loadProfile() {
  if (!currentUser) return null;

  const { data, error } = await db
    .from("Profiles")
    .select("*")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (error) {
    console.log("Profile error:", error);
    return null;
  }

  if (data) {
    return data;
  }

  const username =
    currentUser.user_metadata?.username ||
    currentUser.email?.split("@")[0] ||
    "Player";

  const { data: newProfile, error: insertError } = await db
    .from("Profiles")
    .insert({
      id: currentUser.id,
      username: username,
      email: currentUser.email,
      balance: 0
    })
    .select()
    .single();

  if (insertError) {
    console.log("Profile create error:", insertError);
    return null;
  }

  return newProfile;
}

async function startApp() {
  const { data, error } = await db.auth.getSession();

  if (error) {
    showError(error.message);
    return;
  }

  currentUser = data.session?.user || null;

  if (!currentUser) {
    loginPage();
    return;
  }

  currentProfile = await loadProfile();

  home();
}

function home() {
  if (!currentUser) {
    loginPage();
    return;
  }

  app.innerHTML = pageShell(`
    <main style="
      padding:18px 16px 100px;
      max-width:700px;
      margin:auto;
    ">

      <!-- Hero -->
      <div style="
        background:
          radial-gradient(circle at top right, #25385f 0%, transparent 45%),
          linear-gradient(135deg,#151d2d,#0d121c);
        border:1px solid #2a3852;
        border-radius:20px;
        padding:22px;
        margin-bottom:18px;
        box-shadow:0 12px 30px rgba(0,0,0,.25);
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:12px;
        ">

          <div>
            <div style="
              color:#7f8da6;
              font-size:12px;
              font-weight:700;
              letter-spacing:1.5px;
              margin-bottom:7px;
            ">
              WELCOME BACK
            </div>

            <div style="
              font-size:25px;
              font-weight:800;
              line-height:1.2;
            ">
              ${esc(currentProfile?.username || "Player")}
            </div>

            <div style="
              color:#9ba6b8;
              font-size:13px;
              margin-top:8px;
            ">
              Ready for your next victory?
            </div>
          </div>

          <div style="
            width:46px;
            height:46px;
            border-radius:50%;
            background:#202b40;
            border:1px solid #34435f;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:22px;
            font-weight:800;
          ">
            ${esc(
              String(currentProfile?.username || "P")
                .charAt(0)
                .toUpperCase()
            )}
          </div>

        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
          margin-top:20px;
        ">

          <button onclick="openWallet()" style="
            background:#111925;
            color:white;
            border:1px solid #29364d;
            border-radius:13px;
            padding:13px;
            text-align:left;
          ">
            <div style="
              color:#7f8da6;
              font-size:11px;
              margin-bottom:5px;
            ">
              WALLET BALANCE
            </div>

            <div style="
              font-size:19px;
              font-weight:800;
            ">
              ৳${Number(currentProfile?.balance || 0).toFixed(2)}
            </div>
          </button>

          <button onclick="showLeaderboard()" style="
            background:#111925;
            color:white;
            border:1px solid #29364d;
            border-radius:13px;
            padding:13px;
            text-align:left;
          ">
            <div style="
              color:#7f8da6;
              font-size:11px;
              margin-bottom:5px;
            ">
              COMPETITION
            </div>

            <div style="
              font-size:16px;
              font-weight:800;
            ">
              🏆 Ranking
            </div>
          </button>

        </div>
      </div>


      <!-- Quick Actions -->
      <div style="
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:10px;
        margin-bottom:24px;
      ">

        <button onclick="showMatches()" style="
          background:#111722;
          color:white;
          border:1px solid #263044;
          border-radius:14px;
          padding:15px 7px;
        ">
          <div style="font-size:23px;">🎮</div>
          <div style="
            font-size:12px;
            font-weight:700;
            margin-top:7px;
          ">
            Matches
          </div>
        </button>

        <button onclick="showResults()" style="
          background:#111722;
          color:white;
          border:1px solid #263044;
          border-radius:14px;
          padding:15px 7px;
        ">
          <div style="font-size:23px;">🏆</div>
          <div style="
            font-size:12px;
            font-weight:700;
            margin-top:7px;
          ">
            Results
          </div>
        </button>

        <button onclick="showNotifications()" style="
          background:#111722;
          color:white;
          border:1px solid #263044;
          border-radius:14px;
          padding:15px 7px;
        ">
          <div style="font-size:23px;">🔔</div>
          <div style="
            font-size:12px;
            font-weight:700;
            margin-top:7px;
          ">
            Alerts
          </div>
        </button>

      </div>


      <!-- Game Categories -->
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:12px;
      ">

        <div>
          <div style="
            font-size:20px;
            font-weight:800;
          ">
            Game Categories
          </div>

          <div style="
            color:#78859a;
            font-size:12px;
            margin-top:4px;
          ">
            Choose a game and find your match
          </div>
        </div>

        <div style="
          background:#171f2e;
          border:1px solid #29364d;
          border-radius:999px;
          padding:6px 10px;
          color:#9ba6b8;
          font-size:11px;
          font-weight:700;
        ">
          ${games.length} GAMES
        </div>

      </div>


      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
      ">

        ${games.map((game, index) => `
          <button
            onclick="showGameMatches('${esc(game)}')"
            style="
              position:relative;
              overflow:hidden;
              background:
                linear-gradient(
                  145deg,
                  #141c2b,
                  #0e131d
                );
              color:white;
              border:1px solid #263044;
              border-radius:15px;
              padding:16px 13px;
              min-height:82px;
              text-align:left;
              transition:.2s;
            "
          >

            <div style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:8px;
            ">

              <div style="
                width:34px;
                height:34px;
                border-radius:10px;
                background:#1d2739;
                border:1px solid #303d55;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:17px;
              ">
                ${index === 0 ? "🔥" : "🎯"}
              </div>

              <div style="
                color:#526078;
                font-size:11px;
                font-weight:700;
              ">
                #${String(index + 1).padStart(2, "0")}
              </div>

            </div>

            <div style="
              margin-top:11px;
              font-size:13px;
              font-weight:800;
              line-height:1.3;
            ">
              ${esc(game)}
            </div>

          </button>
        `).join("")}

      </div>

    </main>
  `);
}

async function getTournaments(game = null) {
  let query = db
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.log("Tournament query:", error);
    return [];
  }

  let tournaments = data || [];

  if (game) {
    tournaments = tournaments.filter(t => {
      const value =
        t.game ||
        t.game_name ||
        t.category ||
        t.type ||
        "";

      return String(value).toUpperCase() === game.toUpperCase();
    });
  }

  if (!tournaments.length) {
    return [];
  }

  const ids = tournaments.map(t => t.id);

  const { data: counts, error: countError } =
    await db.rpc(
      "get_tournament_join_counts",
      {
        p_tournament_ids: ids
      }
    );

  if (countError) {
    console.log("Join count query:", countError);
    return tournaments;
  }

  const countMap = {};

  (counts || []).forEach(row => {
    countMap[row.tournament_id] =
      Number(row.joined_players || 0);
  });

  return tournaments.map(t => ({
    ...t,
    joined_players: countMap[t.id] || 0
  }));
}

function tournamentTitle(t) {
  return (
    t.title ||
    t.name ||
    t.tournament_name ||
    "Tournament"
  );
}

function tournamentGame(t) {
  return (
    t.game ||
    t.game_name ||
    t.category ||
    t.type ||
    "Tournament"
  );
}

function tournamentFee(t) {
  return (
    t.entry_fee ??
    t.fee ??
    t.join_fee ??
    0
  );
}

function tournamentPrize(t) {
  return (
    t.prize_pool ??
    t.prize ??
    t.reward ??
    0
  );
}

function tournamentSlots(t) {
  return (
    t. max_players ??
    t.slots ??
    t.max_slots ??
    t.total_slots ??
    0
  );
}
function tournamentStartTime(t) {
  if (!t.start_time) return "-";

  return new Date(t.start_time).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}
async function showMatches() {
  const matches = await getTournaments();

  app.innerHTML = pageShell(`
    <main style="
      padding:18px 16px 100px;
      max-width:760px;
      margin:auto;
    ">

      <!-- HEADER -->
      <div style="
        margin-bottom:15px;
      ">

        <div style="
          color:#718097;
          font-size:11px;
          font-weight:800;
          letter-spacing:1.4px;
          margin-bottom:5px;
        ">
          RENIT MATCHES
        </div>

        <h2 style="
          margin:0;
          font-size:25px;
        ">
          🎮 All Matches
        </h2>

      </div>


      <!-- SEARCH -->
      <div style="
        background:#101521;
        border:1px solid #263044;
        border-radius:16px;
        padding:14px;
        margin-bottom:12px;
      ">

        <input
          id="matchSearch"
          type="text"
          placeholder="🔎 Search tournament..."
          oninput="filterMatches()"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            outline:none;
            font-size:13px;
          "
        >


        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
          margin-top:10px;
        ">

          <select
            id="matchGameFilter"
            onchange="filterMatches()"
            style="
              width:100%;
              box-sizing:border-box;
              background:#111722;
              color:white;
              border:1px solid #29364d;
              border-radius:11px;
              padding:12px;
              outline:none;
              font-size:12px;
            "
          >
            <option value="">All Games</option>
            <option value="BR MATCH">BR MATCH</option>
            <option value="BR-DUO">BR-DUO</option>
            <option value="Custom Team vs Team Headshot">Custom Team vs Team Headshot</option>
            <option value="CS 4 VS 4">CS 4 VS 4</option>
            <option value="LONE WOLF">LONE WOLF</option>
            <option value="SPECIAL MATCH">SPECIAL MATCH</option>
            <option value="CUSTOM 2VS2 HEADSHOOT">CUSTOM 2VS2 HEADSHOOT</option>
            <option value="LONE WOLF HEADSHOOT">LONE WOLF HEADSHOOT</option>
            <option value="LOST TO WIN">LOST TO WIN</option>
            <option value="FREE MATCH">FREE MATCH</option>
          </select>


          <select
            id="matchStatusFilter"
            onchange="filterMatches()"
            style="
              width:100%;
              box-sizing:border-box;
              background:#111722;
              color:white;
              border:1px solid #29364d;
              border-radius:11px;
              padding:12px;
              outline:none;
              font-size:12px;
            "
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>

        </div>

      </div>


      <!-- RESULT COUNT -->
      <div id="matchResultCount" style="
        color:#718097;
        font-size:11px;
        margin:0 2px 10px;
      ">
        ${esc(matches.length)} tournament${matches.length === 1 ? "" : "s"}
      </div>


      <!-- MATCH LIST -->
      <div id="matchList">

        ${
          matches.length
            ? matches.map(matchCard).join("")
            : `
              <div style="
                background:#101521;
                border:1px solid #263044;
                border-radius:15px;
                padding:25px;
                text-align:center;
                color:#8f9bb0;
              ">
                এখনো কোনো tournament publish করা হয়নি।
              </div>
            `
        }

      </div>

    </main>
  `);


  window.__renitMatches = matches;


  matches.forEach(tournament => {
    startTournamentCountdown(tournament);
  });
}
function filterMatches() {
  const matches = window.__renitMatches || [];

  const search =
    String(
      document.getElementById("matchSearch")?.value || ""
    )
      .trim()
      .toLowerCase();

  const gameFilter =
    String(
      document.getElementById("matchGameFilter")?.value || ""
    )
      .trim()
      .toLowerCase();

  const statusFilter =
    String(
      document.getElementById("matchStatusFilter")?.value || ""
    )
      .trim()
      .toLowerCase();


  const filtered = matches.filter(tournament => {

    const title =
      String(
        tournamentTitle(tournament) || ""
      ).toLowerCase();

    const game =
      String(
        tournamentGame(tournament) || ""
      ).toLowerCase();

    const status =
      String(
        tournament.status || "upcoming"
      ).toLowerCase();


    const matchesSearch =
      !search ||
      title.includes(search) ||
      game.includes(search);


    const matchesGame =
      !gameFilter ||
      game === gameFilter;


    const matchesStatus =
      !statusFilter ||
      status === statusFilter;


    return (
      matchesSearch &&
      matchesGame &&
      matchesStatus
    );
  });


  const list =
    document.getElementById("matchList");

  const count =
    document.getElementById("matchResultCount");


  if (!list) return;


  list.innerHTML =
    filtered.length
      ? filtered.map(matchCard).join("")
      : `
        <div style="
          background:#101521;
          border:1px solid #263044;
          border-radius:15px;
          padding:25px 18px;
          text-align:center;
        ">

          <div style="
            font-size:28px;
            margin-bottom:8px;
          ">
            🔎
          </div>

          <div style="
            font-size:15px;
            font-weight:700;
          ">
            No tournaments found
          </div>

          <div style="
            color:#718097;
            font-size:12px;
            margin-top:5px;
          ">
            Search বা filter পরিবর্তন করে আবার চেষ্টা করুন।
          </div>

        </div>
      `;


  if (count) {
    count.textContent =
      `${filtered.length} tournament${
        filtered.length === 1 ? "" : "s"
      } found`;
  }


  filtered.forEach(tournament => {
    startTournamentCountdown(tournament);
  });
}
async function showGameMatches(game) {
  const matches = await getTournaments(game);

  app.innerHTML = pageShell(`
    <main style="padding:18px 16px 90px;">
      <button onclick="home()" style="
        background:none;
        border:0;
        color:#9ba6b8;
        padding:0;
        margin-bottom:15px;
      ">← Back</button>

      <h2>${esc(game)}</h2>

      ${
        matches.length
        ? matches.map(matchCard).join("")
        : `
          <div style="
            background:#101521;
            border:1px solid #202838;
            border-radius:14px;
            padding:25px;
            text-align:center;
            color:#8f9bb0;
          ">
            এই category-তে এখন কোনো tournament নেই।
          </div>
        `
      }
    </main>
  `);
  matches.forEach(tournament => {
  startTournamentCountdown(tournament);
});
}
function matchCard(t) {
  const title = tournamentTitle(t);
  const game = tournamentGame(t);
  const fee = tournamentFee(t);
  const prize = tournamentPrize(t);
  const slots = tournamentSlots(t);

  const joinedPlayers = Number(t.joined_players || 0);

  const remainingSlots = Math.max(
    Number(slots) - joinedPlayers,
    0
  );

  const status =
    String(t.status || "upcoming").toLowerCase();

  let statusText = "UPCOMING";

  if (status === "live") {
    statusText = "🔴 LIVE";
  } else if (status === "completed") {
    statusText = "✅ COMPLETED";
  } else {
    statusText = "🟢 UPCOMING";
  }

  const progress =
    Number(slots) > 0
      ? Math.min(
          (joinedPlayers / Number(slots)) * 100,
          100
        )
      : 0;

  return `
    <div style="
      background:
        radial-gradient(
          circle at top right,
          #1b2a43 0%,
          transparent 45%
        ),
        linear-gradient(145deg,#121a28,#0d121b);
      border:1px solid #29364d;
      border-radius:18px;
      padding:17px;
      margin-bottom:14px;
      box-shadow:0 10px 28px rgba(0,0,0,.22);
      overflow:hidden;
    ">

      <!-- Top Row -->
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        margin-bottom:10px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:8px;
          min-width:0;
        ">

          <div style="
            width:34px;
            height:34px;
            border-radius:10px;
            background:#1d293c;
            border:1px solid #33435c;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:17px;
            flex-shrink:0;
          ">
            🎮
          </div>

          <div style="
            color:#8f9bb0;
            font-size:12px;
            font-weight:700;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
          ">
            ${esc(game)}
          </div>

        </div>

        <div style="
          background:#172235;
          border:1px solid #2d3c55;
          border-radius:999px;
          padding:6px 9px;
          font-size:10px;
          font-weight:800;
          white-space:nowrap;
        ">
          ${statusText}
        </div>

      </div>


      <!-- Tournament Title -->
      <h3 style="
        margin:0 0 15px;
        font-size:20px;
        line-height:1.25;
        font-weight:800;
      ">
        ${esc(title)}
      </h3>


      <!-- Prize / Entry -->
      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:9px;
        margin-bottom:11px;
      ">

        <div style="
          background:#0d141f;
          border:1px solid #202d41;
          border-radius:12px;
          padding:11px;
        ">
          <div style="
            color:#718097;
            font-size:10px;
            font-weight:700;
            margin-bottom:4px;
          ">
            ENTRY FEE
          </div>

          <div style="
            font-size:18px;
            font-weight:800;
          ">
            ৳${esc(fee)}
          </div>
        </div>

        <div style="
          background:#0d141f;
          border:1px solid #202d41;
          border-radius:12px;
          padding:11px;
        ">
          <div style="
            color:#718097;
            font-size:10px;
            font-weight:700;
            margin-bottom:4px;
          ">
            PRIZE POOL
          </div>

          <div style="
            font-size:18px;
            font-weight:800;
          ">
            ৳${esc(prize)}
          </div>
        </div>

      </div>


      <!-- Slots -->
      <div style="
        background:#0d141f;
        border:1px solid #202d41;
        border-radius:12px;
        padding:12px;
        margin-bottom:11px;
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:8px;
          font-size:12px;
        ">

          <span style="color:#9ba6b8;">
            👥 Players
          </span>

          <span style="
            color:#fff;
            font-weight:800;
          ">
            ${esc(joinedPlayers)} / ${esc(slots)}
          </span>

        </div>

        <div style="
          height:6px;
          background:#1b2535;
          border-radius:999px;
          overflow:hidden;
        ">
          <div style="
            width:${progress}%;
            height:100%;
            background:#60a5fa;
            border-radius:999px;
          "></div>
        </div>

        <div style="
          display:flex;
          justify-content:space-between;
          margin-top:7px;
          font-size:11px;
          color:#718097;
        ">
          <span>
            ${esc(remainingSlots)} slots remaining
          </span>

          <span>
            ${Math.round(progress)}% full
          </span>
        </div>

      </div>


      <!-- Start Time -->
      <div style="
        color:#9ba6b8;
        font-size:12px;
        margin-bottom:8px;
      ">
        🕒 Start: ${esc(tournamentStartTime(t))}
      </div>


      <!-- Countdown -->
      <div
        id="countdown-${esc(t.id || "")}"
        style="
          margin-top:8px;
          margin-bottom:12px;
          padding:12px;
          background:#0a1019;
          border:1px solid #26364e;
          border-radius:12px;
          color:#60a5fa;
          font-size:13px;
          font-weight:800;
          text-align:center;
        "
      >
        ⏳ Countdown loading...
      </div>


      <!-- Join Button -->
      ${primaryBtn(
        "View & Join",
        `openMatch('${esc(t.id || "")}')`
      )}

    </div>
  `;
}
function startTournamentCountdown(tournament) {
  const box = document.getElementById(
    `countdown-${tournament.id}`
  );

  if (!box || !tournament.start_time) return;

  const updateCountdown = () => {
    const status =
      String(tournament.status || "upcoming").toLowerCase();

    if (status === "completed") {
      box.textContent = "✅ COMPLETED";
      return;
    }

    if (status === "live") {
      box.textContent = "🔴 LIVE NOW";
      return;
    }

    const startTime =
      new Date(tournament.start_time).getTime();

    const now = Date.now();
    const difference = startTime - now;

    if (difference <= 0) {
      box.textContent = "🔴 LIVE NOW";
      return;
    }

    const totalSeconds =
      Math.floor(difference / 1000);

    const days =
      Math.floor(totalSeconds / 86400);

    const hours =
      Math.floor(
        (totalSeconds % 86400) / 3600
      );

    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );

    const seconds =
      totalSeconds % 60;

    let text = "";

    if (days > 0) {
      text += `${days}d `;
    }

    text +=
      `${String(hours).padStart(2, "0")}h ` +
      `${String(minutes).padStart(2, "0")}m ` +
      `${String(seconds).padStart(2, "0")}s`;

    box.textContent =
      `⏳ Starts in ${text}`;
  };

  updateCountdown();

  const timer =
    setInterval(updateCountdown, 1000);

  box.dataset.timer = timer;
}
async function openMatch(id) {
  const { data, error } = await db
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    alert("Tournament পাওয়া যায়নি।");
    return;
  }

  const title = tournamentTitle(data);
  const game = tournamentGame(data);
  const fee = tournamentFee(data);
  const prize = tournamentPrize(data);
  const slots = tournamentSlots(data);

  const status =
    String(data.status || "upcoming").toLowerCase();

  let statusText = "🟢 UPCOMING";

  if (status === "live") {
    statusText = "🔴 LIVE NOW";
  } else if (status === "completed") {
    statusText = "✅ COMPLETED";
  }

  let room = null;

  if (currentUser) {
    const { data: roomData, error: roomError } =
      await db.rpc(
        "get_my_tournament_room",
        {
          p_tournament_id: id
        }
      );

    if (!roomError && roomData?.length) {
      room = roomData[0];
    }
  }

  app.innerHTML = pageShell(`
    <main style="
      padding:18px 16px 100px;
      max-width:700px;
      margin:auto;
    ">

      <!-- Back -->
      <button onclick="showMatches()" style="
        background:none;
        border:0;
        color:#9ba6b8;
        padding:0;
        margin-bottom:16px;
        font-size:15px;
      ">
        ← Back to Matches
      </button>


      <!-- Tournament Header -->
      <div style="
        background:
          radial-gradient(
            circle at top right,
            #263b60 0%,
            transparent 48%
          ),
          linear-gradient(145deg,#151e2d,#0d121b);
        border:1px solid #2b3b55;
        border-radius:20px;
        padding:20px;
        margin-bottom:14px;
        box-shadow:0 12px 30px rgba(0,0,0,.25);
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        ">

          <div style="
            color:#8f9bb0;
            font-size:12px;
            font-weight:700;
          ">
            🎮 ${esc(game)}
          </div>

          <div style="
            background:#182438;
            border:1px solid #30415d;
            border-radius:999px;
            padding:7px 10px;
            font-size:10px;
            font-weight:800;
            white-space:nowrap;
          ">
            ${statusText}
          </div>

        </div>


        <h2 style="
          margin:12px 0 7px;
          font-size:25px;
          line-height:1.25;
        ">
          ${esc(title)}
        </h2>

        <div style="
          color:#78869c;
          font-size:12px;
        ">
          Tournament Details
        </div>

      </div>


      <!-- Prize & Entry -->
      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
        margin-bottom:14px;
      ">

        <div style="
          background:#111722;
          border:1px solid #263044;
          border-radius:15px;
          padding:15px;
        ">
          <div style="
            color:#718097;
            font-size:10px;
            font-weight:700;
          ">
            ENTRY FEE
          </div>

          <div style="
            font-size:21px;
            font-weight:800;
            margin-top:5px;
          ">
            ৳${esc(fee)}
          </div>
        </div>

        <div style="
          background:#111722;
          border:1px solid #263044;
          border-radius:15px;
          padding:15px;
        ">
          <div style="
            color:#718097;
            font-size:10px;
            font-weight:700;
          ">
            PRIZE POOL
          </div>

          <div style="
            font-size:21px;
            font-weight:800;
            margin-top:5px;
          ">
            ৳${esc(prize)}
          </div>
        </div>

      </div>


      <!-- Tournament Info -->
      <div style="
        background:#101521;
        border:1px solid #202838;
        border-radius:16px;
        padding:16px;
        margin-bottom:14px;
      ">

        <div style="
          font-size:17px;
          font-weight:800;
          margin-bottom:14px;
        ">
          📋 Tournament Information
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
        ">

          <div>
            <div style="
              color:#718097;
              font-size:10px;
            ">
              GAME
            </div>

            <div style="
              margin-top:4px;
              font-size:13px;
              font-weight:700;
            ">
              ${esc(game)}
            </div>
          </div>


          <div>
            <div style="
              color:#718097;
              font-size:10px;
            ">
              MODE
            </div>

            <div style="
              margin-top:4px;
              font-size:13px;
              font-weight:700;
            ">
              ${esc(data.mode || "Solo")}
            </div>
          </div>


          <div>
            <div style="
              color:#718097;
              font-size:10px;
            ">
              MAX PLAYERS
            </div>

            <div style="
              margin-top:4px;
              font-size:13px;
              font-weight:700;
            ">
              ${esc(slots)}
            </div>
          </div>


          <div>
            <div style="
              color:#718097;
              font-size:10px;
            ">
              START TIME
            </div>

            <div style="
              margin-top:4px;
              font-size:13px;
              font-weight:700;
            ">
              ${esc(tournamentStartTime(data))}
            </div>
          </div>

        </div>

      </div>


      <!-- Rules -->
      <div style="
        background:#101521;
        border:1px solid #202838;
        border-radius:16px;
        padding:16px;
        margin-bottom:14px;
      ">

        <div style="
          font-size:17px;
          font-weight:800;
          margin-bottom:10px;
        ">
          📜 Tournament Rules
        </div>

        <div style="
          color:#9ba6b8;
          font-size:13px;
          line-height:1.7;
        ">
          • Join the tournament before the start time.<br>
          • Make sure your game account is ready.<br>
          • Room information will be available to joined players.<br>
          • Follow the tournament instructions provided by the admin.<br>
          • Any rule violation may result in disqualification.
        </div>

      </div>


      <!-- Room Information -->
      ${room ? `
        <div style="
          background:
            linear-gradient(145deg,#142238,#0f1724);
          border:1px solid #31527d;
          border-radius:16px;
          padding:17px;
          margin-bottom:14px;
        ">

          <div style="
            color:#60a5fa;
            font-size:12px;
            font-weight:800;
            margin-bottom:13px;
          ">
            🔑 ROOM INFORMATION
          </div>


          <div style="
            background:#0b111b;
            border:1px solid #26364e;
            border-radius:12px;
            padding:12px;
            margin-bottom:9px;
          ">
            <div style="
              color:#718097;
              font-size:10px;
              margin-bottom:4px;
            ">
              ROOM ID
            </div>

            <div style="
              font-size:18px;
              font-weight:800;
              letter-spacing:.5px;
            ">
              ${esc(room.room_id || "Not published")}
            </div>
          </div>


          <div style="
            background:#0b111b;
            border:1px solid #26364e;
            border-radius:12px;
            padding:12px;
          ">
            <div style="
              color:#718097;
              font-size:10px;
              margin-bottom:4px;
            ">
              PASSWORD
            </div>

            <div style="
              font-size:18px;
              font-weight:800;
              letter-spacing:.5px;
            ">
              ${esc(room.room_password || "Not published")}
            </div>
          </div>

        </div>
      ` : ""}


      <!-- Join -->
      ${primaryBtn(
        status === "completed"
          ? "Tournament Completed"
          : "Join Tournament",
        `joinTournament('${esc(data.id)}')`
      )}

    </main>
  `);
}

async function joinTournament(id) {
  if (!currentUser) {
    loginPage();
    return;
  }

  // Check tournament type
  const { data: tournament, error: tournamentError } =
    await db
      .from("tournaments")
      .select("id, game, title")
      .eq("id", id)
      .single();

  if (tournamentError) {
    console.log(tournamentError);
    alert("Tournament information load করা যায়নি।");
    return;
  }

  // Custom Team vs Team Headshot
  if (
    String(tournament.game || "").trim().toLowerCase() ===
    "custom team vs team headshot"
  ) {
    const player1 = prompt("Player 1-এর Game Name লিখুন:");

    if (player1 === null) return;

    const player2 = prompt("Player 2-এর Game Name লিখুন:");

    if (player2 === null) return;

    const player3 = prompt("Player 3-এর Game Name লিখুন:");

    if (player3 === null) return;

    const player4 = prompt("Player 4-এর Game Name লিখুন:");

    if (player4 === null) return;

    const players = [
      player1.trim(),
      player2.trim(),
      player3.trim(),
      player4.trim()
    ];

    if (players.some(name => !name)) {
      alert("সব ৪ জন Player-এর Game Name দিতে হবে।");
      return;
    }

    if (players.some(name => name.length > 30)) {
      alert("প্রতিটি Game Name সর্বোচ্চ 30 characters হতে পারবে।");
      return;
    }

    const { data, error } =
      await db.rpc(
        "join_custom_team_tournament",
        {
          p_tournament_id: Number(id),
          p_player_1: players[0],
          p_player_2: players[1],
          p_player_3: players[2],
          p_player_4: players[3]
        }
      );

    if (error) {
      console.log(error);
      alert(
        "Team join করা যায়নি: " +
        error.message
      );
      return;
    }

    alert(
      `Team registered successfully!\n\n` +
      `Player 1: ${players[0]}\n` +
      `Player 2: ${players[1]}\n` +
      `Player 3: ${players[2]}\n` +
      `Player 4: ${players[3]}\n\n` +
      `Entry Fee: ৳${data.fee}\n` +
      `Remaining Balance: ৳${data.balance}`
    );

    await openMatch(id);
    return;
  }

  // All other tournaments remain Solo / existing system
  const gameName = prompt("আপনার Game Name লিখুন:");

  if (gameName === null) {
    return;
  }

  const cleanGameName = gameName.trim();

  if (!cleanGameName) {
    alert("Game Name দিতে হবে।");
    return;
  }

  if (cleanGameName.length > 30) {
    alert(
      "Game Name সর্বোচ্চ 30 characters হতে পারবে।"
    );
    return;
  }

  const { data, error } =
    await db.rpc(
      "join_tournament",
      {
        p_tournament_id: id,
        p_game_name: cleanGameName
      }
    );

  if (error) {
    console.log(error);
    alert(
      "Join করা যায়নি: " +
      error.message
    );
    return;
  }

  alert(
    `Tournament joined successfully!\n` +
    `Game Name: ${cleanGameName}\n` +
    `Entry Fee: ৳${data.fee}\n` +
    `Remaining Balance: ৳${data.balance}`
  );

  await openMatch(id);
}

async function showResults() {
  const { data, error } = await db.rpc(
    "get_public_tournament_results"
  );

  if (error) {
    console.log(error);

    app.innerHTML = pageShell(`
      <main style="padding:18px 16px 90px;">
        <h2>Results</h2>

        <div style="
          background:#101521;
          border:1px solid #202838;
          border-radius:14px;
          padding:25px;
          text-align:center;
          color:#ff7185;
        ">
          Results load করা যায়নি।
        </div>
      </main>
    `);

    return;
  }

  app.innerHTML = pageShell(`
    <main style="padding:18px 16px 90px;">
      <h2>Results</h2>

      ${
        data?.length
          ? data.map(r => `
              <div style="
                background:#101521;
                border:1px solid #202838;
                border-radius:14px;
                padding:15px;
                margin-bottom:10px;
              ">
                <div style="
                  font-size:18px;
                  font-weight:700;
                ">
                  ${esc(r.username || "Player")}
                </div>

                <div style="
                  color:#9ba6b8;
                  margin-top:7px;
                ">
                  ${esc(r.tournament_title || "Tournament")}
                </div>

                <div style="
                  color:#9ba6b8;
                  margin-top:5px;
                ">
                  Game: ${esc(r.game || "-")}
                </div>

                <div style="
  margin-top:12px;
  font-size:18px;
  font-weight:700;
">
  ${
    r.result_position === 1
      ? "🥇 1st Place"
      : r.result_position === 2
      ? "🥈 2nd Place"
      : r.result_position === 3
      ? "🥉 3rd Place"
      : `${esc(r.result_position ?? "-")} Place`
  }
</div>

                <div style="
                  color:#9ba6b8;
                  margin-top:5px;
                ">
                  Prize: ৳${esc(r.prize_amount ?? 0)}
                </div>
              </div>
            `).join("")
          : `
              <div style="
                background:#101521;
                border:1px solid #202838;
                border-radius:14px;
                padding:25px;
                text-align:center;
                color:#8f9bb0;
              ">
                এখনো কোনো result নেই।
              </div>
            `
      }
    </main>
  `);
}
async function showLeaderboard() {
  const { data, error } =
    await db.rpc("get_leaderboard");

  if (error) {
    console.log(error);

    app.innerHTML = pageShell(`
      <main style="padding:18px 16px 90px;">
        <h2>Leaderboard</h2>

        <div style="
          background:#101521;
          border:1px solid #202838;
          border-radius:14px;
          padding:25px;
          text-align:center;
          color:#ff7185;
        ">
          Leaderboard load করা যায়নি।
        </div>
      </main>
    `);

    return;
  }

  const players = data || [];

  app.innerHTML = pageShell(`
    <main style="padding:18px 16px 90px;">

      <h2>🏆 Leaderboard</h2>

      <div style="
        color:#8f9bb0;
        font-size:13px;
        margin-top:-5px;
        margin-bottom:15px;
      ">
        Top tournament players
      </div>

      ${
        players.length
          ? players.map(player => `

              <div style="
                background:#101521;
                border:1px solid #202838;
                border-radius:14px;
                padding:16px;
                margin-bottom:10px;
              ">

                <div style="
                  display:flex;
                  align-items:center;
                  gap:12px;
                ">

                  <div style="
                    width:42px;
                    height:42px;
                    border-radius:50%;
                    background:#e94560;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-weight:900;
                    font-size:16px;
                  ">
                    ${
                      Number(player.rank) === 1
                        ? "🥇"
                        : Number(player.rank) === 2
                        ? "🥈"
                        : Number(player.rank) === 3
                        ? "🥉"
                        : `#${esc(player.rank)}`
                    }
                  </div>

                  <div style="flex:1;">

                    <div style="
                      font-size:17px;
                      font-weight:700;
                    ">
                      ${esc(player.username || "Player")}
                    </div>

                    <div style="
                      color:#8f9bb0;
                      font-size:12px;
                      margin-top:4px;
                    ">
                      Rank #${esc(player.rank)}
                    </div>

                  </div>

                </div>


                <div style="
                  display:grid;
                  grid-template-columns:1fr 1fr 1fr;
                  gap:8px;
                  margin-top:15px;
                ">

                  <div style="
                    background:#0b0f17;
                    border-radius:10px;
                    padding:10px;
                    text-align:center;
                  ">
                    <div style="
                      color:#8f9bb0;
                      font-size:10px;
                    ">
                      MATCHES
                    </div>

                    <div style="
                      font-size:18px;
                      font-weight:800;
                      margin-top:4px;
                    ">
                      ${esc(player.matches_played ?? 0)}
                    </div>
                  </div>


                  <div style="
                    background:#0b0f17;
                    border-radius:10px;
                    padding:10px;
                    text-align:center;
                  ">
                    <div style="
                      color:#8f9bb0;
                      font-size:10px;
                    ">
                      WINS
                    </div>

                    <div style="
                      font-size:18px;
                      font-weight:800;
                      color:#4ade80;
                      margin-top:4px;
                    ">
                      ${esc(player.wins ?? 0)}
                    </div>
                  </div>


                  <div style="
                    background:#0b0f17;
                    border-radius:10px;
                    padding:10px;
                    text-align:center;
                  ">
                    <div style="
                      color:#8f9bb0;
                      font-size:10px;
                    ">
                      PRIZE
                    </div>

                    <div style="
                      font-size:18px;
                      font-weight:800;
                      color:#60a5fa;
                      margin-top:4px;
                    ">
                      ৳${esc(player.total_prize ?? 0)}
                    </div>
                  </div>

                </div>

              </div>

            `).join("")
          : `
            <div style="
              background:#101521;
              border:1px solid #202838;
              border-radius:14px;
              padding:25px;
              text-align:center;
              color:#8f9bb0;
            ">
              এখনো কোনো ranked player নেই।
            </div>
          `
      }

    </main>
  `);
}
async function submitDepositRequest() {
  if (!currentUser) {
    loginPage();
    return;
  }

  const method =
    document.getElementById("depositMethod").value;

  const amount =
    Number(document.getElementById("depositAmount").value);

  const mobileNumber =
    document.getElementById("depositMobileNumber").value.trim();

  const transactionId =
    document.getElementById("depositTransactionId").value.trim();

  const msg =
    document.getElementById("depositMessage");

  if (!amount || amount < 10) {
    msg.textContent = "Minimum deposit ৳10.";
    return;
  }

  if (!mobileNumber) {
    msg.textContent = "Mobile number দিন।";
    return;
  }

  if (!transactionId) {
    msg.textContent = "Transaction ID দিন।";
    return;
  }

  msg.textContent =
    "Request submit হচ্ছে...";

  const { error } = await db
    .from("payment_requests")
    .insert({
      user_id: currentUser.id,
      method: method,
      amount: amount,
      mobile_number: mobileNumber,
      transaction_id: transactionId,
      status: "pending"
    });

  if (error) {
    console.log(error);

    msg.textContent =
      "Request submit করা যায়নি: " +
      error.message;

    return;
  }

  msg.textContent =
    "Deposit request submitted. Admin approval-এর অপেক্ষায় আছে।";

  document.getElementById("depositAmount").value = "";
  document.getElementById("depositMobileNumber").value = "";
  document.getElementById("depositTransactionId").value = "";

  loadDepositRequests();
}
function copyWalletNumber() {
  const number = "01954732101";

  navigator.clipboard.writeText(number)
    .then(() => {
      alert("Number copied!");
    })
    .catch(() => {
      alert("Number copy করা যায়নি।");
    });
}
async function loadDepositRequests() {
  if (!currentUser) return;

  const box = document.getElementById("depositRequests");
  if (!box) return;

  const { data, error } = await db
    .from("payment_requests")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    box.innerHTML =
      `<div style="color:#ff7185;">Request history load করা যায়নি.</div>`;
    return;
  }

  if (!data?.length) {
    box.innerHTML =
      `<div style="color:#8f9bb0;">এখনো কোনো deposit request নেই।</div>`;
    return;
  }

  box.innerHTML = data.map(r => `
    <div style="
      background:#111722;
      border:1px solid #293346;
      border-radius:12px;
      padding:13px;
      margin-top:10px;
    ">
      <div>
        <b>${esc(r.method || "-")}</b>
        <span style="float:right;">
          ৳${esc(r.amount ?? 0)}
        </span>
      </div>

      <div style="
        color:#8f9bb0;
        font-size:12px;
        margin-top:7px;
      ">
        TxID: ${esc(r.transaction_id || "-")}
      </div>

      <div style="
        color:#f0b44d;
        font-size:12px;
        margin-top:6px;
      ">
        Status: ${esc(r.status || "pending")}
      </div>
    </div>
  `).join("");
}

async function openWallet() {
  currentProfile = await loadProfile();

  app.innerHTML = pageShell(`
    <main style="
      padding:18px 16px 100px;
      max-width:700px;
      margin:auto;
    ">

      <!-- Header -->
      <div style="
        margin-bottom:16px;
      ">
        <div style="
          color:#718097;
          font-size:11px;
          font-weight:800;
          letter-spacing:1.4px;
          margin-bottom:5px;
        ">
          RENIT WALLET
        </div>

        <h2 style="
          margin:0;
          font-size:25px;
        ">
          💰 Wallet
        </h2>
      </div>


      <!-- Balance -->
      <div style="
        background:
          radial-gradient(
            circle at top right,
            #29446c 0%,
            transparent 48%
          ),
          linear-gradient(145deg,#17243a,#0d141f);
        border:1px solid #304666;
        border-radius:20px;
        padding:22px;
        margin-bottom:14px;
        box-shadow:0 12px 30px rgba(0,0,0,.25);
      ">

        <div style="
          color:#91a0b5;
          font-size:11px;
          font-weight:700;
          letter-spacing:.7px;
        ">
          AVAILABLE BALANCE
        </div>

        <div style="
          font-size:36px;
          font-weight:900;
          margin-top:7px;
        ">
          ৳${esc(currentProfile?.balance ?? 0)}
        </div>

        <div style="
          color:#718097;
          font-size:12px;
          margin-top:7px;
        ">
          Your current RENIT wallet balance
        </div>

      <div style="
  margin-top:15px;
">
  <button
    onclick="openWithdrawalForm()"
    style="
      width:100%;
      background:#1e293b;
      color:white;
      border:1px solid #3b4a63;
      border-radius:11px;
      padding:13px;
      font-size:14px;
      font-weight:800;
      cursor:pointer;
    "
  >
    💸 Withdraw Money
  </button>
</div>
<div id="withdrawMessage"></div>

      </div>


      <!-- Deposit -->
      <div style="
        background:#101521;
        border:1px solid #263044;
        border-radius:17px;
        padding:17px;
        margin-bottom:14px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:8px;
        ">

          <div style="
            width:38px;
            height:38px;
            border-radius:11px;
            background:#1a2536;
            border:1px solid #2d3c55;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:19px;
          ">
            💳
          </div>

          <div>
            <div style="
              font-size:18px;
              font-weight:800;
            ">
              Deposit Money
            </div>

            <div style="
              color:#718097;
              font-size:11px;
              margin-top:2px;
            ">
              Add balance to your tournament wallet
            </div>
          </div>

        </div>


        <div style="
  background:#0d131d;
  border:1px solid #30415d;
  border-radius:14px;
  padding:16px;
  margin-top:14px;
  text-align:center;
">

  <div style="
    color:#718097;
    font-size:10px;
    font-weight:800;
    letter-spacing:1px;
    margin-bottom:8px;
  ">
    SEND MONEY
  </div>

  <div style="
    font-size:20px;
    font-weight:900;
    color:white;
  ">
    bKash / Nagad
  </div>

  <div style="
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  margin-top:5px;
">

  <div style="
    font-size:25px;
    font-weight:900;
    letter-spacing:1px;
  ">
    01954732101
  </div>

  <button
    onclick="copyWalletNumber()"
    style="
      background:#1e293b;
      color:white;
      border:1px solid #3b4a63;
      border-radius:9px;
      padding:7px 10px;
      font-size:12px;
      font-weight:800;
      cursor:pointer;
    "
  >
    📋 Copy
  </button>

</div>

<div style="
  color:#9ba6b8;
  font-size:12px;
  margin-top:5px;
">
  Send Money
</div>

</div>


        <!-- Payment Method -->
        <div style="
          margin-top:14px;
        ">

          <div style="
            color:#718097;
            font-size:10px;
            font-weight:800;
            margin-bottom:6px;
          ">
            PAYMENT METHOD
          </div>

          <select id="depositMethod" style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            outline:none;
          ">
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
          </select>

        </div>


        <!-- Amount -->
        <div style="
          margin-top:11px;
        ">

          <div style="
            color:#718097;
            font-size:10px;
            font-weight:800;
            margin-bottom:6px;
          ">
            AMOUNT
          </div>

          <input
            id="depositAmount"
            type="number"
            min="10"
            placeholder="Enter deposit amount"
            style="
              width:100%;
              box-sizing:border-box;
              background:#111722;
              color:white;
              border:1px solid #29364d;
              border-radius:11px;
              padding:13px;
              outline:none;
            "
          >

        </div>


        <!-- Mobile Number -->
<div style="
  margin-top:11px;
">

  <div style="
    color:#718097;
    font-size:10px;
    font-weight:800;
    margin-bottom:6px;
  ">
    MOBILE NUMBER
  </div>

  <input
    id="depositMobileNumber"
    type="tel"
    inputmode="numeric"
    placeholder="Enter your mobile number"
    style="
      width:100%;
      box-sizing:border-box;
      background:#111722;
      color:white;
      border:1px solid #29364d;
      border-radius:11px;
      padding:13px;
      outline:none;
    "
  >

</div>
        
        <!-- Transaction ID -->
        <div style="
          margin-top:11px;
        ">

          <div style="
            color:#718097;
            font-size:10px;
            font-weight:800;
            margin-bottom:6px;
          ">
            TRANSACTION ID
          </div>

          <input
            id="depositTransactionId"
            type="text"
            placeholder="Enter Transaction ID"
            style="
              width:100%;
              box-sizing:border-box;
              background:#111722;
              color:white;
              border:1px solid #29364d;
              border-radius:11px;
              padding:13px;
              outline:none;
            "
          >

        </div>


        ${primaryBtn(
          "Submit Deposit Request",
          "submitDepositRequest()"
        )}


        <div id="depositMessage" style="
          margin-top:11px;
          color:#9ba6b8;
          font-size:12px;
          line-height:1.5;
        "></div>

      </div>


      <!-- Deposit Requests -->
      <div style="
        background:#101521;
        border:1px solid #263044;
        border-radius:17px;
        padding:17px;
        margin-bottom:14px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:9px;
          margin-bottom:13px;
        ">

          <div style="font-size:19px;">
            📋
          </div>

          <div>
            <div style="
              font-size:17px;
              font-weight:800;
            ">
              Deposit Requests
            </div>

            <div style="
              color:#718097;
              font-size:11px;
              margin-top:2px;
            ">
              Your recent deposit requests
            </div>
          </div>

        </div>

        <div id="depositRequests">
          Loading...
        </div>

      </div>


      <!-- Transaction History -->
      <div style="
        background:#101521;
        border:1px solid #263044;
        border-radius:17px;
        padding:17px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:9px;
          margin-bottom:13px;
        ">

          <div style="font-size:19px;">
            🧾
          </div>

          <div>
            <div style="
              font-size:17px;
              font-weight:800;
            ">
              Transaction History
            </div>

            <div style="
              color:#718097;
              font-size:11px;
              margin-top:2px;
            ">
              Your wallet activity
            </div>
          </div>

        </div>

        <div id="transactionHistory">
          Loading...
        </div>

      </div>

    </main>
  `);

  await loadDepositRequests();
  await loadTransactionHistory();
}
function openWithdrawalForm() {
  const box = document.getElementById("withdrawMessage");

  if (box) {
    box.innerHTML = `
      <div style="
        margin-top:14px;
        padding:14px;
        background:#0d131d;
        border:1px solid #30415d;
        border-radius:14px;
      ">

        <div style="
          font-size:16px;
          font-weight:800;
          color:white;
          margin-bottom:12px;
        ">
          💸 Withdraw Money
        </div>

        <div style="
          color:#9ba6b8;
          font-size:12px;
          line-height:1.5;
          margin-bottom:12px;
        ">
          Minimum withdrawal amount is ৳50.
        </div>

        <div style="
          color:#718097;
          font-size:10px;
          font-weight:800;
          margin-bottom:6px;
        ">
          WITHDRAW METHOD
        </div>

        <select
          id="withdrawMethod"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            outline:none;
          "
        >
          <option value="bKash">bKash</option>
          <option value="Nagad">Nagad</option>
        </select>

        <div style="
          margin-top:11px;
          color:#718097;
          font-size:10px;
          font-weight:800;
          margin-bottom:6px;
        ">
          MOBILE NUMBER
        </div>

        <input
          id="withdrawMobileNumber"
          type="tel"
          inputmode="numeric"
          placeholder="Enter your mobile number"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            outline:none;
          "
        >

        <div style="
          margin-top:11px;
          color:#718097;
          font-size:10px;
          font-weight:800;
          margin-bottom:6px;
        ">
          AMOUNT
        </div>

        <input
          id="withdrawAmount"
          type="number"
          min="50"
          placeholder="Enter amount (Minimum ৳50)"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            outline:none;
          "
        >

        <button
          onclick="submitWithdrawalRequest()"
          style="
            width:100%;
            margin-top:13px;
            background:#1e293b;
            color:white;
            border:1px solid #3b4a63;
            border-radius:11px;
            padding:13px;
            font-size:14px;
            font-weight:800;
          "
        >
          Submit Withdrawal Request
        </button>

        <button
          onclick="closeWithdrawalForm()"
          style="
            width:100%;
            margin-top:8px;
            background:transparent;
            color:#94a3b8;
            border:1px solid #29364d;
            border-radius:11px;
            padding:11px;
            font-size:13px;
            font-weight:700;
          "
        >
          Cancel
        </button>

      </div>
    `;
  }
}
async function submitWithdrawalRequest() {
  if (!currentUser) {
    loginPage();
    return;
  }

  const method =
    document.getElementById("withdrawMethod").value;

  const mobileNumber =
    document
      .getElementById("withdrawMobileNumber")
      .value
      .trim();

  const amount =
    Number(
      document.getElementById("withdrawAmount").value
    );

  const box =
    document.getElementById("withdrawMessage");

  if (!mobileNumber) {
    box.textContent = "Mobile number দিন।";
    return;
  }

  if (!amount || amount < 50) {
    box.textContent =
      "Minimum withdrawal amount ৳50.";
    return;
  }

  box.textContent =
    "Withdrawal request submit হচ্ছে...";

  const { data, error } =
    await db.rpc(
      "submit_withdrawal_request",
      {
        p_method: method,
        p_mobile_number: mobileNumber,
        p_amount: amount
      }
    );

  if (error) {
    console.log(error);

    box.textContent =
      "Withdrawal request submit করা যায়নি: " +
      error.message;

    return;
  }

  box.textContent =
    `Withdrawal request submitted successfully. Amount: ৳${amount}. Admin approval-এর অপেক্ষায় আছে।`;

  document.getElementById(
    "withdrawMobileNumber"
  ).value = "";

  document.getElementById(
    "withdrawAmount"
  ).value = "";
}
async function showProfile() {
  currentProfile = await loadProfile();

  const { data: myTournaments, error: myTournamentsError } =
    await db.rpc("get_my_tournaments");

  if (myTournamentsError) {
    console.log(myTournamentsError);
  }

  const tournaments = myTournaments || [];

  const totalJoined = tournaments.length;

  const liveCount = tournaments.filter(
    t => String(t.status || "").toLowerCase() === "live"
  ).length;

  const completedCount = tournaments.filter(
    t => String(t.status || "").toLowerCase() === "completed"
  ).length;

  const upcomingCount = tournaments.filter(
    t => String(t.status || "").toLowerCase() === "upcoming"
  ).length;

    const { data: playerStats, error: playerStatsError } =
    await db.rpc("get_my_player_stats");

  if (playerStatsError) {
    console.log(playerStatsError);
  }

  const stats = playerStats?.[0] || {
    matches_played: 0,
    wins: 0,
    top_three: 0,
    total_prize: 0,
    win_rate: 0
  };

  const username =
    currentProfile?.username ||
    currentUser?.user_metadata?.username ||
    "Player";

  const email = currentUser?.email || "";

  const balance = Number(
    currentProfile?.balance ?? 0
  );

  const firstLetter =
    String(username).charAt(0).toUpperCase();

  const admin = await isAdmin();

  app.innerHTML = pageShell(`
    <main style="
      padding:18px 16px 100px;
      max-width:700px;
      margin:auto;
    ">

      <!-- HEADER -->
      <div style="
        margin-bottom:16px;
      ">
        <div style="
          color:#718097;
          font-size:11px;
          font-weight:800;
          letter-spacing:1.4px;
          margin-bottom:5px;
        ">
          RENIT ACCOUNT
        </div>

        <h2 style="
          margin:0;
          font-size:25px;
        ">
          👤 Profile
        </h2>
      </div>


      <!-- PROFILE CARD -->
      <div style="
        background:
          radial-gradient(
            circle at top right,
            #29446c 0%,
            transparent 48%
          ),
          linear-gradient(145deg,#17243a,#0d141f);
        border:1px solid #304666;
        border-radius:20px;
        padding:20px;
        box-shadow:0 12px 30px rgba(0,0,0,.25);
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:14px;
        ">

          <div style="
            width:64px;
            height:64px;
            min-width:64px;
            border-radius:18px;
            background:#e94560;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:27px;
            font-weight:900;
            box-shadow:0 8px 20px rgba(233,69,96,.25);
          ">
            ${esc(firstLetter)}
          </div>

          <div style="
            min-width:0;
          ">

            <div style="
              color:#718097;
              font-size:10px;
              font-weight:800;
              letter-spacing:1px;
              margin-bottom:4px;
            ">
              PLAYER
            </div>

            <div style="
              font-size:22px;
              font-weight:900;
              word-break:break-word;
            ">
              ${esc(username)}
            </div>

            <div style="
              color:#91a0b5;
              font-size:12px;
              margin-top:5px;
              word-break:break-all;
            ">
              ${esc(email)}
            </div>

          </div>

        </div>

      </div>


      <!-- WALLET -->
      <div style="
        margin-top:14px;
        background:#101521;
        border:1px solid #263044;
        border-radius:17px;
        padding:17px;
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:12px;
        ">

          <div>

            <div style="
              color:#718097;
              font-size:10px;
              font-weight:800;
              letter-spacing:.8px;
            ">
              WALLET BALANCE
            </div>

            <div style="
              font-size:30px;
              font-weight:900;
              margin-top:5px;
            ">
              ৳${esc(balance)}
            </div>

          </div>

          <div style="
            width:40px;
            height:40px;
            border-radius:12px;
            background:#182235;
            border:1px solid #2c3b55;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:19px;
          ">
            💰
          </div>

        </div>

        ${primaryBtn(
          "Open Wallet",
          "openWallet()"
        )}

      </div>


      <!-- PLAYER STATS -->
      <div style="
        margin-top:15px;
        background:#101521;
        border:1px solid #263044;
        border-radius:17px;
        padding:17px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:14px;
        ">

          <div style="
            width:38px;
            height:38px;
            border-radius:11px;
            background:#1a2536;
            border:1px solid #2d3c55;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:19px;
          ">
            📊
          </div>

          <div>
            <div style="
              font-size:18px;
              font-weight:800;
            ">
              Player Stats
            </div>

            <div style="
              color:#718097;
              font-size:11px;
              margin-top:2px;
            ">
              Your tournament performance
            </div>
          </div>

        </div>


        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
        ">

          <!-- MATCHES -->
          <div style="
            background:#0b0f17;
            border:1px solid #202838;
            border-radius:14px;
            padding:14px;
          ">
            <div style="
              color:#718097;
              font-size:10px;
              font-weight:800;
            ">
              MATCHES
            </div>

            <div style="
              font-size:24px;
              font-weight:900;
              margin-top:5px;
            ">
              ${esc(stats.matches_played)}
            </div>
          </div>


          <!-- WINS -->
          <div style="
            background:#0b0f17;
            border:1px solid #202838;
            border-radius:14px;
            padding:14px;
          ">
            <div style="
              color:#718097;
              font-size:10px;
              font-weight:800;
            ">
              WINS
            </div>

            <div style="
              font-size:24px;
              font-weight:900;
              margin-top:5px;
              color:#4ade80;
            ">
              ${esc(stats.wins)}
            </div>
          </div>


          <!-- TOP 3 -->
          <div style="
            background:#0b0f17;
            border:1px solid #202838;
            border-radius:14px;
            padding:14px;
          ">
            <div style="
              color:#718097;
              font-size:10px;
              font-weight:800;
            ">
              TOP 3
            </div>

            <div style="
              font-size:24px;
              font-weight:900;
              margin-top:5px;
            ">
              ${esc(stats.top_three)}
            </div>
          </div>


          <!-- PRIZE -->
          <div style="
            background:#0b0f17;
            border:1px solid #202838;
            border-radius:14px;
            padding:14px;
          ">
            <div style="
              color:#718097;
              font-size:10px;
              font-weight:800;
            ">
              PRIZE WON
            </div>

            <div style="
              font-size:24px;
              font-weight:900;
              margin-top:5px;
              color:#f0b44d;
            ">
              ৳${esc(stats.total_prize)}
            </div>
          </div>

        </div>


        <!-- WIN RATE -->
        <div style="
          margin-top:10px;
          background:#0b0f17;
          border:1px solid #202838;
          border-radius:14px;
          padding:14px;
        ">

          <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
          ">

            <span style="
              color:#718097;
              font-size:10px;
              font-weight:800;
            ">
              WIN RATE
            </span>

            <span style="
              font-size:18px;
              font-weight:900;
              color:#60a5fa;
            ">
              ${esc(stats.win_rate)}%
            </span>

          </div>


          <div style="
            margin-top:9px;
            height:7px;
            background:#182131;
            border-radius:999px;
            overflow:hidden;
          ">

            <div style="
              width:${Math.min(
                Math.max(Number(stats.win_rate) || 0, 0),
                100
              )}%;
              height:100%;
              background:#60a5fa;
              border-radius:999px;
            "></div>

          </div>

        </div>

      </div>


      <!-- MY TOURNAMENTS -->
      <div style="
        margin-top:15px;
        background:#101521;
        border:1px solid #263044;
        border-radius:17px;
        padding:17px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:9px;
          margin-bottom:13px;
        ">

          <div style="font-size:19px;">
            🏆
          </div>

          <div>

            <div style="
              font-size:17px;
              font-weight:800;
            ">
              My Tournaments
            </div>

            <div style="
              color:#718097;
              font-size:11px;
              margin-top:2px;
            ">
              Your joined tournaments
            </div>

          </div>

        </div>


        ${
          tournaments.length
            ? tournaments.map(t => {

                const status =
                  String(t.status || "upcoming")
                    .toLowerCase();

                let statusColor = "#f0b44d";
                let statusIcon = "⏳";

                if (status === "live") {
                  statusColor = "#4ade80";
                  statusIcon = "🔴";
                }

                if (status === "completed") {
                  statusColor = "#60a5fa";
                  statusIcon = "🏆";
                }

                return `
                  <div style="
                    background:#0c121d;
                    border:1px solid #202c40;
                    border-radius:14px;
                    padding:15px;
                    margin-top:10px;
                  ">

                    <div style="
                      display:flex;
                      justify-content:space-between;
                      align-items:flex-start;
                      gap:10px;
                    ">

                      <div style="
                        min-width:0;
                      ">

                        <div style="
                          font-size:16px;
                          font-weight:800;
                          word-break:break-word;
                        ">
                          ${esc(
                            t.tournament_title ||
                            "Tournament"
                          )}
                        </div>

                        <div style="
                          color:#718097;
                          font-size:12px;
                          margin-top:5px;
                        ">
                          ${esc(t.game || "-")}
                        </div>

                      </div>

                      <div style="
                        color:${statusColor};
                        font-size:11px;
                        font-weight:800;
                        white-space:nowrap;
                      ">
                        ${statusIcon} ${esc(status)}
                      </div>

                    </div>


                    <div style="
                      display:flex;
                      justify-content:space-between;
                      gap:10px;
                      margin-top:13px;
                      padding-top:11px;
                      border-top:1px solid #1c2636;
                      color:#91a0b5;
                      font-size:11px;
                    ">

                      <span>
                        Entry ৳${esc(t.entry_fee ?? 0)}
                      </span>

                      <span>
                        ${esc(
                          t.mode ||
                          "Solo"
                        )}
                      </span>

                    </div>

                  </div>
                `;
              }).join("")
            : `
              <div style="
                background:#0c121d;
                border:1px dashed #28364b;
                border-radius:14px;
                padding:20px 14px;
                text-align:center;
              ">

                <div style="
                  font-size:25px;
                  margin-bottom:7px;
                ">
                  🎮
                </div>

                <div style="
                  color:#9ba6b8;
                  font-size:13px;
                ">
                  আপনি এখনো কোনো tournament-এ
                  join করেননি।
                </div>

              </div>
            `
        }

      </div>


      <!-- ADMIN -->
      ${
        admin
          ? `
            <div style="
              margin-top:15px;
            ">
              ${primaryBtn(
                "⚙️ Admin Panel",
                "openAdmin()"
              )}
            </div>
          `
          : ""
      }


      <!-- EDIT PROFILE -->
<div style="
  margin-top:14px;
  background:#101521;
  border:1px solid #263044;
  border-radius:17px;
  padding:17px;
">
  <div style="
    color:#718097;
    font-size:10px;
    font-weight:800;
    letter-spacing:.8px;
    margin-bottom:10px;
  ">
    ACCOUNT SETTINGS
  </div>

  <button
    onclick="openEditProfile()"
    style="
      width:100%;
      padding:14px;
      background:#161d2b;
      color:#ffffff;
      border:1px solid #303b50;
      border-radius:12px;
      font-weight:800;
      font-size:14px;
    "
  >
    ✏️ Edit Profile
  </button>
</div>
      <!-- LOGOUT -->
      <button onclick="logout()" style="
        width:100%;
        margin-top:12px;
        padding:14px;
        background:#111722;
        color:#ff6178;
        border:1px solid #303b50;
        border-radius:12px;
        font-weight:800;
        font-size:14px;
      ">
        🚪 Logout
      </button>

    </main>
  `);
}
async function updateMyProfile(username) {
  const { data, error } = await db.rpc(
    "update_my_profile",
    {
      p_username: username
    }
  );

  if (error) {
    console.log(error);
    alert("Profile update করা যায়নি: " + error.message);
    return;
  }

  if (currentProfile) {
    currentProfile.username = data.username;
  }

  alert("Profile successfully updated!");

  await showProfile();
}
function openEditProfile() {
  const username =
    currentProfile?.username || "";

  const newUsername =
    prompt("নতুন Username দিন:", username);

  if (newUsername === null) {
    return;
  }

  const trimmedUsername =
    newUsername.trim();

  if (!trimmedUsername) {
    alert("Username দিন।");
    return;
  }

  updateMyProfile(trimmedUsername);
}
async function logout() {
  await db.auth.signOut();
  currentUser = null;
  currentProfile = null;
  loginPage();
}

window.home = home;
window.showMatches = showMatches;
window.showGameMatches = showGameMatches;
window.openMatch = openMatch;
window.joinTournament = joinTournament;
window.showResults = showResults;
window.showLeaderboard = showLeaderboard;
window.updateTournamentStatus = updateTournamentStatus;
async function loadTransactionHistory() {
  const box = document.getElementById("transactionHistory");
  if (!box || !currentUser) return;

  const { data, error } = await db
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    box.innerHTML =
      `<div style="color:#ff7185;">
        Transaction history load করা যায়নি: ${esc(error.message)}
      </div>`;
    return;
  }

  if (!data?.length) {
    box.innerHTML =
      `<div style="color:#8f9bb0;">
        কোনো transaction নেই।
      </div>`;
    return;
  }

  box.innerHTML = data.map(t => `
    <div style="
      background:#111722;
      border:1px solid #293346;
      border-radius:12px;
      padding:13px;
      margin-top:10px;
    ">
      <div>
        <b>${esc(t.type || "-")}</b>
        <span style="float:right;">
          ${Number(t.amount) >= 0 ? "+" : ""}৳${esc(t.amount ?? 0)}
        </span>
      </div>

      <div style="
        color:#8f9bb0;
        font-size:12px;
        margin-top:6px;
      ">
        ${esc(t.description || "-")}
      </div>

      <div style="
        color:#8f9bb0;
        font-size:11px;
        margin-top:5px;
      ">
        $${t.created_at ? new Date(t.created_at).toLocaleString("en-US", {
  timeZone: "Asia/Dhaka",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true
}) : "-"}
      </div>
    </div>
  `).join("");
}
async function isAdmin() {
  if (!currentUser) return false;

  const { data, error } = await db
    .from("admin_users")
    .select("user_id")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  return !error && !!data;
}

async function openAdmin() {
  if (!currentUser) {
    loginPage();
    return;
  }

  if (!(await isAdmin())) {
    alert("Admin access denied.");
    return;
  }

  app.innerHTML = pageShell(`
    <main style="
      padding:18px 16px 100px;
      max-width:760px;
      margin:auto;
    ">

      <!-- HEADER -->
      <div style="
        margin-bottom:16px;
      ">

        <div style="
          color:#718097;
          font-size:11px;
          font-weight:800;
          letter-spacing:1.5px;
          margin-bottom:5px;
        ">
          RENIT CONTROL CENTER
        </div>

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        ">

          <h2 style="
            margin:0;
            font-size:25px;
          ">
            ⚙️ Admin Dashboard
          </h2>

          <div style="
            background:#14251d;
            border:1px solid #28543b;
            color:#4ade80;
            padding:6px 9px;
            border-radius:9px;
            font-size:10px;
            font-weight:800;
          ">
            OWNER
          </div>

        </div>

        <div style="
          color:#718097;
          font-size:12px;
          margin-top:6px;
        ">
          Manage tournaments, payments, rooms and results
        </div>

      </div>


      <!-- CREATE TOURNAMENT -->
      <div style="
        background:#101521;
        border:1px solid #263044;
        border-radius:18px;
        padding:17px;
        margin-bottom:14px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:14px;
        ">

          <div style="
            width:40px;
            height:40px;
            border-radius:12px;
            background:#182235;
            border:1px solid #2c3b55;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:19px;
          ">
            🎮
          </div>

          <div>
            <div style="
              font-size:18px;
              font-weight:800;
            ">
              Create Tournament
            </div>

            <div style="
              color:#718097;
              font-size:11px;
              margin-top:2px;
            ">
              Create a new tournament
            </div>
          </div>

        </div>


        <input
          id="tournamentTitle"
          type="text"
          placeholder="Tournament title"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            outline:none;
          "
        >


        <select
          id="tournamentGame"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >
          <option value="BR MATCH">BR MATCH</option>
          <option value="BR-DUO">BR-DUO</option>
          <option value="FREE FIRE">FREE FIRE</option>
          <option value="CS 4 VS 4">CS 4 VS 4</option>
          <option value="LONE WOLF">LONE WOLF</option>
          <option value="SPECIAL MATCH">SPECIAL MATCH</option>
          <option value="CUSTOM 2VS2 HEADSHOOT">CUSTOM 2VS2 HEADSHOOT</option>
          <option value="LONE WOLF HEADSHOOT">LONE WOLF HEADSHOOT</option>
          <option value="LOST TO WIN">LOST TO WIN</option>
          <option value="FREE MATCH">FREE MATCH</option>
        </select>


        <input
          id="tournamentMode"
          type="text"
          value="Solo"
          placeholder="Mode"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >


        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
          margin-top:10px;
        ">

          <input
            id="tournamentEntryFee"
            type="number"
            min="0"
            placeholder="Entry fee"
            style="
              width:100%;
              box-sizing:border-box;
              background:#111722;
              color:white;
              border:1px solid #29364d;
              border-radius:11px;
              padding:13px;
              outline:none;
            "
          >

          <input
            id="tournamentPrizePool"
            type="number"
            min="0"
            placeholder="Prize pool"
            style="
              width:100%;
              box-sizing:border-box;
              background:#111722;
              color:white;
              border:1px solid #29364d;
              border-radius:11px;
              padding:13px;
              outline:none;
            "
          >

        </div>


        <input
          id="tournamentMaxPlayers"
          type="number"
          min="1"
          placeholder="Maximum players"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >


        <input
          id="tournamentStartTime"
          type="datetime-local"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >


        ${primaryBtn(
          "Create Tournament",
          "createTournament()"
        )}


        <div
          id="createTournamentMessage"
          style="
            margin-top:10px;
            color:#9ba6b8;
            font-size:12px;
            line-height:1.5;
          "
        ></div>

      </div>


            <!-- EDIT TOURNAMENT -->
      <div style="
        background:#101521;
        border:1px solid #263044;
        border-radius:18px;
        padding:17px;
        margin-bottom:14px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:14px;
        ">

          <div style="
            width:40px;
            height:40px;
            border-radius:12px;
            background:#182235;
            border:1px solid #2c3b55;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:19px;
          ">
            ✏️
          </div>

          <div>
            <div style="
              font-size:18px;
              font-weight:800;
            ">
              Edit Tournament
            </div>

            <div style="
              color:#718097;
              font-size:11px;
              margin-top:2px;
            ">
              Update tournament information
            </div>
          </div>

        </div>

        <select
          id="editTournamentId"
          onchange="loadEditTournamentData()"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            outline:none;
          "
        >
          <option value="">
            Loading tournaments...
          </option>
        </select>

        <input
          id="editTournamentTitle"
          type="text"
          placeholder="Tournament title"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >

        <select
          id="editTournamentGame"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >
          <option value="BR MATCH">BR MATCH</option>
          <option value="BR-DUO">BR-DUO</option>
          <option value="FREE FIRE">FREE FIRE</option>
          <option value="CS 4 VS 4">CS 4 VS 4</option>
          <option value="LONE WOLF">LONE WOLF</option>
          <option value="SPECIAL MATCH">SPECIAL MATCH</option>
          <option value="CUSTOM 2VS2 HEADSHOOT">CUSTOM 2VS2 HEADSHOOT</option>
          <option value="LONE WOLF HEADSHOOT">LONE WOLF HEADSHOOT</option>
          <option value="LOST TO WIN">LOST TO WIN</option>
          <option value="FREE MATCH">FREE MATCH</option>
        </select>

        <input
          id="editTournamentMode"
          type="text"
          placeholder="Mode"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
          margin-top:10px;
        ">

          <input
            id="editTournamentEntryFee"
            type="number"
            min="0"
            placeholder="Entry fee"
            style="
              width:100%;
              box-sizing:border-box;
              background:#111722;
              color:white;
              border:1px solid #29364d;
              border-radius:11px;
              padding:13px;
              outline:none;
            "
          >

          <input
            id="editTournamentPrizePool"
            type="number"
            min="0"
            placeholder="Prize pool"
            style="
              width:100%;
              box-sizing:border-box;
              background:#111722;
              color:white;
              border:1px solid #29364d;
              border-radius:11px;
              padding:13px;
              outline:none;
            "
          >

        </div>

        <input
          id="editTournamentMaxPlayers"
          type="number"
          min="1"
          placeholder="Maximum players"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >

        <input
          id="editTournamentStartTime"
          type="datetime-local"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >

        ${primaryBtn(
          "Update Tournament",
          "updateTournament()"
        )}

        <div
          id="editTournamentMessage"
          style="
            margin-top:10px;
            color:#9ba6b8;
            font-size:12px;
            line-height:1.5;
          "
        ></div>

      </div>
      


      <!-- ROOM INFORMATION -->
      <div style="
        background:#101521;
        border:1px solid #263044;
        border-radius:18px;
        padding:17px;
        margin-bottom:14px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:13px;
        ">

          <div style="
            width:40px;
            height:40px;
            border-radius:12px;
            background:#182235;
            border:1px solid #2c3b55;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:19px;
          ">
            🔑
          </div>

          <div>
            <div style="
              font-size:18px;
              font-weight:800;
            ">
              Publish Room Information
            </div>

            <div style="
              color:#718097;
              font-size:11px;
              margin-top:2px;
            ">
              Give joined players their room details
            </div>
          </div>

        </div>


        <select
          id="roomTournamentId"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            outline:none;
          "
        >
          <option value="">
            Loading tournaments...
          </option>
        </select>


        <input
          id="roomIdInput"
          type="text"
          placeholder="Room ID"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >


        <input
          id="roomPasswordInput"
          type="text"
          placeholder="Room Password"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >


        ${primaryBtn(
          "Publish Room",
          "publishTournamentRoom()"
        )}


        <div
          id="roomPublishMessage"
          style="
            margin-top:10px;
            color:#9ba6b8;
            font-size:12px;
          "
        ></div>

      </div>


      <!-- TOURNAMENT STATUS -->
      <div style="
        background:#101521;
        border:1px solid #263044;
        border-radius:18px;
        padding:17px;
        margin-bottom:14px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:13px;
        ">

          <div style="
            width:40px;
            height:40px;
            border-radius:12px;
            background:#182235;
            border:1px solid #2c3b55;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:19px;
          ">
            📡
          </div>

          <div>
            <div style="
              font-size:18px;
              font-weight:800;
            ">
              Tournament Status
            </div>

            <div style="
              color:#718097;
              font-size:11px;
              margin-top:2px;
            ">
              Control tournament availability
            </div>
          </div>

        </div>


        <select
          id="statusTournamentId"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            outline:none;
          "
        >
          <option value="">
            Loading tournaments...
          </option>
        </select>


        <select
          id="tournamentStatus"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >
          <option value="">
            Select status
          </option>
          <option value="upcoming">
            Upcoming
          </option>
          <option value="live">
            Live
          </option>
          <option value="completed">
            Completed
          </option>
        </select>


        ${primaryBtn(
          "Update Status",
          "updateTournamentStatus()"
        )}


        <div
          id="statusUpdateMessage"
          style="
            margin-top:10px;
            color:#9ba6b8;
            font-size:12px;
          "
        ></div>

      </div>


      <!-- TOURNAMENT PLAYERS -->
<section style="
  margin-top:18px;
  background:#111827;
  border:1px solid #263247;
  border-radius:16px;
  padding:16px;
">
  <h3 style="margin:0 0 12px;">👥 Tournament Players</h3>

  <select
    id="playersTournamentId"
    onchange="loadAdminTournamentPlayers()"
    style="
      width:100%;
      padding:12px;
      border-radius:10px;
      border:1px solid #334155;
      background:#0f172a;
      color:white;
    "
  >
    <option value="">Select Tournament</option>
  </select>

  <div
    id="adminTournamentPlayers"
    style="margin-top:14px;"
  >
    Select a tournament to view players.
  </div>
</section>
      <!-- TOURNAMENT RESULTS -->
      <div style="
        background:#101521;
        border:1px solid #263044;
        border-radius:18px;
        padding:17px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:13px;
        ">

          <div style="
            width:40px;
            height:40px;
            border-radius:12px;
            background:#182235;
            border:1px solid #2c3b55;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:19px;
          ">
            🏆
          </div>

          <div>
            <div style="
              font-size:18px;
              font-weight:800;
            ">
              Tournament Results
            </div>

            <div style="
              color:#718097;
              font-size:11px;
              margin-top:2px;
            ">
              Publish player positions and prizes
            </div>
          </div>

        </div>


        <select
          id="resultTournamentId"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            outline:none;
          "
        >
          <option value="">
            Loading tournaments...
          </option>
        </select>


        <select
          id="resultPlayerId"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >
          <option value="">
            Select player
          </option>
        </select>


        <select
          id="resultPosition"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >
          <option value="">
            Select position
          </option>
          <option value="1">
            1st Place
          </option>
          <option value="2">
            2nd Place
          </option>
          <option value="3">
            3rd Place
          </option>
        </select>


        <input
          id="resultPrizeAmount"
          type="number"
          min="0"
          placeholder="Prize Amount"
          style="
            width:100%;
            box-sizing:border-box;
            background:#111722;
            color:white;
            border:1px solid #29364d;
            border-radius:11px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >


        ${primaryBtn(
          "Save Result",
          "saveTournamentResult()"
        )}


        <div
          id="resultSaveMessage"
          style="
            margin-top:10px;
            color:#9ba6b8;
            font-size:12px;
          "
        ></div>

      </div>

      <!-- DEPOSIT REQUESTS -->
      <div style="
        background:#101521;
        border:1px solid #263044;
        border-radius:18px;
        padding:17px;
        margin-bottom:14px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:13px;
        ">

          <div style="
            width:40px;
            height:40px;
            border-radius:12px;
            background:#182235;
            border:1px solid #2c3b55;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:19px;
          ">
            💳
          </div>

          <div>
            <div style="
              font-size:18px;
              font-weight:800;
            ">
              Deposit Requests
            </div>

            <div style="
              color:#718097;
              font-size:11px;
              margin-top:2px;
            ">
              Review player payment requests
            </div>
          </div>

        </div>

        <div id="adminDepositRequests">
          Loading...
        </div>

      </div>

      <!-- WITHDRAWAL REQUESTS -->
<section style="
  margin-top:18px;
  background:#111827;
  border:1px solid #263247;
  border-radius:16px;
  padding:16px;
">

  <div style="
    display:flex;
    align-items:center;
    gap:9px;
    margin-bottom:13px;
  ">

    <div style="font-size:19px;">
      💸
    </div>

    <div>
      <div style="
        font-size:17px;
        font-weight:800;
      ">
        Withdrawal Requests
      </div>

      <div style="
        color:#718097;
        font-size:11px;
        margin-top:2px;
      ">
        Manage player withdrawal requests
      </div>
    </div>

  </div>

  <div id="adminWithdrawalRequests">
    Loading...
  </div>

</section>

    </main>
  `);

  await loadAdminDepositRequests();
  await loadRoomTournaments();
  await loadResultTournaments();
  await loadStatusTournaments();
  await loadEditTournaments();
  await loadPlayersTournamentList();
  await loadAdminWithdrawalRequests();
}
async function loadAdminWithdrawalRequests() {
  const box =
    document.getElementById("adminWithdrawalRequests");

  if (!box) return;

  box.innerHTML = "Loading withdrawal requests...";

  const { data, error } = await db.rpc(
    "get_admin_withdrawal_requests"
  );

  if (error) {
    console.log(error);

    box.innerHTML =
      "Withdrawal requests load করা যায়নি: " +
      esc(error.message);

    return;
  }

  if (!data || data.length === 0) {
    box.innerHTML = `
      <div style="
        padding:10px;
        background:#0f172a;
        border-radius:8px;
        color:#94a3b8;
        font-size:13px;
      ">
        No withdrawal requests yet.
      </div>
    `;

    return;
  }

  box.innerHTML = data.map(request => `
    <div style="
      background:#0f172a;
      border:1px solid #263247;
      border-radius:10px;
      padding:11px;
      margin-bottom:7px;
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        gap:8px;
        margin-bottom:7px;
      ">

        <div style="
          font-size:13px;
          font-weight:800;
          color:white;
        ">
          👤 ${esc(request.username || "Unknown")}
        </div>

        <div style="
          font-size:12px;
          font-weight:800;
          color:#fbbf24;
        ">
          ৳${esc(request.amount)}
        </div>

      </div>

      <div style="
        color:#cbd5e1;
        font-size:12px;
        line-height:1.6;
      ">
        📧 ${esc(request.email || "No email")}<br>
        💳 ${esc(request.method)}<br>
        📱 ${esc(request.mobile_number)}
      </div>

      <div style="
        margin-top:7px;
        color:#94a3b8;
        font-size:11px;
      ">
        Status: ${esc(request.status)}
      </div>

    ${request.status === "pending" ? `
  <div style="
    display:flex;
    gap:8px;
    margin-top:10px;
  ">

    <button
      onclick="processWithdrawalRequest(${request.id}, 'approve')"
      style="
        flex:1;
        background:#1f5135;
        color:white;
        border:1px solid #34734d;
        border-radius:9px;
        padding:10px;
        font-size:12px;
        font-weight:800;
      "
    >
      ✅ Approve
    </button>

    <button
      onclick="processWithdrawalRequest(${request.id}, 'reject')"
      style="
        flex:1;
        background:#51252b;
        color:white;
        border:1px solid #78353e;
        border-radius:9px;
        padding:10px;
        font-size:12px;
        font-weight:800;
      "
    >
      ❌ Reject
    </button>

  </div>
` : ""}
    </div>
  `).join("");
}

async function processWithdrawalRequest(
  requestId,
  action
) {
  const actionText =
    action === "approve"
      ? "approve"
      : "reject";

  const confirmed = confirm(
    `এই withdrawal request ${actionText} করতে চান?`
  );

  if (!confirmed) return;

  const { data, error } =
    await db.rpc(
      "process_withdrawal_request",
      {
        p_request_id: Number(requestId),
        p_action: action
      }
    );

  if (error) {
    console.log(error);

    alert(
      "Withdrawal process করা যায়নি: " +
      error.message
    );

    return;
  }

  alert(
    action === "approve"
      ? "Withdrawal approved successfully!"
      : "Withdrawal rejected successfully!"
  );

  await loadAdminWithdrawalRequests();
}
async function loadAdminTournamentPlayers() {
  const select = document.getElementById("playersTournamentId");
  const box = document.getElementById("adminTournamentPlayers");

  if (!select || !box) return;

  const tournamentId = select.value;

  if (!tournamentId) {
    box.innerHTML = "Select a tournament to view players.";
    return;
  }

  box.innerHTML = "Loading players...";

  const { data, error } = await db.rpc(
    "get_admin_tournament_players",
    {
      p_tournament_id: Number(tournamentId)
    }
  );

  if (error) {
    console.log(error);
    box.innerHTML =
      "Players load করা যায়নি: " + esc(error.message);
    return;
  }

  if (!data || data.length === 0) {
    box.innerHTML = `
      <div style="
        padding:10px;
        background:#0f172a;
        border-radius:8px;
        color:#94a3b8;
        font-size:13px;
      ">
        No players joined this tournament yet.
      </div>
    `;
    return;
  }

  box.innerHTML = `
    <div style="
      margin-bottom:8px;
      color:#94a3b8;
      font-size:12px;
    ">
      👥 Registered: ${data.length}
    </div>

    ${data.map((player, index) => `
      <div style="
        background:#0f172a;
        border:1px solid #263247;
        border-radius:9px;
        padding:9px 10px;
        margin-bottom:6px;
      ">

        <div style="
          display:flex;
          align-items:center;
          gap:8px;
          margin-bottom:6px;
        ">

          <div style="
            width:24px;
            height:24px;
            border-radius:50%;
            background:#1e293b;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:11px;
            font-weight:700;
            flex-shrink:0;
          ">
            ${index + 1}
          </div>

          <div style="
            font-size:12px;
            font-weight:700;
            color:white;
          ">
            Player #${index + 1}
          </div>

        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr;
          gap:3px;
          font-size:12px;
        ">

          <div style="
            color:#cbd5e1;
            word-break:break-word;
          ">
            🎮 <b>Game:</b>
            ${esc(player.game_name || "Not provided")}
          </div>

          <div style="
            color:#cbd5e1;
            word-break:break-word;
          ">
            👤 <b>User:</b>
            ${esc(player.username || "Unknown")}
          </div>

          <div style="
            color:#94a3b8;
            word-break:break-all;
          ">
            📧 <b>Email:</b>
            ${esc(player.email || "No email")}
          </div>

        </div>

      </div>
    `).join("")}
  `;
}
async function loadPlayersTournamentList() {
  const select = document.getElementById("playersTournamentId");

  if (!select) return;

  const { data, error } = await db
    .from("tournaments")
    .select("id, title")
    .order("id", { ascending: false });

  if (error) {
    console.log(error);
    return;
  }

  select.innerHTML = `
    <option value="">Select Tournament</option>
    ${(data || []).map(t => `
      <option value="${t.id}">
        ${esc(t.title || "Tournament #" + t.id)}
      </option>
    `).join("")}
  `;
}
async function loadEditTournaments() {
  const select =
    document.getElementById("editTournamentId");

  if (!select) return;

  const { data, error } = await db
    .from("tournaments")
    .select(`
      id,
      title,
      game,
      mode,
      entry_fee,
      prize_pool,
      max_players,
      start_time
    `)
    .order("start_time", {
      ascending: false,
      nullsFirst: false
    });

  if (error) {
    console.log(error);
    select.innerHTML = `
      <option value="">
        Failed to load tournaments
      </option>
    `;
    return;
  }

  if (!data || !data.length) {
    select.innerHTML = `
      <option value="">
        No tournaments found
      </option>
    `;
    return;
  }

  select.innerHTML = `
    <option value="">
      Select tournament
    </option>
    ${data.map(t => `
      <option value="${esc(t.id)}">
        ${esc(t.title)}
      </option>
    `).join("")}
  `;
}


async function loadEditTournamentData() {
  const id =
    document.getElementById("editTournamentId")?.value;

  if (!id) return;

  const { data, error } = await db
    .from("tournaments")
    .select(`
      id,
      title,
      game,
      mode,
      entry_fee,
      prize_pool,
      max_players,
      start_time
    `)
    .eq("id", Number(id))
    .maybeSingle();

  if (error) {
    console.log(error);
    return;
  }

  if (!data) return;

  document.getElementById(
    "editTournamentTitle"
  ).value = data.title || "";

  document.getElementById(
    "editTournamentGame"
  ).value = data.game || "BR MATCH";

  document.getElementById(
    "editTournamentMode"
  ).value = data.mode || "Solo";

  document.getElementById(
    "editTournamentEntryFee"
  ).value = data.entry_fee ?? 0;

  document.getElementById(
    "editTournamentPrizePool"
  ).value = data.prize_pool ?? 0;

  document.getElementById(
    "editTournamentMaxPlayers"
  ).value = data.max_players ?? 1;

  if (data.start_time) {
    const date = new Date(data.start_time);

    const local =
      new Date(
        date.getTime() -
        date.getTimezoneOffset() * 60000
      )
      .toISOString()
      .slice(0, 16);

    document.getElementById(
      "editTournamentStartTime"
    ).value = local;
  } else {
    document.getElementById(
      "editTournamentStartTime"
    ).value = "";
  }
}
async function updateTournament() {
  if (!(await isAdmin())) {
    alert("Admin access denied.");
    return;
  }

  const tournamentId =
    document.getElementById("editTournamentId").value;

  const title =
    document.getElementById("editTournamentTitle").value.trim();

  const game =
    document.getElementById("editTournamentGame").value;

  const mode =
    document.getElementById("editTournamentMode").value.trim();

  const entryFee =
    Number(
      document.getElementById("editTournamentEntryFee").value
    );

  const prizePool =
    Number(
      document.getElementById("editTournamentPrizePool").value
    );

  const maxPlayers =
    Number(
      document.getElementById("editTournamentMaxPlayers").value
    );

  const startTime =
    document.getElementById("editTournamentStartTime").value;

  const msg =
    document.getElementById("editTournamentMessage");


  if (!tournamentId) {
    msg.textContent = "Tournament select করুন।";
    return;
  }

  if (!title) {
    msg.textContent = "Tournament title দিন।";
    return;
  }

  if (!game) {
    msg.textContent = "Game select করুন।";
    return;
  }

  if (!mode) {
    msg.textContent = "Mode দিন।";
    return;
  }

  if (!Number.isFinite(entryFee) || entryFee < 0) {
    msg.textContent = "Entry fee ভুল।";
    return;
  }

  if (!Number.isFinite(prizePool) || prizePool < 0) {
    msg.textContent = "Prize pool ভুল।";
    return;
  }

  if (!Number.isInteger(maxPlayers) || maxPlayers < 1) {
    msg.textContent = "Maximum players ভুল।";
    return;
  }

  msg.textContent = "Tournament update হচ্ছে...";


  const { data, error } =
    await db.rpc(
      "admin_update_tournament",
      {
        p_tournament_id: Number(tournamentId),
        p_title: title,
        p_game: game,
        p_mode: mode,
        p_entry_fee: entryFee,
        p_prize_pool: prizePool,
        p_max_players: maxPlayers,
        p_start_time: startTime
          ? new Date(startTime).toISOString()
          : null
      }
    );


  if (error) {
    console.log(error);

    msg.textContent =
      "Update করা যায়নি: " + error.message;

    return;
  }


  msg.textContent =
    "Tournament successfully updated!";

  await loadEditTournaments();
}
async function loadStatusTournaments() {
  const select =
    document.getElementById("statusTournamentId");

  if (!select) return;

  const { data, error } = await db
    .from("tournaments")
    .select("id, title")
    .order("created_at", { ascending: false });

  if (error) {
    select.innerHTML =
      `<option value="">Tournament load করা যায়নি</option>`;
    return;
  }

  if (!data?.length) {
    select.innerHTML =
      `<option value="">কোনো tournament নেই</option>`;
    return;
  }

  select.innerHTML =
    `<option value="">Tournament select করুন</option>` +
    data.map(t => `
      <option value="${esc(t.id)}">
        ${esc(t.title || "Tournament #" + t.id)}
      </option>
    `).join("");
}
async function updateTournamentStatus() {
  if (!(await isAdmin())) {
    alert("Admin access denied.");
    return;
  }

  const tournamentId =
    document.getElementById("statusTournamentId").value;

  const status =
    document.getElementById("tournamentStatus").value;

  const msg =
    document.getElementById("statusUpdateMessage");

  if (!tournamentId) {
    msg.textContent = "Tournament select করুন।";
    return;
  }

  if (!status) {
    msg.textContent = "Status select করুন।";
    return;
  }

  msg.textContent = "Status update হচ্ছে...";

  const { data, error } = await db.rpc(
    "update_tournament_status",
    {
      p_tournament_id: Number(tournamentId),
      p_status: status
    }
  );

  if (error) {
    console.log(error);
    msg.textContent =
      "Status update করা যায়নি: " + error.message;
    return;
  }

  msg.textContent =
    "Tournament status successfully updated!";
}
async function loadRoomTournaments() {
  const select = document.getElementById("roomTournamentId");
  if (!select) return;

  const { data, error } = await db
    .from("tournaments")
    .select("id, title, game")
    .order("created_at", { ascending: false });

  if (error) {
    select.innerHTML =
      `<option value="">Tournament load করা যায়নি</option>`;
    return;
  }

  if (!data?.length) {
    select.innerHTML =
      `<option value="">কোনো tournament নেই</option>`;
    return;
  }

  select.innerHTML =
    `<option value="">Tournament select করুন</option>` +
    data.map(t => `
      <option value="${esc(t.id)}">
        ${esc(t.title || "Tournament #" + t.id)}
      </option>
    `).join("");
}
async function loadResultTournaments() {
  const select =
    document.getElementById("resultTournamentId");

  if (!select) return;

  const { data, error } = await db
    .from("tournaments")
    .select("id, title, game")
    .order("created_at", { ascending: false });

  if (error) {
    select.innerHTML =
      `<option value="">Tournament load করা যায়নি</option>`;
    return;
  }

  if (!data?.length) {
    select.innerHTML =
      `<option value="">কোনো tournament নেই</option>`;
    return;
  }

  select.innerHTML =
    `<option value="">Tournament select করুন</option>` +
    data.map(t => `
      <option value="${esc(t.id)}">
        ${esc(t.title || "Tournament #" + t.id)}
      </option>
    `).join("");
  select.onchange = loadResultPlayers;
}
async function loadResultPlayers() {
  const tournamentSelect =
    document.getElementById("resultTournamentId");

  const playerSelect =
    document.getElementById("resultPlayerId");

  if (!tournamentSelect || !playerSelect) return;

  const tournamentId = tournamentSelect.value;

  if (!tournamentId) {
    playerSelect.innerHTML =
      `<option value="">Select player</option>`;
    return;
  }

  playerSelect.innerHTML =
    `<option value="">Loading players...</option>`;

  const { data: registrations, error: regError } =
    await db
      .from("registrations")
      .select("user_id")
      .eq("tournament_id", Number(tournamentId));

  if (regError) {
    playerSelect.innerHTML =
      `<option value="">Player load করা যায়নি</option>`;
    return;
  }

  if (!registrations?.length) {
    playerSelect.innerHTML =
      `<option value="">কোনো player join করেনি</option>`;
    return;
  }

  const userIds =
    registrations.map(r => r.user_id);

  const { data: players, error: playerError } =
  await db.rpc(
    "get_admin_tournament_players",
    {
      p_tournament_id: Number(tournamentId)
    }
  );

  if (playerError) {
    playerSelect.innerHTML =
      `<option value="">Player load করা যায়নি</option>`;
    return;
  }

  playerSelect.innerHTML =
    `<option value="">Select player</option>` +
    (players || []).map(p => `
      <option value="${esc(p.user_id)}">
        ${esc(p.username || p.email || "Player")}
      </option>
    `).join("");
}
async function saveTournamentResult() {
  if (!(await isAdmin())) {
    alert("Admin access denied.");
    return;
  }

  const tournamentId =
    document.getElementById("resultTournamentId").value;

  const playerId =
    document.getElementById("resultPlayerId").value;

  const position =
    document.getElementById("resultPosition").value;

  const prizeAmount =
    Number(document.getElementById("resultPrizeAmount").value);

  const msg =
    document.getElementById("resultSaveMessage");

  if (!tournamentId) {
    msg.textContent = "Tournament select করুন।";
    return;
  }

  if (!playerId) {
    msg.textContent = "Player select করুন।";
    return;
  }

  if (!position) {
    msg.textContent = "Position select করুন।";
    return;
  }

  if (prizeAmount < 0) {
    msg.textContent = "Prize amount ভুল।";
    return;
  }

  msg.textContent = "Result save হচ্ছে...";

  const { data, error } = await db.rpc(
    "save_tournament_result",
    {
      p_tournament_id: Number(tournamentId),
      p_user_id: playerId,
      p_position: Number(position),
      p_prize_amount: prizeAmount
    }
  );

  if (error) {
    console.log(error);
    msg.textContent =
      "Save করা যায়নি: " + error.message;
    return;
  }

  msg.textContent =
    "Tournament result successfully saved!";

  document.getElementById("resultPrizeAmount").value = "";
}
async function publishTournamentRoom() {
  if (!(await isAdmin())) {
    alert("Admin access denied.");
    return;
  }

  const tournamentId =
    document.getElementById("roomTournamentId").value;

  const roomId =
    document.getElementById("roomIdInput").value.trim();

  const roomPassword =
    document.getElementById("roomPasswordInput").value.trim();

  const msg =
    document.getElementById("roomPublishMessage");

  if (!tournamentId) {
    msg.textContent = "Tournament select করুন।";
    return;
  }

  if (!roomId || !roomPassword) {
    msg.textContent = "Room ID এবং Password দুটোই দিন।";
    return;
  }

  msg.textContent = "Room information publish হচ্ছে...";

  const { data, error } = await db.rpc(
    "publish_tournament_room",
    {
      p_tournament_id: Number(tournamentId),
      p_room_id: roomId,
      p_room_password: roomPassword
    }
  );

  if (error) {
    console.log(error);
    msg.textContent =
      "Publish করা যায়নি: " + error.message;
    return;
  }

  msg.textContent =
    "Room ID এবং Password successfully published!";

  document.getElementById("roomIdInput").value = "";
  document.getElementById("roomPasswordInput").value = "";
}

async function createTournament() {
  if (!(await isAdmin())) {
    alert("Admin access denied.");
    return;
  }

  const title =
    document.getElementById("tournamentTitle").value.trim();

  const game =
    document.getElementById("tournamentGame").value;

  const mode =
    document.getElementById("tournamentMode").value.trim() || "Solo";

  const entryFee =
    Number(document.getElementById("tournamentEntryFee").value);

  const prizePool =
    Number(document.getElementById("tournamentPrizePool").value);

  const maxPlayers =
    Number(document.getElementById("tournamentMaxPlayers").value);

  const startTime =
    document.getElementById("tournamentStartTime").value;

  const message =
    document.getElementById("createTournamentMessage");

  if (!title) {
    message.textContent = "Tournament title দিন।";
    return;
  }

  if (entryFee < 0 || prizePool < 0) {
    message.textContent = "Fee বা prize negative হতে পারবে না।";
    return;
  }

  if (!maxPlayers || maxPlayers <= 0) {
    message.textContent = "Maximum players দিন।";
    return;
  }

  message.textContent = "Tournament তৈরি হচ্ছে...";

  const { data, error } = await db.rpc(
    "create_tournament",
    {
      p_title: title,
      p_game: game,
      p_mode: mode,
      p_entry_fee: entryFee,
      p_prize_pool: prizePool,
      p_max_players: maxPlayers,
      p_start_time: startTime
        ? new Date(startTime).toISOString()
        : null,
      p_status: "upcoming"
    }
  );

  if (error) {
    console.log(error);
    message.textContent =
      "Tournament তৈরি করা যায়নি: " + error.message;
    return;
  }

  message.textContent =
    `Tournament created successfully! ID: ${data}`;

  document.getElementById("tournamentTitle").value = "";
  document.getElementById("tournamentEntryFee").value = "";
  document.getElementById("tournamentPrizePool").value = "";
  document.getElementById("tournamentMaxPlayers").value = "";
  document.getElementById("tournamentStartTime").value = "";
}
async function loadAdminDepositRequests() {
  const box = document.getElementById("adminDepositRequests");
  if (!box) return;

  const { data, error } = await db
    .from("payment_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    box.innerHTML =
      `<div style="color:#ff7185;">
        Request load করা যায়নি: ${esc(error.message)}
      </div>`;
    return;
  }

  if (!data?.length) {
    box.innerHTML =
      `<div style="color:#8f9bb0;">
        কোনো deposit request নেই।
      </div>`;
    return;
  }

  box.innerHTML = data.map(r => `
    <div style="
      background:#111722;
      border:1px solid #293346;
      border-radius:12px;
      padding:14px;
      margin-top:10px;
    ">
      <div>
        <b>${esc(r.method || "-")}</b>
        <span style="float:right;">
          ৳${esc(r.amount ?? 0)}
        </span>
      </div>

      <div style="
        color:#8f9bb0;
        font-size:12px;
        margin-top:7px;
      ">
        TxID: ${esc(r.transaction_id || "-")}
      </div>

      <div style="
        color:#8f9bb0;
        font-size:12px;
        margin-top:5px;
      ">
        User: ${esc(r.user_id || "-")}
      </div>

      <div style="
        color:#f0b44d;
        font-size:12px;
        margin-top:6px;
      ">
        Status: ${esc(r.status || "pending")}
      </div>

      ${
        r.status === "pending"
          ? primaryBtn(
              "Approve Deposit",
              `approveDeposit(${r.id})`
            )
          : ""
      }
    </div>
  `).join("");
}

async function approveDeposit(requestId) {
  if (!(await isAdmin())) {
    alert("Admin access denied.");
    return;
  }

  if (!confirm("এই deposit request approve করবেন?")) {
    return;
  }

  const { data, error } = await db.rpc(
    "approve_deposit",
    {
      p_request_id: requestId
    }
  );

  if (error) {
    alert("Approve করা যায়নি: " + error.message);
    return;
  }

  alert(
    `Deposit approved successfully! Amount: ৳${data.amount}`
  );

  await loadAdminDepositRequests();
}
window.openAdmin = openAdmin;
window.openWallet = openWallet;
window.saveTournamentResult = saveTournamentResult;
window.publishTournamentRoom = publishTournamentRoom;
window.submitDepositRequest = submitDepositRequest;
window.showProfile = showProfile;
window.login = login;
window.signup = signup;
window.signupPage = signupPage;
window.loginPage = loginPage;
window.logout = logout;

window.addEventListener("error", function(event) {
  console.error(event.error || event.message);
});

db.auth.onAuthStateChange(async (_event, session) => {
  currentUser = session?.user || null;

  if (currentUser) {
    currentProfile = await loadProfile();
  }
});

startApp().catch(error => {
  console.error(error);
  showError(
    "App চালু করতে সমস্যা হয়েছে।<br><br>" +
    esc(error.message || error)
  );
});
