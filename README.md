# MPesa Daraja Module

Reusable Node.js module for Safaricom MPesa integration via the Daraja API.

## Features
- STK Push initiation with automatic access token generation
- Payment callback handling with idempotency checks
- C2B registration support
- Error handling and retry logic

## Installation

```bash
npm install

import { initiateSTKPush } from './src/index.js';

const result = await initiateSTKPush({
  phoneNumber: '254712345678',
  amount: 25000,
  accountReference: 'COTERIE-FC-001',
  transactionDesc: 'Founder Circle Enrollment',
  callbackUrl: 'https://your-domain.com/payment-callback',
  passkey: 'your-passkey',
  shortcode: 'your-shortcode'
});

console.log(result.checkoutRequestId);
// => "ws_CO_123456789"

import { processPaymentCallback } from './src/index.js';

const payment = await processPaymentCallback(callbackData);
console.log(payment.status);
// => "confirmed"

| Function                       | Parameters                                                                                | Returns                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------- |
| `generateAccessToken()`        | —                                                                                         | `{ accessToken, expiresIn }`    
| `initiateSTKPush(options)`     | `phoneNumber, amount, accountReference, transactionDesc, callbackUrl, passkey, shortcode` | `{ checkoutRequestId, responseCode, responseDescription }`|
| `processPaymentCallback(data)` | Daraja callback payload                                                                   | `{ status, receipt, amount, phoneNumber }`|



MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_PASSKEY=your-passkey
MPESA_SHORTCODE=your-shortcode
MPESA_ENVIRONMENT=sandbox


## Tech Stack
- Node.js (ES Modules)
- Fetch API
- Safaricom Daraja API v2
