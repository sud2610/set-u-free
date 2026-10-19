import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have opened the FreeSetu home page to browse categories', () => {
    cy.visit('/');
});

Then('I should see all six FreeSetu consultation categories', () => {
    ['Dentist', 'Beauty Parlor', 'Gym & Fitness', 'Physiotherapy', 'Yoga Classes', 'Nutrition'].forEach((category) => {
        cy.contains('h3', category).should('be.visible');
    });
});