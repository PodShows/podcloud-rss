// polyfill
import "isomorphic-fetch"

import { execute, makePromise } from "apollo-link"
import { HttpLink } from "apollo-link-http"

class GraphQLSimpleHttpClient {
  constructor(uri) {
    this.link = new HttpLink({ uri })
  }

  query(operation) {
    /* istanbul ignore next */
    return makePromise(execute(this.link, operation))
  }
}

export default GraphQLSimpleHttpClient
