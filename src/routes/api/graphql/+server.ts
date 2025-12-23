import { createSchema, createYoga } from "graphql-yoga";
import type { RequestEvent } from "@sveltejs/kit";

const yogaApp = createYoga<RequestEvent>({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        hello: String!
      }
    `,
    resolvers: {
      Query: {
        hello: () => "SvelteKit - GraphQL Yoga",
      },
    },
  }),
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
});

export { yogaApp as GET, yogaApp as POST, yogaApp as OPTIONS };
