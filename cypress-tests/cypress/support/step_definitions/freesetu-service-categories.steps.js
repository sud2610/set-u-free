import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../pages/home-page.js';

Given('I have opened the FreeSetu home page to browse categories', () => {
    homePage.visit();
});

Then('I should see all six FreeSetu consultation categories', () => {
    ['Dentist', 'Beauty Parlor', 'Gym & Fitness', 'Physiotherapy', 'Yoga Classes', 'Nutrition'].forEach((category) => {
        homePage.assertVisibleText(category, 'h3');
    });
});