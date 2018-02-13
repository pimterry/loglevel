function getStackTrace() {
  try {
    throw new Error();
  } catch (trace) {
    return trace.stack;
  }
}

module.exports = (logger, props) => {
  // Return noop plugin if stacktrace support is absent
  if (!getStackTrace()) {
    return () => {};
  }

  props = Object.assign(
    {
      levels: ['trace', 'warn', 'error'],
      depth: 3,
    },
    props,
  );

  return (state) => {
    if (!props.levels.some(level => level === state.label)) {
      return;
    }

    let stacktrace = getStackTrace();

    const lines = stacktrace.split('\n');
    lines.splice(0, 4);
    const { depth } = props;
    if (depth && lines.length !== depth + 1) {
      const shrink = lines.splice(0, depth);
      stacktrace = shrink.join('\n');
      if (lines.length) stacktrace += `\n    and ${lines.length} more`;
    } else {
      stacktrace = lines.join('\n');
    }

    state.stacktrace = stacktrace;
  };
};
