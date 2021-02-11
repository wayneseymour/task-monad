const request = require('request');
const got = require('got');

const pipe = (...fns) => fns.reduce((f, g) => (...args) => g(f(...args)));

const id = x => x;

const Task = fork => ({
  fork,
  map(f) {
    return Task((err, ok) =>
      fork(err, pipe(f, ok))) //<= theres our compose!
  },
  chain(f) {
    return Task((err, ok) =>
      fork(err, x => f(x).fork(err, ok)))
  },
  fold() {
    Task.chain(id)
  }
})

Task.of = x => ((_, ok) => ok(x)); // pass over the err param
Task.fromPromised = fn => (...args) =>
  Task((rej, res) =>
    fn(...args)
      .then(res)
      .catch(rej),
  );

const httpGetTask = url => Task((reject, resolve) =>
  request(url, (err, data) => { err? reject(err) : resolve(data)}))

const url = 'https://jsonplaceholder.typicode.com/users/1/todos';

Task.fromPromised(x => got.get(x))('stop.com')
  .map(x => x.body)
  .fork(x => console.error(`\n### x: \n\t${x}`), id)//?


httpGetTask(url) // Mapping before forking (transforming the value before we even have a value :)
  .map(x => x.body)
  .fork(e => console.error(e), id)

const simpleTask = httpGetTask('https://jsonplaceholder.typicode.com/users/1/todos')

simpleTask.fork(e => console.error(e), x => console.log(x.body))//?
