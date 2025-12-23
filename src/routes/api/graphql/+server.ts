import { createSchema, createYoga } from "graphql-yoga";
import type { RequestEvent } from "@sveltejs/kit";
import { useCookies } from "@whatwg-node/server-plugin-cookies";

import { taskGqlController } from "$lib/server/graphql/controllers/task.gql.controller";
import { timelogGqlController } from "$lib/server/graphql/controllers/timelog.gql.controller";
import { summaryGqlController } from "$lib/server/graphql/controllers/summary.gql.controller";
import { authGqlController } from "$lib/server/graphql/controllers/auth.gql.controller";

import {
  COOKIE_NAME,
  getUserFromRawToken,
} from "$lib/server/services/auth.service";

const yogaApp = createYoga<RequestEvent>({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      enum TaskStatus {
        PENDING
        IN_PROGRESS
        COMPLETED
      }

      type User {
        id: ID!
        email: String!
      }

      type AuthPayload {
        user: User!
      }

      type Task {
        id: ID!
        title: String!
        description: String!
        status: TaskStatus!
        totalTrackedSec: Int!
        activeStartedAt: String
      }

      type TimeLog {
        id: ID!
        taskId: ID!
        startedAt: String!
        endedAt: String
        durationSec: Int!
      }

      type TodaySummary {
        totalSec: Int!
        completed: Int!
        inProgress: Int!
        pending: Int!
        tasksWorkedOn: [Task!]!
      }

      type Query {
        hello: String!
        me: User
        tasks: [Task!]!
        todaySummary: TodaySummary!
        timeLogs(taskId: ID): [TimeLog!]!
      }

      type Mutation {
        signup(email: String!, password: String!): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
        logout: Boolean!

        createTask(input: String!): Task!
        updateTask(
          id: ID!
          title: String
          description: String
          status: TaskStatus
        ): Task!
        deleteTask(id: ID!): Boolean!

        startTimer(taskId: ID!): TimeLog!
        stopTimer(taskId: ID!): TimeLog!
      }
    `,

    resolvers: {
      Query: {
        hello: () => "GraphQL OK",
        me: authGqlController.me,
        tasks: taskGqlController.tasks,
        todaySummary: summaryGqlController.todaySummary,
        timeLogs: timelogGqlController.timeLogs,
      },
      Mutation: {
        signup: authGqlController.signup,
        login: authGqlController.login,
        logout: authGqlController.logout,

        createTask: taskGqlController.createTask,
        updateTask: taskGqlController.updateTask,
        deleteTask: taskGqlController.deleteTask,
        startTimer: timelogGqlController.startTimer,
        stopTimer: timelogGqlController.stopTimer,
      },
    },
  }),
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response },
  plugins: [useCookies()],
  context: async ({ request }: any) => {
    const cookieStore = request.cookieStore;
    const sid = await cookieStore?.get(COOKIE_NAME);
    const user = await getUserFromRawToken(sid?.value ?? null);
    return { user, cookieStore };
  },
});

export { yogaApp as GET, yogaApp as POST, yogaApp as OPTIONS };
