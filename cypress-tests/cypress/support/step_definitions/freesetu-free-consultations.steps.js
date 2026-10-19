import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have opened the FreeSetu home page to read consultation benefits', () => {
    cy.visit('/');
});

Then('the free consultation benefit should explain there are no hidden charges', () => {
    cy.contains('h4', '100% Free Consultations').should('be.visible');
    cy.contains('p', 'No hidden charges, no commitments.').should('be.visible');
});