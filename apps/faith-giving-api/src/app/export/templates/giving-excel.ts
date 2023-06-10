import { GivingExportDTO, GivingExportItem } from "../../dto/export.dto";
import { BaseExcel } from "./base-excel";
import * as XLSX from 'xlsx';

export class GivingSheet extends BaseExcel {

    _givingData: GivingExportDTO;

    constructor(
        data: GivingExportDTO
    ) {
        super();
        this._givingData = data;
    }

    generateSheet(): XLSX.WorkSheet {
        const titleRange = 'C4:E4';
        const janData = this.getData(1, this._givingData);
        const febData = this.getData(2, this._givingData);
        const marchData = this.getData(3, this._givingData);
        const aprilData = this.getData(4, this._givingData);
        const mayData = this.getData(5, this._givingData);
        const juneData = this.getData(6, this._givingData);
        const julyData = this.getData(7, this._givingData);
        const augData = this.getData(8, this._givingData);
        const septData = this.getData(9, this._givingData);
        const octData = this.getData(10, this._givingData);
        const noveData = this.getData(11, this._givingData);
        const decData = this.getData(12, this._givingData);
        let sheet = XLSX.utils.aoa_to_sheet([
            [],
            [],
            [],
            [/* A4 */ , /* B4 */ ,'TITHE FOR 2023', /* D4 */ , /* E4 */ , /* F4 */, /* G4 */, /* H4 */],
            [],
            [], 
            [/*A7*/, '1st Week', '2nd Week', '3rd Week', '4th Week', '5th Week', /* G4 */, 'Total'],
            [],
            [janData.name, janData.weeks[0], janData.weeks[1], janData.weeks[2], janData.weeks[3], janData.weeks[4], ,janData.total],
            [],
            [febData.name, febData.weeks[0], febData.weeks[1], febData.weeks[2], febData.weeks[3], febData.weeks[4],,febData.total],
            [],
            [marchData.name, marchData.weeks[0], marchData.weeks[1], marchData.weeks[2], marchData.weeks[3], marchData.weeks[4],,marchData.total],
            [],
            [aprilData.name, aprilData.weeks[0], aprilData.weeks[1], aprilData.weeks[2], aprilData.weeks[3], aprilData.weeks[4],,aprilData.total],
            [],
            [mayData.name, mayData.weeks[0], mayData.weeks[1], mayData.weeks[2], mayData.weeks[3], mayData.weeks[4],,mayData.total],
            [],
            [juneData.name, juneData.weeks[0], juneData.weeks[1], juneData.weeks[2], juneData.weeks[3], juneData.weeks[4],,juneData.total],
            [],
            [julyData.name, julyData.weeks[0], julyData.weeks[1], julyData.weeks[2], julyData.weeks[3], julyData.weeks[4],,julyData.total],
            [],
            [augData.name, augData.weeks[0], augData.weeks[1], augData.weeks[2], augData.weeks[3], augData.weeks[4],,augData.total],
            [],
            [septData.name, septData.weeks[0], septData.weeks[1], septData.weeks[2], septData.weeks[3], septData.weeks[4],,septData.total],
            [],
            [octData.name, octData.weeks[0], octData.weeks[1], octData.weeks[2], octData.weeks[3], octData.weeks[4],,octData.total],
            [],
            [noveData.name, noveData.weeks[0], noveData.weeks[1], noveData.weeks[2], noveData.weeks[3], noveData.weeks[4], ,noveData.total],
            [],
            [decData.name, decData.weeks[0], decData.weeks[1], decData.weeks[2], decData.weeks[3], decData.weeks[4], ,decData.total],
          ]);
        
        sheet['!merges'] = [XLSX.utils.decode_range(titleRange)];
        sheet['C4'].s = {
            bold: true,
            alignment: { horizontal: 'center', vertical: 'center' },
        }
        return sheet;
    }
}