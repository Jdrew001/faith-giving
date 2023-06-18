import { WorkSheet } from "@sheet/core";
import { GivingExportDTO, GivingExportItem } from "../../dto/export.dto";
import { BaseExcel } from "./base-excel";
import * as XLSX from '@sheet/core';

export class TitheSheet extends BaseExcel {

    _givingData: GivingExportDTO;
    _fontSize = 12;


    constructor(
        data: GivingExportDTO
    ) {
        super();
        this._givingData = data;
    }

    generateSheet(): XLSX.WorkSheet {
        const year = new Date().getFullYear();
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
            [/* A4 */ , /* B4 */ ,`TITHE FOR ${year}`, /* D4 */ , /* E4 */ , /* F4 */, /* G4 */, /* H4 */],
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
            [],
            [,,,,,`${year} Total Tithe`,,this._givingData.total],
            [],
            [,'Bring ye all the tithes into the'],
            [,'storehouse, that there may be meat'],
            [,'in mine house...    Malachi 3:10',,,,'Pastor Jonathan R. Harris']
          ], {cellStyles: true});
        
        
        return this.styleSpreadsheet(sheet);
    }

    styleSpreadsheet(sheet: WorkSheet) {
        const titleRange = 'C4:E4';
        const bodyCells = ['B7', 'C7', 'D7', 'E7', 'F7', 'H7', 'A9', 'B9', 'C9', 'D9', 'E9', 'F9', 'H9', 'A11', 'B11', 'C11', 'D11', 'E11', 'F11', 'H11',
            'A13', 'B13', 'C13', 'D13', 'E13', 'F13', 'H13', 'A15', 'B15', 'C15', 'D15', 'E15', 'F15', 'H15',
            'A17', 'B17', 'C17', 'D17', 'E17', 'F17', 'H17', 'A19', 'B19', 'C19', 'D19', 'E19', 'F19', 'H19', 
            'A21', 'B21', 'C21', 'D21', 'E21', 'F21', 'H21', 'A23', 'B23', 'C23', 'D23', 'E23', 'F23', 'H23', 
            'A25', 'B25', 'C25', 'D25', 'E25', 'F25', 'H25', 'A27', 'B27', 'C27', 'D27', 'E27', 'F27', 'H27', 
            'A29', 'B29', 'C29', 'D29', 'E29', 'F29', 'H29', 'A31', 'B31', 'C31', 'D31', 'E31', 'F31', 'H31', 'F33', 'H33'];
        const footerCells = ['B35', 'B36', 'B37', 'F37'];
        const columnStyles = [
            { width: 12, font: { size: 12 }, }, // Column A
            { width: 12, font: { size: 12 }, },
            { width: 14, font: { size: 12 }, },
            { width: 14, font: { size: 12 }, },
            { width: 14, font: { size: 12 }, },
            { width: 14, font: { size: 12 }, },
            { width: 0.00, font: { size: 12 }, },
            { width: 15, font: { size: 12 }, }
        ];

        sheet["!cols"] = columnStyles;
        sheet["!rows"] = [
            { hpt: 90 }
        ]

        // Other styles
        bodyCells.forEach(cell => {
            let rightAlignedCell = cell.includes('B') || cell.includes('C') || cell.includes('D') || cell.includes('E') || cell.includes('F') || cell.includes('H');
            let shouldBold = cell.includes('A') || cell.includes('B7') || cell.includes('C7') ||cell.includes('D7') ||cell.includes('E7') || cell.includes('F7') || cell.includes('F33') || cell.includes('H');
            let cellObj = sheet[cell];
            if (cellObj) {
                cellObj['s'] = {
                    bold: shouldBold,
                    alignment: { horizontal: rightAlignedCell ? 'right': 'left', vertical: 'center' },
                }
            }
        });

        footerCells.forEach(cell => {
            sheet[cell].s = {
                bold: true,
                alignment: { horizontal: 'center', vertical: 'center'},
                name: 'Baskerville Old Face'
            }
        });

         // TITLE RANGE
         sheet['!merges'] = [XLSX.utils.decode_range(titleRange)];
         sheet['C4'].s = {
            bold: true,
            alignment: { horizontal: 'center', vertical: 'center' },
            sz: 20,
            name: 'Times New Roman'
        }

        sheet["!margins"] = {
            left: 0.5,    // Left margin in inches
            right: 0.5,   // Right margin in inches
            top: 0.5,     // Top margin in inches
            bottom: 0.5,  // Bottom margin in inches
        }
        
        return sheet;
    }
}