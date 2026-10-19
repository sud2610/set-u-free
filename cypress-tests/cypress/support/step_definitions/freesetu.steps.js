import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../pages/home-page.js';

Given('I open the FreeSetu home page', () => {
    homePage.visit();
});

When('I search for {string}', (query) => {
    homePage.searchFor(query);
});

When('I choose {string} from the navigation', (linkText) => {
    homePage.chooseNavigationLink(linkText);
});

When('I choose {string} from the account links', (linkText) => {
    homePage.chooseAccountLink(linkText);
});

Then('I see the free consultation heading', () => {
    homePage.assertFreeConsultationHeading();
});

Then('I see the {word} service category', (category) => {
    homePage.assertVisibleText(category, 'h3');
});

Then('the service search contains {string}', (query) => {
    homePage.assertSearchQuery(query);
});

Then('I see the {string} page heading', (heading) => {
    homePage.assertVisibleText(heading, 'h2');
});

Then('I see the email and password fields', () => {
    homePage.assertEmailAndPasswordFields();
});

Then('I see the full name, email, and password fields', () => {
    homePage.assertRegistrationFields();
});

When('I enter contact details', () => {
    homePage.enterContactDetails();
});

Then('the contact form contains my details', () => {
    homePage.assertContactDetails();
});