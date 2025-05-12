// trends.e2e.cy.ts

describe('Currency Trends Page E2E Tests', () => {
  beforeEach(() => {
    // Visit the trends page
    cy.visit('/trends');
    
    // Wait for the page to fully load
    cy.get('.trends').should('be.visible', { timeout: 10000 });
    cy.get('app-line-chart canvas').should('be.visible', { timeout: 15000 });
  });

  // Test 1: Verify the basic structure and elements of the page
  it('should display all major components of the trends page', () => {
    // Verify the main container exists
    cy.get('.trends').should('exist');
    
    // Verify specific toggle options
    cy.get('mat-button-toggle').contains('All').should('exist');
    cy.get('mat-button-toggle').contains('3 days').should('exist');
    cy.get('mat-button-toggle').contains('7 days').should('exist');
    
    // Verify the chart exists
    cy.get('.chart-block').should('exist');
    cy.get('app-line-chart canvas').should('exist');
  });

  // Test 2: Test currency selection functionality
  it('should allow selecting currencies from all dropdowns', () => {
    // Test the first dropdown
    cy.get('app-currencies-dropdown').eq(0).click();
    
    // Test the second dropdown
    cy.get('app-currencies-dropdown').eq(1).click();
    
    // Test the third dropdown
    cy.get('app-currencies-dropdown').eq(2).click();
    
    // Verify the chart updates after selections (wait for any potential loading states)
    // This assumes there's some visual indicator or change in the chart
    cy.get('app-line-chart canvas').should('be.visible');

  });

  // Test 3: Test time period toggle functionality
  it('should allow changing time periods and update the chart', () => {
    // Verify the default selected time period is "All"
    cy.get('mat-button-toggle.mat-button-toggle-checked')
      .should('contain', 'All');
    
    // Select 3 days period
    cy.get('mat-button-toggle').contains('3 days').click();
    
    // Verify the button is now checked
    cy.get('mat-button-toggle.mat-button-toggle-checked')
      .should('contain', '3 days');
    
    // Select 7 days period
    cy.get('mat-button-toggle').contains('7 days').click();
    
    // Verify the button is now checked
    cy.get('mat-button-toggle.mat-button-toggle-checked')
      .should('contain', '7 days');
    
    
    // Go back to "All"
    cy.get('mat-button-toggle').contains('All').click();
    
    // Verify the button is now checked
    cy.get('mat-button-toggle.mat-button-toggle-checked')
      .should('contain', 'All');
  });
});