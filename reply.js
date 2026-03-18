// INIT DB
import schema from "./scheme/schema.json"
import table from "./scheme/types.json"
import * from "./workers.js"

import { validateSchema } from "./scheme/types.ts"

const result = validateSchema(schema, table)

console.log(result)


// DOM HANDLER
function init(){
  document.getElementById("app").textContent = "ready"
}

const myModule = (function () {
  const earlierPart = "This was defined earlier";

  function getPreviousPart() {
    return earlierPart;
  }

  return { getPreviousPart };
})();

console.log(myModule.getPreviousPart());
