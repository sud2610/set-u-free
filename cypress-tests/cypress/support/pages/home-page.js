class HomePage {
    visit() {
        cy.visit('/');
    }

    serviceSearchInput() {
        return cy.findByDataTestid('service-search-input');
    }

    locationSearchInput() {
        return cy.findByDataTestid('location-search-input');
    }

    search(query, location) {
        this.serviceSearchInput().type(query);
        this.locationSearchInput().type(location);
        cy.findByDataTestid('service-search-submit').click();
    }

    searchFor(query) {
        this.serviceSearchInput().type(query);
    }

    enterLocation(location) {
        this.locationSearchInput().type(location);
    }

    searchResults() {
        return cy.findByDataTestid('service-search-results');
    }

    chooseNavigationLink(linkText) {
        cy.contains('nav a', linkText).click();
    }

    chooseAccountLink(linkText) {
        cy.contains('header a', linkText).click();
    }

    chooseFooterLink(linkText) {
        cy.get('footer').contains('a', linkText).click();
    }

    assertCurrentPath(path) {
        cy.location('pathname').should('eq', path);
    }

    assertContactEmailVisible() {
        cy.get('a[href="mailto:contact@set-u-free.com"]').should('be.visible');
    }

    assertVisibleText(text, selector) {
        if (selector) {
            cy.contains(selector, text).should('be.visible');
            return;
        }

        cy.contains(text).should('be.visible');
    }

    assertFreeConsultationHeading() {
        this.assertVisibleText('Find Your Perfect', 'h2');
        this.assertVisibleText('Free Consultation', 'h2');
    }

    assertSearchQuery(query) {
        this.serviceSearchInput().should('have.value', query);
    }

    assertLocation(location) {
        this.locationSearchInput().should('have.value', location);
    }

    assertEmailAndPasswordFields() {
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');
    }

    assertRegistrationFields() {
        cy.get('input[placeholder="Full Name"]').should('be.visible');
        this.assertEmailAndPasswordFields();
    }

    enterContactDetails() {
        cy.get('input[placeholder="Your Name"]').type('Taylor Test');
        cy.get('input[placeholder="Your Email"]').type('taylor@example.com');
        cy.get('textarea[placeholder="Your Message"]').type('I would like information about consultations.');
    }

    assertContactDetails() {
        cy.get('input[placeholder="Your Name"]').should('have.value', 'Taylor Test');
        cy.get('input[placeholder="Your Email"]').should('have.value', 'taylor@example.com');
        cy.get('textarea[placeholder="Your Message"]')
            .should('have.value', 'I would like information about consultations.');
    }

    assertPlatformStatistics() {
        ['10K+', '500+', '25+', '50K+', 'Happy Customers', 'Service Providers', 'Cities Covered', 'Free Consultations']
            .forEach((stat) => this.assertVisibleText(stat));
    }

    assertProviderBenefits() {
        ['Reach More Customers', 'Easy Booking Management', 'Build Your Reputation']
            .forEach((benefit) => this.assertVisibleText(benefit, 'h4'));
    }

    assertCategoryProviderCounts() {
        [
            ['Dentist', '150+ providers'],
            ['Beauty Parlor', '200+ providers'],
            ['Gym & Fitness', '80+ providers'],
            ['Physiotherapy', '90+ providers'],
            ['Yoga Classes', '120+ providers'],
            ['Nutrition', '60+ providers'],
        ].forEach(([category, count]) => {
            cy.contains('h3', category).parent().should('contain.text', count);
        });
    }
}

export default new HomePage();
