// Biblioteca de exercícios do Zerão: grupo muscular, animação 3D mais próxima, repetições sugeridas e dica de execução.
// Os ids nunca mudam: o histórico de cargas é guardado por id. Exercícios criados no portal ficam nos dados sincronizados.
const EXERCISE_GROUPS = ["Peito", "Ombros", "Costas", "Trapézio", "Bíceps", "Tríceps", "Antebraço", "Quadríceps", "Posteriores", "Glúteos", "Adutores", "Panturrilhas", "Abdômen"];

// Animação usada por exercícios criados no portal, conforme o grupo escolhido.
const GROUP_ANIMATIONS = {
  "Peito": "chestPress",
  "Ombros": "lateralRaise",
  "Costas": "row",
  "Trapézio": "shrug",
  "Bíceps": "curl",
  "Tríceps": "tricepsPushdown",
  "Antebraço": "reverseCurl",
  "Quadríceps": "squat",
  "Posteriores": "hinge",
  "Glúteos": "hipThrust",
  "Adutores": "adduction",
  "Panturrilhas": "calfRaise",
  "Abdômen": "crunch",
};

const EXERCISE_LIBRARY = {
  // Peito
  "a-supino-inclinado": { name: "Supino inclinado com halteres", group: "Peito", animation: "chestPress", reps: "8–12 repetições", cue: "Mantenha os pés firmes, escápulas apoiadas e os punhos alinhados. Desça os halteres com controle e empurre sem bater os pesos no alto." },
  "a-supino-reto-maquina": { name: "Supino reto na máquina", group: "Peito", animation: "chestPress", reps: "8–12 repetições", cue: "Ajuste o banco para as alças ficarem na linha do peito. Empurre mantendo ombros baixos e retorne devagar sem perder o apoio das costas." },
  "a-peck-deck": { name: "Crucifixo na máquina (Peck Deck)", group: "Peito", animation: "chestFly", reps: "10–12 repetições", cue: "Apoie bem as costas e mantenha leve flexão nos cotovelos. Feche os braços contraindo o peitoral e abra apenas até uma amplitude confortável." },
  "x-supino-reto-barra": { name: "Supino reto com barra", group: "Peito", animation: "chestPress", reps: "8–10 repetições", cue: "Escápulas encaixadas no banco e pés firmes. Desça a barra até a linha do peito com controle e empurre sem tirar o quadril do banco." },
  "x-supino-inclinado-maquina": { name: "Supino inclinado na máquina", group: "Peito", animation: "chestPress", reps: "8–12 repetições", cue: "Ajuste o banco para as pegadas ficarem na altura do peito superior. Empurre sem encolher os ombros e volte devagar." },
  "x-supino-declinado": { name: "Supino declinado com barra", group: "Peito", animation: "chestPress", reps: "8–12 repetições", cue: "Prenda bem as pernas no apoio. Desça a barra até a parte baixa do peito e empurre mantendo os punhos alinhados." },
  "x-crucifixo-halteres": { name: "Crucifixo com halteres", group: "Peito", animation: "chestFly", reps: "10–12 repetições", cue: "Cotovelos levemente flexionados e fixos. Abra até sentir alongar o peito sem forçar o ombro e feche contraindo." },
  "x-crossover": { name: "Crossover na polia", group: "Peito", animation: "chestFly", reps: "12–15 repetições", cue: "Um pé à frente e tronco levemente inclinado. Traga as mãos para a frente do corpo em arco, sem dobrar mais os cotovelos." },
  "x-flexao": { name: "Flexão de braço", group: "Peito", animation: "chestPress", reps: "até perto da falha", cue: "Corpo alinhado da cabeça aos pés e abdômen firme. Desça o peito perto do chão com cotovelos a uns 45° do tronco." },
  // Ombros
  "a-elevacao-lateral": { name: "Elevação lateral com halteres", group: "Ombros", animation: "lateralRaise", reps: "10–12 repetições", cue: "Eleve os braços para os lados com cotovelos levemente flexionados, sem encolher os ombros ou usar impulso. Desça controlando." },
  "a-crucifixo-inverso": { name: "Crucifixo inverso na máquina", group: "Ombros", animation: "reverseFly", reps: "12–15 repetições", cue: "Mantenha o peito apoiado e abra os braços levando os cotovelos para trás. Evite arquear a lombar ou acelerar a volta." },
  "x-desenvolvimento-halteres": { name: "Desenvolvimento com halteres", group: "Ombros", animation: "lateralRaise", reps: "8–12 repetições", cue: "Sentado com as costas apoiadas, empurre os halteres para cima sem travar os cotovelos e sem arquear a lombar." },
  "x-desenvolvimento-maquina": { name: "Desenvolvimento na máquina", group: "Ombros", animation: "lateralRaise", reps: "10–12 repetições", cue: "Ajuste o banco para as pegadas ficarem na altura dos ombros. Empurre para cima com controle e desça até a linha do queixo." },
  "x-elevacao-lateral-polia": { name: "Elevação lateral na polia", group: "Ombros", animation: "lateralRaise", reps: "12–15 repetições", cue: "Cabo passando na frente ou atrás do corpo. Eleve o braço para o lado até a linha do ombro, sem girar o tronco." },
  "x-elevacao-frontal": { name: "Elevação frontal com halteres", group: "Ombros", animation: "lateralRaise", reps: "10–12 repetições", cue: "Eleve os braços à frente até a altura dos ombros, cotovelos levemente flexionados, sem balançar o tronco." },
  "x-face-pull": { name: "Face pull na polia com corda", group: "Ombros", animation: "reverseFly", reps: "12–15 repetições", cue: "Polia na altura do rosto. Puxe a corda em direção aos olhos abrindo os cotovelos e girando os ombros para fora." },
  "x-crucifixo-inverso-halteres": { name: "Crucifixo inverso com halteres", group: "Ombros", animation: "reverseFly", reps: "12–15 repetições", cue: "Tronco inclinado à frente e coluna neutra. Abra os braços para os lados levando os cotovelos para trás, sem impulso." },
  // Costas
  "c-puxada-aberta": { name: "Puxada alta aberta", group: "Costas", animation: "latPulldown", reps: "10–12 repetições", cue: "Segure a barra com pegada aberta, mantenha o peito elevado e puxe em direção à parte superior do peito levando os cotovelos para baixo." },
  "c-puxada-fechada": { name: "Puxada alta fechada", group: "Costas", animation: "latPulldown", reps: "10–12 repetições", cue: "Use a pegada neutra, mantenha o tronco estável e puxe o triângulo em direção ao peito sem balançar o corpo." },
  "c-remada-baixa": { name: "Remada baixa no cabo", group: "Costas", animation: "row", reps: "10–12 repetições", cue: "Mantenha a coluna neutra e puxe levando os cotovelos para trás. Evite transformar o movimento em um balanço do tronco." },
  "c-remada-articulada": { name: "Remada articulada com apoio", group: "Costas", animation: "row", reps: "10–12 repetições", cue: "Apoie o peito, mantenha os ombros longe das orelhas e conduza os cotovelos para trás, apertando as costas no final." },
  "x-barra-fixa": { name: "Barra fixa", group: "Costas", animation: "latPulldown", reps: "até perto da falha", cue: "Pegada um pouco mais aberta que os ombros. Puxe o peito em direção à barra levando os cotovelos para baixo e desça controlando." },
  "x-pulldown-corda": { name: "Pulldown na polia com corda", group: "Costas", animation: "latPulldown", reps: "12–15 repetições", cue: "Braços quase estendidos e tronco levemente inclinado. Leve a corda até as coxas usando as costas, sem dobrar os cotovelos." },
  "x-remada-curvada": { name: "Remada curvada com barra", group: "Costas", animation: "row", reps: "8–10 repetições", cue: "Quadril para trás, coluna neutra e joelhos levemente flexionados. Puxe a barra em direção ao umbigo apertando as escápulas." },
  "x-remada-unilateral": { name: "Remada unilateral com halter", group: "Costas", animation: "row", reps: "10–12 repetições", cue: "Apoie joelho e mão no banco. Puxe o halter em direção ao quadril, mantendo o tronco parado e o ombro longe da orelha." },
  "x-remada-maquina": { name: "Remada na máquina com pegada neutra", group: "Costas", animation: "row", reps: "10–12 repetições", cue: "Peito apoiado e ombros baixos. Leve os cotovelos para trás junto ao corpo e segure um instante no final." },
  "x-pullover-polia": { name: "Pullover na polia", group: "Costas", animation: "latPulldown", reps: "12–15 repetições", cue: "Em pé, quadril levemente para trás. Leve a barra da altura da cabeça até as coxas em arco, cotovelos quase estendidos." },
  // Trapézio
  "c-encolhimento": { name: "Encolhimento com halteres", group: "Trapézio", animation: "shrug", reps: "12–15 repetições", cue: "Eleve os ombros em direção às orelhas, segure um instante e desça lentamente. Não gire os ombros durante o movimento." },
  "x-encolhimento-barra": { name: "Encolhimento com barra", group: "Trapézio", animation: "shrug", reps: "12–15 repetições", cue: "Barra à frente do corpo e braços estendidos. Suba os ombros em direção às orelhas, segure e desça devagar." },
  "x-encolhimento-maquina": { name: "Encolhimento na máquina", group: "Trapézio", animation: "shrug", reps: "12–15 repetições", cue: "Ajuste a altura para começar com os ombros relaxados. Eleve os ombros sem rodar e sem dobrar os cotovelos." },
  // Bíceps
  "d-rosca-direta": { name: "Rosca direta com barra W", group: "Bíceps", animation: "curl", reps: "8–12 repetições", cue: "Mantenha os cotovelos próximos ao corpo e suba a barra sem balançar o tronco. Desça controlando toda a amplitude." },
  "d-rosca-alternada": { name: "Rosca alternada com halteres", group: "Bíceps", animation: "curl", reps: "10–12 repetições", cue: "Flexione um braço por vez mantendo o ombro estável. Gire a palma para cima durante a subida e evite usar impulso." },
  "d-rosca-martelo": { name: "Rosca martelo com halteres", group: "Bíceps", animation: "hammerCurl", reps: "10–12 repetições", cue: "Mantenha as palmas voltadas uma para a outra e os cotovelos fixos. Suba e desça os halteres de forma controlada." },
  "x-rosca-polia-barra": { name: "Rosca na polia com barra", group: "Bíceps", animation: "curl", reps: "10–12 repetições", cue: "Fique perto da polia, cotovelos colados ao corpo. Suba a barra até perto dos ombros e desça controlando, mantendo a tensão do cabo." },
  "x-rosca-direta-reta": { name: "Rosca direta com barra reta", group: "Bíceps", animation: "curl", reps: "8–12 repetições", cue: "Pegada na largura dos ombros e cotovelos fixos. Suba sem jogar o tronco para trás e desça até quase estender os braços." },
  "x-rosca-scott": { name: "Rosca Scott", group: "Bíceps", animation: "curl", reps: "10–12 repetições", cue: "Axilas encaixadas no banco. Desça até quase estender o braço, sem soltar o peso no final, e suba contraindo o bíceps." },
  "x-rosca-concentrada": { name: "Rosca concentrada com halter", group: "Bíceps", animation: "curl", reps: "10–12 repetições", cue: "Sentado, cotovelo apoiado na parte interna da coxa. Suba o halter girando a palma para cima e desça devagar." },
  "x-rosca-inclinada": { name: "Rosca inclinada com halteres", group: "Bíceps", animation: "curl", reps: "10–12 repetições", cue: "Banco inclinado e braços pendurados atrás da linha do tronco. Suba sem levar os cotovelos para a frente." },
  "x-rosca-martelo-corda": { name: "Rosca martelo na polia com corda", group: "Bíceps", animation: "hammerCurl", reps: "10–12 repetições", cue: "Palmas voltadas uma para a outra e cotovelos fixos. Suba a corda até perto dos ombros e desça com controle." },
  // Tríceps
  "d-triceps-corda": { name: "Tríceps na polia com corda", group: "Tríceps", animation: "tricepsPushdown", reps: "10–12 repetições", cue: "Fixe os cotovelos ao lado do corpo, estenda os braços e afaste levemente as pontas da corda no final sem inclinar o tronco." },
  "d-triceps-frances": { name: "Tríceps francês unilateral", group: "Tríceps", animation: "tricepsExtension", reps: "10–12 repetições", cue: "Mantenha o braço apontado para cima e flexione apenas o cotovelo, levando o peso atrás da cabeça. Estenda sem abrir o cotovelo." },
  "x-triceps-polia-barra": { name: "Tríceps na polia com barra", group: "Tríceps", animation: "tricepsPushdown", reps: "10–12 repetições", cue: "Cotovelos colados ao corpo e tronco levemente inclinado. Estenda os braços até o fim e volte sem deixar os cotovelos subirem." },
  "x-triceps-polia-unilateral": { name: "Tríceps na polia unilateral", group: "Tríceps", animation: "tricepsPushdown", reps: "12–15 repetições", cue: "Um braço por vez, cotovelo fixo ao lado do corpo. Estenda até o fim e volte devagar." },
  "x-triceps-testa": { name: "Tríceps testa com barra W", group: "Tríceps", animation: "tricepsExtension", reps: "10–12 repetições", cue: "Deitado, braços apontando para o teto. Flexione só os cotovelos levando a barra em direção à testa e estenda de volta." },
  "x-triceps-frances-halter": { name: "Tríceps francês com halter (duas mãos)", group: "Tríceps", animation: "tricepsExtension", reps: "10–12 repetições", cue: "Sentado com apoio nas costas, segure o halter atrás da cabeça. Estenda os braços para cima sem abrir os cotovelos." },
  "x-triceps-coice": { name: "Tríceps coice com halter", group: "Tríceps", animation: "tricepsExtension", reps: "12–15 repetições", cue: "Tronco inclinado e braço colado ao corpo. Estenda o cotovelo levando o halter para trás e volte sem mexer o ombro." },
  "x-triceps-testa-polia": { name: "Tríceps testa na polia", group: "Tríceps", animation: "tricepsExtension", reps: "10–12 repetições", cue: "Deitado no banco de frente para a polia baixa, braços apontando para cima e levemente inclinados para trás. Flexione só os cotovelos e estenda sem abrir os braços." },
  "x-triceps-frances-polia": { name: "Tríceps francês na polia", group: "Tríceps", animation: "tricepsExtension", reps: "10–12 repetições", cue: "De costas para a polia, corda atrás da cabeça e cotovelos apontando para a frente. Estenda os braços à frente e acima sem abrir os cotovelos; é a posição que mais alonga a cabeça longa." },
  "x-mergulho-banco": { name: "Mergulho no banco", group: "Tríceps", animation: "tricepsPushdown", reps: "10–12 repetições", cue: "Mãos na borda do banco e quadril perto dele. Desça dobrando os cotovelos para trás, sem forçar a frente do ombro." },
  // Antebraço
  "d-rosca-inversa": { name: "Rosca inversa com barra W", group: "Antebraço", animation: "reverseCurl", reps: "12–15 repetições", cue: "Segure a barra com as palmas para baixo, cotovelos junto ao corpo e punhos firmes. Suba sem balançar e desça devagar." },
  "x-rosca-punho": { name: "Rosca de punho com barra", group: "Antebraço", animation: "reverseCurl", reps: "12–15 repetições", cue: "Antebraços apoiados nas coxas, palmas para cima. Mexa só os punhos, levando a barra para cima e para baixo." },
  "x-rosca-punho-inversa": { name: "Rosca de punho inversa", group: "Antebraço", animation: "reverseCurl", reps: "12–15 repetições", cue: "Antebraços apoiados, palmas para baixo. Eleve o dorso das mãos sem levantar os antebraços." },
  "x-rosca-inversa-polia": { name: "Rosca inversa na polia", group: "Antebraço", animation: "reverseCurl", reps: "12–15 repetições", cue: "Pegada pronada na barra da polia, cotovelos fixos. Suba sem dobrar os punhos e desça controlando." },
  // Quadríceps
  "b-leg-press": { name: "Leg press 45°", group: "Quadríceps", animation: "legPress", reps: "10–12 repetições", cue: "Mantenha lombar e quadril apoiados. Desça a plataforma com controle sem deixar os joelhos fecharem e empurre sem travar totalmente as pernas." },
  "b-extensora": { name: "Cadeira extensora", group: "Quadríceps", animation: "legExtension", reps: "10–12 repetições", cue: "Ajuste o joelho ao eixo da máquina. Estenda as pernas com controle, faça uma pausa curta no alto e retorne sem soltar o peso." },
  "x-agachamento-livre": { name: "Agachamento livre", group: "Quadríceps", animation: "squat", reps: "8–10 repetições", cue: "Pés na largura dos ombros, peito aberto e abdômen firme. Desça empurrando o quadril para trás, joelhos na direção dos pés." },
  "x-agachamento-smith": { name: "Agachamento no Smith", group: "Quadríceps", animation: "squat", reps: "10–12 repetições", cue: "Pés um pouco à frente da barra. Desça controlando até onde mantiver a coluna neutra e suba empurrando o chão." },
  "x-hack": { name: "Agachamento no hack", group: "Quadríceps", animation: "squat", reps: "10–12 repetições", cue: "Costas e quadril bem apoiados. Desça com os joelhos acompanhando a ponta dos pés e suba sem travar." },
  "x-leg-press-horizontal": { name: "Leg press horizontal", group: "Quadríceps", animation: "legPress", reps: "10–12 repetições", cue: "Lombar apoiada no encosto. Dobre os joelhos com controle e empurre a plataforma sem travar as pernas." },
  "x-afundo": { name: "Afundo com halteres", group: "Quadríceps", animation: "lunge", reps: "10–12 por lado", cue: "Passo largo e tronco ereto. Desça até o joelho de trás chegar perto do chão e suba empurrando pelo calcanhar da frente." },
  "x-bulgaro": { name: "Agachamento búlgaro", group: "Quadríceps", animation: "lunge", reps: "8–10 por lado", cue: "Pé de trás apoiado no banco. Desça o quadril na vertical, joelho da frente alinhado ao pé, e suba sem impulso." },
  // Posteriores
  "b-flexora": { name: "Mesa flexora", group: "Posteriores", animation: "legCurl", reps: "10–12 repetições", cue: "Mantenha o quadril apoiado. Flexione os joelhos levando os calcanhares em direção aos glúteos e retorne devagar." },
  "x-stiff": { name: "Stiff com halteres", group: "Posteriores", animation: "hinge", reps: "10–12 repetições", cue: "Joelhos levemente flexionados e coluna neutra. Desça os halteres rente às pernas empurrando o quadril para trás e volte contraindo os glúteos." },
  "x-terra-romeno": { name: "Levantamento terra romeno", group: "Posteriores", animation: "hinge", reps: "8–10 repetições", cue: "Barra colada às pernas e costas retas. Leve o quadril para trás até sentir os posteriores alongarem e suba estendendo o quadril." },
  "x-cadeira-flexora": { name: "Cadeira flexora", group: "Posteriores", animation: "legCurl", reps: "10–12 repetições", cue: "Joelho alinhado ao eixo da máquina e coxa presa pelo apoio. Flexione as pernas até o fim e volte devagar." },
  "x-flexora-em-pe": { name: "Flexora em pé unilateral", group: "Posteriores", animation: "legCurl", reps: "10–12 por lado", cue: "Quadril encostado no apoio. Flexione o joelho levando o calcanhar em direção ao glúteo, sem girar a perna." },
  // Glúteos
  "b-abdutora": { name: "Cadeira abdutora", group: "Glúteos", animation: "abduction", reps: "12–15 repetições", cue: "Mantenha quadril e costas apoiados. Abra os joelhos com controle, sem impulso, e retorne resistindo ao peso." },
  "x-elevacao-pelvica": { name: "Elevação pélvica", group: "Glúteos", animation: "hipThrust", reps: "10–12 repetições", cue: "Parte alta das costas apoiada no banco e pés firmes. Suba o quadril até alinhar com o tronco, contraia e desça controlando." },
  "x-gluteo-polia": { name: "Glúteo na polia (coice)", group: "Glúteos", animation: "hipThrust", reps: "12–15 por lado", cue: "Tornozeleira presa ao cabo e tronco estável. Leve a perna para trás estendendo o quadril, sem arquear a lombar." },
  "x-abducao-polia": { name: "Abdução de quadril na polia", group: "Glúteos", animation: "abduction", reps: "12–15 por lado", cue: "Em pé de lado para a polia. Afaste a perna para fora com controle, sem inclinar o tronco." },
  // Adutores
  "b-adutora": { name: "Cadeira adutora", group: "Adutores", animation: "adduction", reps: "12–15 repetições", cue: "Ajuste uma amplitude confortável. Feche as pernas controlando a carga e retorne sem deixar as placas baterem." },
  // Panturrilhas
  "b-panturrilha": { name: "Panturrilha sentada", group: "Panturrilhas", animation: "calfRaise", reps: "12–15 repetições", cue: "Use toda a amplitude confortável: desça os calcanhares, eleve até contrair a panturrilha e pause brevemente no alto." },
  "x-panturrilha-pe": { name: "Panturrilha em pé", group: "Panturrilhas", animation: "calfRaise", reps: "12–15 repetições", cue: "Pontas dos pés no degrau. Desça o calcanhar alongando, suba o mais alto que conseguir e segure um instante." },
  "x-panturrilha-leg": { name: "Panturrilha no leg press", group: "Panturrilhas", animation: "calfRaise", reps: "12–15 repetições", cue: "Só as pontas dos pés na plataforma e joelhos quase estendidos. Empurre com os tornozelos usando toda a amplitude." },
  // Abdômen
  "c-abdominal-maquina": { name: "Abdominal na máquina", group: "Abdômen", animation: "crunch", reps: "12–15 repetições", cue: "Inicie o movimento pelo abdômen, aproximando costelas e quadril. Não puxe apenas com os braços e não prenda a respiração." },
  "c-bird-dog": { name: "Bird dog", group: "Abdômen", animation: "birdDog", reps: "8–10 por lado", cue: "Em quatro apoios, estenda braço e perna opostos sem girar o quadril. Pause, retorne com controle e alterne os lados." },
  "x-abdominal-supra": { name: "Abdominal supra no solo", group: "Abdômen", animation: "crunch", reps: "12–15 repetições", cue: "Joelhos flexionados e queixo afastado do peito. Tire as escápulas do chão aproximando costelas e quadril." },
  "x-abdominal-infra": { name: "Abdominal infra (elevação de pernas)", group: "Abdômen", animation: "crunch", reps: "12–15 repetições", cue: "Lombar colada no chão. Eleve as pernas e leve o quadril um pouco para cima, descendo devagar sem arquear." },
  "x-abdominal-polia": { name: "Abdominal na polia (crunch)", group: "Abdômen", animation: "crunch", reps: "12–15 repetições", cue: "Ajoelhado, corda perto da cabeça. Enrole o tronco para baixo usando o abdômen, sem puxar com os braços." },
  "x-prancha": { name: "Prancha", group: "Abdômen", animation: "birdDog", reps: "30–60 segundos", cue: "Antebraços no chão, corpo em linha reta e abdômen e glúteos contraídos. Respire normalmente sem deixar o quadril cair." },
};
