# ZERÃO — Do Zero ao Zé no Verão

Portal pessoal de evolução integral do Zé. O projeto combina treino, alimentação, peso, sono, suplementação e observações de saúde em uma única rotina diária.

## Recursos

- painel diário com placar dos pilares de evolução;
- ciclo sugerido 4×1 com fichas A (peito e ombros), B (pernas e panturrilhas), C (costas e abdômen), D (braços e antebraço) e descanso, com escolha livre do treino, cardio e registro em qualquer data;
- séries, cargas, histórico e demonstrações humanas 3D para cada exercício;
- biblioteca de exercícios (`exercises.js`) com troca só na sessão ou fixa na ficha, exercícios próprios e anotações de dicas por exercício;
- nutrição unificada: refeições e suplementos somam nas metas de 2.300 kcal, 190 g de proteína, 205 g de carboidratos e 80 g de gorduras;
- registro de peso com gráfico de tendência;
- galeria privada de fotos do shape, com data, ângulo e comparação lado a lado;
- acompanhamento de duração e qualidade do sono;
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

O acesso tem dois níveis. Qualquer pessoa com o endereço vê o portal em modo visualização; registrar treinos, editar qualquer dado e ver ou enviar fotos do shape exige login pelo botão **Entrar**. A senha fica só como hash em `zerao_private/auth.json`, acima de `public_html`; cada aparelho logado recebe um token aleatório em cookie `HttpOnly` válido por 90 dias, e cinco tentativas erradas seguidas bloqueiam novas tentativas por 15 minutos. O PHP cria `zerao_private` automaticamente; ali ficam também `state.json`, o índice da galeria e os arquivos de imagem com permissões privadas.

O primeiro usuário e senha são criados pelo próprio botão **Entrar**, e isso só é aceito enquanto a pasta ainda está sob **Password Protect Directories** da Hostinger. Depois de criar o acesso, remova essa proteção no painel. Para trocar o usuário ou a senha, apague `zerao_private/auth.json` pelo gerenciador de arquivos, reative a proteção da pasta por alguns minutos e crie o novo acesso.

Não adicione senhas, arquivos `.htpasswd`, fotos ou o diretório privado ao repositório. A configuração da senha é feita apenas no painel da Hostinger.

As páginas do portal têm endereço próprio (`/projetozerao/treino`, `/projetozerao/nutricao`…). Para que esses endereços abram direto, o `.htaccess` da pasta na Hostinger tem, depois do bloco de senha, estas regras:

```apache
RewriteEngine On
RewriteBase /projetozerao/
RewriteRule ^(visao-geral|treino|nutricao|progresso|sono|saude)/$ $1 [R=301,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(visao-geral|treino|nutricao|progresso|sono|saude)$ index.html [L]
```

O `.htaccess` não vai para o repositório porque guarda a proteção por senha. Se a proteção for recriada pelo painel, confira se as regras continuam no arquivo. Uma página nova do portal precisa entrar nas duas listas acima e em `pages.js`.

## Dependência externa

O modelo 3D usa Three.js via jsDelivr. É necessária conexão com a internet para carregar a biblioteca 3D e as fontes/imagens de apresentação.
