"use client"

import {QueryClientProvider} from "@tanstack/react-query";
import {QueryClient} from "@tanstack/query-core";
import {ReactNode} from "react";

const client = new QueryClient();

const Providers = ({children}: {children: ReactNode}) => {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export default Providers