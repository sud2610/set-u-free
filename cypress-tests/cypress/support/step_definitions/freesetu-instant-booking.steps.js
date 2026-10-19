import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have opened the FreeSetu home page to review booking benefits', () => {
    cy.visit('/');
});

Then('the instant booking benefit should be visible', () => {
    cy.contains('h4', 'Instant Booking').should('be.visible');
    cy.contains('p', 'Book your free consultation instantly.').should('be.visible');
});