import type { Loader } from "astro/loaders";
import { createClient } from "@prismicio/client";

import { schematize } from "./lib/parser.ts";
import { collectionLoader } from "./lib/loader.ts";


const API_ENDPOINT = "https://customtypes.prismic.io/customtypes";

export default async function PrismicLoader(
    { repository, accessToken }: LoaderParams
): Promise<Record<string, Loader>> {
    const request = await fetch(API_ENDPOINT, {
        headers: {
            repository,
            "Authorization": `Bearer ${accessToken}`
        }
    });
    const response: TypeResponse[] = await request.json();

    const collectionTypes = response.filter(
        (i: TypeResponse) => i.repeatable == true
    );

    const client = createClient(`https://${repository}.cdn.prismic.io/api/v2`)
    const loaders: Record<string, Loader> = {}

    for (let page of collectionTypes) {
        const name = page.id;
        const metadata = page.json.Main;
        const schema = schematize(metadata);
        loaders[name] = collectionLoader(client, name, schema);
    }

    return loaders
}