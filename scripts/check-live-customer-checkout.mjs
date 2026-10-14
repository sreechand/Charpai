// Opens production checkout and cancels it. Never submits payment details or charges money.
import { chromium } from 'playwright';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
const base='https://charpai.sreechand.pm';
const client=new ConvexHttpClient('https://elegant-mosquito-650.convex.cloud');
const email=`live-checkout-${randomUUID()}@example.invalid`,password=randomUUID()+randomUUID();
const login=await client.action(api.auth.signIn,{provider:'password',params:{flow:'signUp',email,password}});
client.setAuth(login.tokens.token);
const headers={Authorization:`Bearer ${login.tokens.token}`,'Content-Type':'application/json'};
const details=await fetch(base+'/api/create-order',{headers});const price=await details.json();assert.equal(details.status,200);assert.equal(price.amount,20000);assert.equal(price.testMode,false);
const browser=await chromium.launch();
try {
 const page=await browser.newPage();
 await page.goto(base+'/app/login');
 await page.getByLabel('Email',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();
 const responsePromise=page.waitForResponse(r=>r.url()===base+'/api/create-order'&&r.request().method()==='POST');
 await page.getByRole('button',{name:'Pay ₹200.00',exact:true}).click();
 const response=await responsePromise;const order=await response.json();assert.equal(response.status(),200);assert.equal(order.amount,20000);assert.equal(order.currency,'INR');assert.match(order.key_id,/^rzp_live_/);assert.equal('key_secret' in order,false);
 const checkout=page.frameLocator('iframe.razorpay-checkout-frame');await checkout.getByText('Payment Options',{exact:true}).waitFor({timeout:30000});
 await checkout.getByPlaceholder('Mobile number').waitFor({state:'visible'});
 await page.waitForTimeout(2500);
 await page.screenshot({path:'/private/tmp/charpai-live-200-checkout.png',fullPage:true});
 const invalid=await fetch(base+'/api/verify-payment',{method:'POST',headers,body:JSON.stringify({razorpay_order_id:order.order_id,razorpay_payment_id:'pay_invalid_readiness_test',razorpay_signature:'0'.repeat(64)})});assert.equal(invalid.status,400);
 assert.equal((await client.query(api.payments.status,{})).credits,0);
 console.log('PASS: production ₹200 INR order using live keys; real Razorpay checkout opens; secret excluded; bad signature rejected; no credits or money spent.');
} finally {await browser.close();}
