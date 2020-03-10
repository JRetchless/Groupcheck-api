// const ItemsService = {
//     getListItems(knex, user_id, list_id) {
//         return knex.select('*').from('groupcheck_items').where('user_id', user_id).andWhere('list_id', list_id)
//       },
//     insertItem(knex, newItem) {
//       return knex
//         .insert(newItem)
//         .into('groupcheck_items')
//         .returning('*')
//         .then(rows => {
//           return rows[0]
//         })
//     },
//     getById(knex, id) {
//       return knex
//       .from('groupcheck_items')
//       .select('*')
//       .where('id', id)
//       .first()
//     },
//     deleteItem(knex, id) {
//       return knex('groupcheck_items')
//         .where({ id })
//         .delete()
//     },
//     updateItem(knex, id, newItemFields) {
//       return knex('groupcheck_items')
//         .where({ id })
//         .update(newItemFields)
//     },
//   }
  
//   module.exports = ItemsService
  