const { Given, When, Then } = require("@cucumber/cucumber");
const { By, until } = require("selenium-webdriver");


async function fecharPopupLogin(driver) {
  try {
    const popups = await driver.findElements(
      By.css("a.nav-a, div#nav-main a.nav-a")
    );
    if (popups.length > 0) {
      await popups[0].click();
    }
  } catch (_) {}
}


Given('que o usuário está na página inicial da Amazon', async function () {
  await this.driver.get('https://www.amazon.com.br/');

  await this.driver.wait(
    until.elementLocated(By.id('twotabsearchtextbox')),
    20000
  );
});

When('ele busca por {string}', async function (produto) {
  const searchBox = await this.driver.findElement(By.id('twotabsearchtextbox'));
  await searchBox.clear();
  await searchBox.sendKeys(produto);

  const searchButton = await this.driver.findElement(By.id('nav-search-submit-button'));
  await searchButton.click();

  await this.driver.wait(
    until.elementLocated(By.css('div.s-main-slot')),
    20000
  );
});

Then('a página deve exibir resultados relacionados ao termo {string}', async function (produto) {
  const results = await this.driver.findElements(
    By.css('div.s-main-slot div[data-component-type="s-search-result"]')
  );

  if (results.length === 0) {
    throw new Error(`Nenhum resultado encontrado para: ${produto}`);
  }
});


Then('a página deve informar que não há resultados para o termo buscado', async function () {
  const emptyMessage = await this.driver.wait(
    until.elementLocated(By.css('[cel_widget_id="UPPER-RESULT_INFO_BAR-0"]')),
    15000
  );

  const msg = await emptyMessage.getText();

  if (!msg.toLowerCase().includes("não encontrou")) {
    throw new Error("Mensagem de 'nenhum resultado' não encontrada na página.");
  }
});


Then('os resultados exibidos devem estar relacionados ao termo {string}', async function (produto) {
  const results = await this.driver.findElements(
    By.css('div.s-main-slot div[data-component-type="s-search-result"]')
  );

  if (results.length === 0) {
    throw new Error(`Nenhum resultado encontrado para: ${produto}`);
  }

  const bodyText = await this.driver.findElement(By.tagName('body')).getText();

  if (!bodyText.toLowerCase().includes(produto.toLowerCase())) {
    throw new Error(`O termo "${produto}" não aparece em nenhum resultado.`);
  }
});


When('ele aplica o filtro de preço {string}', async function (faixa) {

  const [min, max] = faixa
    .replace(/[R$\s\.]/g, '')
    .split('a')
    .map(v => v.trim());

  try {
    await this.driver.executeScript("window.scrollTo(0, document.body.scrollHeight)");

    const minBox = await this.driver.findElement(By.id('low-price'));
    const maxBox = await this.driver.findElement(By.id('high-price'));

    await minBox.clear();
    await minBox.sendKeys(min);

    await maxBox.clear();
    await maxBox.sendKeys(max);

    const goBtn = await this.driver.findElement(By.id('high-price + span input'));
    await goBtn.click();
  } catch (err) {
    throw new Error("Não foi possível aplicar o filtro de preço. Erro: " + err);
  }

  await this.driver.sleep(3000);
});

Then('os resultados exibidos devem estar dentro da faixa de preço selecionada', async function () {
  const pricesElems = await this.driver.findElements(By.css('span.a-price-whole'));

  if (pricesElems.length === 0) {
    throw new Error("Nenhum preço encontrado para validar.");
  }

  for (const elem of pricesElems) {
    const txt = await elem.getText();
    const value = parseInt(txt.replace(/\D/g, ''), 10);

    if (value < 1000 || value > 2000) {
      throw new Error(`Preço fora da faixa: ${value}`);
    }
  }
});



Given('que o usuário está na página de resultados da busca por {string}', async function (produto) {
  await this.driver.get(`https://www.amazon.com.br/s?k=${encodeURIComponent(produto)}`);

  await this.driver.wait(
    until.elementLocated(By.css('div.s-main-slot')),
    20000
  );
});

When('ele seleciona a ordenação {string}', async function (opcao) {
  await fecharPopupLogin(this.driver);

  await this.driver.wait(
    until.elementLocated(By.id('a-autoid-0-announce')),
    10000
  );

  const sortButton = await this.driver.findElement(By.id('a-autoid-0-announce'));
  await sortButton.click();
  await this.driver.sleep(1000);

  let xpath = "";

  if (opcao === "Menor preço") {
    xpath = "//a[contains(@id, 'sort') and contains(text(), 'Preço: menor para maior')]";
  } else if (opcao === "Maior preço") {
    xpath = "//a[contains(@id, 'sort') and contains(text(), 'Preço: maior para menor')]";
  } else {
    throw new Error("Opção de ordenação inválida: " + opcao);
  }

  const el = await this.driver.findElement(By.xpath(xpath));
  await el.click();

  await this.driver.sleep(3000);
});

Then('a página deve exibir os produtos ordenados do menor para o maior preço', async function () {
  const elems = await this.driver.findElements(By.css('span.a-price-whole'));

  const values = [];
  for (const elem of elems) {
    const txt = await elem.getText();
    const value = parseInt(txt.replace(/\D/g, ''), 10);
    if (!isNaN(value)) values.push(value);
  }

  if (values.length < 2) {
    throw new Error("Poucos preços encontrados para validar ordenação.");
  }

  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] > values[i + 1]) {
      throw new Error(`Ordenação incorreta: ${values[i]} > ${values[i + 1]}`);
    }
  }
});


When('ele clica em um dos produtos listados', async function () {

  await this.driver.wait(
    until.elementsLocated(By.css('div[data-component-type="s-search-result"] h2 a')),
    15000
  );

  const items = await this.driver.findElements(
    By.css('div[data-component-type="s-search-result"] h2 a')
  );

  if (items.length === 0) {
    throw new Error("Nenhum produto clicável encontrado.");
  }

  await items[0].click();

  await this.driver.wait(
    until.elementLocated(By.id('productTitle')),
    20000
  );
});

Then('a página deve exibir os detalhes do produto selecionado', async function () {
  const title = await this.driver.findElement(By.id('productTitle'));

  const txt = await title.getText();
  if (!txt || txt.length < 2) {
    throw new Error("Título do produto não carregou corretamente.");
  }
});
