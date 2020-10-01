const { assert } = require('chai');

const findUserByEmail = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail(testUsers, "user@example.com")['id']
    const expectedOutput = "userRandomID";
    assert.deepEqual (user, expectedOutput);
  });

  it('should return false if email does not exist', function() {
    const user = findUserByEmail(testUsers, "meow@example.com")
    const expectedOutput = false;
    assert.deepEqual (user, expectedOutput);
  });
});

