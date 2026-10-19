import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have opened the FreeSetu home page to test footer service navigation', () => {
    cy.visit('/');
});

When('I select Healthcare in the FreeSetu footer', () => {
    cy.get('footer').contains('a', 'Healthcare').click();
});

Then('the services page should open from the footer', () => {
    cy.location('pathname').should('eq', '/services');
    cy.contains('h2', 'Our Services').should('be.visible');
});