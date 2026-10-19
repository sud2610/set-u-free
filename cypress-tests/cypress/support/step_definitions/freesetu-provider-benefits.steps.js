import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../pages/home-page.js';

Given('I have opened the FreeSetu home page to review provider benefits', () => {
    homePage.visit();
});

Then('the provider benefits should include customers, booking management, and reputation', () => {
    homePage.assertProviderBenefits();
});