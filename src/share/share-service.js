const ShareService = {
    getUserFromEmail(knex, email) {
        return knex.select('*').from('groupcheck_users').where('email', email )
    },

    shareList(knex, shareData ) {
        return knex
            .insert(shareData)
            .into('groupcheck_shared_lists')
            .returning('*')
            .then(rows => {
                return rows[0]
        })
    }
}

module.exports = ShareService