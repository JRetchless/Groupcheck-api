const ShareService = {
    getUserFromEmail(knex, email) {
        console.log('email')
        console.log(email)
        return knex.select('*').from('groupcheck_users').where('email', email )
    },

    shareList(knex, shareData ) {
        console.log("SHAREDATA.shared_by")
        console.log(shareData.shared_by)
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