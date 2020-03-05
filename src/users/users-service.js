const UsersService = {
    getAllUsers(knex) {
      return knex.select('*').from('groupcheck_users')
    },
  
    insertUser(knex, newUser) {
      return knex
        .insert(newUser)
        .into('groupcheck_users')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('groupcheck_users')
        .select('*')
        .where('id', id)
        .first()
    },
  
    deleteUser(knex, id) {
      return knex('groupcheck_users')
        .where({ id })
        .delete()
    },
  
    updateUser(knex, id, newUserFields) {
      return knex('groupcheck_users')
        .where({ id })
        .update(newUserFields)
    },
    getAllLists(knex, author) {
      return knex.select('*').from('groupcheck_lists').where('author', author)
    },
    getListItems(knex, user_id, list_id) {
      return knex.select('*').from('groupcheck_items').where('user_id', user_id).andWhere('list_id', list_id)
    },
  }
  
  module.exports = UsersService