const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")

function generateRandomString() {
  let availableChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let shortURLString = ''; 
  for (let i = 0; i < 6; i++) {
    shortURLString += availableChars[Math.floor(Math.random() * 62)];
  }
  return shortURLString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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
  const templateVars = { urls: urlDatabase };
  res.render("url_index", templateVars);
});

// create new shortened URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// delete a URL 
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls')
});

// individual shortened URL on webpage 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// redirects webpage to long URL 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL)
  res.redirect(longURL);
  console.log(longURL)
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

// server answer when connected
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});