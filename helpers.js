

// Look through user emails for user
const findUserByEmail = (usersDb, email) => {
  for (let user in usersDb) {
    const userObj = usersDb[user];
    if (userObj.email === email) {
      return userObj;
    }
  }
  return false;
};

module.exports = findUserByEmail;