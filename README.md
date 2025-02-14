# Astro Loader Prismic

This package is a loader to load data from a Prismic CMS into Astro using the Astro Loader API introduced in Astro 5.


## Basic usage

In your content configuration file, you can use the PrismicLoader function to use your Prismic content as a data source.

```ts
import { PrismicLoader } from "astro-loader-prismic";
import { defineCollection } from "astro:content";

export const collections = { 
    ...PrismicLoader({
        repository: "respository-name",
        accessToken: "access-token"
    })
 };
```

Remember that due to the nature Astros Content Layer lifecycle, the loader will only fetch entries at build time, even when using on-demand rendering. If you want to update your deployed site with new entries, you need to rebuild it.