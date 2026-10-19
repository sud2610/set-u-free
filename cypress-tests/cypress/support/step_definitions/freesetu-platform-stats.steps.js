import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../pages/home-page.js';

Given('I have opened the FreeSetu home page to review platform statistics', () => {
    homePage.visit();
});

Then('the homepage should display its four platform statistics', () => {
    homePage.assertPlatformStatistics();
});