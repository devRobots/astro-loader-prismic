interface LoaderParams {
    repository: string,
    accessToken: string
}

interface TypeResponse {
    id: string,
    json: any,
    label: string,
    repeatable: boolean,
    status: boolean,
    format: string
}

interface TypeStruct {
    type: string,
    config: any
}