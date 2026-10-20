---
name: Faith Giving - Faith Tabernacle
colors:
  background: '#0b0b0b'
  on-background: '#ffffff'
  surface: '#151515'
  surface-container-lowest: '#0b0b0b'
  surface-container-low: '#151515'
  surface-container: '#151515'
  surface-container-high: '#202020'
  surface-container-highest: '#2a2a2a'
  on-surface: '#ffffff'
  on-surface-variant: '#b9b9b9'
  outline: '#858585'
  outline-variant: '#2a2a2a'
  primary: '#ffffff'
  on-primary: '#0b0b0b'
  secondary: '#b9b9b9'
  on-secondary: '#0b0b0b'
  tertiary: '#ffffff'
  on-tertiary: '#0b0b0b'
typography:
  headline-lg:
    fontFamily: Poppins
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.04em
  headline-md:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-md:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.65'
  label-md:
    fontFamily: Poppins
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  DEFAULT: 12px
  lg: 24px
  full: 9999px
spacing:
  container-max: 600px
  gutter: 24px
  gutter-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Source of truth
Match the CURRENT Faith Tabernacle website https://discoverfaitharlington.org/ and its production stylesheet, not the older light design of this Stitch project. This is a quiet black-and-white church identity. Faith Giving is the separate giving application linked from that website.
Exact tokens verified from the Faith Tabernacle repository: background #0b0b0b; foreground #ffffff; muted #b9b9b9; line #2a2a2a; soft #151515; raised #202020; card radius 24px; font Poppins 400/500/700. Use real Poppins via CSS font-family even if the theme picker lacks that font.

## Visual character
An elegant, warm, minimal extension of Faith Tabernacle's website. Black canvas, charcoal surfaces, crisp white headings, readable gray supporting text. Large confident Poppins headings, restrained eyebrow text. No blue, purple, colored gradients, gold, glass effects, decorative blobs, or new invented photography. The giving transaction is the focus. Per the October 20 wordmark follow-up, use a widely spaced uppercase Faith Giving wordmark framed by thin white square brackets, following the Faith Tabernacle Homepage Hero Redesign in Stitch. Omit the separate Faith Tabernacle label beside the header wordmark.

## Components
Main cards #151515 with 1px #2a2a2a borders, 24px corners. Inputs #202020 with 1px gray border and 12px corners, minimum 48px height. Clearly persistent labels above fields; white focus ring. Primary actions white with #0b0b0b text, pill radius, minimum 48px. Secondary actions charcoal or transparent with a gray outline and white text. Secondary text #b9b9b9, never low-contrast gray on gray. Monochrome selected radios/checkboxes and progress. Success uses a white check within a charcoal circle. Error states may use a restrained accessible red paired with written error text. Use icon-library icons.

## Responsive layout
Desktop 1440px canvas; 80px minimal header with Faith Giving and contextual account action; centered 560-600px giving card. Avoid enormous empty marketing heroes. Mobile 390px wide, 20px page gutters, one column, 16px form text, minimum 44px targets, reachable full-width actions. No unnecessary mobile app tab bar.

## Existing functional scope
Preserve phone sign-in and 6-digit code verification, Continue as Guest, guest first name/last name/email/phone, authenticated welcome with sign out and profile edit, Tithing and repeatable Offering rows with amount/category plus remove/add and an Other description, optional card processing fee checkbox, accurate Giving Total, Stripe card details (card number/expiry/CVC/ZIP), authenticated saved card selection plus Add new payment method and opt-in save card, processing, confirmation/receipt, profile editing and saved-card removal. Keep guest access visible. No recurring-giving or frequency controls, ACH, PayPal, Apple Pay, invented giving history, or unsupported account features.
Fees in current UI: 2.2% + $0.30. Example mock gift: Tithing $100.00 + General Offering $25.00 = $125.00 before optional fee; unchecked fee means total $125.00. All mock data must be generic, such as Alex Morgan and alex@example.com.
Payment action text must convey final submission, e.g. Give $125.00, and a pre-payment amount action should say Continue to payment. Display SECURE GIVING / Payments processed by Stripe without unsubstantiated compliance claims.
