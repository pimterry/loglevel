/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-extraneous-dependencies */

// for node
const fetch = require('node-fetch');

// for browser
// const fetch = require('unfetch');

module.exports = (logger, props) => {
  props = Object.assign(
    {
      request: {
        method: 'POST',
      },
      url: '/logger',
      data: 'json',
      roll: true,
    },
    props,
  );

  return (state) => {
    const request = Object.assign({}, props.request);
    request.body = typeof props.data === 'function' ? props.data(state) : state[props.data];

    fetch(props.url, request);

    state.roll = props.roll;
  };
};
