describe('Navigation', () => {
  it('should navigate to Trends page', () => {
    cy.visit('/');
    cy.get('a[routerLink="/trends"]').click();
    cy.url().should('include', '/trends');
    cy.get('span').should('contain', 'All');
  });
});