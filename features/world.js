const { setWorldConstructor, Before, After } = require("@cucumber/cucumber");
const { Builder } = require("selenium-webdriver");

class CustomWorld {
  constructor() {
    this.driver = null;
  }
}

Before(async function () {
  this.driver = await new Builder().forBrowser("chrome").build();
  await this.driver.manage().setTimeouts({ implicit: 10000 }); // 10s
});

After(async function () {
  if (this.driver) {
    await this.driver.quit();
  }
});

setWorldConstructor(CustomWorld);
