const { Builder, By, Key, until } = require('selenium-webdriver');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');

// --- Configuración ---
let driver;
const LOGIN_URL = "http://localhost:5173/login"; // ¡Cámbiala por la URL de tu página de login!
const ADD_PRODUCT_URL = "http://localhost:5173/productos"; // ¡Cámbiala por la URL de tu página de agregar productos!

// Credenciales de un usuario de prueba válido
const TEST_USER = {
    username: "admin", // ¡Cámbialo por un usuario válido en tu base de datos!
    password: "1234" // ¡Cámbialo por la contraseña de ese usuario!
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
    this.timeout(45000); // Aumenta el timeout si 30s no es suficiente (puede ser lento al principio con login)

    before(async function() {
        // Se ejecuta una vez antes de TODAS las pruebas en esta suite
        driver = await new Builder().forBrowser('chrome').build();
        console.log("Iniciando sesión para las pruebas...");
        await driver.get(LOGIN_URL);

        try {
            // Esperar que el formulario de login esté visible
            await driver.wait(until.elementLocated(By.id('usuario')), 10000); // Espera el input de usuario

            // Rellenar campos de login
            await driver.findElement(By.id('usuario')).sendKeys(TEST_USER.username); // ¡Ajusta el ID!
            await driver.findElement(By.id('password')).sendKeys(TEST_USER.password); // ¡Ajusta el ID!

            // Hacer clic en el botón de login
            await driver.findElement(By.id('loger')).click(); // ¡Ajusta el ID!

            // Esperar una redirección o un indicador de éxito de login
            // Por ejemplo, si redirige a la página principal ('/dashboard')
            await driver.wait(until.urlContains('/productos'), 15000); // ¡Ajusta la URL de redirección post-login!
            console.log("👍 Login exitoso. URL actual:", await driver.getCurrentUrl());

        } catch (error) {
            console.error("❌ Falló el login inicial para las pruebas.");
            console.error("Error:", error.message);
            await driver.takeScreenshot().then(function(image) {
                fs.writeFileSync(`error_screenshot_login.png`, image, 'base64');
            });
            throw new Error("No se pudo iniciar sesión. Las pruebas no pueden continuar."); // Detener las pruebas si el login falla
        }
    });

    after(async function() {
        // Se ejecuta una vez después de todas las pruebas
        if (driver) {
            console.log("Cerrando el navegador...");
            await driver.quit();
        }
    });

    // Bucle para generar pruebas de agregar producto desde el JSON
    testData.forEach((product, index) => {
        it(`Debería agregar el producto #${index + 1}: "${product.nombre}" exitosamente`, async function() {
            // No necesitamos navegar a login de nuevo, ya estamos logueados.
            // Navegar directamente a la página de agregar producto
            await driver.get(ADD_PRODUCT_URL);
            // Esperar a que el campo 'nombre' esté presente y visible
            await driver.wait(until.elementLocated(By.id('newProductName')), 10000);

            try {
                // Encontrar elementos por su ID y rellenarlos
                const nombreInput = await driver.findElement(By.id('newProductName'));
                const precioInput = await driver.findElement(By.id('newProductPrice'));
                const stockInput = await driver.findElement(By.id('newProductStock'));
                const addProductButton = await driver.findElement(By.id('enviar'));

                // Limpiar campos antes de escribir (por si acaso)
                await nombreInput.clear();
                await precioInput.clear();
                await stockInput.clear();

                // Rellenar campos
                await nombreInput.sendKeys(product.nombre);
                await precioInput.sendKeys(String(product.precio));
                await stockInput.sendKeys(String(product.stock));

                console.log(`   Rellenando campos para: Nombre: "${product.nombre}", Precio: "${product.precio}", Stock: "${product.stock}"`);

                // Hacer clic en el botón de agregar
                await addProductButton.click();

                // --- Aserciones ---
                // Verifica el mensaje de éxito o la redirección
                const messageElement = await driver.wait(until.elementLocated(By.id('message')), 10000);
                const messageText = await messageElement.getText();
                expect(messageText).to.include('Producto agregado exitosamente'); // ¡Ajusta el texto de tu mensaje de éxito!

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

    // Prueba para campos vacíos (después del login)
    it('Debería mostrar un error si los campos obligatorios están vacíos (después del login)', async function() {
        await driver.get(ADD_PRODUCT_URL); // Ya estamos logueados, vamos directo
        await driver.wait(until.elementLocated(By.id('nombre')), 10000);

        const addProductButton = await driver.findElement(By.id('enviar'));
        await addProductButton.click();

        try {
            const errorMessageElement = await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
            const errorMessageText = await errorMessageElement.getText();
            expect(errorMessageText).to.include('Campo requerido'); // ¡Ajusta el mensaje de error de tu UI!

            console.log(`   ✔️ Prueba de campos vacíos PASADA (después de login): Mensaje de error encontrado: "${errorMessageText}"`);
        } catch (error) {
            const currentUrl = await driver.getCurrentUrl();
            expect(currentUrl).to.equal(ADD_PRODUCT_URL);
            console.log("   ✔️ Prueba de campos vacíos PASADA (después de login): El formulario no se envió (validación HTML5 o JS).");
        }
    });

});