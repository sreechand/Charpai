// Real production authentication with fictional credentials; no payment.
import {chromium} from 'playwright';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const base=process.env.LOGIN_TEST_BASE||'https://charpai.sreechand.pm';
const browser=await chromium.launch();
try {
 const page=await browser.newPage();
 const email=`login-error-${randomUUID()}@example.invalid`,password=randomUUID()+randomUUID();
 await page.goto(base+'/app/login');
 await page.getByLabel('Email',{exact:true}).fill(email);
 await page.getByLabel('Password',{exact:true}).fill(password);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await page.getByText('No email account found.',{exact:false}).waitFor();
 assert.doesNotMatch(await page.locator('body').innerText(),/CONVEX A\(|Server Error|Request ID:/);
 await page.screenshot({path:'/private/tmp/charpai-login-error-fixed.png',fullPage:true});
 await page.getByRole('button',{name:'Create an account',exact:true}).click();
 assert.equal(await page.getByLabel('Email',{exact:true}).inputValue(),email);
 assert.equal(await page.getByText('No email account found.',{exact:false}).count(),0);
 await page.getByRole('button',{name:'Create account',exact:true}).click();
 await page.getByRole('button',{name:'Pay ₹200.00',exact:true}).waitFor();
 await page.getByRole('button',{name:'Sign out',exact:true}).click();
 await page.getByLabel('Email',{exact:true}).fill(email);
 await page.getByLabel('Password',{exact:true}).fill('incorrect-fictional-password');
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await page.getByText('Incorrect password.',{exact:false}).waitFor();
 await page.getByLabel('Password',{exact:true}).fill(password);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await page.getByRole('button',{name:'Pay ₹200.00',exact:true}).waitFor();
 console.log('PASS: missing account offers a working Create an account button and wrong password shows its own message; switching to signup clears the error; real signup and correct login reach ₹200 payment. No money charged.');
} finally {await browser.close();}
