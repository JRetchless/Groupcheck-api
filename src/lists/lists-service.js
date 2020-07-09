const ListsService = {
    insertList(knex, newList) {
        return knex
        .insert(newList)
        .into('groupcheck_lists')
        .returning('*')
        .then((rows) => {
            return rows[0];
        });
    },
    getLists(knex, author) {
        return knex.select('*')
            .from('groupcheck_lists')
            .where('author', author);
    },
    getSharedLists(knex, shared_to) {
        return knex.select('*')
            .from('groupcheck_shared_lists')
            .leftJoin('groupcheck_lists', 'groupcheck_lists.id', 'groupcheck_shared_lists.list_id')
            .where('groupcheck_shared_lists.shared_to', shared_to);
    },
    deleteFromSharedLists(knex, list_id, shared_to) {
        return knex('groupcheck_shared_lists')
            .where({ list_id })
            .andWhere({ shared_to })
            .delete();
    },
    deleteList(knex, id, table) {
        return knex(table)
          .where({ id })
          .delete();
    },
    deleteFromAllLists(knex, id) {
        return Promise.all([
            this.deleteList(knex, id, 'groupcheck_lists'),
            this.deleteList(knex, id, 'groupcheck_shared_lists'),
            this.deleteList(knex, id, 'groupcheck_users_lists'),
        ]);
    },
};

module.exports = ListsService;
