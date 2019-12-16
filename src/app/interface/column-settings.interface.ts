export interface ColumnSettings {
    field: string;
    title?: string;
    filter?: 'string'|'numeric'|'date'|'boolean';
    format?: string;
    width?: number;
    _width?: number;
    filterable: boolean;
    orderIndex?: number;
}