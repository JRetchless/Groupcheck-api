function makeItemsArray() {
    return [
      {
        id: 1,
        name: "test1",
        content: "testcontent",
        priority: 1,
        list_id: 1,
        user_id: 1,
      },
      {
        id: 2,
        name: "test2",
        content: "testcontent2",
        priority: 1,
        list_id: 2,
        user_id: 2,
      },
    ];
  }
  function makeMaliciousItem() {
    const maliciousItem = {
      id: 911,
      name: 'Naughty naughty very naughty <script>alert("xss");</script>',
      content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      priority: 1,
      list_id: 911,
      user_id: 911
    };
    const expectedItem = {
      ...maliciousItem,
      name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
      priority: 1,
      list_id: 911,
      user_id: 911,
    };
    return {
      maliciousItem,
      expectedItem,
    };
  }

  module.exports = {
    makeItemsArray,
    makeMaliciousItem
  };
