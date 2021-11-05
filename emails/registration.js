const keys = require('../keys');

module.exports = function (to, username) {
  return {
    to,
    from: keys.EMAIL_FROM,
    subject: 'Sign Up complete',
    html: `
      <h1>Registration has been complete successfully</h1>
      <hr />
      <p>Created account <i>${username}</i>.</p>
      <p>Email: <i>${to}</i>.</p>
      <hr />
      <p><a href="${keys.BASE_URL}">Our site</a></p>
    `,
  };
};
