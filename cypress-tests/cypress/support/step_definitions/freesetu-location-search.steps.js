import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../pages/home-page.js';

Given('I have opened the FreeSetu home page for location lookup', () => {
    homePage.visit();
});

When('I enter {string} in the FreeSetu location search', (location) => {
    homePage.enterLocation(location);
});

Then('the FreeSetu location search should show {string}', (location) => {
    homePage.assertLocation(location);
});