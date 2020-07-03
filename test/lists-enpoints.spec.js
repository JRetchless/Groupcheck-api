const knex = require('knex');
const app = require('../src/app');
const { makeListsArray, makeMaliciousList } = require('./lists.fixtures');
const { makeUsersArray } = require('./users.fixtures');

describe('Lists Endpoints', function() {
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
  describe(`GET /api/lists`, () => {
    context(`Given no lists`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/lists')
          .expect(200, []);
      });
    });

    context('Given there are lists in the database', () => {
      const testUsers = makeUsersArray();
      const testLists = makeListsArray();

      beforeEach('insert lists', () => {
        return db
          .into('groupcheck_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('groupcheck_lists')
              .insert(testLists);
          });
      });

      it('responds with 200 and all of the lists', () => {
        return supertest(app)
          .get('/api/lists')
          .expect(200, testLists);
      });
    });

    context(`Given an XSS attack list`, () => {
      const testUsers = makeUsersArray();
      const { maliciousList, expectedList } = makeMaliciousList();

      beforeEach('insert malicious list', () => {
        return db
          .into('groupcheck_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('groupcheck_lists')
              .insert([maliciousList]);
          });
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/lists`)
          .expect(200)
          .expect((res) => {
            expect(res.body[0].name).to.eql(expectedList.name);
            expect(res.body[0].content).to.eql(expectedList.content);
          });
      });
    });
  });

  describe(`GET /api/lists/:list_id`, () => {
    context(`Given no lists`, () => {
      it(`responds with 404`, () => {
        const listId = 123456;
        return supertest(app)
          .get(`/api/lists/${listId}`)
          .expect(404, { error: { message: `List doesn't exist` } });
      });
    });

    context('Given there are lists in the database', () => {
      const testUsers = makeUsersArray();
      const testLists = makeListsArray();

      beforeEach('insert lists', () => {
        return db
          .into('groupcheck_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('groupcheck_lists')
              .insert(testLists);
          });
      });

      it('responds with 200 and the specified list', () => {
        const listId = 2;
        const expectedList = testLists[listId - 1];
        return supertest(app)
          .get(`/api/lists/${listId}`)
          .expect(200, expectedList);
      });
    });

    context(`Given an XSS attack list`, () => {
      const testUsers = makeUsersArray();
      const { maliciousList, expectedList } = makeMaliciousList();

      beforeEach('insert malicious list', () => {
        return db
          .into('groupcheck_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('groupcheck_lists')
              .insert([maliciousList]);
          });
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/lists/${maliciousList.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.name).to.eql(expectedList.name);
            expect(res.body.content).to.eql(expectedList.content);
          });
      });
    });
  });

  describe(`POST /api/lists`, () => {
    const testUsers = makeUsersArray();
    beforeEach('insert malicious list', () => {
      return db
        .into('groupcheck_users')
        .insert(testUsers);
    });

    it(`creates an list, responding with 201 and the new list`, () => {
      const newList = {
        name: 'Test new list',
        style: 'Listicle',
        content: 'Test new list content...',
      };
      return supertest(app)
        .post('/api/lists')
        .send(newList)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(newList.name);
          expect(res.body.content).to.eql(newList.content);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/lists/${res.body.id}`);
          const expected = new Intl.DateTimeFormat('en-US').format(new Date());
          const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.date_published));
          expect(actual).to.eql(expected);
        })
        .then((res) =>
          supertest(app)
            .get(`/api/lists/${res.body.id}`)
            .expect(res.body));
    });

    const requiredFields = ['name', 'content'];

    requiredFields.forEach((field) => {
      const newList = {
        name: 'Test new list',
        style: 'Listicle',
        content: 'Test new list content...',
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newList[field];
        return supertest(app)
          .post('/api/lists')
          .send(newList)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });

    it('removes XSS attack content from response', () => {
      const { maliciousList, expectedList } = makeMaliciousList();
      return supertest(app)
        .post(`/api/lists`)
        .send(maliciousList)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(expectedList.name);
          expect(res.body.content).to.eql(expectedList.content);
        });
    });
  });

  describe(`DELETE /api/lists/:list_id`, () => {
    context(`Given no lists`, () => {
      it(`responds with 404`, () => {
        const listId = 123456;
        return supertest(app)
          .delete(`/api/lists/${listId}`)
          .expect(404, { error: { message: `List doesn't exist` } });
      });
    });

    context('Given there are lists in the database', () => {
      const testUsers = makeUsersArray();
      const testLists = makeListsArray();

      beforeEach('insert lists', () => {
        return db
          .into('groupcheck_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('groupcheck_lists')
              .insert(testLists);
          });
      });

      it('responds with 204 and removes the list', () => {
        const idToRemove = 2;
        const expectedLists = testLists.filter(list => list.id !== idToRemove);
        return supertest(app)
          .delete(`/api/lists/${idToRemove}`)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/lists`)
              .expect(expectedLists));
      });
    });
  });

  describe(`PATCH /api/lists/:list_id`, () => {
    context(`Given no lists`, () => {
      it(`responds with 404`, () => {
        const listId = 123456;
        return supertest(app)
          .delete(`/api/lists/${listId}`)
          .expect(404, { error: { message: `List doesn't exist` } });
      });
    });

    context('Given there are lists in the database', () => {
      const testUsers = makeUsersArray();
      const testLists = makeListsArray();

      beforeEach('insert lists', () => {
        return db
          .into('groupcheck_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('groupcheck_lists')
              .insert(testLists);
          });
      });

      it('responds with 204 and updates the list', () => {
        const idToUpdate = 2;
        const updateList = {
          name: 'updated list name',
          style: 'Interview',
          content: 'updated list content',
        };
        const expectedList = {
          ...testLists[idToUpdate - 1],
          ...updateList,
        };
        return supertest(app)
          .patch(`/api/lists/${idToUpdate}`)
          .send(updateList)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/lists/${idToUpdate}`)
              .expect(expectedList));
      });

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch(`/api/lists/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain either 'name' or 'content'`,
            },
          });
      });

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2;
        const updateList = {
          name: 'updated list name',
        };
        const expectedList = {
          ...testLists[idToUpdate - 1],
          ...updateList,
        };

        return supertest(app)
          .patch(`/api/lists/${idToUpdate}`)
          .send({
            ...updateList,
            fieldToIgnore: 'should not be in GET response',
          })
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/lists/${idToUpdate}`)
              .expect(expectedList));
      });
    });
  });
});
