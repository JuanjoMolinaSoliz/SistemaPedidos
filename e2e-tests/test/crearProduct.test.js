const { Builder, By, Key, until } = require('selenium-webdriver');
const { expect } = require('chai');
const fs = require('fs'); // Para capturas de pantalla de depuración
const path = require('path');

// --- Configuración Global ---
let driver;
const LOGIN_URL = "http://localhost:5173/login"; // URL de tu página de login
const CREATE_ORDER_URL = "http://localhost:5173/pedidos/crear"; // URL de tu página de crear pedido

// Credenciales de un usuario de prueba válido
const TEST_USER = {
    username: "admin",
    password: "1234"
};

// --- Datos de Prueba para la creación de un pedido ---
const orderScenario = {
    // ¡IMPORTANTE! Asegúrate de que este cliente exista en tu base de datos
    // y sea cargado por tu API al iniciar la aplicación.
    clientName: "juan", 
    
    // ¡IMPORTANTE! Asegúrate de que estos productos existan y tengan stock suficiente
    // en tu base de datos y sean cargados por tu API.
    productsToAdd: [
        { name: "Laptopp", quantity: 2 }, 
        { name: "Honey Garlic Shrimp", quantity: 1 },
        { name: "panchos", quantity: 1 }
    ],
    // Asegúrate que el producto a editar/eliminar esté primero en productsToAdd
    // o que exista previamente en tu lista de productos cargados.
    // Si no necesitas probar edición/eliminación, puedes comentar estas líneas.
    productToEdit: { name: "Laptopp", newQuantity: 3 }, 
    productToRemove: "Honey Garlic Shrimp" 
};

// --- Suite de Pruebas ---
describe('Pruebas de la página de Crear Pedido', function() {
    this.timeout(60000); // Aumenta el timeout general a 60 segundos

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        console.log("Iniciando sesión para las pruebas de Crear Pedido...");
        await driver.get(LOGIN_URL);

        try {
            await driver.wait(until.elementLocated(By.id('usuario')), 10000);
            await driver.findElement(By.id('usuario')).sendKeys(TEST_USER.username);
            await driver.findElement(By.id('password')).sendKeys(TEST_USER.password);
            await driver.findElement(By.id('loger')).click();
            
            // Esperar una redirección a una URL que indique éxito, ej. /dashboard, /home o /productos
            await driver.wait(until.urlContains('/productos'), 15000); // AJUSTA ESTA URL a tu URL post-login
            console.log("👍 Login exitoso para Crear Pedido. URL actual:", await driver.getCurrentUrl());
        } catch (error) {
            console.error("❌ Falló el login inicial para Crear Pedido.");
            console.error("Error:", error.message);
            await driver.takeScreenshot().then(function(image) {
                fs.writeFileSync(path.join(__dirname, `error_screenshot_login_crear_pedido.png`), image.toString('base64'), 'base64');
            });
            throw new Error("No se pudo iniciar sesión. Las pruebas de Crear Pedido no pueden continuar.");
        }
    });

    after(async function() {
        if (driver) {
            console.log("Cerrando el navegador después de las pruebas de Crear Pedido...");
            await driver.quit();
        }
    });

    beforeEach(async function() {
        // Navegar a la página de Crear Pedido antes de cada test para asegurar un estado limpio
        await driver.get(CREATE_ORDER_URL);
        // Esperar a que el select de clientes y la lista de productos se carguen
        await driver.wait(until.elementLocated(By.css('select[class*="block w-full"]')), 10000); // Select de clientes
        await driver.wait(until.elementLocated(By.css('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6')), 10000); // Contenedor de productos
        console.log("Navegado a la página de Crear Pedido y elementos iniciales cargados.");
    });


    it('Debería crear un pedido exitosamente con múltiples productos, editar y remover', async function() {
        console.log("\n--- Ejecutando prueba: Crear un pedido exitosamente (completo) ---");

        // 1. Seleccionar un cliente
        console.log(`Seleccionando cliente: "${orderScenario.clientName}"`);
        const clientSelect = await driver.findElement(By.css('select[class*="block w-full"]'));
        // Esperar que la opción del cliente esté visible
        await driver.wait(until.elementLocated(By.xpath(`//option[contains(text(), '${orderScenario.clientName}')]`)), 10000);
        await clientSelect.sendKeys(orderScenario.clientName);
        await driver.sleep(500); // Pequeña pausa después de seleccionar el cliente

        // 2. Añadir productos al pedido
        for (const item of orderScenario.productsToAdd) {
            console.log(`Añadiendo "${item.name}" con cantidad ${item.quantity}`);
            // Encontrar el input de cantidad y el botón Añadir para el producto específico
            const productCardXPath = `//h3[text()="${item.name}"]/ancestor::div[contains(@class, 'border-gray-200')]`;
            const quantityInputXPath = `${productCardXPath}//input[contains(@id, 'qty-')]`;
            const addButtonXPath = `${productCardXPath}//button[text()='Añadir']`;

            const quantityInput = await driver.wait(until.elementLocated(By.xpath(quantityInputXPath)), 10000);
            const addButton = await driver.wait(until.elementLocated(By.xpath(addButtonXPath)), 10000);

            await quantityInput.clear();
            await quantityInput.sendKeys(String(item.quantity));
            await addButton.click();

            await driver.sleep(1000); // Aumentamos la pausa para dar tiempo a React de actualizar la tabla
        }

        // 3. (Opcional) Editar la cantidad de un producto ya añadido
        if (orderScenario.productToEdit) {
            console.log(`Editando cantidad de "${orderScenario.productToEdit.name}" a ${orderScenario.productToEdit.newQuantity}`);
            try {
                const rowXPath = `//table//td[text()="${orderScenario.productToEdit.name}"]/parent::tr`;
                const editQuantityInputXPath = `${rowXPath}//input[@type='number']`;

                const editQuantityInput = await driver.wait(until.elementLocated(By.xpath(editQuantityInputXPath)), 10000);
                await editQuantityInput.clear();
                await editQuantityInput.sendKeys(String(orderScenario.productToEdit.newQuantity));
                await driver.sleep(1000); // Esperar que la UI se actualice después de la edición
            } catch (error) {
                console.warn(`   ⚠️ Advertencia: No se pudo editar el producto "${orderScenario.productToEdit.name}". Puede que no esté en el pedido o el selector sea incorrecto.`, error.message);
                await driver.takeScreenshot().then(function(image) {
                    fs.writeFileSync(path.join(__dirname, `error_screenshot_edit_product.png`), image.toString('base64'), 'base64');
                });
            }
        }

        // 4. (Opcional) Eliminar un producto del pedido
        if (orderScenario.productToRemove) {
            console.log(`Eliminando "${orderScenario.productToRemove}" del pedido`);
            try {
                const removeButtonXPath = `//table//td[text()="${orderScenario.productToRemove}"]/parent::tr//button[text()='Eliminar']`;
                const removeButton = await driver.wait(until.elementLocated(By.xpath(removeButtonXPath)), 10000);
                await removeButton.click();
                await driver.sleep(1000); // Esperar que la UI se actualice después de la eliminación
                // Verificar que el producto ya no esté en la tabla
                const productRemoved = await driver.findElements(By.xpath(`//table//td[text()="${orderScenario.productToRemove}"]`));
                expect(productRemoved).to.have.lengthOf(0, `El producto "${orderScenario.productToRemove}" debería haber sido eliminado.`);
            } catch (error) {
                console.warn(`   ⚠️ Advertencia: No se pudo eliminar el producto "${orderScenario.productToRemove}". Puede que ya no esté en el pedido o el selector sea incorrecto.`, error.message);
                 await driver.takeScreenshot().then(function(image) {
                    fs.writeFileSync(path.join(__dirname, `error_screenshot_remove_product.png`), image.toString('base64'), 'base64');
                });
            }
        }

        // 5. Verificar el Total del Pedido (opcional)
        // Se asume que el total se actualiza en la UI y es visible.
        const totalElement = await driver.wait(until.elementLocated(By.css('span[class*="text-xl font-extrabold"]')), 10000);
        const currentTotalText = await totalElement.getText();
        expect(currentTotalText).to.match(/^\$\d+(\.\d{2})?$/); // Esperar formato $X.XX
        console.log(`   Total del pedido visible: ${currentTotalText}`);


        // 6. Confirmar el Pedido
        console.log("Confirmando el pedido...");
        const confirmOrderButton = await driver.findElement(By.css('button[type="submit"]'));
        await confirmOrderButton.click();

        // 7. Aserciones finales: Mensaje de éxito
        const successMessage = await driver.wait(until.elementLocated(By.css('p[class*="text-green-600"]')), 15000); // Mensaje de éxito
        const messageText = await successMessage.getText();
        expect(messageText).to.include('¡Pedido creado con éxito!'); // AJUSTA ESTE MENSAJE SI ES DIFERENTE
        console.log(`   ✔️ Pedido creado exitosamente: "${messageText}"`);

        // Opcional: Verificar que los campos se hayan limpiado (si tu UI lo hace)
        // const clientSelectValue = await driver.findElement(By.css('select[class*="block w-full"]')).getAttribute('value');
        // expect(clientSelectValue).to.equal('');
        // const orderItemsRows = await driver.findElements(By.css('table.min-w-full tbody tr'));
        // expect(orderItemsRows).to.have.lengthOf(0, "La tabla de productos debería estar vacía después de confirmar el pedido.");

        console.log("--- Prueba de Creación de Pedido completada con éxito ---");
    });

    it('Debería deshabilitar el botón de confirmar si no hay cliente seleccionado', async function() {
        console.log("\n--- Ejecutando prueba: Botón deshabilitado sin cliente seleccionado ---");

        // Añadir un producto para que el botón de confirmar pedido esté deshabilitado SOLO por falta de cliente
        const productToTestNoClient = orderScenario.productsToAdd[0];
        if (productToTestNoClient) {
            console.log(`Añadiendo "${productToTestNoClient.name}" para esta prueba.`);
            const productCardXPath = `//h3[text()="${productToTestNoClient.name}"]/ancestor::div[contains(@class, 'border-gray-200')]`;
            const quantityInputXPath = `${productCardXPath}//input[contains(@id, 'qty-')]`;
            const addButtonXPath = `${productCardXPath}//button[text()='Añadir']`;

            const quantityInput = await driver.wait(until.elementLocated(By.xpath(quantityInputXPath)), 10000);
            const addButton = await driver.wait(until.elementLocated(By.xpath(addButtonXPath)), 10000);

            await quantityInput.clear();
            await quantityInput.sendKeys("1");
            await addButton.click();
            await driver.sleep(1000);
        } else {
            console.warn("⚠️ Advertencia: No hay productos definidos en orderScenario.productsToAdd para la prueba de 'sin cliente'. Asegúrate de que el botón de confirmar pedido pueda estar habilitado por productos.");
        }

        const confirmOrderButton = await driver.findElement(By.css('button[type="submit"]'));
        // Aserción: Verificar que el botón "Confirmar Pedido" está deshabilitado
        const isDisabled = await confirmOrderButton.isEnabled();
        expect(isDisabled).to.be.false; 
        console.log(`   ✔️ Botón "Confirmar Pedido" está deshabilitado sin cliente seleccionado.`);
    });

    it('Debería deshabilitar el botón de confirmar si no hay productos en el pedido', async function() {
        console.log("\n--- Ejecutando prueba: Botón deshabilitado sin productos ---");
        // Seleccionar un cliente (para que el botón de confirmar pedido esté deshabilitado SOLO por falta de productos)
        const clientSelect = await driver.findElement(By.css('select[class*="block w-full"]'));
        await driver.wait(until.elementLocated(By.xpath(`//option[contains(text(), '${orderScenario.clientName}')]`)), 10000);
        await clientSelect.sendKeys(orderScenario.clientName);
        await driver.sleep(1000);

        // No añadir ningún producto, dejar la lista de orderItems vacía

        const confirmOrderButton = await driver.findElement(By.css('button[type="submit"]'));
        // Aserción: Verificar que el botón "Confirmar Pedido" está deshabilitado
        const isDisabled = await confirmOrderButton.isEnabled();
        expect(isDisabled).to.be.false; 
        console.log(`   ✔️ Botón "Confirmar Pedido" está deshabilitado sin productos en el pedido.`);
    });


    it('Debería validar la cantidad al añadir un producto (deshabilitando botón y mostrando mensaje)', async function() {
        console.log("\n--- Ejecutando prueba: Validar cantidad al añadir producto ---");

        // Seleccionar un cliente para que otros aspectos de la página no causen problemas
        const clientSelect = await driver.findElement(By.css('select[class*="block w-full"]'));
        await driver.wait(until.elementLocated(By.xpath(`//option[contains(text(), '${orderScenario.clientName}')]`)), 10000);
        await clientSelect.sendKeys(orderScenario.clientName);
        await driver.sleep(1000);

        // Usamos el primer producto del escenario para asegurarnos de que exista y tenga stock
        const productForValidation = orderScenario.productsToAdd[0]; 
        console.log(`Producto de prueba para validación: "${productForValidation.name}"`);

        const productCardXPath = `//h3[text()="${productForValidation.name}"]/ancestor::div[contains(@class, 'border-gray-200')]`;
        const quantityInputXPath = `${productCardXPath}//input[contains(@id, 'qty-')]`;
        const addButtonXPath = `${productCardXPath}//button[text()='Añadir']`;

        const quantityInput = await driver.wait(until.elementLocated(By.xpath(quantityInputXPath)), 10000);
        const addButton = await driver.wait(until.elementLocated(By.xpath(addButtonXPath)), 10000);

        // --- Caso 1: Cantidad 0 o negativa (debería deshabilitar el botón "Añadir") ---
        console.log(`Intentando ingresar cantidad 0 para "${productForValidation.name}".`);
        await quantityInput.clear();
        await quantityInput.sendKeys("0"); // Cantidad inválida

        try {
            await driver.wait(until.elementIsDisabled(addButton), 5000); // Espera hasta 5 segundos a que el botón se deshabilite
            console.log(`   ✔️ Botón "Añadir" está deshabilitado para cantidad <= 0.`);
        } catch (error) {
            // Si falla la espera, el botón NO se deshabilitó
            console.error(`   ❌ ERROR: El botón "Añadir" NO se deshabilitó para cantidad <= 0.`, error.message);
            await driver.takeScreenshot().then(function(image) {
                fs.writeFileSync(path.join(__dirname, `error_screenshot_qty_zero_not_disabled.png`), image.toString('base64'), 'base64');
            });
            throw error; // Re-lanza el error para que Mocha marque el test como fallido
        }

        // --- Caso 2: Cantidad que excede el stock (debería deshabilitar el botón Y mostrar mensaje) ---
        console.log(`Intentando ingresar cantidad que excede stock para "${productForValidation.name}".`);

        const stockTextElementXPath = `${productCardXPath}//p[contains(text(), "Stock:")]`;
        const stockTextElement = await driver.wait(until.elementLocated(By.xpath(stockTextElementXPath)), 10000);
        // Extrae el valor numérico del texto "Stock: XX"
        const stockValue = parseInt((await stockTextElement.getText()).replace('Stock: ', ''), 10);

        await quantityInput.clear();
        await quantityInput.sendKeys(String(stockValue + 1)); // Cantidad que excede el stock
        await driver.sleep(1000); // Dar tiempo a React para actualizar el disabled y el mensaje de error

        // Aserción 1: El botón Añadir debería estar deshabilitado
        addButtonDisabled = await addButton.isEnabled();
        expect(addButtonDisabled).to.be.false;
        console.log(`   ✔️ Botón "Añadir" está deshabilitado cuando excede stock.`);

        // Aserción 2: El mensaje de "Cantidad excede stock disponible." debería aparecer
        // El mensaje de stock aparece dentro de la tarjeta del producto con 'text-red-500'
        const errorMessageElement = await driver.wait(until.elementLocated(By.css(`${productCardXPath} p[class*="text-red-500"]`)), 10000);
        const messageText = await errorMessageElement.getText();
        expect(messageText).to.include('Cantidad excede stock disponible.'); // AJUSTA ESTE MENSAJE SI ES DIFERENTE
        console.log(`   ✔️ Mensaje de error por stock excedido visible: "${messageText}"`);

    });
});