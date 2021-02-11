const request = require('request');
const got = require('got');

const Task = require('../task');

const id = x => x;

describe(`task monad`, () => {
  it(`should not eval until fork is called`, () => {
    const t1 = Task((rej, res) => res(1))
      .map(one => one + 2)
      .map(three => three * 2)
      .chain(six => Task((rej, res) => res(six + 1)));

    t1.fork(console.error, x => {
      expect(x).toBe(7)
    })
  });
  describe(`used with a promise fn`, () => {
    describe(`that calls a bad url`, () => {
      it(`should handle the error in the rejected handler`, () => {
        Task.fromPromised(x => got.get(x))('http://stop.com')
          .fork(
            e => expect(e).toBe('RequestError: getaddrinfo ENOTFOUND stop.com stop.com:80'),
            id
          )
      });
    });
  });
});
//=====================================================================
// const httpGetTask = url => Task((reject, resolve) =>
//   request(url, (err, data) => { err? reject(err) : resolve(data)}))
//
// const url = 'https://jsonplaceholder.typicode.com/users/1/todos';
//
//
// const body = x => x.body;
//

//
//
// httpGetTask(url)
//   .map(body)
//   .fork(errorFork, id)
//
// const simpleTask = httpGetTask('https://jsonplaceholder.typicode.com/users/1/todos')
//
// simpleTask.fork(e => console.error(e), x => console.log(x.body))//?
