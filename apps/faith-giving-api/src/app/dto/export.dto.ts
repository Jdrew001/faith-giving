export interface GivingExportDTO {
    data: Array<GivingExportItem>;
    total: string;
}

export interface GivingExportItem {
    name: string;
    id: number;
    weeks: Array<string>;
    total: string;
}