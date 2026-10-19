import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have opened the FreeSetu home page to review provider counts', () => {
    cy.visit('/');
});

Then('each consultation category should show its provider count', () => {
    [
        ['Dentist', '150+ providers'],
        ['Beauty Parlor', '200+ providers'],
        ['Gym & Fitness', '80+ providers'],
        ['Physiotherapy', '90+ providers'],
        ['Yoga Classes', '120+ providers'],
        ['Nutrition', '60+ providers'],
    ].forEach(([category, count]) => {
        cy.contains('h3', category).parent().should('contain.text', count);
    });
});