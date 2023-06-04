import { BaseExcel } from "./base-excel";
import * as XLSX from 'xlsx';

export class GivingSheet implements BaseExcel {
    constructor() {}

    generateSheet(): XLSX.WorkSheet {
        const titleRange = 'C4:E4';
        let sheet = XLSX.utils.sheet_add_aoa([
            [],
            [],
            [],
            [/* A4 */ , /* B4 */ ,'TITHE FOR 2023', /* D4 */ , /* E4 */ , /* F4 */, /* G4 */, /* H4 */],
            [],
            [], 
            [/*A7*/, '1st Week', '2nd Week', '3rd Week', '4th Week', '5th Week', /* G4 */, 'Total'],
            [],
            ['Januray', /* B9 */, /* C9 */, /* D9 */, /* E9 */, /* G9 */, , '$0.00'],
            [],
            ['February', /* B11 */, /* C11 */, /* D11 */, /* E11 */, /* G11 */,, '$0.00'],
            [],
            ['March', /* B11 */, /* C11 */, /* D11 */, /* E11 */, /* G11 */,, '$0.00'],
            [],
            ['April', /* B11 */, /* C11 */, /* D11 */, /* E11 */, /* G11 */,, '$0.00'],
            [],
            ['May', /* B11 */, /* C11 */, /* D11 */, /* E11 */, /* G11 */,, '$0.00'],
            [],
            ['June', /* B11 */, /* C11 */, /* D11 */, /* E11 */, /* G11 */,, '$0.00'],
            [],
            ['July', /* B11 */, /* C11 */, /* D11 */, /* E11 */, /* G11 */,, '$0.00'],
            [],
            ['August', /* B11 */, /* C11 */, /* D11 */, /* E11 */, /* G11 */,, '$0.00'],
            [],
            ['September', /* B11 */, /* C11 */, /* D11 */, /* E11 */, /* G11 */,, '$0.00'],
            [],
            ['October', /* B11 */, /* C11 */, /* D11 */, /* E11 */, /* G11 */,, '$0.00'],
            [],
            ['November', /* B11 */, /* C11 */, /* D11 */, /* E11 */, /* G11 */, ,'$0.00'],
            [],
            ['December', /* B11 */, /* C11 */, /* D11 */, /* E11 */, /* G11 */, ,'$0.00'],
          ], null, {origin: "A1" });
        sheet['!merges'] = [XLSX.utils.decode_range(titleRange)];
        return sheet;
    }
}