type Primitive = "number" | "string"

type TableSchema = {
  table: string
  primaryKey: string
  fields: Record<string, Primitive>
}

type LambdaSchema = {
  schema: {
    typeSystem: string
    keyKind: string
    entity: string
  }

  types: Record<string, { kind: "primitive" }>

  constructors: Record<
    string,
    {
      kind: "record"
      fields: Record<string, string>
    }
  >

  mapping: Record<string, string>

  primaryKey: string
}

const primitiveMap: Record<string, Primitive> = {
  Number: "number",
  String: "string"
}

const validateMapping = (
  lambda: LambdaSchema,
  table: TableSchema
) => {

  const entity = lambda.schema.entity
  const constructor = lambda.constructors[entity]

  if (!constructor) {
    throw new Error("missing constructor for entity")
  }

  const fields = constructor.fields

  for (const symbol in fields) {

    const lambdaType = fields[symbol]
    const mappedField = lambda.mapping[symbol]

    if (!mappedField) {
      throw new Error(`missing mapping for ${symbol}`)
    }

    const tableType = table.fields[mappedField]

    if (!tableType) {
      throw new Error(`table missing field ${mappedField}`)
    }

    const expectedType = primitiveMap[lambdaType]

    if (expectedType !== tableType) {
      throw new Error(
        `type mismatch ${symbol} -> ${mappedField}`
      )
    }
  }

  return true
}

const validatePrimaryKey = (
  lambda: LambdaSchema,
  table: TableSchema
) => {

  const mappedKey = lambda.mapping[lambda.primaryKey]

  if (!mappedKey) {
    throw new Error("primary key mapping missing")
  }

  if (mappedKey !== table.primaryKey) {
    throw new Error(
      `primary key mismatch: ${mappedKey} vs ${table.primaryKey}`
    )
  }

  return true
}

export const validateSchema = (
  lambda: LambdaSchema,
  table: TableSchema
) => {

  if (lambda.schema.typeSystem !== "lambda-calculus") {
    throw new Error("unsupported type system")
  }

  validateMapping(lambda, table)
  validatePrimaryKey(lambda, table)

  return {
    ok: true,
    entity: lambda.schema.entity,
    table: table.table
  }
}
