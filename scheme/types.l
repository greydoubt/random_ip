{
  "schema": {
    "typeSystem": "lambda-calculus",
    "keyKind": "symbolic",
    "entity": "Set"
  },
  "types": {
    "Number": {
      "kind": "primitive"
    },
    "String": {
      "kind": "primitive"
    }
  },
  "constructors": {
    "Set": {
      "kind": "record",
      "fields": {
        "α": "Number",
        "β": "String",
        "γ": "String",
        "δ": "Number"
      }
    }
  },
  "mapping": {
    "α": "key",
    "β": "name",
    "γ": "set",
    "δ": "chain"
  },
  "primaryKey": "α"
}
