import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../pages/home-page.js';

Given('I have opened the FreeSetu home page to test footer service navigation', () => {
    homePage.visit();
});

When('I select Healthcare in the FreeSetu footer', () => {
    homePage.chooseFooterLink('Healthcare');
});

Then('the services page should open from the footer', () => {
    homePage.assertCurrentPath('/services');
    homePage.assertVisibleText('Our Services', 'h2');
});