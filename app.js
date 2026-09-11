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

      ${primaryBtn(
        "View & Join",
        `openMatch('${esc(t.id || "")}')`
      )}
    </div>
  `;
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
  const { data, error } = await db
    .from("results")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
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
            <b>${esc(r.username || r.player_name || "Player")}</b>
            <div style="color:#9ba6b8;margin-top:6px;">
              Rank: ${esc(r.rank ?? "-")}
            </div>
            <div style="color:#9ba6b8;">
              Prize: ৳${esc(r.prize ?? r.amount ?? 0)}
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

  app.innerHTML = pageShell(`
    <main style="padding:18px 16px 90px;">
      <h2>Profile</h2>

      <div style="
        background:#101521;
        border:1px solid #202838;
        border-radius:16px;
        padding:20px;
      ">
        <div style="color:#8f9bb0;font-size:12px;">
          USERNAME
        </div>

        <div style="
          font-size:21px;
          font-weight:700;
          margin-top:5px;
        ">
          ${esc(currentProfile?.username || "Player")}
        </div>

        <div style="
          color:#8f9bb0;
          margin-top:15px;
          font-size:13px;
        ">
          ${esc(currentUser?.email || "")}
        </div>

        <div style="
          color:#8f9bb0;
          margin-top:10px;
          font-size:13px;
        ">
          Balance: ৳${esc(currentProfile?.balance ?? 0)}
        </div>
        ${await isAdmin() ? primaryBtn(
  "Admin Panel",
  "openAdmin()"
) : ""}

        <button onclick="logout()" style="
          width:100%;
          margin-top:20px;
          padding:13px;
          background:#171e2b;
          color:#ff6178;
          border:1px solid #303a4d;
          border-radius:10px;
          font-weight:700;
        ">
          Logout
        </button>
      </div>
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
        <h3 style="margin-top:0;">Deposit Requests</h3>

        <div id="adminDepositRequests">
          Loading...
        </div>
      </div>
    </main>
  `);

  await loadAdminDepositRequests();
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
