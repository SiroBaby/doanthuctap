"use client";

import { ApolloProvider } from "@apollo/client";
import { ThemeProvider } from "next-themes";
import { apolloClient } from "@/lib/apollo";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProvider client={apolloClient}>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                {children}
            </ThemeProvider>
        </ApolloProvider>
    );
}
