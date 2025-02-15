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
        }).nullable()
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

export function parsePrismicDoc(data_: Record<string, any>):
    Record<string, any> {
    const data: Record<string, any> = {}

    for (let field in data_) {
        const metadata = data_[field];

        if (typeof metadata == "object") data[field] = parseField(metadata)
        else data[field] = metadata
    }

    return data
}

function parseField(field: any): any {
    if (!field) return null
    if (Object.keys(field).length == 0) return null
    if ("url" in field && "alt" in field) {
        const { url, alt } = field;
        return { url, alt }
    }
    if ("link_type" in field && field.link_type == "Document") {
        const { id, slug } = field;
        if (!id) return null;
        else return { id, slug };
    }
    if (field.length == 1) {
        const [subfield] = field;
        if ("text" in subfield) return {
            text: asText(field),
            rendered: asHTML(field)
        }
        else return [parsePrismicDoc(subfield)]
    }
    if ("text" in field[0]) {
        const text = asText(field)
        const rendered = asHTML(field)
        return { text, rendered }
    }

    const array = []
    for (let subfield of field) {
        array.push(parsePrismicDoc(subfield))
    }
    return array
}