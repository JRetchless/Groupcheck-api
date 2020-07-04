function makeUsersArray() {
    return [
      {
        id: 1,
        firstname: 'Sam',
        lastname: 'Gamgee',
        email: 'sam.gamgee@shire.com',
        p_word: 'secret',
      },
      {
        id: 2,
        firstname: 'Peregrin',
        lastname: 'Took',
        email: 'peregrin.took@shire.com',
        p_word: 'secret',
      },
    ];
  }
  function makeMaliciousUser() {
    const maliciousUser = {
      id: 911,
      firstname: 'Naughty naughty very naughty <script>alert("xss");</script>',
      lastname: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      email:'superbademail@doesnt.exist',
      p_word:'baduser'
    };
    const expectedUser = {
      ...maliciousUser,
      firstname: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      lastname: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
      email:'superbademail@doesnt.exist',
      p_word:'baduser',
    };
    return {
      maliciousUser,
      expectedUser,
    };
  }

  module.exports = {
    makeUsersArray,
    makeMaliciousUser
  };
