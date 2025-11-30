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
Opponent: ${otherText}
Poll simulation:
1️⃣ ${session.q.a} — ${p1}%
2️⃣ ${session.q.b} — ${p2}%
${p1 > p2 ? "Most people preferred option 1." : p2 > p1 ? "Most people preferred option 2." : "It's a tie!"}`
  return sendMsg(result)
}

// If user passed a text arg that's not recognized, show help
return sendMsg(`Would You Rather command usage:


kord({
  cmd: "howhot",
  desc: "Fun: check how hot someone is",
  react: "😍",
  fromMe: wtype,
  type: "fun",
}, async (m) => {
  try {
    const raw = (m.text || "").trim()
    const arg = raw.split(/\s+/).slice(1).join(" ").trim()

    // Determine target name (argument > quoted > sender)
    let target = ""
    if (arg) {
      target = arg
    } else if (m.quoted && m.quoted.sender && m.quoted.pushName) {
      target = m.quoted.pushName
    } else {
      target = m.pushName || "You"
    }

    // Deterministic hash so same name yields same score (fun and consistent)
    const hashScore = (s) => {
      let h = 0
      for (let i = 0; i < s.length; i++) {
        h = (h << 5) - h + s.charCodeAt(i)
        h |= 0
      }
      return Math.abs(h) % 101 // 0..100
    }

    const score = hashScore(target)

    // Heart bar (10 slots)
    const filled = Math.round(score / 10)
    const empty = 10 - filled
    const bar = "💖".repeat(filled) + "♡".repeat(empty)

    // Simple rating text
    let rating = ""
    if (score >= 90) rating = "Smoking hot 🔥"
    else if (score >= 75) rating = "Very hot 🔥"
    else if (score >= 60) rating = "Hot 😊"
    else if (score >= 40) rating = "Cute 🙂
"
    else if (score >= 20) rating = "Hmm... average 🤔"
    else rating = "Not feeling it 😅"

    // Fun comments by bucket
    const comments = {
      0: ["Brutal honesty incoming.", "Oof, tough luck — but personality wins!"],
      20: ["Work that confidence!", "A hidden gem in the making."],
      40: ["Nice! Keep smiling.", "Looking good today."],
      60: ["Looking great! 🥰", "Definitely catches the eye."],
      80: ["Whoa! People stop and stare.", "Absolute banger!"],
      90: ["Stop it, you're on fire!", "Literally dazzling ✨"]
    }
    const pickComment = () => {
      if (score >= 90) return comments[90][Math.floor(Math.random()*comments[90].length)]
      if (score >= 80) return comments[80][Math.floor(Math.random()*comments[80].length)]
      if (score >= 60) return comments[60][Math.floor(Math.random()*comments[60].length)]
      if (score >= 40) return comments[40][Math.floor(Math.random()*comments[40].length)]
      if (score >= 20) return comments[20][Math.floor(Math.random()*comments[20].length)]
      return comments[0][Math.floor(Math.random()*comments[0].length)]
    }

    const comment = pickComment()

    const output = [
      `╔═━┈ How Hot Is ${target} ┈━═╗`,
      `🔥 Score : ${score}/100`,
      ` ${bar}`,
      `✨ Rating: ${rating}`,
      ``,
      `${comment}`,
      `╚════════════════════════╝`,
      ``,
      `Tip: use ${prefix}howhot <name> or reply to a message with ${prefix}howhot`
    ].join("\n")

    return m.send(output)
  } catch (e) {
    console.error("howhot error", e)
    if (m.sendErr) return await m.sendErr(e)
    return m.send("An error occurred.")
  }
})