import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../pages/home-page.js';

Given('I have opened the FreeSetu home page to review booking benefits', () => {
    homePage.visit();
});

Then('the instant booking benefit should be visible', () => {
    homePage.assertVisibleText('Instant Booking', 'h4');
    homePage.assertVisibleText('Book your free consultation instantly.', 'p');
});