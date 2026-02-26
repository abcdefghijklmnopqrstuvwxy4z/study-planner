const express = require("express");
const bodyParser = require("body-parser");
const app = express();
// This tells the server: use Render's port, OR 4001 if running on my PC
const PORT = process.env.PORT || 4001;


let users = [];
let cloudTasks = {};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// REGISTER
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.send("User already exists");
  }
  users.push({ username, password });
  res.redirect("/login.htm");
});

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const valid = users.find(u => u.username === username && u.password === password);
  if (!valid) return res.send("Invalid Login");
  res.redirect("/planner.htm?user=" + username);
});

// CLOUD SYNC
app.post("/sync", (req, res) => {
  const { user, tasks } = req.body;
  cloudTasks[user] = tasks;
  res.json({ message: "Synced" });
});

app.get("/sync/:user", (req, res) => {
  res.json(cloudTasks[req.params.user] || []);
});

// AI RESCHEDULE
app.post("/ai", (req, res) => {
  let tasks = req.body.tasks;
  const now = new Date();
  tasks.forEach(t => {
    if (!t.done && new Date(t.time) < now) {
      let d = new Date();
      d.setHours(d.getHours() + 2);
      t.time = d.toISOString().slice(0,16);
    }
  });
  res.json(tasks);
});

// This tells the server: "When someone visits the root (/), send them the login page"
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/register.htm");
});

// This handles any page that doesn't exist
app.use((req, res) => {
  res.status(404).send("<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p>");
});
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);