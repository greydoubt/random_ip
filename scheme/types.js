const schema = {
  table: "set",
  primaryKey: "key",
  fields: {
    "key": "number",
    "name": "string",
    "set": "string",
    "chain": "number"
  }
}

const typeCheck = schema => obj =>
  Object.entries(schema.fields).every(([k,t]) =>
    typeof obj[k] === t
  )

const requireFields = schema => obj =>
  Object.keys(schema.fields).every(k => k in obj)

const validate = schema => obj =>
  requireFields(schema)(obj) && typeCheck(schema)(obj)

const Types = {
  schema,
  validate
}
