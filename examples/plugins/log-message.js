const { format } = require('util');

module.exports = () => (state) => {
  state.message = format(...state.args);
};
