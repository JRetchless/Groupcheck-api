const knex = require('knex');
const app = require('../src/app');
const { makeUsersArray, makeMaliciousUser } = require('./users.fixtures');
const { makeListsArray } = require('./lists.fixtures');

describe('Users Endpoints', function() {
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

  describe(`GET /api/users/:user_id`, () => {
    context(`Given no lists`, () => {
      it(`responds with 404`, () => {
        const UserId = 123456;
        return supertest(app)
          .get(`/api/users/${UserId}`)
          .expect(404, { error: { message: `User doesn't exist` } });
      });
    });

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();
      const testLists = makeListsArray();

      beforeEach('insert users', () => {
        return db
          .into('groupcheck_users')
          .insert(testUsers)
          .then(() => {
            return db
          });
      });

      it('responds with 200 and the specified user', () => {
        const userId = 2;
        const expectedUser = testUsers[userId - 1];
        return supertest(app)
          .get(`/api/users/${userId}`)
          .expect(200, expectedUser);
      });
    });

    context(`Given an XSS attack user`, () => {
      const testUsers = makeUsersArray();
      const { maliciousUser, expectedUser } = makeMaliciousUser();

      beforeEach('insert malicious user', () => {
        return db
          .into('groupcheck_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('groupcheck_users')
              .insert([maliciousUser]);
          });
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/users/${maliciousUser.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.firstname).to.eql(expectedUser.firstname);
            expect(res.body.lastname).to.eql(expectedUser.lastname);
          });
      });
    });
  });

  describe(`POST /api/users`, () => {
    const testUsers = makeUsersArray();
    beforeEach('insert malicious user', () => {
      return db
        .into('groupcheck_users')
        .insert(testUsers);
    });

    it(`creates a user, responding with 201 and the new user`, () => {
      const newUser = {
        firstname: 'Test new user',
        lastname: 'user',
        email: 'Test@testing.testing',
        p_word:'test',
      };
      return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.firstname).to.eql(newUser.firstname);
          expect(res.body.lastname).to.eql(newUser.lastname);
          expect(res.body.email).to.eql(newUser.email);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
          expect(actual).to.eql(expected);
        })
        .then((res) =>
          supertest(app)
            .get(`/api/users/${res.body.id}`)
            .expect(res.body));
    });

    const requiredFields = ['firstname', 'lastname', 'email', 'p_word'];

    requiredFields.forEach((field) => {
      const newUser = {
        firstname: 'Test new user',
        lastname: 'user',
        email: 'Test@testing.testing',
        p_word:'test',
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newUser[field];
        return supertest(app)
          .post('/api/users')
          .send(newUser)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });

    it('removes XSS attack content from response', () => {
      const { maliciousUser, expectedUser } = makeMaliciousUser();
      return supertest(app)
        .post(`/api/users/`)
        .send(maliciousUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.firstname).to.eql(expectedUser.firstname);
          expect(res.body.lastname).to.eql(expectedUser.lastname);
          expect(res.body.email).to.eql(expectedUser.email);
          expect(res.body.p_word).to.eql(expectedUser.p_word);
        });
    });
  });

  describe(`DELETE /api/users/:user_id`, () => {
    context(`Given no users`, () => {
      it(`responds with 404`, () => {
        const userId = 123456;
        return supertest(app)
          .delete(`/api/users/${userId}`)
          .expect(404, { error: { message: `User doesn't exist` } });
      });
    });

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();
      beforeEach('insert user', () => {
        return db
          .into('groupcheck_users')
          .insert(testUsers)
          .then(() => {
            return db
          });
      });

      it('responds with 204 and removes the user', () => {
        const idToRemove = 2;
        const expectedUsers = testUsers.filter(user => user.id !== idToRemove);
        return supertest(app)
          .delete(`/api/users/${idToRemove}`)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/users`)
              .expect(expectedUsers));
      });
    });
  });
});
