import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';

// Fix the environment variable access
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:3001/graphql";

const httpLink = createHttpLink({
    uri: BACKEND_URL,
    credentials: "include",
    fetchOptions: {
        credentials: 'include'
    },
});

// Add auth context
const authLink = setContext((_, { headers }) => {
    return {
        headers: {
            ...headers,
            credentials: 'include',
            'Apollo-Require-Preflight': 'true',
        }
    };
});

export const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'network-only',
        },
        query: {
            fetchPolicy: 'network-only',
        },
    },
});
