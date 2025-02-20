import { z } from "zod";
import type { Client } from "@prismicio/client";
import type { Loader, LoaderContext } from 'astro/loaders';

import { parsePrismicDoc } from "./parser.ts";

export function pageLoader(
    client: Client, pages: TypeResponse[]
): Loader {
    return {
        name: "page", schema: z.any(),
        load: async ({ store, parseData }: LoaderContext) => {
            for (let page of pages) {
                const metadata = page.json.Main;
                const result = await client.getSingle(page.id);

                const id = result.id
                const [slug] = result.slugs;
                const data_ = result.data;

                const predata = parsePrismicDoc(data_, metadata)
                const data = { id, slug, ...predata }
                const body = data_.body

                const entry = await parseData({ id: slug, data });
                store.set({ id: slug, data: entry, body });
            }
        }
    }
}

export function collectionLoader(
    client: Client, name: string, metaschema: Record<string, any>
): Loader {
    return {
        name,
        load: async ({ store, parseData }: LoaderContext) => {
            const results = await client.getAllByType(name);

            for (let result of results) {
                const id = result.id
                const [slug] = result.slugs;
                const data_ = result.data;

                const predata = parsePrismicDoc(data_, metaschema)
                const data = { id, slug, ...predata }

                const entry = await parseData({ id: slug, data });
                store.set({ id: slug, data: entry });
            }
        }
    }
}