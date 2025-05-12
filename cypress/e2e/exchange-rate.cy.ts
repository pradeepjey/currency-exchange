describe('Exchange Rate Component - Default State', () => {
  beforeEach(() => {
    cy.visit('/exchange');
  });

  it('should display the component with default values', () => {
    // Verify main component container
    cy.get('app-exchange-rate').should('exist');
    cy.get('.exchange-rate').should('be.visible');
    
    // Verify search field
    cy.get('app-text-search mat-label').contains('Search');
    
    // Verify table headers
    cy.contains('.mat-mdc-header-cell', 'Base Currency').should('be.visible');
    cy.contains('.mat-mdc-header-cell', 'Currency').should('be.visible');
    cy.contains('.mat-mdc-header-cell', 'Rate').should('be.visible');
    
    // Verify table has data rows
    cy.get('tbody tr.mat-mdc-row').should('have.length.gt', 5);
    
    // Verify first row data
    cy.get('tbody tr').first().within(() => {
      cy.get('td').eq(0).should('contain', 'MYR');
      cy.get('td').eq(1).should('contain', 'AED');
      cy.get('td').eq(2).should('contain', '0.8548');
    });
  });
});