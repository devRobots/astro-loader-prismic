import { z, type ZodTypeAny } from "zod";
import { asHTML, asText } from "@prismicio/client";

export function schematize(metadata: any) {
    const schema: Record<string, ZodTypeAny> = {
        id: z.string(),
        slug: z.string()
    }
    for (let type in metadata) {
        schema[type] = parseType(metadata[type]);
    }
    return z.object(schema);
}

function parseType(struct: TypeStruct): ZodTypeAny {
    if (struct.type == "Boolean") return z.boolean().nullable().default(false);
    if (struct.type == "Number") return z.number().default(0);
    if (struct.type == "StructuredText") {
        return z.object({
            text: z.string(),
            rendered: z.string()
        }).or(z.string()).nullable()
    }
    if (struct.type == "Link") {
        return z.object({
            id: z.string(),
            slug: z.string()
        }).nullable();
    }
    if (struct.type == "Image") {
        return z.object({
            url: z.string().nullable(),
            alt: z.string().nullable()
        }).nullable();
    }
    if (struct.type == "Group") {
        return z.array(z.any());
    }

    return z.any();
}

export function parsePrismicDoc(
    data_: Record<string, any>, schema: Record<string, any>
): Record<string, any> {
    const data: Record<string, any> = {}

    for (let field in data_) {
        const metadata = data_[field];
        const datatype = schema[field];

        if (!metadata || Object.keys(field).length == 0) {
            data[field] = null;
        } else if (datatype.type == "Group") {
            const array = [];
            for (let item in metadata) {
                array.push(
                    parsePrismicDoc(metadata[item], datatype.config.fields)
                );
            }
            data[field] = array
        } else if (datatype.type == "Link") {
            const { id, slug } = metadata;
            if (!id) data[field] = null;
            else data[field] = { id, slug };
        } else if (datatype.type == "Image") {
            const { url, alt } = metadata;
            data[field] = { url, alt }
        } else if (datatype.type == "StructuredText") {
            const isSingle = "single" in datatype.config;
            if (isSingle) data[field] = asText(metadata);
            else data[field] = {
                text: asText(metadata),
                rendered: asHTML(metadata)
            }
        } else {
            data[field] = metadata
        }
    }

    return data
}