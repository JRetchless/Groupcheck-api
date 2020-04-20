const ItemsService = {
    getListItems(knex, list_id) {
        return knex.select('*').from('groupcheck_items').where('list_id', list_id)
      },
    insertItem(knex, newItem) {
      return knex
        .insert(newItem)
        .into('groupcheck_items')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    getById(knex, id) {
      return knex
      .from('groupcheck_items')
      .select('*')
      .where('id', id)
      .first()
    },
    deleteItem(knex, listId, itemId) {
      return knex('groupcheck_items')
        .where('list_id', listId)
        .andWhere('id', itemId)
        .delete()
    },
    updateItem(knex, id, newItemFields) {
      return knex('groupcheck_items')
        .where({ id })
        .update(newItemFields)
    },
  }
  
  module.exports = ItemsService