const AuthService = {
    getUser(knex, email, p_word) {
      return knex.select('id').from('groupcheck_users').where('email', email).
      first()
    },
  }
  //.andWhere('p_word', p_word)
  module.exports = AuthService
  