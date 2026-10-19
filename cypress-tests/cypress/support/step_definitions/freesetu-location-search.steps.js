import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I have opened the FreeSetu home page for location lookup', () => {
    cy.visit('/');
});

When('I enter {string} in the FreeSetu location search', (location) => {
    cy.findByDataTestid('location-search-input').type(location);
});

Then('the FreeSetu location search should show {string}', (location) => {
    cy.findByDataTestid('location-search-input').should('have.value', location);
});