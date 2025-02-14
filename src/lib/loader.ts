import type { ZodType } from "zod";
import type { Client } from "@prismicio/client";
import type { Loader, LoaderContext } from 'astro/loaders';

import { parsePrismicDoc } from "./parser.ts";


export function collectionLoader(client: Client, name: string, schema: ZodType): Loader {
    return {
        name, schema,
        load: async ({ store, parseData }: LoaderContext) => {
            const results = await client.getAllByType(name);

            for (let result of results) {
                const id = result.id
                const [slug] = result.slugs;
                const data_ = result.data;

                const predata = parsePrismicDoc(data_)
                const data = { id, slug, ...predata }

                const entry = await parseData({ id: slug, data });
                store.set({ id: slug, data: entry });
            }
        }
    }
}