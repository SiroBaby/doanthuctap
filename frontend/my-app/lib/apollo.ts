import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// Fix the environment variable access
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/graphql";

const httpLink = createHttpLink({
    uri: BACKEND_URL,
    credentials: "include",
});

export const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});
