const AuthService = {
    getUser(knex) {
      return knex.select('*').from('groupcheck_login')
    },
    
  }
  
  module.exports = AuthService
  