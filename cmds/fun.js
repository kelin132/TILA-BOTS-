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
┃ Choose one (reply: ${prefix}wyr 1 or ${prefix}wyr 2)
╚════════════════════════╝
      const body = \n1️⃣ ${q.a}\n\n2️⃣ ${q.b}\n\n⏳ Expires in ${Math.floor(expireMs / 1000)}s
      return sendMsg(${header}\n${body}`)
 }
// Custom: "custom Option A | Option B"
if (arg.toLowerCase().startsWith("custom")) {
  const rest = arg.slice(6).trim()
  const sep = rest.includes("|") ? "|" : " / "
  const partsCustom = rest.split("|").map(s => s.trim()).filter(Boolean)
  if (partsCustom.length !== 2) {
    return sendMsg("Invalid format. Use:\nwyr custom Option A | Option B")
  }
  const q = { a: partsCustom[0], b: partsCustom[1] }
  const session = { q, created: Date.now(), expires: Date.now() + expireMs }
  wyrGames.set(m.sender, session)
  const header = `╔═━┈ Custom Would You Rather ┈━═╗┃ Reply: ${prefix}wyr 1 or ${prefix}wyr 2
╚════════════════════════════════╝
      const body = \n1️⃣ ${q.a}\n\n2️⃣ ${q.b}\n\n⏳ Expires in ${Math.floor(expireMs / 1000)}s
      return sendMsg(${header}\n${body}`)
 }
// If argument is a choice number
const choice = arg.split(/\s+/)[0]
if (["1", "2"].includes(choice)) {
  const session = wyrGames.get(m.sender)
  if (!session) return sendMsg(`No active game. Start one with ${prefix}wyr`)
  if (Date.now() > session.expires) {
    wyrGames.delete(m.sender)
    return sendMsg("Your session expired. Start a new one with " + prefix + "wyr")
  }

  // Simple "poll" simulation: give chosen option a higher random percent
  const winnerIndex = choice === "1" ? 0 : 1
  let p1 = Math.floor(Math.random() * 60) + 20 // between 20-79
  let p2 = 100 - p1
  // boost chosen slightly
  if (winnerIndex === 0) {
    p1 = Math.min(95, p1 + Math.floor(Math.random() * 15))
    p2 = 100 - p1
  } else {
    p2 = Math.min(95, p2 + Math.floor(Math.random() * 15))
    p1 = 100 - p2
  }

  const chosenText = choice === "1" ? session.q.a : session.q.b
  const otherText = choice === "1" ? session.q.b : session.q.a

  wyrGames.delete(m.sender)

  const result = `You chose: ${chosenText}