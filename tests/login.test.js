const { Builder, By, until } = require("selenium-webdriver");
const assert = require("assert");

describe("Fitur Login - Black Box Testing SauceDemo", function () {
  this.timeout(30000);
  let driver;

  beforeEach(async () => {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.get("https://www.saucedemo.com/");
  });

  afterEach(async () => {
    await driver.quit();
  });

  // TC-LOGIN-01: Login dengan kredensial valid
  it("TC-LOGIN-01 - Should berhasil login dengan akun valid", async () => {
    await driver.findElement(By.id("user-name")).sendKeys("standard_user");
    await driver.findElement(By.id("password")).sendKeys("secret_sauce");
    await driver.findElement(By.id("login-button")).click();

    await driver.wait(until.urlContains("inventory.html"), 5000);
    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes("inventory.html"));
  });

  // TC-LOGIN-02: Login dengan password salah
  it("TC-LOGIN-02 - Should menolak login dengan password salah", async () => {
    await driver.findElement(By.id("user-name")).sendKeys("standard_user");
    await driver.findElement(By.id("password")).sendKeys("salah_password");
    await driver.findElement(By.id("login-button")).click();

    const errorMsg = await driver.findElement(By.css("[data-test='error']")).getText();
    assert.ok(errorMsg.includes("do not match"));
  });

  // TC-LOGIN-03: Login dengan akun locked_out_user
  it("TC-LOGIN-03 - Should menolak login untuk akun locked_out_user", async () => {
    await driver.findElement(By.id("user-name")).sendKeys("locked_out_user");
    await driver.findElement(By.id("password")).sendKeys("secret_sauce");
    await driver.findElement(By.id("login-button")).click();

    const errorMsg = await driver.findElement(By.css("[data-test='error']")).getText();
    assert.ok(errorMsg.includes("locked out"));
  });

  // TC-LOGIN-04: Username dikosongkan
  it("TC-LOGIN-04 - Should menampilkan error saat username kosong", async () => {
    await driver.findElement(By.id("password")).sendKeys("secret_sauce");
    await driver.findElement(By.id("login-button")).click();

    const errorMsg = await driver.findElement(By.css("[data-test='error']")).getText();
    assert.ok(errorMsg.includes("Username is required"));
  });

  // TC-LOGIN-05: Password dikosongkan
  it("TC-LOGIN-05 - Should menampilkan error saat password kosong", async () => {
    await driver.findElement(By.id("user-name")).sendKeys("standard_user");
    await driver.findElement(By.id("login-button")).click();

    const errorMsg = await driver.findElement(By.css("[data-test='error']")).getText();
    assert.ok(errorMsg.includes("Password is required"));
  });
});