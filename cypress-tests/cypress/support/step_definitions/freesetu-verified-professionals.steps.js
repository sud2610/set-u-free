import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have opened the FreeSetu home page to review provider verification', () => {
    cy.visit('/');
});

Then('the verified professionals benefit should be described', () => {
    cy.contains('h4', 'Verified Professionals').should('be.visible');
    cy.contains('p', 'thoroughly verified').should('be.visible');
});