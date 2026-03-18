const MyAppNamespace = (function () {
  // Private variables
  const _schema = schema;
  const _table = table;

  // Private function
  function _validate() {
    return validateSchema(_schema, _table);
  }

  // Public API
  return {
    // Expose validation
    validate: function () {
      return _validate();
    },

    // Expose workers
    workers: Workers,
  };
})();

// Usage
const result = MyAppNamespace.validate();
console.log(result);

// Example: using a worker
// MyAppNamespace.workers.someWorkerFunction();
