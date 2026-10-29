# ZERÃO — O verão do Zé

Aplicativo web estático para acompanhar um treino de pernas, registrar séries e cargas e consultar demonstrações humanas 3D de cada exercício.

## Recursos

- oito exercícios de pernas;
- marcação individual de séries e cargas;
- progresso do treino em tempo real;
- histórico salvo no navegador;
- modelo humano 3D animado, giratório e com pausa;
- pesquisa direta de cada exercício no canal/conteúdo do Leandro Twin no YouTube;
- layout responsivo para celular e computador.

Os dados ficam no `localStorage` do navegador. Não há conta nem sincronização entre aparelhos.

## Executar localmente

O projeto não exige compilação. Sirva esta pasta com qualquer servidor HTTP estático, por exemplo:

```bash
npx serve .
```

Abrir `index.html` diretamente também funciona na maioria dos navegadores, mas o servidor local representa melhor a hospedagem final.

## Publicação na Hostinger

O workflow `.github/workflows/deploy.yml` publica automaticamente cada atualização da branch `main` em uma conta FTP da Hostinger restrita à pasta `public_html/projetozerao`.

Os dados de acesso ficam protegidos nos secrets `FTP_SERVER`, `FTP_USERNAME` e `FTP_PASSWORD` do GitHub Actions e não fazem parte do repositório.

O projeto usa caminhos relativos, portanto pode ser servido em `https://zeppen.com.br/projetozerao/` sem alterar os arquivos da raiz do domínio.

## Dependência externa

O modelo 3D usa Three.js via jsDelivr. É necessária conexão com a internet para carregar a biblioteca 3D e as fontes/imagens de apresentação.
