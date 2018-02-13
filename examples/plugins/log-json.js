module.exports = (logger, props) => {
  const fields = Object.keys(props);

  return (state) => {
    const json = {};

    fields.forEach((name) => {
      json[name] = typeof props[name] === 'function'
        ? props[name](state)
        : state[props[name]] || state[name];
    });

    state.json = JSON.stringify(json, null, '\t');
  };
};
