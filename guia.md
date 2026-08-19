# Guia do Acervo Paroquianos do Junco

## Estrutura do sistema

- `index.html`: página inicial, com a Semana da Família 2026.
- `acervo.html`: página para escolher uma galeria.
- `galeria.html?evento=...`: abre os álbuns secundários de forma independente.
- `events.js`: catálogo de todos os álbuns publicados.
- `Semana da Família AAAA/`: pasta autocontida de cada evento, com imagens e `data.js`.
- `script.js` e `styles.css`: comportamento e aparência compartilhados.
- `local-server.js`: servidor local com recurso de exclusão definitiva.

A Semana da Família 2026 é a galeria editorial principal. Os demais álbuns usam o modo simples: mosaico responsivo e visualizador de fotos na mesma página.

## Ativar o sistema localmente

1. Abra um terminal na pasta do projeto:

```bash
cd \"/home/ferper/Área de trabalho/Paroquianos_do_Junco\"
```

2. Confirme que o Node.js está disponível:

```bash
node --version
```

3. Se outro servidor estiver usando a porta 8000, encerre-o com `Ctrl+C` no terminal onde ele está rodando.

4. Inicie o servidor administrativo local:

```bash
node local-server.js
```

O terminal deve mostrar `Administração local: http://127.0.0.1:8000`.

5. Abra `http://127.0.0.1:8000` no navegador. Nesse endereço aparece o botão **Excluir**. Ele remove a imagem definitivamente e atualiza os metadados e o contador do álbum.

6. Para encerrar o sistema local, volte ao terminal e pressione `Ctrl+C`.

Nunca publique esse servidor na internet.

## Atualizar um álbum existente

1. Adicione, remova ou ajuste os arquivos dentro da pasta do evento.
2. Atualize o `data.js` quando necessário; `photoCount` deve coincidir com a lista de fotos.
3. Teste localmente.
4. Valide o acervo:

```bash
node validar.js
```

5. Publique em um comando:

```bash
./publicar.sh "Descreva a atualização"
```

O comando valida o projeto, mostra as alterações, cria o commit e envia para `main`. A hospedagem publica automaticamente; use sempre o domínio principal, não links de prévia com identificadores longos.

## Criar um novo álbum simples

1. Crie uma pasta para o evento e coloque nela somente as imagens a publicar.
2. Execute:

```bash
node criar-album.js "Nome da Pasta" "Nome do Evento" 2024
```

O comando lê dimensões e datas EXIF, gera o `data.js`, ordena as fotos por data e inclui o evento em `events.js`.

3. Abra `acervo.html` localmente e confira o novo cartão.
4. Publique com `./publicar.sh`.

## Arquivos que não vão para o site

O `.gitignore` já exclui arquivos de sistema, editores e as pastas `_local/`, `rascunhos/` e `originais/`.

Use essas pastas para materiais privados, arquivos pesados de trabalho e versões não aprovadas. Eles não entram no commit nem na publicação. Quando surgir outro tipo de arquivo local, inclua uma regra no `.gitignore` antes de usar o `publicar.sh`.
