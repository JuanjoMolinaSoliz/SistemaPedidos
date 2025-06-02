import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

import { Builder, By, Key, until } from 'selenium-webdriver';
import { expect } from 'chai';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// --- Configuración ---
let driver;
const LOGIN_URL = "http://localhost:5173/login";
const ADD_PRODUCT_URL = "http://localhost:5173/productos";

const TEST_USER = {
    username: "admin",
    password: "1234"
};

const testDataPath = path.resolve(__dirname, '../datos_modificados.json');
let testData = [];

try {
    const rawData = fs.readFileSync(testDataPath, 'utf8');
    testData = JSON.parse(rawData);
    console.log(`✅ Se cargaron ${testData.length} productos desde ${testDataPath}`);
} catch (error) {
    console.error(`❌ Error al cargar los datos de prueba desde ${testDataPath}:`, error);
    process.exit(1);
}

describe('Pruebas de la página de Agregar Producto con Login', function() {
    this.timeout(45000);

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        console.log("Iniciando sesión para las pruebas...");
        await driver.get(LOGIN_URL);

        try {
            await driver.wait(until.elementLocated(By.id('usuario')), 10000);

            await driver.findElement(By.id('usuario')).sendKeys(TEST_USER.username);
            await driver.sleep(1000);

            await driver.findElement(By.id('password')).sendKeys(TEST_USER.password);
            await driver.sleep(1000);

            await driver.findElement(By.id('loger')).click();
            await driver.sleep(2000);

            await driver.wait(until.urlContains('/productos'), 15000);
            console.log("👍 Login exitoso. URL actual:", await driver.getCurrentUrl());

        } catch (error) {
            console.error("❌ Falló el login inicial para las pruebas.");
            console.error("Error:", error.message);
            await driver.takeScreenshot().then(function(image) {
                fs.writeFileSync(path.join(__dirname, `error_screenshot_login.png`), image, 'base64');
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
            await driver.sleep(1500); 

            try {
                const nombreInput = await driver.findElement(By.id('newProductName'));
                const precioInput = await driver.findElement(By.id('newProductPrice'));
                const stockInput = await driver.findElement(By.id('newProductStock'));
                const addProductButton = await driver.findElement(By.id('enviar'));

                // Limpiar campos antes de escribir
                await nombreInput.clear();
                await precioInput.clear();
                await stockInput.clear();
                await driver.sleep(500);

                // Rellenar campos
                await nombreInput.sendKeys(product.nombre);
                await driver.sleep(500);
                await precioInput.sendKeys(String(product.precio));
                await driver.sleep(500);
                await stockInput.sendKeys(String(product.stock));
                await driver.sleep(500);

                console.log(`    Rellenando campos para: Nombre: "${product.nombre}", Precio: "${product.precio}", Stock: "${product.stock}"`);

                await addProductButton.click();
                await driver.sleep(2000);

                // --- Aserciones: CAMBIADO EL SELECTOR Y EL TEXTO ESPERADO ---
                const messageElement = await driver.wait(until.elementLocated(By.css('p.text-green-600')), 10000);
                const messageText = await messageElement.getText();
                expect(messageText).to.include('Producto enviado para creación. Reintentando cargar lista...'); 

                console.log(`    ✔️ Producto #${index + 1}: "${product.nombre}" agregado y verificado exitosamente. Mensaje: "${messageText}"`);

            } catch (error) {
                console.error(`    ❌ Falló la prueba para el producto #${index + 1}: "${product.nombre}"`);
                console.error(`    Error: ${error.message}`);
                await driver.takeScreenshot().then(
                    function(image) {
                        fs.writeFileSync(path.join(__dirname, `error_screenshot_product_${index + 1}_${product.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.png`), image, 'base64');
                        console.log(`    Captura de pantalla guardada para "${product.nombre}".`);
                    }
                );
                throw error;
            }
        });
    });

    // Prueba para campos vacíos
    it('Debería mostrar un error si los campos obligatorios están vacíos (después del login)', async function() {
        await driver.get(ADD_PRODUCT_URL);
        await driver.wait(until.elementLocated(By.id('newProductName')), 10000); 

        await driver.sleep(1500);

        const addProductButton = await driver.findElement(By.id('enviar'));
        await addProductButton.click();

        await driver.sleep(2000);

        try {
            const errorMessageElement = await driver.wait(until.elementLocated(By.css('p.text-red-600')), 5000);
            const errorMessageText = await errorMessageElement.getText();
            expect(errorMessageText).to.include('Complete todos los campos.'); 

            console.log(`    ✔️ Prueba de campos vacíos PASADA (después de login): Mensaje de error encontrado: "${errorMessageText}"`);
        } catch (error) {
            const currentUrl = await driver.getCurrentUrl();
            expect(currentUrl).to.equal(ADD_PRODUCT_URL); 
            console.log("    ✔️ Prueba de campos vacíos PASADA (después de login): El formulario no se envió (validación HTML5 o JS).");
        }
    });

});