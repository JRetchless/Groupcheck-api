const knex = require('knex');
const app = require('../src/app');
const { makeUsersArray } = require('./users.fixtures');
const { makeItemsArray, makeMaliciousItem } = require('./items.fixtures');

describe('Items Endpoints', function() {
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
  describe(`GET /api/items/:list_id`, () => {
    context(`Given no items`, () => {
      it(`responds with 403`, () => {
        const listId = 123456;
        return supertest(app)
          .get(`/api/items/${listId}`)
          .expect(404, { error: { message: `List doesn't exist` } });
      });
    });

    context('Given there are items in the database', () => {
      const testUsers = makeUsersArray();
      const testItems = makeItemsArray();

      beforeEach('insert items', () => {
        return db
          .into('groupcheck_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('groupcheck_items')
              .insert(testItems);
          });
      });

      it('responds with 200 and the specified item', () => {
        const listId = 2;
        const expectedItem = testItems[listId - 1];
        return supertest(app)
          .get(`/api/items/${listId}`)
          .expect(200, expectedItem);
      });
    });

    context(`Given an XSS attack item`, () => {
      const testUsers = makeUsersArray();
      const { maliciousItem, expectedItem } = makeMaliciousItem();

      beforeEach('insert malicious item', () => {
        return db
          .into('groupcheck_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('groupcheck_items')
              .insert([maliciousItem]);
          });
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/items/${maliciousItem.id}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.name).to.eql(expectedItem.name);
            expect(res.body.content).to.eql(expectedItem.content);
          });
      });
    });
  });

  describe(`POST /api/items/:list_id`, () => {
    const testUsers = makeUsersArray();
    beforeEach('insert malicious item', () => {
      return db
        .into('groupcheck_users')
        .insert(testUsers);
    });

    it(`creates an item, responding with 201 and the new item`, () => {
      const newItem = {
        name: 'Test new item',
        content: 'Test new item content...',
        priority: 1,
        list_id: 1,
        user_id: 1,
      };
      return supertest(app)
        .post('/api/items/1')
        .send(newItem)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(newItem.name);
          expect(res.body.content).to.eql(newItem.content);
          expect(res.body.priority).to.eql(newItem.priority);
          expect(res.body.list_id).to.eql(newItem.list_id);
          expect(res.body.user_id).to.eql(newItem.user_id);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/api/items/${res.body.list_id}`);
        })
        .then((res) =>
          supertest(app)
            .get(`/api/items/${res.body.list_id}`)
            .expect(res.body));
    });

    const requiredFields = ['name', 'content'];

    requiredFields.forEach((field) => {
      const newItem = {
        name: 'Test new item',
        content: 'Test new item content...',
        priority: 1,
        list_id: 2,
        user_id: 1,
      };

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newItem[field];
        return supertest(app)
          .post('/api/items/2')
          .send(newItem)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });

    it('removes XSS attack content from response', () => {
      const { maliciousItem, expectedItem } = makeMaliciousItem();
      return supertest(app)
        .post(`/api/items/2`)
        .send(maliciousItem)
        .expect(201)
        .expect((res) => {
          expect(res.body.name).to.eql(expectedItem.name);
          expect(res.body.content).to.eql(expectedItem.content);
          expect(res.body.priority).to.eql(newItem.priority);
          expect(res.body.list_id).to.eql(newItem.list_id);
          expect(res.body.user_id).to.eql(newItem.user_id);
        });
    });
  });

  describe(`DELETE /api/items/:list_id/:item`, () => {
    context(`Given no lists`, () => {
      it(`responds with 404`, () => {
        const listId = 123456;
        return supertest(app)
          .delete(`/api/items/${listId}/:2`)
          .expect(404, { error: { message: `List doesn't exist` } });
      });
    });

    context('Given there are items in the database', () => {
      const testUsers = makeUsersArray();
      const testItems = makeItemsArray();

      beforeEach('insert items', () => {
        return db
          .into('groupcheck_users')
          .insert(testUsers)
          .then(() => {
            return db
              .into('groupcheck_items')
              .insert(testItems);
          });
      });

      it('responds with 204 and removes the item', () => {
        const idToRemove = 2;
        const expectedItems = testItems.filter(item => item.id !== idToRemove);
        return supertest(app)
          .delete(`/api/items/2/${idToRemove}`)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/items/2`)
              .expect(expectedItems));
            });
        });
    });
});
