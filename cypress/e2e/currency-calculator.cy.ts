// currency-conversion.e2e.cy.ts

describe('Currency Conversion Form E2E Test', () => {
  beforeEach(() => {
    // Visit the page containing the currency conversion form
    // Replace with your actual application URL
    cy.visit('/calculator');
    
    // Wait for the page to load completely
    cy.get('.currency-conversion').should('be.visible');
  });

  it('should load the currency conversion form with all elements', () => {
    // Verify form container exists
    cy.get('.currency-conversion').should('exist');
    cy.get('.form-container').should('exist');

    // Verify currency dropdowns exist
    cy.get('app-currencies-dropdown').should('have.length', 2);
    
    // Verify labels on dropdowns
    cy.contains('From Currency').should('be.visible');
    cy.contains('To Currency').should('be.visible');

    // Verify amount input field exists
    cy.get('input[formControlName="amount"]').should('exist');
    cy.contains('Amount').should('be.visible');

    // Verify submit button exists and is initially disabled
    cy.get('button[type="submit"]').should('be.visible')
      .and('be.disabled')
      .and('contain.text', 'Submit');
  });

});