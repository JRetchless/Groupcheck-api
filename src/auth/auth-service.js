const AuthService = {
    getUser(knex) {
      return knex.select('*').from('groupcheck_users')
    
  }
}
  module.exports = AuthService
  