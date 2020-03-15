const ListsService = {
//     insertList(knex, newList) {
//         return knex
//         .insert(newList)
//         .into('groupcheck_lists')
//         .returning('*')
//         .then(rows => {
//             return rows[0]
//         })
    // },
    getAllLists(knex, author) {
        return knex.select('*').from('groupcheck_lists').where('author', author)
    }
// //     deleteList(knex, id) {
// //         return knex('groupcheck_lists')
// //           .where({ id })
// //           .delete()
// //     },
// //     updateList(knex, id, newListField) {
// //         return knex('groupcheck_lists')
// //         .where({ id })
// //         .update(newListField)
// //     }
  
}

module.exports = ListsService