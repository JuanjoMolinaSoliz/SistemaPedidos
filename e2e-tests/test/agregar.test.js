const { Builder, By, Key, until } = require('selenium-webdriver');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

// --- Configuración ---
let driver;
const LOGIN_URL = "http://localhost:5173/login";
const ADD_PRODUCT_URL = "http://localhost:5173/productos";

// Credenciales de un usuario de prueba válido
const TEST_USER = {
    username: "admin",
    password: "1234" 
};

// Ruta al archivo de datos de prueba
const testDataPath = path.resolve(__dirname, '../datos_modificados.json');
let testData = [];

// Cargar los datos de prueba sincrónicamente al inicio
try {
    const rawData = fs.readFileSync(testDataPath, 'utf8');
    testData = JSON.parse(rawData);
    console.log(`✅ Se cargaron ${testData.length} productos desde ${testDataPath}`);
} catch (error) {
    console.error(`❌ Error al cargar los datos de prueba desde ${testDataPath}:`, error);
    process.exit(1);
}

// --- Suite de Pruebas ---
describe('Pruebas de la página de Agregar Producto con Login', function() {
    this.timeout(45000);

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        console.log("Iniciando sesión para las pruebas...");
        await driver.get(LOGIN_URL);

        try {
            await driver.wait(until.elementLocated(By.id('usuario')), 10000);

            await driver.findElement(By.id('usuario')).sendKeys(TEST_USER.username);
            await driver.findElement(By.id('password')).sendKeys(TEST_USER.password);

            await driver.findElement(By.id('loger')).click();

            await driver.wait(until.urlContains('/productos'), 15000);
            console.log("👍 Login exitoso. URL actual:", await driver.getCurrentUrl());

        } catch (error) {
            console.error("❌ Falló el login inicial para las pruebas.");
            console.error("Error:", error.message);
            await driver.takeScreenshot().then(function(image) {
                fs.writeFileSync(`error_screenshot_login.png`, image, 'base64');
            });
            throw new Error("No se pudo iniciar sesión. Las pruebas no pueden continuar.");
        }
    });

    after(async function() {
        if (driver) {
            console.log("Cerrando el navegador...");
            await driver.quit();
        }
    });

    // Bucle para generar pruebas de agregar producto desde el JSON
    testData.forEach((product, index) => {
        it(`Debería agregar el producto #${index + 1}: "${product.nombre}" exitosamente`, async function() {
            await driver.get(ADD_PRODUCT_URL);
            await driver.wait(until.elementLocated(By.id('newProductName')), 10000);

            try {
                const nombreInput = await driver.findElement(By.id('newProductName'));
                const precioInput = await driver.findElement(By.id('newProductPrice'));
                const stockInput = await driver.findElement(By.id('newProductStock'));
                const addProductButton = await driver.findElement(By.id('enviar'));

                // Limpiar campos antes de escribir
                await nombreInput.clear();
                await precioInput.clear();
                await stockInput.clear();

                // Rellenar campos
                await nombreInput.sendKeys(product.nombre);
                await precioInput.sendKeys(String(product.precio));
                await stockInput.sendKeys(String(product.stock));

                console.log(`   Rellenando campos para: Nombre: "${product.nombre}", Precio: "${product.precio}", Stock: "${product.stock}"`);

                await addProductButton.click();

                // --- Aserciones ---
                const messageElement = await driver.wait(until.elementLocated(By.id('message')), 10000);
                const messageText = await messageElement.getText();
                expect(messageText).to.include('Producto agregado exitosamente'); 

                console.log(`   ✔️ Producto #${index + 1}: "${product.nombre}" agregado y verificado exitosamente. Mensaje: "${messageText}"`);

            } catch (error) {
                console.error(`   ❌ Falló la prueba para el producto #${index + 1}: "${product.nombre}"`);
                console.error(`   Error: ${error.message}`);
                await driver.takeScreenshot().then(
                    function(image) {
                        fs.writeFileSync(`error_screenshot_product_${index + 1}_${product.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.png`, image, 'base64');
                        console.log(`   Captura de pantalla guardada para "${product.nombre}".`);
                    }
                );
                throw error;
            }
        });
    });

    // Prueba para campos vacíos
    it('Debería mostrar un error si los campos obligatorios están vacíos (después del login)', async function() {
        await driver.get(ADD_PRODUCT_URL);
        await driver.wait(until.elementLocated(By.id('nombre')), 10000);

        const addProductButton = await driver.findElement(By.id('enviar'));
        await addProductButton.click();

        try {
            const errorMessageElement = await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
            const errorMessageText = await errorMessageElement.getText();
            expect(errorMessageText).to.include('Campo requerido');

            console.log(`   ✔️ Prueba de campos vacíos PASADA (después de login): Mensaje de error encontrado: "${errorMessageText}"`);
        } catch (error) {
            const currentUrl = await driver.getCurrentUrl();
            expect(currentUrl).to.equal(ADD_PRODUCT_URL);
            console.log("   ✔️ Prueba de campos vacíos PASADA (después de login): El formulario no se envió (validación HTML5 o JS).");
        }
    });

});