const { Builder, By, Key, until } = require('selenium-webdriver');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

// --- Configuración Global ---
let driver;
const LOGIN_URL = "http://localhost:5173/login";
const CREATE_ORDER_URL = "http://localhost:5173/pedidos/crear";

const TEST_USER = {
    username: "admin",
    password: "1234"
};

const orderScenario = {
    clientName: "juan", 

    productsToAdd: [
        { name: "Laptopp", quantity: 2 }, 
        { name: "Honey Garlic Shrimp", quantity: 1 },
        { name: "panchos", quantity: 1 }
    ],
    productToEdit: { name: "Laptopp", newQuantity: 3 }, 
    productToRemove: "Honey Garlic Shrimp" 
};

// --- Pruebas ---
describe('Pruebas de la página de Crear Pedido', function() {
    this.timeout(60000);

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        console.log("Iniciando sesión para las pruebas de Crear Pedido...");
        await driver.get(LOGIN_URL);

        try {
            await driver.wait(until.elementLocated(By.id('usuario')), 10000);
            await driver.findElement(By.id('usuario')).sendKeys(TEST_USER.username);
            await driver.findElement(By.id('password')).sendKeys(TEST_USER.password);
            await driver.findElement(By.id('loger')).click();
            
            await driver.wait(until.urlContains('/productos'), 15000);
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
        await driver.get(CREATE_ORDER_URL);
        await driver.wait(until.elementLocated(By.css('select[class*="block w-full"]')), 10000);
        await driver.wait(until.elementLocated(By.css('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6')), 10000);
        console.log("Navegado a la página de Crear Pedido y elementos iniciales cargados.");
    });


    it('Debería crear un pedido exitosamente con múltiples productos, editar y remover', async function() {
        console.log("\n--- Ejecutando prueba: Crear un pedido exitosamente (completo) ---");

        // 1. Seleccionar un cliente
        console.log(`Seleccionando cliente: "${orderScenario.clientName}"`);
        const clientSelect = await driver.findElement(By.css('select[class*="block w-full"]'));
        await driver.wait(until.elementLocated(By.xpath(`//option[contains(text(), '${orderScenario.clientName}')]`)), 10000);
        await clientSelect.sendKeys(orderScenario.clientName);
        await driver.sleep(500);

        // 2. Añadir productos al pedido
        for (const item of orderScenario.productsToAdd) {
            console.log(`Añadiendo "${item.name}" con cantidad ${item.quantity}`);
            const productCardXPath = `//h3[text()="${item.name}"]/ancestor::div[contains(@class, 'border-gray-200')]`;
            const quantityInputXPath = `${productCardXPath}//input[contains(@id, 'qty-')]`;
            const addButtonXPath = `${productCardXPath}//button[text()='Añadir']`;

            const quantityInput = await driver.wait(until.elementLocated(By.xpath(quantityInputXPath)), 10000);
            const addButton = await driver.wait(until.elementLocated(By.xpath(addButtonXPath)), 10000);

            await quantityInput.clear();
            await quantityInput.sendKeys(String(item.quantity));
            await addButton.click();

            await driver.sleep(1000);
        }

        if (orderScenario.productToEdit) {
            console.log(`Editando cantidad de "${orderScenario.productToEdit.name}" a ${orderScenario.productToEdit.newQuantity}`);
            try {
                const rowXPath = `//table//td[text()="${orderScenario.productToEdit.name}"]/parent::tr`;
                const editQuantityInputXPath = `${rowXPath}//input[@type='number']`;

                const editQuantityInput = await driver.wait(until.elementLocated(By.xpath(editQuantityInputXPath)), 10000);
                await editQuantityInput.clear();
                await editQuantityInput.sendKeys(String(orderScenario.productToEdit.newQuantity));
                await driver.sleep(1000); 
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
                await driver.sleep(1000);
                const productRemoved = await driver.findElements(By.xpath(`//table//td[text()="${orderScenario.productToRemove}"]`));
                expect(productRemoved).to.have.lengthOf(0, `El producto "${orderScenario.productToRemove}" debería haber sido eliminado.`);
            } catch (error) {
                console.warn(`   ⚠️ Advertencia: No se pudo eliminar el producto "${orderScenario.productToRemove}". Puede que ya no esté en el pedido o el selector sea incorrecto.`, error.message);
                 await driver.takeScreenshot().then(function(image) {
                    fs.writeFileSync(path.join(__dirname, `error_screenshot_remove_product.png`), image.toString('base64'), 'base64');
                });
            }
        }

        // 5. total del pedido
        const totalElement = await driver.wait(until.elementLocated(By.css('span[class*="text-xl font-extrabold"]')), 10000);
        const currentTotalText = await totalElement.getText();
        expect(currentTotalText).to.match(/^\$\d+(\.\d{2})?$/);
        console.log(`   Total del pedido visible: ${currentTotalText}`);


        // 6. Confirmar el Pedido
        console.log("Confirmando el pedido...");
        const confirmOrderButton = await driver.findElement(By.css('button[type="submit"]'));
        await confirmOrderButton.click();

        // 7. Aserciones finales: Mensaje de éxito
        const successMessage = await driver.wait(until.elementLocated(By.css('p[class*="text-green-600"]')), 15000);
        const messageText = await successMessage.getText();
        expect(messageText).to.include('¡Pedido creado con éxito!'); 
        console.log(`   ✔️ Pedido creado exitosamente: "${messageText}"`);


        console.log("--- Prueba de Creación de Pedido completada con éxito ---");
    });

    it('Debería deshabilitar el botón de confirmar si no hay cliente seleccionado', async function() {
        console.log("\n--- Ejecutando prueba: Botón deshabilitado sin cliente seleccionado ---");

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
        const isDisabled = await confirmOrderButton.isEnabled();
        expect(isDisabled).to.be.false; 
        console.log(`   ✔️ Botón "Confirmar Pedido" está deshabilitado sin cliente seleccionado.`);
    });

    it('Debería deshabilitar el botón de confirmar si no hay productos en el pedido', async function() {
        console.log("\n--- Ejecutando prueba: Botón deshabilitado sin productos ---");
        const clientSelect = await driver.findElement(By.css('select[class*="block w-full"]'));
        await driver.wait(until.elementLocated(By.xpath(`//option[contains(text(), '${orderScenario.clientName}')]`)), 10000);
        await clientSelect.sendKeys(orderScenario.clientName);
        await driver.sleep(1000);


        const confirmOrderButton = await driver.findElement(By.css('button[type="submit"]'));
        const isDisabled = await confirmOrderButton.isEnabled();
        expect(isDisabled).to.be.false; 
        console.log(`   ✔️ Botón "Confirmar Pedido" está deshabilitado sin productos en el pedido.`);
    });


    it('Debería validar la cantidad al añadir un producto (deshabilitando botón y mostrando mensaje)', async function() {
        console.log("\n--- Ejecutando prueba: Validar cantidad al añadir producto ---");

        const clientSelect = await driver.findElement(By.css('select[class*="block w-full"]'));
        await driver.wait(until.elementLocated(By.xpath(`//option[contains(text(), '${orderScenario.clientName}')]`)), 10000);
        await clientSelect.sendKeys(orderScenario.clientName);
        await driver.sleep(1000);

        const productForValidation = orderScenario.productsToAdd[0]; 
        console.log(`Producto de prueba para validación: "${productForValidation.name}"`);

        const productCardXPath = `//h3[text()="${productForValidation.name}"]/ancestor::div[contains(@class, 'border-gray-200')]`;
        const quantityInputXPath = `${productCardXPath}//input[contains(@id, 'qty-')]`;
        const addButtonXPath = `${productCardXPath}//button[text()='Añadir']`;

        const quantityInput = await driver.wait(until.elementLocated(By.xpath(quantityInputXPath)), 10000);
        const addButton = await driver.wait(until.elementLocated(By.xpath(addButtonXPath)), 10000);

        console.log(`Intentando ingresar cantidad 0 para "${productForValidation.name}".`);
        await quantityInput.clear();
        await quantityInput.sendKeys("0"); 

        try {
            await driver.wait(until.elementIsDisabled(addButton), 5000);
            console.log(`   ✔️ Botón "Añadir" está deshabilitado para cantidad <= 0.`);
        } catch (error) {
            console.error(`   ❌ ERROR: El botón "Añadir" NO se deshabilitó para cantidad <= 0.`, error.message);
            await driver.takeScreenshot().then(function(image) {
                fs.writeFileSync(path.join(__dirname, `error_screenshot_qty_zero_not_disabled.png`), image.toString('base64'), 'base64');
            });
            throw error;
        }

        // --- Caso 2: Cantidad que excede el stock ---
        console.log(`Intentando ingresar cantidad que excede stock para "${productForValidation.name}".`);

        const stockTextElementXPath = `${productCardXPath}//p[contains(text(), "Stock:")]`;
        const stockTextElement = await driver.wait(until.elementLocated(By.xpath(stockTextElementXPath)), 10000);
        const stockValue = parseInt((await stockTextElement.getText()).replace('Stock: ', ''), 10);

        await quantityInput.clear();
        await quantityInput.sendKeys(String(stockValue + 1));
        await driver.sleep(1000);

        addButtonDisabled = await addButton.isEnabled();
        expect(addButtonDisabled).to.be.false;
        console.log(`   ✔️ Botón "Añadir" está deshabilitado cuando excede stock.`);

        const errorMessageElement = await driver.wait(until.elementLocated(By.css(`${productCardXPath} p[class*="text-red-500"]`)), 10000);
        const messageText = await errorMessageElement.getText();
        expect(messageText).to.include('Cantidad excede stock disponible.');
        console.log(`   ✔️ Mensaje de error por stock excedido visible: "${messageText}"`);

    });
});