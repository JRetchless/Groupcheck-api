function makeSharedListsArray() {
    return [
      {
        id: 1,
        shared_by: 2,
        shared_to: 1,
        list_id: 3,
      },
      {
        id: 2,
        shared_by: 1,
        shared_to: 2,
        list_id: 2,
      },
    ];
  }

  module.exports = {
    makeSharedListsArray,
  };
