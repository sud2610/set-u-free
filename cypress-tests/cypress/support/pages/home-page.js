class HomePage {
    visit() {
        cy.visit('/');
    }

    search(query, location) {
        cy.findByDataTestid('service-search-input').type(query);
        cy.findByDataTestid('location-search-input').type(location);
        cy.findByDataTestid('service-search-submit').click();
    }

    searchResults() {
        return cy.findByDataTestid('service-search-results');
    }
}

export default new HomePage();