// Dependencies
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const findUserByEmail = require("./helpers");

// Template engine
app.set("view engine", "ejs");

// Use of dependencies
app.use(cookieSession({
  name: "session",
  keys: ["thankyouforbrowsingmycode", "idontreallyknowwhatimdoingbutidokindof"]
}));
app.use(bodyParser.urlencoded({extended: true}));

// Databases
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {};

// Helper functions ----------------------------------------------------
// ID Generator
const generateRandomString = () => {
  let availableChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let shortURLString = "";
  for (let i = 0; i < 6; i++) {
    shortURLString += availableChars[Math.floor(Math.random() * 62)];
  }
  return shortURLString;
};


// Look through urldatabase for urls created by specified user
const urlsForUser = (urlsDb, id) => {
  const filteredUrls = {};

  for (let shortURL in urlsDb) {
    const urlObj = urlsDb[shortURL];
    if (urlObj.userID === id) {
      filteredUrls[shortURL] = urlObj;
    }
  }
  return filteredUrls;
};

// View (Browse, Read) ----------------------------------------------------


// root page, redirects to login if not signed in
app.get("/", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

// list of shortened URLS pertaining to user signed in ----
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  };
  if (users[req.session.user_id]) {
    let idSpecificURLDatabase = urlsForUser(urlDatabase, users[req.session.user_id]["userId"]);
    templateVars["urls"] = idSpecificURLDatabase;
    res.render("url_index", templateVars);
  } else {
    res.render("url_index", templateVars);
  }
});

// route for new shortened URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (users[req.session.user_id] === undefined) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});


// individual shortened URL on webpage
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[req.session.user_id],
  };
  if (users[req.session.user_id] === undefined) {
    res.redirect("/login");
  } else if (users[req.session['user_id']]['userId'] !== urlDatabase[req.params.shortURL]["userID"]) {
    res.status(401).json({message: "This URL is not listed under your account - please try again"});
  } else {
  res.render("urls_show", templateVars);
  }
});

// redirects webpage to long URL
app.get("/u/:id/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

// registration form route
app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("register", templateVars);
});

// login form route
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
});


// Action (Edit, Add, Delete) -----------------------------------------

// delete a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// edits the longURL using form intake
app.post("/urls/update/:id", (req, res) => {
  const updatedURL = req.body.longURL;
  const shortURL = req.params.id;

  urlDatabase[shortURL]["longURL"] = updatedURL;
  res.redirect(`/urls/${shortURL}`);
});

// generates string for url key + adds to URLdatabase
app.post("/urls", (req, res) => {
  let newShortUrl = generateRandomString();
  urlDatabase[`${newShortUrl}`] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${newShortUrl}`);
});

// sets value to user_id cookie from login form
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user = findUserByEmail(users, email);

  if (!user) {
    res.status(403).json({message: "Email cannot be found"});
  } else if (user) {
    bcrypt.compare(password, user.password, function(err, isPasswordMatched) {
      if (isPasswordMatched) {
        req.session.user_id = `${user["userId"]}`;
        res.redirect("/urls");
      } else {
        res.render("login", { error: "Incorrect Password", user: user});
      }
    });
  } else {
    res.status(403);
    res.render("login", { error: "No account under this user. Register instead?"});
  }
});

// clear user_id cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// adds registration form info to user database
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).json({message: "No email/password provided"});
  } else if (findUserByEmail(users, email) !== false) {
    res.status(400).json({message: "Email already exists"});
    return;
  } else {
    const userId = generateRandomString();
    req.session.user_id = `${userId}`;
    bcrypt.hash(password, 5, function(err, hashedPassword) {
      users[`${userId}`] = {
        userId,
        email,
        password: hashedPassword,
      };
    });
  }
  res.redirect("/urls");
});

// server answer when connected
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});