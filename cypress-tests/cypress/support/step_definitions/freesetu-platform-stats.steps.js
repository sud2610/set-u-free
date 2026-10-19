import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have opened the FreeSetu home page to review platform statistics', () => {
    cy.visit('/');
});

Then('the homepage should display its four platform statistics', () => {
    ['10K+', '500+', '25+', '50K+', 'Happy Customers', 'Service Providers', 'Cities Covered', 'Free Consultations'].forEach((stat) => {
        cy.contains(stat).should('be.visible');
    });
});