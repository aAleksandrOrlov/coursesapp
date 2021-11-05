const keys = require('../keys');

module.exports = function (to, token) {
  return {
    to,
    from: keys.EMAIL_FROM,
    subject: 'Reset password',
    html: `
      <h1>Reset password requested</h1>
      <hr />
      <p>If you didn't requested password reset ignore this message.</p>
      <hr />
      <p>Link to reset: <a href="${keys.BASE_URL}auth/reset-password/${token}">${keys.BASE_URL}auth/reset-password/${token}</a></p>
    `,
  };
};
