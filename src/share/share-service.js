const ShareService = {
    getUserFromEmail(knex, email) {
        console.log('email')
        console.log(email)
        return knex.select('*').from('groupcheck_users').where('email', email ).first()
    },
    checkForShare(knex, shareData){
        return knex
            .select('*')
            .from('groupcheck_shared_lists')
            .where('list_id', shareData.list_id)
            .andWhere('shared_to', shareData.shared_to)
            .first()
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