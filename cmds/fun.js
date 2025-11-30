kord({
 cmd: "wyr|wouldyourather",
 desc: "Play Would You Rather",
 react: "🎲",
 fromMe: wtype,
 type: "fun",
}, async (m) => {
 try {
 const raw = (m.text || "").trim()
 const parts = raw.split(/\s+/)
 // parts[0] will be the command name when framework gives whole text; adapt if framework strips
 const arg = parts.slice(1).join(" ").trim() // everything after command
const expireMs = 60_000 // 60 seconds per session

// helpers
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]
const sendMsg = async (txt) => await m.send(txt)

// Usage/help
if (!arg) {
  // Start a new random game
  const q = pickRandom(QUESTIONS)
  const session = { q, created: Date.now(), expires: Date.now() + expireMs }
  wyrGames.set(m.sender, session)

  const header = `╔═━┈ Would You Rather ┈━═╗