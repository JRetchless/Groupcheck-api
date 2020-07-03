const AuthService = {
    getUser (knex, email, p_word) {
      return knex.select('id').from('groupcheck_users').where('email', email).
      first();
    },
  };
 
  module.exports = AuthService;
  