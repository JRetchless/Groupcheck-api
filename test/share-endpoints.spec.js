const knex = require('knex');
const app = require('../src/app');
const { makeSharedListsArray } = require('./share.fixtures');
const { makeUsersArray } = require('./users.fixtures');

describe('Shared Lists Endpoints', function () {
    let db;
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set('db', db);
    });
    after('disconnect from db', () => db.destroy());
    before('clean the table', () => db.raw('TRUNCATE groupcheck_lists, groupcheck_users, groupcheck_items RESTART IDENTITY CASCADE'));
    afterEach('cleanup', () => db.raw('TRUNCATE groupcheck_lists, groupcheck_users, groupcheck_items RESTART IDENTITY CASCADE'));
    describe(`GET /api/share/:email`, () => {
        context(`Given no user`, () => {
            it(`responds with 404`, () => {
                return supertest(app)
                    .get('/api/share/emaildoesntexist')
                    .expect(404);
            });
        });

        context('Given there are users in the database', () => {
            const testUsers = makeUsersArray();
            const testSharedLists = makeSharedListsArray();

            beforeEach('insert lists', () => {
                return db
                    .into('groupcheck_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('groupcheck_shared_lists')
                            .insert(testSharedLists);
                    });
            });

            it('responds with 200 and the user email', () => {
                return supertest(app)
                    .get(`/api/share/${testUsers[1].email}`)
                    .expect(200, testUsers[1].email);
            });
        });

    });
});


describe(`POST /api/share/:user_id/:list_id`, () => {
    const testUsers = makeUsersArray();
    beforeEach('insert shared list', () => {
        return db
            .into('groupcheck_users')
            .insert(testUsers);
    });

    it(`creates a shared list, responding with 201 and the new list`, () => {
        const newSharedList = {
            list_id: 1 ,
            shared_by: 2 ,
            shared_to: 1,
        };
        return supertest(app)
            .post(`/api/share/${newSharedList.shared_to}/${newSharedList.list_id}`)
            .send(newSharedList)
            .expect(201)
            .expect((res) => {
                expect(res.body.list_id).to.eql(newSharedList.list_id);
                expect(res.body.shared_by).to.eql(newSharedList.shared_by);
                expect(res.body.shared_to).to.eql(newSharedList.shared_to);
                expect(res.body).to.have.property('id');
                expect(res.headers.location).to.eql(`/api/shared/${res.body.shared_to}/${res.body.list_id}`);
            })
    });

    const requiredFields = ['list_id', 'shared_by', 'shared_to'];

    requiredFields.forEach((field) => {
        const newSharedList = {
            list_id: 1,
            shared_by: 2,
            shared_to: 1,
        };

        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
            delete newSharedList[field];
            return supertest(app)
                .post('/api/share/1/1')
                .send(newSharedList)
                .expect(400, {
                    error: { message: `Missing '${field}' in request body` }
                });
        });
    });

});
