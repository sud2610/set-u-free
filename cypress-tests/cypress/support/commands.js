Cypress.Commands.add('findByDataTestid', (testId) => {
    return cy.get(`[data-testid="${testId}"]`);
});