import { Fetcher } from '@graphiql/toolkit'
import { GraphQLError, GraphQLSchema, parse, validate } from 'graphql'

export function extendFetcherWithValidations(schema: GraphQLSchema | undefined, fetcher: Fetcher): Fetcher {
  return (...[params, opts]: Parameters<Fetcher>): ReturnType<Fetcher> => {
    if (params.operationName === 'IntrospectionQuery' || schema === undefined) {
      return fetcher(params, opts)
    }

    try {
      const documentNode = parse(params.query)
      const validationErrors = validate(schema, documentNode)

      if (validationErrors.length > 0) {
        return {
          data: null,
          extensions: {
            warning:
              'The Graph will soon start returning validation errors for GraphQL queries. Please fix the errors in your queries. For more information: https://thegraph.com/docs/en/release-notes/graphql-validations-migration-guide',
          },
          errors: validationErrors,
        }
      }

      return fetcher(params, opts)
    } catch (e) {
      console.log('fetcher error', e)
      return {
        errors: [e as GraphQLError],
      }
    }
  }
}
