import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../pages/home-page.js';

Given('the FreeSetu search API returns a matching provider', () => {
    cy.intercept('GET', '**/search*', {
        fixture: 'service-search-results.json',
    }).as('serviceSearch');
    homePage.visit();
});

When('I search FreeSetu for {string} near {string}', (query, location) => {
    homePage.search(query, location);
});

Then('the search should wait for the API request with {string} and {string}', (query, location) => {
    cy.wait('@serviceSearch').then(({ request, response }) => {
        expect(request.query).to.deep.equal({ q: query, loc: location });
        expect(response.statusCode).to.equal(200);
    });
});

Then('I should see the provider {string}', (providerName) => {
    homePage.searchResults().should('contain.text', providerName);
});