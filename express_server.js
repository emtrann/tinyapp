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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {};

// Helper functions ----------------------------------------------------
// ID Generator 
const generateRandomString = () => {
  let availableChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let shortURLString = ''; 
  for (let i = 0; i < 6; i++) {
    shortURLString += availableChars[Math.floor(Math.random() * 62)];
  }
  return shortURLString;
};

// Look through user emails for user
const findUserByEmail = (usersDb, email) => {
  for (let user in users) {
    const userObj = usersDb[user];
    if (userObj.email === email) {
      return userObj;
    }
  }
  return false;
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

// list of shortened URLS pertaining to user signed in ---- 
app.get("/urls/:id", (req, res) => {
  if (users[req.cookies["user_id"]] === undefined) {
    res.redirect("/login");
  } else {
    let idSpecificURLDatabase = urlsForUser(urlDatabase, users[req.cookies["user_id"]]["userId"]); 
    const templateVars = { 
      urls: idSpecificURLDatabase,
      user: users[req.cookies["user_id"]],
    };
    res.render("url_index", templateVars);
  }
});

// route for new shortened URL
app.get("/urls/:id/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (users[req.cookies["user_id"]] === undefined) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});


// individual shortened URL on webpage 
app.get("/urls/:id/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

// redirects webpage to long URL 
app.get("/u/:id/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
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
app.post("/urls/:id/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/:id')
});

// edits the longURL using form intake
app.post("/urls/update/:id", (req, res) => {
  const updatedURL = req.body.longURL;
  const shortURL = req.params.id;

  urlDatabase[shortURL]['longURL'] = updatedURL;
  res.redirect(`/urls/${shortURL}`)
})

// generates string for url key + adds to URLdatabase
app.post("/urls", (req, res) => {
  let newShortUrl = generateRandomString();
  urlDatabase[`${newShortUrl}`] = { 
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
   };
  res.redirect(`/urls/${newShortUrl}`);
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
  res.redirect('/urls/:id');
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
  res.redirect('/urls/:id')
});

// server answer when connected
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});