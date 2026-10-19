import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I open the FreeSetu home page', () => {
    cy.visit('/');
});

When('I search for {string}', (query) => {
    cy.findByDataTestid('service-search-input').type(query);
});

When('I choose {string} from the navigation', (linkText) => {
    cy.contains('nav a', linkText).click();
});

When('I choose {string} from the account links', (linkText) => {
    cy.contains('header a', linkText).click();
});

Then('I see the free consultation heading', () => {
    cy.contains('h2', 'Find Your Perfect').should('be.visible');
    cy.contains('h2', 'Free Consultation').should('be.visible');
});

Then('I see the {word} service category', (category) => {
    cy.contains('h3', category).should('be.visible');
});

Then('the service search contains {string}', (query) => {
    cy.findByDataTestid('service-search-input').should('have.value', query);
});

Then('I see the {string} page heading', (heading) => {
    cy.contains('h2', heading).should('be.visible');
});

Then('I see the email and password fields', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
});

Then('I see the full name, email, and password fields', () => {
    cy.get('input[placeholder="Full Name"]').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
});

When('I enter contact details', () => {
    cy.get('input[placeholder="Your Name"]').type('Taylor Test');
    cy.get('input[placeholder="Your Email"]').type('taylor@example.com');
    cy.get('textarea[placeholder="Your Message"]').type('I would like information about consultations.');
});

Then('the contact form contains my details', () => {
    cy.get('input[placeholder="Your Name"]').should('have.value', 'Taylor Test');
    cy.get('input[placeholder="Your Email"]').should('have.value', 'taylor@example.com');
    cy.get('textarea[placeholder="Your Message"]').should('have.value', 'I would like information about consultations.');
});