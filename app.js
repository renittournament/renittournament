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
  "FREE FIRE",
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
    <main style="padding:18px 16px 90px;">
      <div style="
        background:linear-gradient(135deg,#151d2d,#0f1420);
        border:1px solid #263044;
        border-radius:16px;
        padding:20px;
      ">
        <div style="color:#8f9bb0;font-size:13px;">WELCOME</div>
        <h2 style="margin:7px 0;">
          ${esc(currentProfile?.username || "Player")}
        </h2>
        <div style="color:#9ba6b8;font-size:13px;">
          Ready for your next tournament?
        </div>
      </div>

      <h3 style="margin-top:25px;">Game Categories</h3>

      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
      ">
        ${games.map(game => `
          <button onclick="showGameMatches('${esc(game)}')" style="
            background:#111722;
            color:white;
            border:1px solid #263044;
            border-radius:12px;
            padding:17px 8px;
            min-height:70px;
            font-weight:700;
          ">
            ${esc(game)}
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
    <main style="padding:18px 16px 90px;">
      <h2>All Matches</h2>

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
            এখনো কোনো tournament publish করা হয়নি।
          </div>
        `
      }
    </main>
  `);
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

  return `
    <div style="
      background:#101521;
      border:1px solid #202838;
      border-radius:14px;
      padding:16px;
      margin-bottom:12px;
    ">
      <div style="
        color:#8f9bb0;
        font-size:12px;
        margin-bottom:6px;
      ">${esc(game)}</div>

      <h3 style="margin:0 0 12px;">
        ${esc(title)}
      </h3>

      <div style="
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:8px;
        color:#b8c1d1;
        font-size:13px;
      ">
        <div>Entry: ৳${esc(fee)}</div>
        <div>Prize: ৳${esc(prize)}</div>
        <div>Joined: ${esc(joinedPlayers)} / ${esc(slots)}</div>
        <div>Remaining: ${esc(remainingSlots)}</div>
        <div>Status: ${esc(t.status || "upcoming")}</div>
      </div>

      <div style="margin-top:8px;">
        Start: ${esc(tournamentStartTime(t))}
      </div>
      <div
  id="countdown-${esc(t.id || "")}"
  style="
    margin-top:8px;
    padding:10px;
    background:#0b0f17;
    border:1px solid #202838;
    border-radius:10px;
    color:#60a5fa;
    font-size:13px;
    font-weight:700;
    text-align:center;
  "
>
  ⏳ Countdown loading...
</div>

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
    <main style="padding:18px 16px 90px;">
      <button onclick="showMatches()" style="
        background:none;
        border:0;
        color:#9ba6b8;
        padding:0;
        margin-bottom:15px;
      ">← Back</button>

      <div style="
        background:#101521;
        border:1px solid #202838;
        border-radius:16px;
        padding:20px;
      ">
        <div style="color:#8f9bb0;font-size:12px;">
          ${esc(game)}
        </div>

        <h2>${esc(title)}</h2>

        <p>Entry Fee: <b>৳${esc(fee)}</b></p>
        <p>Prize Pool: <b>৳${esc(prize)}</b></p>
        <p>Slots: <b>${esc(slots)}</b></p>

        ${room ? `
          <div style="
            margin-top:20px;
            padding:16px;
            background:#151d2d;
            border:1px solid #2c3952;
            border-radius:14px;
          ">
            <div style="
              color:#8f9bb0;
              font-size:12px;
              margin-bottom:10px;
            ">
              ROOM INFORMATION
            </div>

            <div style="margin-bottom:10px;">
              <span style="color:#8f9bb0;">Room ID</span><br>
              <b style="font-size:18px;">
                ${esc(room.room_id || "Not published")}
              </b>
            </div>

            <div>
              <span style="color:#8f9bb0;">Password</span><br>
              <b style="font-size:18px;">
                ${esc(room.room_password || "Not published")}
              </b>
            </div>
          </div>
        ` : ""}

        ${primaryBtn(
          "Join Tournament",
          `joinTournament('${esc(data.id)}')`
        )}
      </div>
    </main>
  `);
}

async function joinTournament(id) {
  if (!currentUser) {
    loginPage();
    return;
  }

  const { data, error } = await db.rpc(
    "join_tournament",
    {
      p_tournament_id: id
    }
  );

  if (error) {
    alert("Join করা যায়নি: " + error.message);
    return;
  }

  alert(
    `Tournament joined successfully!\nEntry Fee: ৳${data.fee}\nRemaining Balance: ৳${data.balance}`
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

  const method = document.getElementById("depositMethod").value;
  const amount = Number(document.getElementById("depositAmount").value);
  const transactionId =
    document.getElementById("depositTransactionId").value.trim();
  const msg = document.getElementById("depositMessage");

  if (!amount || amount < 10) {
    msg.textContent = "Minimum deposit ৳10.";
    return;
  }

  if (!transactionId) {
    msg.textContent = "Transaction ID দিন।";
    return;
  }

  msg.textContent = "Request submit হচ্ছে...";

  const { error } = await db
    .from("payment_requests")
    .insert({
      user_id: currentUser.id,
      method: method,
      amount: amount,
      transaction_id: transactionId,
      status: "pending"
    });

  if (error) {
    console.log(error);
    msg.textContent = "Request submit করা যায়নি: " + error.message;
    return;
  }

  msg.textContent =
    "Deposit request submitted. Admin approval-এর অপেক্ষায় আছে।";

  document.getElementById("depositAmount").value = "";
  document.getElementById("depositTransactionId").value = "";

  loadDepositRequests();
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
    <main style="padding:18px 16px 90px;">
      <h2>Wallet</h2>

      <div style="
        background:#101521;
        border:1px solid #202838;
        border-radius:16px;
        padding:22px;
      ">
        <div style="color:#8f9bb0;font-size:13px;">
          Available Balance
        </div>

        <div style="
          font-size:34px;
          font-weight:800;
          margin-top:7px;
        ">
          ৳${esc(currentProfile?.balance ?? 0)}
        </div>
      </div>

      <div style="
        margin-top:15px;
        background:#101521;
        border:1px solid #202838;
        border-radius:14px;
        padding:16px;
      ">
        <h3 style="margin-top:0;">Deposit</h3>

        <div style="
          color:#9ba6b8;
          font-size:13px;
          line-height:1.5;
        ">
          bKash অথবা Nagad দিয়ে payment করার পর
          Transaction ID এখানে submit করুন।
        </div>

        <select id="depositMethod" style="
          width:100%;
          box-sizing:border-box;
          background:#111722;
          color:white;
          border:1px solid #293346;
          border-radius:10px;
          padding:13px;
          margin-top:12px;
        ">
          <option value="bKash">bKash</option>
          <option value="Nagad">Nagad</option>
        </select>

        <input
          id="depositAmount"
          type="number"
          min="10"
          placeholder="Deposit amount"
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

        <input
          id="depositTransactionId"
          type="text"
          placeholder="Transaction ID"
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

        ${primaryBtn(
          "Submit Deposit Request",
          "submitDepositRequest()"
        )}

        <div id="depositMessage" style="
          margin-top:12px;
          color:#9ba6b8;
          font-size:13px;
          line-height:1.5;
        "></div>
      </div>

      <div style="
        margin-top:15px;
        background:#101521;
        border:1px solid #202838;
        border-radius:14px;
        padding:16px;
      ">
        <h3 style="margin-top:0;">Deposit Requests</h3>
        <div id="depositRequests">
          Loading...
        </div>
      </div>
      <div style="
  margin-top:15px;
  background:#101521;
  border:1px solid #202838;
  border-radius:14px;
  padding:16px;
">
  <h3 style="margin-top:0;">Transaction History</h3>

  <div id="transactionHistory">
    Loading...
  </div>
</div>
    </main>
  `);

  await loadDepositRequests();
  await loadTransactionHistory();
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

  app.innerHTML = pageShell(`
    <main style="padding:18px 16px 90px;">

      <h2 style="margin-bottom:15px;">
        Profile
      </h2>

      <!-- PROFILE HEADER -->
      <div style="
        background:linear-gradient(
          135deg,
          #151d2d,
          #0d121c
        );
        border:1px solid #293346;
        border-radius:18px;
        padding:20px;
      ">

        <div style="
          width:64px;
          height:64px;
          border-radius:50%;
          background:#e94560;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:28px;
          font-weight:900;
          margin-bottom:14px;
        ">
          ${esc(firstLetter)}
        </div>

        <div style="
          color:#8f9bb0;
          font-size:11px;
          letter-spacing:1px;
        ">
          PLAYER
        </div>

        <div style="
          font-size:23px;
          font-weight:800;
          margin-top:5px;
        ">
          ${esc(username)}
        </div>

        <div style="
          color:#9ba6b8;
          font-size:13px;
          margin-top:7px;
          word-break:break-all;
        ">
          ${esc(email)}
        </div>

      </div>


      <!-- BALANCE -->
      <div style="
        margin-top:14px;
        background:#101521;
        border:1px solid #202838;
        border-radius:16px;
        padding:18px;
      ">

        <div style="
          color:#8f9bb0;
          font-size:12px;
        ">
          WALLET BALANCE
        </div>

        <div style="
          font-size:30px;
          font-weight:800;
          margin-top:6px;
        ">
          ৳${esc(balance)}
        </div>

        ${primaryBtn(
          "Open Wallet",
          "openWallet()"
        )}

      </div>


      <!-- PLAYER STATS -->
      <div style="
        margin-top:14px;
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
      ">

        <div style="
          background:#101521;
          border:1px solid #202838;
          border-radius:14px;
          padding:15px;
        ">
          <div style="
            color:#8f9bb0;
            font-size:12px;
          ">
            JOINED
          </div>

          <div style="
            font-size:24px;
            font-weight:800;
            margin-top:5px;
          ">
            ${esc(totalJoined)}
          </div>
        </div>


        <div style="
          background:#101521;
          border:1px solid #202838;
          border-radius:14px;
          padding:15px;
        ">
          <div style="
            color:#8f9bb0;
            font-size:12px;
          ">
            LIVE
          </div>

          <div style="
            font-size:24px;
            font-weight:800;
            margin-top:5px;
            color:#4ade80;
          ">
            ${esc(liveCount)}
          </div>
        </div>


        <div style="
          background:#101521;
          border:1px solid #202838;
          border-radius:14px;
          padding:15px;
        ">
          <div style="
            color:#8f9bb0;
            font-size:12px;
          ">
            UPCOMING
          </div>

          <div style="
            font-size:24px;
            font-weight:800;
            margin-top:5px;
          ">
            ${esc(upcomingCount)}
          </div>
        </div>


        <div style="
          background:#101521;
          border:1px solid #202838;
          border-radius:14px;
          padding:15px;
        ">
          <div style="
            color:#8f9bb0;
            font-size:12px;
          ">
            COMPLETED
          </div>

          <div style="
            font-size:24px;
            font-weight:800;
            margin-top:5px;
            color:#60a5fa;
          ">
            ${esc(completedCount)}
          </div>
        </div>

      </div>


      <!-- MY TOURNAMENTS -->
      <div style="
        margin-top:15px;
        background:#101521;
        border:1px solid #202838;
        border-radius:16px;
        padding:18px;
      ">

        <h3 style="
          margin-top:0;
          margin-bottom:10px;
        ">
          My Tournaments
        </h3>

        ${
          tournaments.length
            ? tournaments.map(t => {

                const status =
                  String(t.status || "upcoming")
                    .toLowerCase();

                let statusColor = "#f0b44d";

                if (status === "live") {
                  statusColor = "#4ade80";
                }

                if (status === "completed") {
                  statusColor = "#60a5fa";
                }

                return `
                  <div style="
                    background:#0b0f17;
                    border:1px solid #202838;
                    border-radius:13px;
                    padding:15px;
                    margin-top:10px;
                  ">

                    <div style="
                      font-size:17px;
                      font-weight:700;
                    ">
                      ${esc(
                        t.tournament_title ||
                        "Tournament"
                      )}
                    </div>

                    <div style="
                      color:#9ba6b8;
                      font-size:13px;
                      margin-top:6px;
                    ">
                      ${esc(t.game || "-")}
                    </div>

                    <div style="
                      display:flex;
                      justify-content:space-between;
                      align-items:center;
                      margin-top:12px;
                    ">

                      <span style="
                        color:#9ba6b8;
                        font-size:12px;
                      ">
                        Entry: ৳${esc(t.entry_fee ?? 0)}
                      </span>

                      <span style="
                        color:${statusColor};
                        font-size:12px;
                        font-weight:700;
                        text-transform:uppercase;
                      ">
                        ${esc(status)}
                      </span>

                    </div>

                  </div>
                `;
              }).join("")
            : `
              <div style="
                color:#8f9bb0;
                padding:12px 0;
                text-align:center;
              ">
                আপনি এখনো কোনো tournament-এ join করেননি।
              </div>
            `
        }

      </div>


      <!-- ADMIN -->
      ${
        await isAdmin()
          ? primaryBtn(
              "Admin Panel",
              "openAdmin()"
            )
          : ""
      }


      <!-- LOGOUT -->
      <button onclick="logout()" style="
        width:100%;
        margin-top:12px;
        padding:13px;
        background:#171e2b;
        color:#ff6178;
        border:1px solid #303a4d;
        border-radius:10px;
        font-weight:700;
      ">
        Logout
      </button>

    </main>
  `);
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
    <main style="padding:18px 16px 90px;">
      <h2>Admin Panel</h2>

      <div style="
        background:#101521;
        border:1px solid #202838;
        border-radius:14px;
        padding:16px;
      ">
        <h3 style="margin-top:0;">Create Tournament</h3>

        <input
          id="tournamentTitle"
          type="text"
          placeholder="Tournament title"
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

        <select
          id="tournamentGame"
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
            border:1px solid #293346;
            border-radius:10px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >

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
            border:1px solid #293346;
            border-radius:10px;
            padding:13px;
            margin-top:10px;
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
            border:1px solid #293346;
            border-radius:10px;
            padding:13px;
            margin-top:10px;
            outline:none;
          "
        >

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
            border:1px solid #293346;
            border-radius:10px;
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
            border:1px solid #293346;
            border-radius:10px;
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
            margin-top:12px;
            color:#9ba6b8;
            font-size:13px;
          "
        ></div>
      </div>

      <div style="
        margin-top:15px;
        background:#101521;
        border:1px solid #202838;
        border-radius:14px;
        padding:16px;
      ">
       <div style="
  margin-bottom:15px;
  background:#101521;
  border:1px solid #202838;
  border-radius:14px;
  padding:16px;
">
  <h3 style="margin-top:0;">Publish Room Information</h3>

  <select id="roomTournamentId" style="
    width:100%;
    box-sizing:border-box;
    background:#111722;
    color:white;
    border:1px solid #293346;
    border-radius:10px;
    padding:13px;
    margin-top:10px;
  ">
    <option value="">Loading tournaments...</option>
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
      border:1px solid #293346;
      border-radius:10px;
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
      border:1px solid #293346;
      border-radius:10px;
      padding:13px;
      margin-top:10px;
      outline:none;
    "
  >

  ${primaryBtn(
    "Publish Room",
    "publishTournamentRoom()"
  )}

  <div id="roomPublishMessage" style="
    margin-top:10px;
    color:#9ba6b8;
    font-size:13px;
  "></div>
</div> 
        <div style="
  margin-bottom:15px;
  background:#101521;
  border:1px solid #202838;
  border-radius:14px;
  padding:16px;
">
  <div style="
  margin-bottom:15px;
  background:#101521;
  border:1px solid #202838;
  border-radius:14px;
  padding:16px;
">
  <h3 style="margin-top:0;">Tournament Status</h3>

  <select
    id="statusTournamentId"
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
    <option value="">Loading tournaments...</option>
  </select>

  <select
    id="tournamentStatus"
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
    <option value="">Select status</option>
    <option value="upcoming">Upcoming</option>
    <option value="live">Live</option>
    <option value="completed">Completed</option>
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
      font-size:13px;
    "
  ></div>
</div>
  <h3 style="margin-top:0;">Tournament Results</h3>

  <select
    id="resultTournamentId"
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
    <option value="">Loading tournaments...</option>
  </select>

  <select
    id="resultPlayerId"
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
    <option value="">Select player</option>
  </select>

  <select
    id="resultPosition"
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
    <option value="">Select position</option>
    <option value="1">1st Place</option>
    <option value="2">2nd Place</option>
    <option value="3">3rd Place</option>
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
      border:1px solid #293346;
      border-radius:10px;
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
      font-size:13px;
    "
  ></div>
</div>
        <h3 style="margin-top:0;">Deposit Requests</h3>

        <div id="adminDepositRequests">
          Loading...
        </div>
      </div>
    </main>
  `);
    await loadAdminDepositRequests();
  await loadRoomTournaments();
  await loadResultTournaments();
  await loadStatusTournaments();
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
