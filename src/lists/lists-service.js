const ListsService = {
    insertList(knex, newList) {
        return knex
        .insert(newList)
        .into('groupcheck_lists')
        .returning('*')
        .then(rows => {
            return rows[0]
        })
    },
    getAllLists(knex, author) {  
        return knex.select('*').from('groupcheck_lists').where('author', author)
    },
    //add comma after line 13
    deleteList(knex, id, table) {
        return knex(table)
          .where({ id })
          .delete()
    },
    deleteFromAllLists(knex, id) {
        return Promise.all([
            this.deleteList(knex, id, 'groupcheck_lists'),
            this.deleteList(knex, id, 'groupcheck_shared_lists'),
            this.deleteList(knex, id, 'groupcheck_users_lists')
        ])
    }
//     updateList(knex, id, newListField) {
//         return knex('groupcheck_lists')
//         .where({ id })
//         .update(newListField)
//     }
  
}

module.exports = ListsService