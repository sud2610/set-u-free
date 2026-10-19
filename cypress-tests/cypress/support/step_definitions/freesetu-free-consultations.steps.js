import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../pages/home-page.js';

Given('I have opened the FreeSetu home page to read consultation benefits', () => {
    homePage.visit();
});

Then('the free consultation benefit should explain there are no hidden charges', () => {
    homePage.assertVisibleText('100% Free Consultations', 'h4');
    homePage.assertVisibleText('No hidden charges, no commitments.', 'p');
});