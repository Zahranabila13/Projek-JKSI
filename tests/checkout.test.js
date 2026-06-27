const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert");

describe("Fitur Checkout - Black Box Testing SauceDemo", function () {
  this.timeout(60000);
  let driver;

  async function login() {
    await driver.get("https://www.saucedemo.com/");
    await driver.wait(until.elementLocated(By.id("user-name")), 10000);
    await driver.findElement(By.id("user-name")).sendKeys("standard_user");
    await driver.findElement(By.id("password")).sendKeys("secret_sauce");
    await driver.findElement(By.id("login-button")).click();
    await driver.wait(until.urlContains("inventory.html"), 10000);
  }

  // klik aman: tunggu elemen muncul & bisa diklik, baru klik
  async function safeClick(locator) {
    const el = await driver.wait(until.elementLocated(locator), 10000);
    await driver.wait(until.elementIsVisible(el), 10000);
    await el.click();
  }

  beforeEach(async () => {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.manage().window().maximize();
    await login();
  });

  afterEach(async () => {
    await driver.quit();
  });

  // TC-CHECKOUT-01: Badge cart bertambah
  it("TC-CHECKOUT-01 - Should badge cart bertambah sesuai jumlah produk", async () => {
    await safeClick(By.id("add-to-cart-sauce-labs-backpack"));
    await driver.wait(until.elementTextIs(driver.findElement(By.className("shopping_cart_badge")), "1"), 5000);

    await safeClick(By.id("add-to-cart-sauce-labs-bike-light"));
    await driver.wait(until.elementTextIs(driver.findElement(By.className("shopping_cart_badge")), "2"), 5000);

    const cartBadge = await driver.findElement(By.className("shopping_cart_badge")).getText();
    assert.strictEqual(cartBadge, "2");
  });

  // TC-CHECKOUT-02: Checkout lengkap sampai selesai
  it("TC-CHECKOUT-02 - Should berhasil checkout sampai selesai", async () => {
    await safeClick(By.id("add-to-cart-sauce-labs-backpack"));
    await safeClick(By.className("shopping_cart_link"));
    await driver.wait(until.urlContains("cart.html"), 10000);

    await safeClick(By.id("checkout"));
    await driver.wait(until.urlContains("checkout-step-one.html"), 10000);

    await driver.wait(until.elementLocated(By.id("first-name")), 10000);
    await driver.findElement(By.id("first-name")).sendKeys("Zahra");
    await driver.findElement(By.id("last-name")).sendKeys("Nurul Fikri");
    await driver.findElement(By.id("postal-code")).sendKeys("16411");
    await safeClick(By.id("continue"));

    await driver.wait(until.urlContains("checkout-step-two.html"), 10000);
    await safeClick(By.id("finish"));
    await driver.wait(until.urlContains("checkout-complete.html"), 10000);

    const successMsg = await driver.findElement(By.className("complete-header")).getText();
    assert.strictEqual(successMsg, "Thank you for your order!");
  });

  // TC-CHECKOUT-03: First Name dikosongkan
  it("TC-CHECKOUT-03 - Should menampilkan error saat First Name kosong", async () => {
    await safeClick(By.id("add-to-cart-sauce-labs-backpack"));
    await safeClick(By.className("shopping_cart_link"));
    await driver.wait(until.urlContains("cart.html"), 10000);

    await safeClick(By.id("checkout"));
    await driver.wait(until.urlContains("checkout-step-one.html"), 10000);

    await driver.findElement(By.id("last-name")).sendKeys("Nurul Fikri");
    await driver.findElement(By.id("postal-code")).sendKeys("16411");
    await safeClick(By.id("continue"));

    const errorMsg = await driver.wait(
      until.elementLocated(By.css("[data-test='error']")), 5000
    ).then(el => el.getText());
    assert.ok(errorMsg.includes("First Name is required"));
  });

  // TC-CHECKOUT-04: Postal Code dikosongkan
  it("TC-CHECKOUT-04 - Should menampilkan error saat Postal Code kosong", async () => {
    await safeClick(By.id("add-to-cart-sauce-labs-backpack"));
    await safeClick(By.className("shopping_cart_link"));
    await driver.wait(until.urlContains("cart.html"), 10000);

    await safeClick(By.id("checkout"));
    await driver.wait(until.urlContains("checkout-step-one.html"), 10000);

    await driver.findElement(By.id("first-name")).sendKeys("Zahra");
    await driver.findElement(By.id("last-name")).sendKeys("Nurul Fikri");
    await safeClick(By.id("continue"));

    const errorMsg = await driver.wait(
      until.elementLocated(By.css("[data-test='error']")), 5000
    ).then(el => el.getText());
    assert.ok(errorMsg.includes("Postal Code is required"));
  });

  // TC-CHECKOUT-05: Verifikasi total harga
  it("TC-CHECKOUT-05 - Should menampilkan total harga yang sesuai", async () => {
    await safeClick(By.id("add-to-cart-sauce-labs-backpack"));
    await safeClick(By.id("add-to-cart-sauce-labs-bolt-t-shirt"));
    await safeClick(By.className("shopping_cart_link"));
    await driver.wait(until.urlContains("cart.html"), 10000);

    await safeClick(By.id("checkout"));
    await driver.wait(until.urlContains("checkout-step-one.html"), 10000);

    await driver.findElement(By.id("first-name")).sendKeys("Zahra");
    await driver.findElement(By.id("last-name")).sendKeys("Nurul Fikri");
    await driver.findElement(By.id("postal-code")).sendKeys("16411");
    await safeClick(By.id("continue"));
    await driver.wait(until.urlContains("checkout-step-two.html"), 10000);

    const itemTotalText = await driver.findElement(By.className("summary_subtotal_label")).getText();
    const taxText = await driver.findElement(By.className("summary_tax_label")).getText();
    const totalText = await driver.findElement(By.className("summary_total_label")).getText();

    const itemTotal = parseFloat(itemTotalText.replace(/[^0-9.]/g, ""));
    const tax = parseFloat(taxText.replace(/[^0-9.]/g, ""));
    const total = parseFloat(totalText.replace(/[^0-9.]/g, ""));

    assert.strictEqual(Math.round((itemTotal + tax) * 100) / 100, total);
  });
});