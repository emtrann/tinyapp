// Dependencies 
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

// Template engine 
app.set("view engine", "ejs")

// Use of dependencies 
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

// Databases 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

};

// Helper functions ----------------------------------------------------
// ID Generator 
function generateRandomString() {
  let availableChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let shortURLString = ''; 
  for (let i = 0; i < 6; i++) {
    shortURLString += availableChars[Math.floor(Math.random() * 62)];
  }
  return shortURLString;
};

// Look through user emails
const findUserByEmail = (usersDb, email) => {
  for (let user in users) {
    const userObj = usersDb[user];
    if (userObj.email === email) {
      return userObj;
    }
  }
  return false;
};

// View (BR) ----------------------------------------------------


// root page 
app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// list of shortened URLS - 
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("url_index", templateVars);
});

// page for new shortened URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

// individual shortened URL on webpage 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

// redirects webpage to long URL 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// registration form
app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("register", templateVars);
});

// login form
app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars);
});


// Action (EAD) -----------------------------------------

// delete a URL 
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls')
});

// edits the longURL using form intake
app.post("/urls/:id", (req, res) => {
  const updatedURL = req.body.longURL;
  const shortURLId = req.params.id;

  urlDatabase[shortURLId] = updatedURL;
  res.redirect(`/urls/${shortURLId}`)
})

// generates string for url key + adds to URLdatabase
app.post("/urls", (req, res) => {
  let newShortUrl = generateRandomString();
  urlDatabase[`${newShortUrl}`] = req.body.longURL;
  res.redirect(`/urls/${newShortUrl}`);
  console.log(urlDatabase);
});

// sets value to user_id cookie from login form
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user = findUserByEmail(users, email)

  if (!user) {
    res.status(403).json({message: 'Email cannot be found'});
  } else if (user && (user['password'] !== password)) {
    res.status(403).json({message: 'Password is incorrect'});
  } else {
    res.cookie('user_id', `${user['userId']}`);
    res.redirect('/urls');
  }
});

// clear user_id cookie
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// adds registration form info to user database
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).json({message: 'No email/password provided'});
  } else if (findUserByEmail(users, email) !== false) {
    res.status(400).json({message: 'Email already exists'});
    return;
  } else {
    const userId = generateRandomString();
    res.cookie('user_id', `${userId}`);
    users[`${userId}`] = {
      userId, 
      email,
      password
    }
  }
  res.redirect('/urls')
});

// server answer when connected
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});