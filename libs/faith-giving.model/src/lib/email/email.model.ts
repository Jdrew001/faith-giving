import { Utils } from '@faith-giving/faith-giving.service'

export interface EmailTemplate {
    from: EmailJSON;
    subject: string;
    content?: MailContent[];
    personalizations: PersonalizationJSON[];
    attachments?: AttachmentJSON[];
    categories?: string[];
    headers?: { [key: string]: string };
    mail_settings?: MailSettingsJSON;
    tracking_settings?: TrackingSettingsJSON;
    custom_args?: { [key: string]: string };
    sections?: { [key: string]: string };
    asm?: ASMOptionsJSON;
    reply_to?: EmailJSON;
    send_at?: number;
    batch_id?: string;
    template_id?: string;
    ip_pool_name?: string;
    reply_to_list?: EmailJSON[];
}

export type EmailJSON = { name?: string; email: string }
export interface MailContent {
    type: string;
    value: string;
}
export interface PersonalizationJSON {
    to: EmailJSON | EmailJSON[];
    from?: EmailJSON;
    cc?: EmailJSON[];
    bcc?: EmailJSON[];
    headers?: { [key: string]: string; };
    substitutions?: { [key: string]: string; };
    dynamic_template_data?: { [key: string]: string; };
    custom_args?: { [key: string]: string; };
    subject?: string;
    send_at?: number;
}
export interface AttachmentJSON {
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
    content_id?: string;
}
export interface MailSettingsJSON {
    bcc?: {
      enable?: boolean;
      email?: string;
    };
    bypass_list_management?: {
      enable?: boolean;
    };
    footer?: {
      enable?: boolean;
      text?: string;
      html?: string;
    };
    sandbox_mode?: {
      enable?: boolean;
    };
    spam_check?: {
      enable?: boolean;
      threshold?: number;
      post_to_url?: string;
    };
}
export interface TrackingSettingsJSON {
    click_tracking?: {
      enable?: boolean;
      enable_text?: boolean;
    };
    open_tracking?: {
      enable?: boolean;
      substitution_tag?: string;
    };
    subscription_tracking?: {
      enable?: boolean;
      text?: string;
      html?: string;
      substitution_tag?: string;
    };
    ganalytics?: {
      enable?: boolean;
      utm_source?: string;
      utm_medium?: string;
      utm_term?: string;
      utm_content?: string;
      utm_campaign?: string;
    };
}
export interface ASMOptionsJSON {
    group_id: number;
    groups_to_display?: number[];
}

export class GivingReportDto {

  firstname: string;
  lastname: string;
  date: string;
  email: string;
  phone: string;
  tithing: string;
  offerings: Array<{label: string, amount: number}>;
  feeCovered: boolean;
  total: string;

  constructor(
      firstname: string,
      lastname: string,
      email: string,
      phone: string,
      tithing: string,
      offerings: Array<{label: string, amount: number}>,
      feeCovered: boolean,
      total: string
  ) {
      this.firstname = firstname;
      this.lastname = lastname;
      this.email = email;
      this.phone = phone;
      this.tithing = tithing;
      this.offerings = offerings;
      this.feeCovered = feeCovered;
      this.total = total;
      this.date = Utils.formatDate(new Date());
  }
}

export class GivingReceipt {
  firstname: string;
  lastname: string;
  tithing: string;
  offerings: Array<{label: string, amount: number}>;
  feeCovered: boolean;
  total: string;
  date: string;

  constructor(
      firstname: string,
      lastname: string,
      tithing: string,
      offerings: Array<{label: string, amount: number}>,
      feeCovered: boolean,
      total: string
  ) {
      this.firstname = firstname;
      this.lastname = lastname;
      this.tithing = tithing;
      this.offerings = offerings;
      this.feeCovered = feeCovered;
      this.total = total;
      this.date = Utils.formatDate(new Date());
  }
}