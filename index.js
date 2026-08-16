
/**
 * MPesa Daraja API Module
 * Reusable module for STK Push and payment callback handling
 */

const DARAJA_BASE_URL = 'https://sandbox.safaricom.co.ke';

/**
 * Generate OAuth access token from Daraja API
 */
export async function generateAccessToken(consumerKey, consumerSecret) {
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
  const response = await fetch(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`
    }
  });
  
  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in
  };
}

/**
 * Initiate STK Push to customer phone
 */
export async function initiateSTKPush({
  phoneNumber,
  amount,
  accountReference,
  transactionDesc,
  callbackUrl,
  passkey,
  shortcode
}) {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  
  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: callbackUrl,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc
  };
  
  const response = await fetch(`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MPESA_ACCESS_TOKEN}`
    },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}

/**
 * Process payment callback from Daraja
 */
export async function processPaymentCallback(callbackData) {
  const { Body } = callbackData;
  const { stkCallback } = Body;
  
  const result = {
    merchantRequestId: stkCallback.MerchantRequestID,
    checkoutRequestId: stkCallback.CheckoutRequestID,
    resultCode: stkCallback.ResultCode,
    resultDesc: stkCallback.ResultDesc,
    status: stkCallback.ResultCode === 0 ? 'confirmed' : 'failed'
  };
  
  if (stkCallback.CallbackMetadata) {
    const metadata = {};
    stkCallback.CallbackMetadata.Item.forEach(item => {
      metadata[item.Name] = item.Value;
    });
    
    result.receipt = metadata.MpesaReceiptNumber;
    result.amount = metadata.Amount;
    result.phoneNumber = metadata.PhoneNumber;
    result.transactionDate = metadata.TransactionDate;
  }
  
  return result;
}
