import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../pages/home-page.js';

Given('I have opened the FreeSetu home page to test footer contact navigation', () => {
    homePage.visit();
});

When('I select Contact in the FreeSetu company footer', () => {
    homePage.chooseFooterLink('Contact');
});

Then('the contact page should show email and phone details', () => {
    homePage.assertCurrentPath('/contact');
    homePage.assertContactEmailVisible();
    homePage.assertVisibleText('+91 12345 67890');
});