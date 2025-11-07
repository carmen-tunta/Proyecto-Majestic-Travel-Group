describe('Proveedores - Crear proveedor', () => {
  beforeEach(() => {
    // Ajusta baseUrl en cypress.json o usa URL completa
    cy.visit('/proveedores');
  });

  it('Debería abrir el formulario de nuevo proveedor', () => {
    // Botón "Nuevo" debería existir y estar deshabilitado/ habilitado según permisos
    cy.contains('button', 'Nuevo').then($btn => {
      // Si está habilitado, clicamos
      if (!$btn.is(':disabled')) {
        cy.wrap($btn).click();
        // Esperar navegación al formulario de detalles
        cy.url().should('include', '/proveedores/detalles');

        // Aquí asumiendo que el formulario tiene campos con name/id: name, whatsapp, mail
        cy.get('input[name="name"]').type('Proveedor Cypress Test');
        cy.get('input[name="whatsapp"]').type('999999999');
        cy.get('input[name="mail"]').type('cypress@test.com');

        // Botón guardar: buscar por texto 'Guardar' o 'Save'
        cy.contains('button', /guardar|save/i).click();

        // Validar que vuelve a la lista o muestra toast de éxito
        cy.contains('Proveedor creado', { timeout: 5000 }).should('exist');
      } else {
        // Si está deshabilitado solo comprobamos que existe
        cy.wrap($btn).should('be.disabled');
      }
    });
  });
});
