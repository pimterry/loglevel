const fs = require('fs');

module.exports = (logger, props) => {
  props = Object.assign(
    {
      file: 'app.log',
      fields: ['message', 'stacktrace'],
      separator: '\n',
      eol: '\n',
      roll: true,
    },
    props,
  );

  return (state) => {
    const fields = props.fields.map(field => state[field]).filter(field => field);

    fs.appendFileSync(props.file, fields.join(props.separator) + props.eol);

    state.roll = props.roll;
  };
};
