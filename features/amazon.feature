Feature: Busca de produtos na Amazon
  Como usuário do site da Amazon
  Quero realizar buscas por produtos
  Para visualizar itens relevantes e encontrar o que desejo comprar

  # Cenário 1 (já existente)
  Scenario: Buscar um notebook existente
    Given que o usuário está na página inicial da Amazon
    When ele busca por "notebook"
    Then a página deve exibir resultados relacionados ao termo "notebook"

  # Cenário 2 (já existente)
  Scenario: Buscar um item que não existe
    Given que o usuário está na página inicial da Amazon
    When ele busca por "xyzprodutoquenaoexiste123"
    Then a página deve informar que não há resultados para o termo buscado

  # Cenário 3 – Filtrar resultados após busca
  Scenario: Aplicar filtro de preço após uma busca
    Given que o usuário está na página inicial da Amazon
    And ele busca por "smartphone"
    When ele aplica o filtro de preço "R$ 1.000 a R$ 2.000"
    Then os resultados exibidos devem estar dentro da faixa de preço selecionada

  # Cenário 4 – Ordenar resultados
  Scenario: Ordenar resultados por menor preço
    Given que o usuário está na página de resultados da busca por "monitor"
    When ele seleciona a ordenação "Menor preço"
    Then a página deve exibir os produtos ordenados do menor para o maior preço

  # Cenário 5 – Ver detalhes de um produto
  Scenario: Acessar a página de um produto a partir dos resultados
    Given que o usuário está na página de resultados da busca por "mouse gamer"
    When ele clica em um dos produtos listados
    Then a página deve exibir os detalhes do produto selecionado

  # Scenario Outline (requisito obrigatório)
  Scenario Outline: Buscar diferentes tipos de produtos
    Given que o usuário está na página inicial da Amazon
    When ele busca por "<produto>"
    Then os resultados exibidos devem estar relacionados ao termo "<produto>"

    Examples:
      | produto        |
      | mochila        |
      | cadeira gamer  |
      | teclado        |
      | fone bluetooth |
