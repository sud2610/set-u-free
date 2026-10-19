import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../pages/home-page.js';

Given('I have opened the FreeSetu home page to review provider counts', () => {
    homePage.visit();
});

Then('each consultation category should show its provider count', () => {
    homePage.assertCategoryProviderCounts();
});