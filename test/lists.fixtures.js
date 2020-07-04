function makeListsArray() {
    return [
      {
        id: 1,
        date_published: '2029-01-22T16:28:32.615Z',
        name: 'First test post!',
        author: 1,
      },
      {
        id: 2,
        date_published: '2100-05-22T16:28:32.615Z',
        name: 'Second test post!',
        author: 1,
      },
      {
        id: 3,
        date_published: '1919-12-22T16:28:32.615Z',
        name: 'Third test post!',
        author: 1,
      },
      {
        id: 4,
        date_published: '1919-12-22T16:28:32.615Z',
        name: 'Fourth test post!',
        author: 1,
      },
    ];
  }

  function makeMaliciousList() {
    const maliciousList = {
      id: 911,
      date_published: new Date().toISOString(),
      name: 'Naughty naughty very naughty <script>alert("xss");</script>',
      author: 1,
    };
    const expectedList = {
      ...maliciousList,
      name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      author: 1
    };
    return {
      maliciousList,
      expectedList,
    };
  }

  module.exports = {
    makeListsArray,
    makeMaliciousList,
  };
