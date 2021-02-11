const pipe = (...fns) => fns.reduce((f, g) => (...args) => g(f(...args)));

const Task = fork => ({
  fork,
  map: f => Task((rej, res) => fork(rej, pipe(f, res))),
  chain: f =>
    Task((rej, res) => fork(rej, x => f(x).fork(rej, res))),
  fold: (f, g) =>
    Task((rej, res) => fork(x => f(x).fork(rej, res), x => g(x).fork(rej, res)))
})


Task.of = x =>
  ((rej, res) => res(x));
Task.fromPromised = fn => (...args) =>
  Task((rej, res) => fn(...args).then(res).catch(rej));
Task.rejected = x =>
  Task((rej, res) => rej(x))

module.exports = Task;
