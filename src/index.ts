import type { Loader } from "astro/loaders";
import { createClient } from "@prismicio/client";
import { defineCollection } from "astro:content";

import { schematize } from "./lib/parser.ts";
import { collectionLoader, pageLoader } from "./lib/loader.ts";


const API_ENDPOINT = "https://customtypes.prismic.io/customtypes";

export async function PrismicLoader(
    { repository, accessToken }: LoaderParams
): Promise<Record<string, Loader>> {
    const client = createClient(`https://${repository}.cdn.prismic.io/api/v2`)
    const request = await fetch(API_ENDPOINT, {
        headers: {
            repository,
            "Authorization": `Bearer ${accessToken}`
        }
    });
    const response: TypeResponse[] = await request.json();

    const pageTypes = response.filter((i) => i.id.includes("page"));
    const collectionTypes = response.filter((i) => i.repeatable == true);

    const loaders: Record<string, Loader> = {}
    
    loaders["page"] = defineCollection({loader: pageLoader(client, pageTypes)});

    for (let collection of collectionTypes) {
        const name = collection.id;
        const metadata = collection.json.Main;
        const schema = schematize(metadata);
        loaders[name] = defineCollection({
            schema, loader: collectionLoader(client, name, metadata)
        });
    }

    return loaders
}