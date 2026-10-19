import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have opened the FreeSetu home page to review provider benefits', () => {
    cy.visit('/');
});

Then('the provider benefits should include customers, booking management, and reputation', () => {
    ['Reach More Customers', 'Easy Booking Management', 'Build Your Reputation'].forEach((benefit) => {
        cy.contains('h4', benefit).should('be.visible');
    });
});