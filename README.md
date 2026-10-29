# ZERÃO — Do Zero ao Zé no Verão

Portal pessoal de evolução integral do Zé. O projeto combina treino, alimentação, peso, sono, suplementação e observações de saúde em uma única rotina diária.

## Recursos

- painel diário com placar dos pilares de evolução;
- ciclo de treino 4×1 com fichas A (peito e ombros), B (pernas e panturrilhas), C (costas e abdômen), D (braços e antebraço) e um dia de descanso;
- séries, cargas, histórico e demonstrações humanas 3D para cada exercício;
- diário de alimentação com metas de 2.300 kcal, 190 g de proteína, 205 g de carboidratos e 80 g de gorduras;
- registro de peso com gráfico de tendência;
- galeria privada de fotos do shape, com data, ângulo e comparação lado a lado;
- acompanhamento de duração e qualidade do sono;
- rotina pessoal de suplementação;
- observações de saúde para apoiar conversas com profissionais;
- dados sincronizados em armazenamento privado da Hostinger e layout responsivo para celular e computador.

O navegador mantém um cache local para o uso cotidiano, mas o estado principal é sincronizado pelo `api.php`. Cada gravação informa a revisão em que se baseou; se outro aparelho salvou antes, o `sync.js` mescla as duas versões registro a registro em vez de sobrescrever. As fotos do shape ficam fora de `public_html`, são entregues somente após a autenticação da Hostinger e nunca entram no GitHub. Fotos de refeições não são armazenadas: entram apenas descrição e estimativas nutricionais. O módulo de saúde organiza anotações pessoais e não substitui avaliação profissional.

## Executar localmente

O front-end não exige compilação. Para uma prévia visual sem sincronização, sirva esta pasta com qualquer servidor HTTP estático, por exemplo:

```bash
npx serve .
```

Abrir `index.html` diretamente também funciona na maioria dos navegadores, mas o servidor local representa melhor a hospedagem final.

## Publicação na Hostinger

O workflow `.github/workflows/deploy.yml` publica automaticamente cada atualização da branch `main` em uma conta FTP da Hostinger restrita à pasta `public_html/projetozerao`.

Os dados de acesso ficam protegidos nos secrets `FTP_SERVER`, `FTP_USERNAME` e `FTP_PASSWORD` do GitHub Actions e não fazem parte do repositório.

O projeto usa caminhos relativos, portanto pode ser servido em `https://zeppen.com.br/projetozerao/` sem alterar os arquivos da raiz do domínio.

Depois da primeira publicação, ative **Password Protect Directories** para `public_html/projetozerao`. Essa proteção é o login do portal e também bloqueia o acesso direto à API. O PHP cria automaticamente `zerao_private` acima de `public_html`; ali ficam `state.json`, o índice da galeria e os arquivos de imagem com permissões privadas.

Não adicione senhas, arquivos `.htpasswd`, fotos ou o diretório privado ao repositório. A configuração da senha é feita apenas no painel da Hostinger.

## Dependência externa

O modelo 3D usa Three.js via jsDelivr. É necessária conexão com a internet para carregar a biblioteca 3D e as fontes/imagens de apresentação.
