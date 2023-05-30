import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export class GiveFormValidator {
    validateOffering(giveForm: AbstractControl) : {[key: string]: boolean} {
        const offeringControl = giveForm.get('amount');
        const offeringCat = giveForm.get('category');
        
        if (offeringControl && offeringControl.value !== 0) {
            if (offeringCat && (offeringCat.value === null || offeringCat.value === '')) {
                return { 'categoryRequired': true };
            }
 

        }

        return null;
    }

    validateOfferingOther(giveForm: AbstractControl) {
        const offeringControl = giveForm.get('amount');
        const offeringCat = giveForm.get('category');
        const offeringOther = giveForm.get('other');
        
        if (offeringControl && offeringControl.value !== 0) {
            if (offeringCat && offeringCat.value === 'Other' && offeringOther && (offeringOther.value === '' || !offeringOther.value)) {
                return { 'otherRequired': true };
            }
        }

        return null;
    }

    offeringRequired(giveForm: AbstractControl) : {[key: string]: boolean} {
        const offeringControl = giveForm.get('amount');
        if (offeringControl && (offeringControl.value === '$0.00') || !offeringControl.value) {
            return { 'offeringRequired': true };
        }
        return null;
    }

    oneRequired(giveForm: AbstractControl) : {[key: string]: boolean} {
        const offeringArray = giveForm.get('offerings') as FormArray;
        const titheControl = giveForm.get('tithe');

        let offeringValid = false;
        offeringArray.controls.forEach((control: FormGroup) => {
            if (control.controls['amount'].value !== '$0.00') {
                offeringValid = true;
            }
        });

        if (!titheControl.value || titheControl.value === '$0.00') { // tithe is empty
            if (!offeringValid) {
                return { 'oneRequired':  true };
            }
        }
        return null;
    }
}