module.exports = (logger, props) => (state) => {
  const meta = Object.assign({}, props);

  const { args } = state;

  if (args.length && typeof args[0] === 'object') {
    Object.assign(meta, args.shift());
  }

  state.meta = meta;
};
