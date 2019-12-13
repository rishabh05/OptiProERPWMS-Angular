import { State, DataResult } from "@progress/kendo-data-query";
import { ColumnSettings } from "./column-settings.interface";

export interface GridSettings {
    columnsConfig: ColumnSettings[];
    state: State;
    gridData?: DataResult;
}