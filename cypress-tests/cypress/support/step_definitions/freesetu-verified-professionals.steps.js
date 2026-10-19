import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../pages/home-page.js';

Given('I have opened the FreeSetu home page to review provider verification', () => {
    homePage.visit();
});

Then('the verified professionals benefit should be described', () => {
    homePage.assertVisibleText('Verified Professionals', 'h4');
    homePage.assertVisibleText('thoroughly verified', 'p');
});