import { Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GivingFormService } from './services/giving-form.service';
import { GivingService } from './services/giving.service';
import { GrowlService } from '../core/growl.service';
import { GiveConstants } from './giving.constants';
import { UserDetails } from './models/giving.model';
import { AuthService } from '../core/services/auth.service';
import { ProfileModalService } from '../core/services/profile-modal.service';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';

declare var Stripe;

@Component({
  selector: 'faith-giving-giving',
  templateUrl: './giving.component.html',
  styleUrls: ['./giving.component.css'],
})
export class GivingComponent implements OnInit, OnDestroy {

  @ViewChildren('confirmDialog') confirmDialog: ConfirmDialog;

  get givingForm() { return this.formService.givingForm; }
  get formSubmitted() { return this.giveService.formSubmitted; }
  get activeFormIndex() { return this.giveService.activeIndex; }
  get stripeKey() { return process.env['NODE_ENV'] == 'development' ? GiveConstants.STRIPE_PK_TEST : GiveConstants.STRIPE_PK; }
  get requestInit() { return this.giveService.requestInit; }
  get giveTotal() { return this.giveService.giveTotal; }
  get userDetails() { return this.giveService.individualInfo; }
  get userEdit() { return this.giveService.userEdit; }
  get isAuthenticated() { return this.authService.isAuthenticated || !!this.giveService.individualInfo; }
  get individual() { return this.authService.individual ?? this.giveService.individualInfo; }
  get confirmationDetails() { return this.giveService.confirmationDetails; }

  isGuest = false;
  userEdited = false;
  stripe;
  showProfileModal = false;
  savedPaymentMethods: any[] = [];
  selectedPaymentMethod: string | null = null;
  useNewCard = true;

  private _modalSub: Subscription;

  constructor(
    private formService: GivingFormService,
    private growlService: GrowlService,
    public giveService: GivingService,
    private confirmService: ConfirmationService,
    private authService: AuthService,
    private profileModalService: ProfileModalService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.stripe = Stripe(this.stripeKey);
    this.formService.createGivingForm();
    this._modalSub = this.profileModalService.open$.subscribe(() => {
      this.showProfileModal = true;
    });
    this.giveService.getCategoryReferenceData();
    this.giveService.registerTitheOfferingChanges();

    if (this.isAuthenticated) {
      this.fetchSavedPaymentMethods();
    }

    this.isGuest = this.route.snapshot.queryParamMap.get('guest') === 'true';

    if (this.isGuest) {
      this.giveService.userEdit = true;
      this.formService.enablePersonalFieldValidators();
      const prefillPhone = this.route.snapshot.queryParamMap.get('phone');
      if (prefillPhone) {
        this.formService.givingForm.patchValue({ phone: prefillPhone });
      }
    } else {
      this.giveService.userEdit = false;
      if (this.authService.individual) {
        this.applyAuthenticatedIndividual(this.authService.individual);
      } else {
        this.authService.checkSession().then(found => {
          if (found) {
            this.applyAuthenticatedIndividual(found);
          } else {
            this.isGuest = true;
            this.giveService.userEdit = true;
            this.formService.enablePersonalFieldValidators();
          }
        });
      }
    }
  }

  applyAuthenticatedIndividual(individual: UserDetails) {
    this.isGuest = false;
    this.giveService.userEdit = false;
    this.giveService.individualInfo = individual;
    this.formService.updateUserFields(individual);
    this.formService.disablePersonalFieldValidators();
    this.fetchSavedPaymentMethods();
  }

  payWithStripe() {
    this.giveService.formSubmitted = true;
    if (this.givingForm.invalid) {
      const invalidFields = Object.keys(this.givingForm.controls).filter(key => this.givingForm.controls[key].invalid);
      this.growlService.showErrorMessage(`Please fix the errors in the form before submitting. ${invalidFields.join(', ')}`);
      return;
    }
    if (this.isAuthenticated) {
      this.fetchSavedPaymentMethods();
    }
    this.giveService.activeIndex = 1;
  }

  async submitForm(data: {number: ElementRef, zipCode: number, savePaymentMethod?: boolean}) {
    if (this.selectedPaymentMethod) {
      // Pay with saved card - skip Stripe Elements, use saved paymentMethodId
      const selectedCard = this.savedPaymentMethods.find(pm => pm.paymentMethodId === this.selectedPaymentMethod);
      await this.giveService.submitPaymentWithSavedMethod(this.selectedPaymentMethod, data.savePaymentMethod, selectedCard?.last4 ? `•••• ${selectedCard.last4}` : 'Saved card');
    } else {
      // Pay with new card
      await this.giveService.submitPayment(this.stripe, data.number, data.zipCode, data.savePaymentMethod);
    }
    this.userEdited = false;
  }

  handleFormError() {
    this.growlService.showErrorMessage('Please fix the errors in the form before submitting.');
  }

  convertToNumber(value: string) {
    return parseFloat(value.replace(/[$,.]/g, ""));
  }

  previous() {
    this.giveService.activeIndex--;
  }

  clearFields() {
    this.formService.givingForm.markAsPristine();
    if (this.giveService.userEdit) {
      this.formService.givingForm.reset();
    } else {
      this.formService.tithe.setValue('$0.00');
      this.formService.offerings.clear();
      this.formService.feeCovered.setValue(false);
    }
    this.giveService.formSubmitted = false;
  }

  onEdit(userDetails: UserDetails) {
    this.giveService.userEdit = true;
  }

  cancelEdit() {
    if (this.userEdited) {
      this.confirmService.confirm({
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.userEdited = false;
          this.giveService.userEdit = false;
          this.formService.updateUserFields(this.giveService.individualInfo);
        }
      });
      return;
    }
    this.giveService.userEdit = false;
  }

  userInputChange() {
    this.userEdited = true;
  }

  onConfirm() {
    this.userEdited = false;
    this.giveService.userEdit = false;
    this.formService.updateUserFields(this.giveService.individualInfo);
  }

  signOut() {
    this.authService.signOut();
  }

  done() {
    this.giveService.confirmationDetails = null;
    this.giveService.activeIndex = 0;
    this.selectedPaymentMethod = null;
    this.useNewCard = this.savedPaymentMethods.length === 0;
  }

  viewReceipt() {
    window.print();
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.fetchSavedPaymentMethods();
  }

  fetchSavedPaymentMethods() {
    this.giveService.fetchPaymentMethods().subscribe({
      next: (result) => {
        if (result?.success) {
          this.savedPaymentMethods = result.data;
          if (this.savedPaymentMethods.length > 0 && !this.selectedPaymentMethod) {
            this.selectPaymentMethod(this.savedPaymentMethods[0].paymentMethodId);
          }
        }
      },
      error: () => {
        this.savedPaymentMethods = [];
      }
    });
  }

  selectPaymentMethod(paymentMethodId: string) {
    this.selectedPaymentMethod = paymentMethodId;
    this.useNewCard = false;
  }

  useNewCardSelected() {
    this.selectedPaymentMethod = null;
    this.useNewCard = true;
  }

  ngOnDestroy() {
    this._modalSub?.unsubscribe();
  }
}
