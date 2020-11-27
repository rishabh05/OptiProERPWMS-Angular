import { UOM } from './UOM';

export interface OpenPOLinesModel{
    CardCode: string;
    DOCENTRY: number;
    DocNum: string;
    FACTOR: number;
    ITEMCODE: string;
    ITEMNAME: string;
    LINENUM: number;
    OPENQTY: number;
    QCREQUIRED: string;
    ROWNUM: number;
    RPTQTY;
    SHIPDATE: string;
    TOTALQTYINVUOM: number;
    TRACKING: string;
    TargetBin: any;
    TargetWhs: any;
    UOM: string;
    WHSE: string;
    UOMList: UOM[];
    PalletCode: string;
    INVOPENQTY;
    INVRPTQTY;
}