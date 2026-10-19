import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have opened the FreeSetu home page to test footer contact navigation', () => {
    cy.visit('/');
});

When('I select Contact in the FreeSetu company footer', () => {
    cy.get('footer').contains('a', 'Contact').click();
});

Then('the contact page should show email and phone details', () => {
    cy.location('pathname').should('eq', '/contact');
    cy.get('a[href="mailto:contact@set-u-free.com"]').should('be.visible');
    cy.contains('+91 12345 67890').should('be.visible');
});