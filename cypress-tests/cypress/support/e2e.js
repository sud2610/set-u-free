import './commands.js';

afterEach(function () {
    if (this.currentTest.state === 'passed') {
        const screenshotName = this.currentTest.title.replace(/[<>:"/\\|?*]/g, '-');
        cy.screenshot(screenshotName, { capture: 'viewport' });
    }
});
