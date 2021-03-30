export enum ArchiveContentMode {
    none = '0',
    include_size = '1'
}

export enum ArchiveType {
    zip = 'zip',
    rar = 'rar',
    cbz = 'cbz',
    cbr = 'cbr'
}

export interface ArchiveContent {
    path: string
    name: string
    type: string
    width: number
    height: number
}

