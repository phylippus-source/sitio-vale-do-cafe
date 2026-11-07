import * as THREE from 'three';

(function(){
'use strict';
const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = function(s, r){ return (r||document).querySelector(s); };
const clamp = function(v,a,b){ return Math.min(b, Math.max(a, v)); };

/* ================= DADOS ================= */
const SECTORS = [
  {k:'overview', n:'Corte geral', d:'Gleba de 100 × 150 m (1,5 ha) em escala real, 1 unidade = 1 metro. Sítio rústico na superfície e complexo técnico a −8 m, com o terreno respirando entre os setores.', f:[2,-4,2], ry:-0.55, rx:0.17, z:1.12},
  {k:'bunker', n:'Subsolo', d:'1.400 m² em um só nível (40 × 35 m), piso a −8,7 m, sob a Casa Grande e parte do Engenho. Concreto de 60 cm com barita e gaiola de Faraday. Abrir o corte deixa a terra transparente.', f:[8,-7,-55.5], ry:-0.3, rx:0.45, z:3.6, lift:100},
  {k:'casa', n:'Casa Grande', d:'Sobrado imperial reformado de 26 × 20 m sobre porão alto de pedra: paredes ocre com cunhais e cimalhas brancos, frontão com relógio, escadaria de mármore com espelhos de azulejo e gradil de ferro, balcão de ferro fundido, telhado de quatro águas em capa e canal. Planta pelas sedes de fazendas do Vale do Café (INEPAC): capela e escritório ladeando o hall, salas ao centro, cozinha e copa na ala de serviço, 6 suítes no sobrado.', f:[1,4,-52], ry:0.35, rx:0.22, z:4.0, lift:0},
  {k:'casa_in', n:'Casa por dentro', d:'Telhado e sobrado levantados: no térreo, hall com escada, capela, escritório, salas de visitas e jantar, cozinha de serviço com fogão de ferro e azulejos, despensa de catástrofe e banheiros coletivos. No sobrado, 6 suítes com banheiro e a sala íntima.', f:[1,3,-58], ry:-0.5, rx:0.75, z:3.6, lift:100},
  {k:'barn', n:'Engenho 1850', d:'Engenho de pedra de 22 × 10 m com paredes de 80 cm, eixo de transmissão de 18 m, serra de fita, moenda, forja e oficina. Painéis PV no telhado.', f:[32,2,-38], ry:-0.5, rx:0.26, z:3.9, lift:0},
  {k:'barn_in', n:'Engenho por dentro', d:'Telhado aberto: eixo movido pela roda d’água, serra de fita, moenda de pedra, engenho de cana, bomba de pistão, forja, torno, fresadora, solda, prensa e bancada de eletrônica.', f:[32,1,-38], ry:-0.2, rx:0.52, z:4.5, lift:100},
  {k:'yard', n:'Pátio técnico', d:'Laje de concreto de 18 × 19 m diante da oficina: minicarregadeira, miniescavadeira, carrinhos elétricos de ferramentas, van, moto, paletes, caixas de ferramentas e cones.', f:[30,1,-22], ry:-0.45, rx:0.42, z:4.5},
  {k:'solar', n:'Painéis solares', d:'48 painéis de 450 W (21,6 kWp) integrados ao telhado do engenho, que carregam as baterias térmicas durante o dia.', f:[32,7,-35], ry:-0.15, rx:0.5, z:4.8, lift:0},
  {k:'hydro', n:'Roda d’água', d:'Roda overshot em peroba aciona o eixo do engenho. A Pelton de 3,5 kW trabalha com 6,8 m de desnível e abastece o subsolo.', f:[45,2,-38], ry:-1.05, rx:0.22, z:5.4},
  {k:'lake', n:'Lago de reúso', d:'120 m² de espelho d’água: reservatório do núcleo Sisteminha. Recebe a água dos tanques de peixes e abastece a horta e a lavagem das baias.', f:[-36.5,0,48.5], ry:0.2, rx:0.32, z:5.4},
  {k:'sisteminha', n:'Núcleo Sisteminha', d:'Layout pelas regras do Sisteminha Embrapa: dois tanques redondos de 10 m³ no centro, em terreno plano e sem árvores, a poucos metros da energia e dos poços. Horta de 5 canteiros irrigada pelos tanques, galinheiro, composteira e minhocário colados ao núcleo.', f:[-20,0,42], ry:0.25, rx:0.45, z:3.4},
  {k:'road', n:'Estrada e porteira', d:'Porteira de pedra a leste, estrada de cascalho de 5 m pela via transversal e pela via principal até o pátio e a porta da garagem do engenho.', f:[-26,0,28], ry:-0.9, rx:0.4, z:2.2},
  {k:'animals', n:'Criação animal', d:'Curral de 300 m² com suínos Moura e cabras Anglo-Nubianas. As baias são lavadas por gravidade para o biodigestor. As poedeiras moram no núcleo Sisteminha.', f:[31,0,-0.5], ry:-0.4, rx:0.42, z:5.6},
  {k:'bio', n:'Biodigestor', d:'Tubular canadense de 15 m³ colado ao curral: 4,2 m³/dia de biogás (65% CH₄) e 180 L/dia de biofertilizante. O minhocário foi para o núcleo Sisteminha.', f:[30,1,13.5], ry:-0.35, rx:0.34, z:4.8},
  {k:'quadras', n:'Quadras de rotação', d:'Rotação quadrienal em quatro quadras: Q1 fixadores, Q2 tubérculos, Q3 exigentes (milho e abóbora), Q4 recuperação.', f:[-14,0,-16], ry:-0.25, rx:0.5, z:2.2},
  {k:'garden', n:'Estufa & farmácia', d:'Estufa arqueada de 12 × 10 m, cumeeira leste-oeste e face voltada ao norte, com sala estéril de cogumelos. Farmácia viva com ora-pro-nóbis, boldo, guaco e erva-baleeira.', f:[27.5,1,35.6], ry:-0.3, rx:0.38, z:6.0},
  {k:'windmill', n:'Moinho de vento', d:'Torre de 14 m com rotor de pás finas e tomada de ar do bunker no topo. Gera de 1,2 a 2,2 kW.', f:[6,7,36], ry:0.0, rx:0.16, z:4.8},
  {k:'bamboo', n:'Bambuzal', d:'728 m² de Guadua e Dendrocalamus. Rendem 120 colmos por ano para andaimes, canaletas e carvão ativado dos filtros.', f:[-30,5,-58], ry:0.2, rx:0.28, z:3.3},
  {k:'forest', n:'Silvicultura', d:'Mata densa de eucalipto em talhadia de 4 anos, cedrinho, gliricídia e pinus. Rende 18 t de madeira seca por ano.', f:[30,6,-60], ry:-0.3, rx:0.28, z:3.1},
  {k:'apiary', n:'Apiário', d:'Seis colmeias Langstroth na borda da mata, com 70 kg de mel por ano e cera. Também reforçam a defesa passiva.', f:[17.5,1,-56], ry:-0.35, rx:0.42, z:8.0},
  {k:'gravity', n:'Bateria gravitacional', d:'Bloco de concreto de 12 t sobe por trilho de 35 m com guincho nos picos de vento e sol. Desce à noite acionando um dínamo de 1,5 kW.', f:[36.5,6,54], ry:-1.2, rx:0.18, z:3.9},
  {k:'clay', n:'Jazida de argila', d:'570 m² de argila refratária na várzea. Fornece tijolos queimados no forno solar e vedação de tanques.', f:[-33,0,66], ry:0.25, rx:0.36, z:4.0},
  {k:'datacenter', n:'Datacenter Aura', d:'Seis tanques com 3.000 L de óleo dielétrico, 4,2 PB offline e 32 aceleradores. Consome 2,45 kW e aquece o piso do quarto.', f:[13.1,-8,-64], ry:-0.2, rx:0.52, z:6.2, lift:100},
  {k:'labs', n:'Laboratórios', d:'70 m² ISO 7: cabine classe II B2, qPCR de 96 poços, UHPLC-MS/MS, rotavapor e biorreatores de 10 L.', f:[18,-8,-64], ry:-0.2, rx:0.52, z:6.2, lift:100},
  {k:'clean', n:'Sala limpa', d:'50 m² ISO 5. Litografia UV sem máscara de 365 nm (350 nm de resolução), forno de 1.200 °C e câmara RIE.', f:[21.5,-8,-64], ry:-0.3, rx:0.52, z:6.2, lift:100},
  {k:'refuge', n:'Habitação do bunker', d:'Suíte cyberpunk do Mestre (116 m², cama-casulo com mosquiteiro, estação dev, mesa holográfica), suíte dos pais (75 m²), quartos da irmã, da sobrinha e do convidado com banheiro, e estar, jantar e cozinha de 199 m². Luz circadiana e pressão positiva.', f:[-3,-6,-56], ry:-0.2, rx:0.7, z:4.6, lift:100},
  {k:'battery', n:'Baterias térmicas', d:'4 cilindros de 1,40 × 3,20 m a 550 °C com 18 t de areia e sais. Armazenam 320 kWh e dão 14 dias de autonomia.', f:[25.2,-8,-64], ry:-0.25, rx:0.5, z:5.6, lift:100}
];
const SECTOR = {}; SECTORS.forEach(function(s){ SECTOR[s.k] = s; });

const LABELS = [
  {t:'Córrego & roda d’água', s:'Overshot e Pelton', L:'s', p:[45.5,8,-41.2], k:'hydro', m:1},
  {t:'Lago de reúso', s:'120 m² · reservatório', L:'s', p:[-36.5,4,48.5], k:'lake', m:0},
  {t:'Núcleo Sisteminha', s:'2 tanques de 10 m³ · horta', L:'s', p:[-14,4.5,39], k:'sisteminha', m:1},
  {t:'Galinheiro', s:'35 poedeiras', L:'s', p:[-37,3.5,36], k:'sisteminha', m:0},
  {t:'Porteira e estrada', s:'Cascalho até a garagem', L:'s', p:[-49.1,5,28], k:'road', m:1},
  {t:'Criação de animais', s:'Curral de 300 m²', L:'s', p:[31,5,-0.5], k:'animals', m:1},
  {t:'Estufa & farmácia viva', s:'12 × 10 m · cogumelos', L:'s', p:[27.5,6.5,35.6], k:'garden', m:0},
  {t:'Quadras de rotação', s:'Ciclo quadrienal Q1 a Q4', L:'s', p:[-14,5,-16], k:'quadras', m:1},
  {t:'Moinho de vento', s:'Torre de 14 m', L:'s', p:[6,19,36], k:'windmill', m:1},
  {t:'Poços artesianos', s:'5 poços de 65 a 110 m', L:'s', p:[16,4,33.5], k:'overview', m:0},
  {t:'Engenho histórico 1850', s:'22 × 10 m · oficina', L:'b', p:[0,9.5,0], k:'barn', m:1},
  {t:'Painéis solares', s:'21,6 kWp', L:'b', p:[0,6,4.2], k:'solar', m:0},
  {t:'Acesso oculto', s:'Elevador de 4,5 t', L:'s', p:[31,2,-33], k:'barn', m:0},
  {t:'Pátio técnico', s:'Minicarregadeira e miniescavadeira', L:'s', p:[31,4,-25], k:'yard', m:1},
  {t:'Cinturão vivo', s:'Ora-pro-nóbis e sebe', L:'s', p:[-48.4,4,-30], k:'overview', m:0},
  {t:'Casa Grande', s:'Sobrado imperial · 2 pavimentos', L:'c', p:[0,10,0], k:'casa', m:1},
  {t:'Bosque de bambu', s:'728 m²', L:'s', p:[-30,15,-58], k:'bamboo', m:0},
  {t:'Silvicultura', s:'Eucalipto e cedrinho', L:'s', p:[30,17,-60], k:'forest', m:0},
  {t:'Apiário', s:'6 colmeias', L:'s', p:[17.5,3,-56], k:'apiary', m:0},
  {t:'Biodigestor', s:'15 m³ · biogás', L:'s', p:[30,4.5,13.5], k:'bio', m:1},
  {t:'Minhocário', s:'8 canteiros', L:'s', p:[2,3,47], k:'sisteminha', m:0},
  {t:'Bateria gravitacional', s:'Bloco de 12 t', L:'s', p:[36.5,17.5,38], k:'gravity', m:0},
  {t:'Jazida de argila', s:'570 m² refratária', L:'s', p:[-33,3,66], k:'clay', m:0},
  {t:'Cozinha de serviço', s:'Fogão de ferro · azulejos', L:'i', p:[-10,3.4,-5.5], k:'casa_in', m:0, i:1},
  {t:'Despensa de catástrofe', s:'42 m² · estoque longo', L:'i', p:[10,3.4,-6.5], k:'casa_in', m:0, i:1},
  {t:'Banheiros', s:'2 coletivos + 6 de suíte', L:'i', p:[10,3.2,-0.5], k:'casa_in', m:0, i:1},
  {t:'Eixo de transmissão', s:'Aço 60 mm · 18 m', L:'e', p:[0,2.6,-3.2], k:'barn_in', m:0, i:1, z:4.5},
  {t:'Serra de fita', s:'Volantes de 700 mm', L:'e', p:[-8.6,3.8,-1.6], k:'barn_in', m:0, i:1, z:4.5},
  {t:'Moenda de pedra', s:'Granito de 80 cm', L:'e', p:[-4.2,2.8,-1.9], k:'barn_in', m:0, i:1, z:4.5},
  {t:'Engenho de cana', s:'3 rolos · 300 L/h', L:'e', p:[-1.4,2.9,-2.4], k:'barn_in', m:0, i:1, z:4.5},
  {t:'Bomba de pistão', s:'Duplo · 4.000 L/dia', L:'e', p:[-8.9,3.0,2.6], k:'barn_in', m:0, i:1, z:4.5},
  {t:'Forja', s:'Bigorna de 180 kg e fole', L:'e', p:[-5.4,3.6,2.9], k:'barn_in', m:0, i:1, z:4.5},
  {t:'Elevador oculto', s:'3 × 5 m · 4,5 t', L:'e', p:[-1,1.2,2.2], k:'barn_in', m:0, i:1, z:4.5},
  {t:'Torno', s:'Nardini Mascote 1 m', L:'e', p:[4,2.6,-3.2], k:'barn_in', m:0, i:1, z:4.5},
  {t:'Fresadora', s:'Com inversor', L:'e', p:[5.6,2.6,-3.2], k:'barn_in', m:0, i:1, z:5.5},
  {t:'Solda TIG/MIG', s:'Mesa e cilindros', L:'e', p:[7.2,3.6,-3.2], k:'barn_in', m:0, i:1, z:4.5},
  {t:'Prensa de 30 t', s:'Pórtico vermelho', L:'e', p:[5.2,3.2,1.4], k:'barn_in', m:0, i:1, z:4.5},
  {t:'Bancada de eletrônica', s:'ESP32 e STM32', L:'e', p:[7.2,2.0,3.7], k:'barn_in', m:0, i:1, z:4.5},
  {t:'Sala de visitas', s:'Piano e sofás', L:'i', p:[0,3.4,-1], k:'casa_in', m:0, i:1, z:4.5},
  {t:'Sala de jantar', s:'Mesa para 14', L:'i', p:[0,3.4,-7], k:'casa_in', m:0, i:1, z:4.5},
  {t:'Capela', s:'Altar entalhado', L:'i', p:[-10,3.4,6], k:'casa_in', m:0, i:1, z:4.5},
  {t:'Escritório', s:'Mapas e estante', L:'i', p:[10,3.4,6], k:'casa_in', m:0, i:1, z:4.5},
  {t:'Hall e escadaria', s:'Mármore e xadrez', L:'i', p:[-4,3.4,7], k:'casa_in', m:0, i:1, z:4.5},
  {t:'Suítes do sobrado (6)', s:'Com banheiro privativo', L:'U', p:[0,2.4,6.5], k:'casa_in', m:0, i:1, z:4.5},
  {t:'Sala íntima', s:'Estar do sobrado', L:'U', p:[0,2.4,-6], k:'casa_in', m:0, i:1, z:4.5},
  {t:'Horta', s:'5 canteiros · gotejo', L:'s', p:[-16,2.4,50], k:'sisteminha', m:0, z:2.2},
  {t:'Composteira', s:'3 baias de paletes', L:'s', p:[0,2.4,36], k:'sisteminha', m:0, z:2.6},
  {t:'Tanques de peixes', s:'2 × 10 m³', L:'s', p:[-14,3,38.5], k:'sisteminha', m:0, z:2.4},
  {t:'Datacenter imerso', s:'Servidores Aura · 4,2 PB', L:'u', p:[13.1,-6.2,-64], k:'datacenter', m:1},
  {t:'Laboratórios', s:'Genética e bioquímica', L:'u', p:[18.05,-6.2,-64], k:'labs', m:1},
  {t:'Sala limpa', s:'Litografia de chips', L:'u', p:[21.5,-6.2,-64], k:'clean', m:1},
  {t:'Suporte de vida e baterias', s:'Água · ar · 320 kWh térmicos', L:'u', p:[25.2,-6.2,-65], k:'battery', m:1},
  {t:'Suíte cyberpunk do Mestre', s:'116 m² · cama-casulo com mosquiteiro', L:'u', p:[-7.9,-6.2,-64], k:'refuge', m:1},
  {t:'Suíte dos pais', s:'75 m² · banheiro privativo', L:'u', p:[-2.2,-6.2,-64], k:'refuge', m:0, z:5},
  {t:'Irmã · Sobrinha · Convidado', s:'3 quartos com banheiro', L:'u', p:[5.5,-6.2,-64], k:'refuge', m:0, z:5},
  {t:'Estar, jantar e cozinha', s:'199 m²', L:'u', p:[-4.6,-6.2,-46], k:'refuge', m:1},
  {t:'Despensa 90 dias', s:'Estoque para 7 pessoas', L:'u', p:[4,-6.2,-46], k:'bunker', m:0, z:5},
  {t:'Cinema e jogos', s:'Tela de 5 m · sinuca · fliperamas', L:'u', p:[9.1,-6.2,-46], k:'bunker', m:0, z:5},
  {t:'Hidroponia', s:'12 prateleiras · LED roxo', L:'u', p:[16.4,-6.2,-46], k:'bunker', m:1},
  {t:'Oficina maker', s:'CNC · impressoras 3D · torno', L:'u', p:[23.9,-6.2,-46], k:'bunker', m:0, z:5},
  {t:'Corredor técnico', s:'Dutos, água e ar · saída de emergência', L:'u', p:[8,-6.2,-54.5], k:'bunker', m:0, z:5},
  {t:'Forno e tijolos', s:'Argila queimada', L:'s', p:[-42,6,59], k:'clay', m:0, z:2.6},
];

const BOM = [
  {t:'01 · Gleba e implantação', tag:'1,5 ha', items:[
    ['Gleba','100 × 150 m (15.000 m²) na microbacia do Vale do Café, entre Vassouras, Paty do Alferes e Rio das Flores (RJ).'],
    ['Terreno','520 a 555 m de altitude, declividade de 8% a 15%, gnaisse e granito estáveis com latossolo de alta drenagem.'],
    ['Logística','92 km da Região Metropolitana pelo Arco Metropolitano (BR-493) e estradas rurais secundárias.']]},
  {t:'02 · Engenho histórico de 1850', tag:'220 m²', items:[
    ['Construção','22 × 10 m, pé-direito de 4,80 m. Paredes de pedra com 80 cm, cal, saibro e óleo de baleia.'],
    ['Cobertura','Tesouras de aroeira e braúna tratadas com bórax, telha colonial sobre ripas de cedro.'],
    ['Eixo de transmissão','Aço forjado de 60 mm e 18 m, com mancais de bronze grafitado.'],
    ['Roda d’água overshot','3,80 m de diâmetro por 1,20 m, em peroba. 18 HP a 12 RPM com desnível de 4,20 m.'],
    ['Engrenagem mestra','Ferro fundido de 2,40 m que leva o eixo a 120 RPM.'],
    ['Máquinas acopladas','Serra de fita (volantes de 700 mm), moenda de granito de 80 cm, engenho de cana de 3 rolos (300 L/h) e bomba de pistão duplo (4.000 L/dia até a cota +555 m).'],
    ['Forja','Bigorna de 180 kg, fole duplo acoplável ao eixo e morsa de ferreiro.']]},
  {t:'03 · Garagem, oficina e elevador oculto', tag:'80 m²', items:[
    ['Veículos','Van Asia Towner e moto de 175 cc.'],
    ['Pátio técnico','Laje de concreto de 18 × 19 m com minicarregadeira, miniescavadeira, carrinhos elétricos de ferramentas, paletes e caixas de ferramentas.'],
    ['Equipamentos','Torno Nardini Mascote de 1 m, fresadora com inversor, solda TIG/MIG, prensa de 30 t e bancada para ESP32 e STM32.'],
    ['Elevador','Plataforma de 3 × 5 m para 4,5 t, com cilindro hidráulico de duplo estágio. Desce até a antecâmara a −8 m.'],
    ['Painéis solares','48 painéis de 450 W (21,6 kWp) no telhado do engenho, com película antirreflexo.']]},
  {t:'04 · Casa Grande de superfície', tag:'520 m² + sobrado', items:[
    ['Arquitetura','Sobrado imperial do século XIX reformado em 2026: porão alto de pedra, esteios de madeira com vedação de pau-a-pique, paredes ocre e brancas, madeira escura, ferro fundido com rebites grossos, azulejo português e mármore branco. Toques da UFRRJ: ocre e branco, frontão central, arcada.'],
    ['Quartos e banhos','Sobrado com 6 suítes e banheiro privativo, sala íntima, mais 2 banheiros coletivos no térreo.'],
    ['Cozinha de serviço','54 m² com fogão a lenha de ferro, bancada com pia, mesa e azulejos portugueses; copa com passa-pratos.'],
    ['Despensa de catástrofe','42 m² com prateleiras em três paredes, barris, galões de água, freezer e sacarias.'],
    ['Porão e acesso','Porão alto de pedra com respiros gradeados. O elevador fica sob o assoalho da casa, destravado por contrapeso disfarçado.']]},
  {t:'05 · Zootecnia de ciclo fechado', tag:'4 adultos', items:[
    ['Galinhas poedeiras','35 Rhode Island Red em galinheiro de 114 m² no núcleo Sisteminha. De 750 a 850 ovos por mês e 12 kg de carne de descarte.'],
    ['Frangos de corte','Lote rotativo de 20 aves caipira pesado, 25 kg de carne por mês.'],
    ['Suínos Moura','1 macho e 2 matrizes em 90 m² de piso ripado. Um abate de 80 kg a cada 4 meses.'],
    ['Cabras Anglo-Nubiana','4 em lactação, 1 bode e 4 crias em 300 m². De 180 a 240 L de leite por mês.'],
    ['Piscicultura','Dois tanques redondos de 10 m³ (Sisteminha) mais o lago de reúso de 120 m². 30 kg de peixe por mês.'],
    ['Minhocário','8 canteiros de alvenaria no núcleo Sisteminha, ao lado da composteira. 600 kg de húmus por mês.'],
    ['Tenébrio e mosca-soldado','40 bandejas em 6 m². 8 kg de proteína por mês para aves e peixes.'],
    ['Apicultura','6 colmeias Langstroth na borda oeste da mata, com as portinhas voltadas ao norte (sol da manhã). 70 kg de mel por ano e cera.']]},
  {t:'06 · Biodigestor integrado', tag:'15 m³', items:[
    ['Piso das baias','Inclinação de 3%, lavado por gravidade com água de reúso. A calha leva o efluente direto ao biodigestor, colado ao curral.'],
    ['Biodigestor','Tubular canadense em lona de PVC vulcanizado. 4,2 m³/dia de biogás (65% CH₄).'],
    ['Depurador','Limalha de ferro retira H₂S e sílica gel seca o gás. Alimenta o fogão e o gerador de emergência.'],
    ['Biofertilizante','180 L/dia de efluente inodoro bombeado às valas das quadras.']]},
  {t:'07 · Agroecologia e pomar', tag:'3.900 m²', items:[
    ['Quadras de rotação','Quatro quadras de 20 × 25 m (500 m² cada, 2.000 m² no total) em ciclo quadrienal. Q1 fixadores, Q2 tubérculos, Q3 exigentes, Q4 recuperação.'],
    ['Horta intensiva','5 canteiros de 24 × 1,3 m (156 m² úteis, 228 m² com passagens) no núcleo Sisteminha, irrigados por gotejo com a água dos tanques.'],
    ['Farmácia viva','Ora-pro-nóbis em 120 m de cerca viva, boldo, guaco, erva-baleeira, açafrão e gengibre.'],
    ['Pomar consorciado','Bosque de 240 m² (20 × 12 m) ao norte do núcleo Sisteminha e frutíferas dispersas, com laranja, limão, ponkan, abacate, acerola, banana, jabuticaba e amora.'],
    ['Estufa arqueada','12 × 10 m (120 m²) em policarbonato anti-UV, com sala estéril de 16 m² para shimeji, shiitake e pleurotus.']]},
  {t:'08 · Extração e silvicultura', tag:'3.200 m²', items:[
    ['Bambuzal','728 m² (28 × 26 m) de Guadua angustifolia e Dendrocalamus asper. 120 colmos por ano.'],
    ['Silvicultura energética','1.570 m²: bloco oeste de 728 m² (26 × 28 m) e faixa leste de 840 m². Eucalipto (ciclo de 4 anos), acácia, gliricídia, cedrinho e pinus. 18 t de madeira seca por ano.'],
    ['Argila e areia','570 m² (30 × 19 m) de jazida refratária, seixos e areia de quartzo para filtros e silos térmicos.']]},
  {t:'09 · Geração de energia', tag:'Barramento 48 V DC', items:[
    ['Micro-hidrelétrica Pelton','Desnível de 6,80 m, tubo de 250 mm, rotor de 320 mm. 3,5 kW contínuos (84 kWh/dia).'],
    ['Gerador eólico','Torre de treliça de 14 m, rotor de 4,20 m com 8 pás. De 1,2 a 2,2 kW.'],
    ['Usina fotovoltaica','48 painéis, 21,6 kWp, voltados à carga das baterias térmicas.'],
    ['Gasogênio e motor','Reator down-draft e motor OM-314 com alternador de 25 kVA. Consome 1,1 kg de madeira por kWh.']]},
  {t:'10 · Armazenamento de energia', tag:'Sem lítio', items:[
    ['Baterias térmicas','4 cilindros de 1,40 × 3,20 m em aço de 12 mm, 18 t de areia e sais de nitrato. 320 kWh a 550 °C.'],
    ['Recuperação','Vapor a 35 bar em microturbina de 5 kW. 14 dias de autonomia.'],
    ['Chumbo-ácido','48 vasos abertos, 48 V × 2.400 Ah (115 kWh).'],
    ['Gravitacional','Bloco de 12 t em trilho de 35 m com guincho e dínamo de 1,5 kW.']]},
  {t:'11 · Hidrologia', tag:'3.200 L/dia', items:[
    ['Poços artesianos','Cinco poços de 65, 78, 82, 90 e 110 m, com bombas helicoidais solares de 48 V DC.'],
    ['Cisterna central','80.000 L em rocha, alimentada por córrego, chuva (150 m³) e poços.'],
    ['Linha pura','Carvão de bambu, osmose reversa de 400 GPD e UV-C. Condutividade abaixo de 0,1 µS/cm.']]},
  {t:'12 · Telecomunicações', tag:'OpSec grau 5', items:[
    ['Links','Três links de 300 Mbps em Vassouras, Paty e Mendes, mais um terminal Starlink no reservatório falso do moinho.'],
    ['Malha de longo alcance','Antenas HF/VHF e LoRaWAN nas copas dos eucaliptos, com criptografia AES-256.'],
    ['Mascaramento de tráfego','Script de borda simula o uso de uma família comum (Ghost Masking).']]},
  {t:'13 · Estrutura do bunker', tag:'1 nível · 1.400 m²', items:[
    ['Nível único','40 × 35 m (1.400 m²), piso a −8,7 m, pé-direito de 3,6 m, laje de 80 cm e 4,3 m de terra por cima. Fica sob a Casa Grande e parte do Engenho; saída de emergência por escada de ferro até uma escotilha.'],
    ['Escavação','Em gnaisse com fio diamantado e expansores químicos, sem explosivos.'],
    ['Lajes e paredes','Concreto de 60 cm com barita e cristalizante, mais gaiola de Faraday em cobre de 2 mm.'],
    ['Portas','Duas portas estanques de aço balístico de 350 kg com volante manual.']]},
  {t:'14 · Técnico · Datacenter Aura', tag:'≈100 m² · 2,45 kW', items:[
    ['Tanques','Seis tanques com 3.000 L de óleo mineral dielétrico. Ruído de 0 dB.'],
    ['Calor residual','O óleo a 48 °C aquece o piso do quarto por trocadores de titânio.'],
    ['Armazenamento','4,2 PB em ZFS com discos selados a hélio, isolados da rede.'],
    ['Aura Core','3 nós com 32 aceleradores, modelo local de 70 B de parâmetros e latência abaixo de 8 ms.']]},
  {t:'15 · Técnico · Laboratórios', tag:'68 m² · ISO 7', items:[
    ['Biossegurança','Cabine classe II tipo B2 com exaustão total e duplo HEPA.'],
    ['Análise','qPCR de 96 poços e UHPLC-MS/MS recalibrado.'],
    ['Preparo','Rotavapor, centrífuga refrigerada de 20.000 RPM e biorreatores de 10 L com controle de ±0,05 °C.']]},
  {t:'16 · Técnico · Sala limpa', tag:'55 m² · ISO 5', items:[
    ['Mesa óptica','Granito negro de 2,5 t sobre bolsões pneumáticos.'],
    ['Litografia','Projetor DLP UV de 365 nm sem máscara, resolução de 350 nm em pastilhas de 100 mm.'],
    ['Processo','Spin coater de 8.000 RPM, forno de quartzo de 1.200 °C e câmara RIE de 13,56 MHz.']]},
  {t:'17 · Técnico · Suporte de vida, hidroponia e oficina', tag:'390 m²', items:[
    ['Pressurização','Pressão positiva de +35 Pa. Ar captado no topo do moinho e resfriado a 18 °C por duto geotérmico.'],
    ['Filtragem','Pré-filtro G4, carvão ativado e HEPA H14 de 99,995%.'],
    ['Emergência','Quatro velas de clorato (600 L de O₂ cada) e depuradores de cal sodada para 7 pessoas. Hidroponia de 131 m² (12 prateleiras), despensa de 90 dias (66 m²) e oficina maker (98 m²) com CNC, impressoras 3D e torno.']]},
  {t:'18 · Habitação · 7 pessoas', tag:'≈ 650 m²', items:[
    ['Suíte cyberpunk do Mestre','116 m²: closet, estação dev com 3 telas curvas, mesa holográfica, lounge, fliperama, vitrola, parede aquário, skyline em LED e cama-casulo redonda com cabeceira em arco, anel de neon e mosquiteiro em cúpula. Banheiro-cabine.'],
    ['Suíte dos pais','75 m² com banheiro, cama king, poltrona de leitura, penteadeira, adega, TV e lareira de luz.'],
    ['Irmã, sobrinha e convidado','Três quartos com banheiro. O da sobrinha (11 anos) tem cabaninha de leitura, escrivaninha e estrelinhas no teto.'],
    ['Estar, jantar e cozinha','199 m² com ilha, mesa para 8, sofá em L, TV de parede e bar. Ao lado: despensa e sala de cinema e jogos.'],
    ['Iluminação','LED circadiano com CRI 98, de 2.700 K ao amanhecer a 5.500 K ao meio-dia e 2.200 K à noite, mais neon nas suítes.']]},


  {t:'19 · Defesa passiva', tag:'Sem muros', items:[
    ['Infrassom','Transdutores de 18,9 Hz nas três trilhas de mata, acionados por telemetria sísmica.'],
    ['Alarme biológico','Nebulizadores de feromônio nas bordas sul e oeste, junto ao apiário, ativam as seis colmeias.'],
    ['Geofones','40 sensores piezoelétricos a 40 cm, que distinguem passos humanos de fauna.']]},
  {t:'20 · Operação e pessoal', tag:'Escala 4x3', items:[
    ['Equipe','Mínimo de 2 funcionários e máximo recomendado de 4 a 5.'],
    ['Automação','Válvulas solenóides, bombas, elevador e serra no eixo do engenho. A Aura Core gere energia, rede e sensores.'],
    ['Manutenção','Datacenter semanal e semestral, laboratórios mensal e anual, sala limpa diária, suporte de vida semanal e trimestral.'],
    ['Trabalho humano','Manejo animal, colheita, usinagem fina, protocolos de laboratório e limpeza.']]},
  {t:'21 · Núcleo Sisteminha Embrapa', tag:'Regras do módulo', items:[
    ['Tanques','Dois tanques redondos de 4,4 m (10 m³) em placas de concreto, sobre terreno plano, perto da energia e da água, sem árvores ao redor.'],
    ['Biofiltro e sedimentador','Baldes de 20 L ao lado de cada tanque, com bomba, retorno por gravidade e sifão do lodo para a composteira.'],
    ['Horta','5 canteiros de 24 × 1,3 m irrigados com a água dos tanques (alface, couve, tomate, beterraba e temperos).'],
    ['Aves, composteira e minhocário','Galinheiro de poedeiras, frangos de corte em trator móvel, 3 baias de composto e 8 canteiros de minhoca, todos colados aos tanques.'],
    ['Mosca-soldado','Galpão de larvas que recicla restos e vira proteína para peixes e aves.'],
    ['Desvio da regra','Embrapa tirou os suínos do módulo por manutenção; aqui eles ficam no curral, junto do biodigestor.']]},
  {t:'22 · Estrada e porteira', tag:'Cascalho · 5 m', items:[
    ['Porteira','Dois pilares de pedra de 3,6 m, travessa de madeira, placa “Sítio Vale do Café” e duas folhas abertas.'],
    ['Traçado','Da porteira a leste, por 70 m na via transversal, depois ao sul pela via principal até o pátio técnico.'],
    ['Garagem','Setas no pátio guiam os carros até a porta do engenho (x 28,5 a 33,5).']]},
  {t:'23 · Orientação solar (lat. 22,4° S)', tag:'Norte = frente', items:[
    ['Convenção','O norte aponta para a frente da maquete (bússola no canto). Sol ao meio-dia: 44° no inverno, 68° nos equinócios e quase a pino no verão.'],
    ['Painéis','Telhado do engenho com água de 30° voltada ao norte (≈ latitude + 8°): bom ganho no inverno. Mata ao sul, sem sombra.'],
    ['Casa Grande','Varanda e sala ao norte, com beiral de 1,8 m que sombreia no verão e deixa entrar o sol de inverno. Despensa no canto sul-leste, o mais fresco.'],
    ['Núcleo Sisteminha','Sem árvores num raio de 6 m ao sul e ao redor. Pomar ao norte (sombra cai para o sul, até 6 m no inverno, e para antes dos canteiros).'],
    ['Estufa','Cumeeira leste-oeste, face voltada ao norte. Nada ao sul além da estrada e da quadra Q4.'],
    ['Bambu e eucalipto','Ao sul da gleba: a sombra cai para fora e não cobre as quadras.'],
    ['Ressalva','O trilho da bateria gravitacional (15 m) projeta sombra a oeste nas primeiras horas da manhã de inverno.']]},
  {t:'24 · Quadro de áreas e perímetros', tag:'Gleba 15.000 m²', items:[
    ['Gleba','100 × 150 m · 15.000 m² · perímetro 500 m'],
    ['Casa Grande','24 × 19 m · 456 m² · 86 m. Cozinha 80 m², despensa 55 m². Varanda 24 × 3,2 m (77 m²)'],
    ['Engenho','22 × 10 m · 220 m² · 64 m. Pátio 18 × 19 m · 342 m² · 74 m'],
    ['Curral','16 × 19 m · 304 m² · 70 m. Biodigestor 15 × 3,6 m (54 m²)'],
    ['Núcleo Sisteminha','49 × 25 m · 1.225 m² · 148 m. Tanques 2 × 15 m². Horta 156 m². Galinheiro 12 × 9,5 m (114 m²). Lago 121 m² · 39 m'],
    ['Estufa','12 × 10 m · 120 m² · 44 m'],
    ['Quadras','4 × (20 × 25 m) = 2.000 m² · 90 m de perímetro cada'],
    ['Bambuzal e silvicultura','728 m² e 728 m² · 108 m cada. Faixa leste 840 m²'],
    ['Jazida','30 × 19 m · 570 m² · 98 m'],
    ['Estrada de cascalho','148 m de eixo × 5 m · 740 m²'],
    ['Bunker','1 nível de 40 × 35 m = 1.400 m². Mestre 116, pais 75, irmã 58, sobrinha 47, convidado 44, estar 199, despensa 53, cinema 96, hidroponia 117, oficina 102 m², datacenter 100, laboratórios 65, sala limpa 50, suporte 73 m²'],
    ['Fosso do subsolo','24 × 31 m · 744 m² · 110 m']]},
  {t:'21 · Cronograma de implantação', tag:'6 meses', items:[
    ['Mês 1','Aquisição e restauração do engenho.'],
    ['Mês 2','Escavação e laje do subsolo.'],
    ['Mês 3','Isolamento térmico e divisórias.'],
    ['Mês 4','Montagem eletromecânica do datacenter e da bioquímica.'],
    ['Mês 5','Zootecnia, baterias térmicas e rotação de solos.'],
    ['Mês 6','Conexão do cluster Aura OS.']]}
];

const AURA = {
  opsec:'Rede: três links de 300 Mbps fragmentados, malha HF/LoRa com AES-256 e mascaramento de tráfego ativo. Os 40 geofones do perímetro estão sem alertas.',
  energy:'Telemetria: os 4 cilindros guardam 320 kWh a 550 °C (14 dias de autonomia). A Pelton de 3,5 kW cobre os 2,45 kW do datacenter e sobra 1,05 kW para a iluminação.',
  family:'Refúgio: +35 Pa de pressão positiva, HEPA H14 e luz circadiana em ciclo. O calor do óleo a 48 °C mantém o piso do quarto aquecido.',
  staff:'Escala 4x3: duas pessoas cobrem os sete dias. Com quatro ou cinco, as equipes se dividem entre campo, laboratórios, marcenaria e apoio doméstico.'
};

/* ================= UI: dados ================= */
const gridEl = $('#sector-grid'), chipsEl = $('#chips');
SECTORS.forEach(function(s){
  [gridEl, chipsEl].forEach(function(host){
    const b = document.createElement('button');
    b.className = 'btn'; b.textContent = s.n; b.dataset.sector = s.k; b.setAttribute('aria-pressed', s.k === 'overview' ? 'true' : 'false');
    b.addEventListener('click', function(){ focusOn(s.k); });
    host.appendChild(b);
  });
});
(function(){
  const host = $('#bom-body');
  BOM.forEach(function(c){
    const d = document.createElement('section'); d.className = 'cat';
    const h = document.createElement('h4'); h.textContent = c.t;
    const sp = document.createElement('span'); sp.textContent = c.tag; h.appendChild(sp);
    const ul = document.createElement('ul');
    c.items.forEach(function(it){
      const li = document.createElement('li'); const b = document.createElement('b'); b.textContent = it[0] + ': ';
      li.appendChild(b); li.appendChild(document.createTextNode(it[1])); ul.appendChild(li);
    });
    d.appendChild(h); d.appendChild(ul); host.appendChild(d);
  });
})();

/* ================= THREE ================= */
const glHost = $('#gl'), stage = $('#stage');

let renderer;
try {
  renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, powerPreference:'high-performance'});
} catch (e) {
  glHost.innerHTML = '<div class="fallback">Este aparelho não conseguiu iniciar o WebGL.</div>'; return;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Math.min(window.innerWidth, window.innerHeight) < 640 ? 1.5 : 2));   /* celulares de entrada (moto g52): 1,5× poupa a GPU */
renderer.setClearColor(0x000000, 0);
renderer.outputEncoding = THREE.sRGBEncoding;
glHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(26, 1, 30, 2400);
const dio = new THREE.Group(), surface = new THREE.Group(), under = new THREE.Group();
dio.add(under); dio.add(surface); scene.add(dio);
scene.add(new THREE.AmbientLight(0xffffff, 0.60));
const sun = new THREE.DirectionalLight(0xffffff, 0.34); const SUNDIR = new THREE.Vector3(-0.55, 0.78, 0.55).normalize(); scene.add(sun); scene.add(sun.target);

/* ---------- utilidades ---------- */
function C(hex){ return new THREE.Color(hex).convertSRGBToLinear(); }
function rnd(a,b){ return a + Math.random()*(b-a); }
let _s = 11;
function R(){ _s |= 0; _s = _s + 0x6D2B79F5 | 0; let t = Math.imul(_s ^ _s >>> 15, 1 | _s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
function rr(a,b){ return a + R()*(b-a); }
function smooth(a,b,x){ const t = clamp((x-a)/(b-a), 0, 1); return t*t*(3-2*t); }

/* ---------- materiais cel-shading ---------- */
const gradData = new Uint8Array([0,0,0,255, 128,128,128,255, 255,255,255,255]);
const gradTex = new THREE.DataTexture(gradData, 3, 1, THREE.RGBAFormat);
gradTex.minFilter = gradTex.magFilter = THREE.NearestFilter; gradTex.generateMipmaps = false; gradTex.needsUpdate = true;
const toonMat = new THREE.MeshToonMaterial({vertexColors:true, gradientMap:gradTex});
const unlitMat = new THREE.MeshBasicMaterial({vertexColors:true});
const hullMat = new THREE.ShaderMaterial({
  uniforms:{uRes:{value:new THREE.Vector2(1,1)}, uThick:{value:1.5}},
  vertexShader:[
    'uniform vec2 uRes; uniform float uThick; attribute vec3 snormal;',
    'void main(){',
    '  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
    '  vec3 nv = normalize(normalMatrix * snormal);',
    '  vec4 nc = projectionMatrix * vec4(nv, 0.0);',
    '  vec2 dp = nc.xy * uRes; float l = length(dp); dp = l > 1e-5 ? dp / l : vec2(0.0);',
    '  clip.xy += dp * (2.0 * uThick / uRes) * clip.w;',
    '  clip.z += 0.0004 * clip.w;',
    '  gl_Position = clip;',
    '}'].join('\n'),
  fragmentShader:'void main(){ gl_FragColor = vec4(0.035, 0.027, 0.02, 1.0); }',
  side:THREE.BackSide
});
function TM(hex, opacity){
  return new THREE.MeshToonMaterial({color:C(hex), gradientMap:gradTex, transparent:true, opacity:opacity, depthWrite:false, side:THREE.DoubleSide});
}

/* ---------- geometrias compartilhadas ---------- */
const GX = {
  box:new THREE.BoxGeometry(1,1,1), ico0:new THREE.IcosahedronGeometry(1,0), ico1:new THREE.IcosahedronGeometry(1,1),
  tor:new THREE.TorusGeometry(1,0.05,4,18), arc:new THREE.TorusGeometry(1,0.035,4,16,Math.PI),
  half:new THREE.CylinderGeometry(1,1,1,14,1,false,0,Math.PI)
};
const _gc = {};
function cylG(k,seg){ const key = 'c' + k.toFixed(3) + '|' + seg; return _gc[key] || (_gc[key] = new THREE.CylinderGeometry(k,1,1,seg)); }
function coneG(seg){ const key = 'n' + seg; return _gc[key] || (_gc[key] = new THREE.ConeGeometry(1,1,seg)); }
function ni(g){
  if (!g.userData.ni){ const n = g.index ? g.toNonIndexed() : g; n.computeBoundingBox(); g.userData.ni = n; }
  return g.userData.ni;
}

/* ---------- Batch: junta primitivas numa única malha com cor por vértice ---------- */
const _m4 = new THREE.Matrix4(), _q4 = new THREE.Quaternion(), _e4 = new THREE.Euler(), _v3 = new THREE.Vector3(), _s3 = new THREE.Vector3(), _nm3 = new THREE.Matrix3(), _Y = new THREE.Vector3(0,1,0);
function Batch(){ this.pos = []; this.nor = []; this.col = []; this.base = new THREE.Matrix4(); }
Batch.prototype.at = function(x,y,z,ry){ this.base.makeRotationY(ry || 0); this.base.setPosition(x || 0, y || 0, z || 0); return this; };
Batch.prototype.add = function(geo, hex, x,y,z, s, r, q){
  const g = ni(geo), bb = g.boundingBox, y0 = bb.min.y, hh = Math.max(1e-6, bb.max.y - bb.min.y);
  if (typeof s === 'number') s = [s,s,s]; s = s || [1,1,1];
  if (q) _q4.copy(q); else { r = r || [0,0,0]; _e4.set(r[0], r[1], r[2]); _q4.setFromEuler(_e4); }
  _v3.set(x,y,z); _s3.set(s[0], s[1], s[2]); _m4.compose(_v3, _q4, _s3); _m4.premultiply(this.base); _nm3.getNormalMatrix(_m4);
  const P = g.attributes.position, N = g.attributes.normal, c = C(hex), n = P.count;
  for (let i=0;i<n;i++){
    _v3.fromBufferAttribute(P,i); const t = (_v3.y - y0)/hh; _v3.applyMatrix4(_m4); this.pos.push(_v3.x, _v3.y, _v3.z);
    _v3.fromBufferAttribute(N,i).applyMatrix3(_nm3).normalize(); this.nor.push(_v3.x, _v3.y, _v3.z);
    const k = 0.93 + 0.12*t; this.col.push(c.r*k, c.g*k, c.b*k);
  }
  return this;
};
/* caixa pela base (y = fundo) */
Batch.prototype.bb = function(w,h,d,hex,x,y0,z,r){ return this.add(GX.box, hex, x, y0 + h/2, z, [w,h,d], r); };
/* cilindro pela base: raio r, topo rt */
Batch.prototype.cb = function(r,h,hex,x,y0,z,seg,rt,rot){ rt = (rt == null) ? r : rt; return this.add(cylG(rt/r, seg || 10), hex, x, y0 + h/2, z, [r,h,r], rot); };
Batch.prototype.cn = function(r,h,hex,x,y0,z,seg,rot){ return this.add(coneG(seg || 6), hex, x, y0 + h/2, z, [r,h,r], rot); };
Batch.prototype.ic = function(r,hex,x,y,z,sx,sy,sz,det){ return this.add(det ? GX.ico1 : GX.ico0, hex, x, y, z, [r*(sx||1), r*(sy||1), r*(sz||1)]); };
Batch.prototype.beam = function(a,b,rad,hex,seg){
  const A = new THREE.Vector3(a[0],a[1],a[2]), B = new THREE.Vector3(b[0],b[1],b[2]), len = A.distanceTo(B);
  const q = new THREE.Quaternion().setFromUnitVectors(_Y, B.clone().sub(A).normalize());
  return this.add(cylG(1, seg || 6), hex, (A.x+B.x)/2, (A.y+B.y)/2, (A.z+B.z)/2, [rad, len, rad], null, q);
};
function smoothN(pos, nor){
  const n = pos.length/3;
  const map = new Map();
  const out = new Float32Array(pos.length);
  const keys = new Array(n);
  let i;
  let k;
  for (i=0;i<n;i++){
    k = (Math.round(pos[3*i]*400)+10000) + 20001*(Math.round(pos[3*i+1]*400)+10000) + 400040001*(Math.round(pos[3*i+2]*400)+10000);
    keys[i] = k; let a = map.get(k); if (!a){ a = [0,0,0]; map.set(k,a); }
    a[0] += nor[3*i]; a[1] += nor[3*i+1]; a[2] += nor[3*i+2];
  }
  for (i=0;i<n;i++){ const v = map.get(keys[i]), l = Math.hypot(v[0],v[1],v[2]) || 1; out[3*i] = v[0]/l; out[3*i+1] = v[1]/l; out[3*i+2] = v[2]/l; }
  return out;
}
Batch.prototype.build = function(parent, o){
  o = o || {};
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
  const mesh = new THREE.Mesh(g, o.mat || (o.unlit ? unlitMat : toonMat));
  if (o.outline !== false){
    const hg = new THREE.BufferGeometry();
    hg.setAttribute('position', g.attributes.position);
    hg.setAttribute('snormal', new THREE.Float32BufferAttribute(smoothN(this.pos, this.nor), 3));
    mesh.add(new THREE.Mesh(hg, hullMat));
  }
  if (parent) parent.add(mesh);
  this.pos = this.nor = this.col = null; return mesh;
};

/* paleta chapada */
const K = {grass:0x6cc13e, grass2:0x5db234, grass3:0x7dcd4b, tuft:0x4a9b2b, soil:0x7c4f2d, soilD:0x5b3a21, dirt:0xdcb57d,
  water:0x4cc6f2, waterL:0xa9e8fa, pond:0x2fd2c6, sand:0xedd49b, stone:0xbdb6a8, stoneD:0x8f887b, stoneL:0xd6d0c2, rock:0x9c9c98,
  roof:0xdb642f, roofD:0xb44b22, cal:0xf8f3e5, ocre:0xe3a63f, wood:0xab723f, woodD:0x6b4527, woodL:0xdaa768,
  conc:0xcdd2d6, concD:0x9ea5ac, steel:0xa5b0bc, steelD:0x606b77, black:0x25282d, yellow:0xf7b90e, orange:0xff7a14, red:0xdc3b2d,
  blue:0x3e86d8, green:0x31a05a, glass:0x9bd9f1, white:0xf6f8f9, pink:0xf5a9b9, copper:0xd47f3b, ice:0xeaf3f7, navy:0x1d3566};
const GROUND = 0;
const pulse = {};
const COL = [];                          /* colisão da 1ª pessoa: [x1,z1,x2,z2,nível] */
function col(x1,z1,x2,z2,lv){ COL.push([Math.min(x1,x2),Math.min(z1,z2),Math.max(x1,x2),Math.max(z1,z2),lv||'s']); }
function slab(b,x1,z1,x2,z2,y0,h,col){ b.bb(x2-x1, h, z2-z1, col, (x1+x2)/2, y0, (z1+z2)/2); }


/* ================= TERRENO 100 × 150 m (1 unidade = 1 m) ================= */
const SB = new Batch(), SW = new Batch(), SP = new Batch();
const waterMat = new THREE.MeshToonMaterial({color:C(K.water), gradientMap:gradTex});
const pondMat  = new THREE.MeshToonMaterial({color:C(K.pond),  gradientMap:gradTex});
const FLOOR = -8.9;                                 /* laje do bunker: piso a −8,7 m */
const STRATA = [[-10,-8,0x8d98a3],[-8,-5,0xb7814f],[-5,-2.4,0x946037],[-2.4,-0.4,0x6e4527]];
function strata(x1,z1,x2,z2,top){
  STRATA.forEach(function(b){ const t = Math.min(b[1], top); if (t > b[0]+0.01) slab(SB,x1,z1,x2,z2,b[0],t-b[0],b[2]); });
}
function land(x1,z1,x2,z2){ strata(x1,z1,x2,z2,-0.4); slab(SB,x1,z1,x2,z2,-0.4,0.4,K.grass); }
land(-50,-75,-12,75); land(28,-75,43,75); land(-12,-38,28,75); land(-12,-75,28,-73); land(48,-75,50,75);
strata(-12,-73,28,-38,FLOOR);                          /* rocha sob o fosso */
strata(43,-75,48,75,-1.4);                         /* leito do córrego */
slab(SW,43,-75,48,75,-1.4,0.85,K.white);           /* água (material próprio) */

/* linhas de estrato desenhadas e pedras nas faces do corte */
(function(){
  const ln = 0x3a2a1b;
  const ys = [-8,-5,-2.4,-0.4];
  let i;
  let k;
  function stripX(x1,x2,z,y){ SB.bb(x2-x1,0.16,0.07, ln, (x1+x2)/2, y-0.08, z); }
  function stripZ(z1,z2,x,y){ SB.bb(0.07,0.16,z2-z1, ln, x, y-0.08, (z1+z2)/2); }
  ys.forEach(function(y){
    stripX(-50,50,75.04,y);
    stripZ(-75,75,-50.04,y); stripZ(-75,75,50.04,y);
    
  });
  for (k=0;k<46;k++){
    const u = R(), col = [0xc9c2b4,0xa59d8f,0xd6b48a,0x7f8a94][k%4], y = rr(-9.6,-0.9);
    if (u < 0.34){ const x = rr(-49,49); SB.ic(1, col, x, y, 75.0, rr(.45,1.1), rr(.3,.7), 0.18); }
    else if (u < 0.6) SB.ic(1, col, -50.0, y, rr(-74,74), 0.18, rr(.3,.7), rr(.45,1.1));
    else if (u < 0.8) SB.ic(1, col, 50.0, y, rr(-74,74), 0.18, rr(.3,.7), rr(.45,1.1));
    else SB.ic(1, col, rr(-49,49), y, 75.0, rr(.45,1.1), rr(.3,.7), 0.18);
  }
})();

function inLand(x,z){ return (x>=-50&&x<=43&&z>=-75&&z<=75) || (x>=48&&x<=50); }
const gpl = [];
for (let gp=0; gp<150; gp++){
  const gpx = rr(-48,42);
  const gpz = rr(-73,73);
  const gpr = rr(1.6,4.4);
  if (gpx < -16 && gpz > 54) continue;
  if (gpl.some(function(q){ return Math.hypot(q[0]-gpx, q[1]-gpz) < q[2]+gpr+0.1; })) continue;
  gpl.push([gpx,gpz,gpr]);
  if (!inLand(gpx,gpz) || !inLand(gpx+gpr,gpz+gpr) || !inLand(gpx-gpr,gpz-gpr) || !inLand(gpx+gpr,gpz-gpr) || !inLand(gpx-gpr,gpz+gpr)) continue;
  SB.cb(gpr, 0.03, [K.grass2,K.grass3][gp%2], gpx, 0, gpz, 7);
}

/* retângulos de uso do solo: nada de árvore ou capim por cima */
const BLOCK = [
  [-12,-70,14,-44], [-36,-44,-16,-19], [-12,-44,8,-19], [-36,-14,-16,11], [-12,-14,8,11],
  [16.5,-46,21.5,31], [-50,24.5,43,31.5], [-16,-44,-12,24], [21,-44,43,-32], [21,-33,39,-12], [38,-20,44,-14],
  [23,-10,39,9], [23,10,43,19], [5,31,42,41.5], [33,36,40,72], [-50,56,-16,75], [-44,31,5,62],
  [14.8,-61,20,-51], [-3,-47,3,-43], [3,-2,10,2]
];
const BCIRC = [[6,36,6]];
function free(x,z,pad){
  pad = pad || 0; if (!inLand(x,z) || x > 43) return false;
  let i;
  let b;
  let c;
  for (i=0;i<BLOCK.length;i++){ b = BLOCK[i]; if (x > b[0]-pad && x < b[2]+pad && z > b[1]-pad && z < b[3]+pad) return false; }
  for (i=0;i<BCIRC.length;i++){ c = BCIRC[i]; if (Math.hypot(x-c[0], z-c[1]) < c[2]+pad) return false; }
  return true;
}

/* caminhos de terra */
function path(x1,z1,x2,z2){ SB.bb(x2-x1, 0.06, z2-z1, K.dirt, (x1+x2)/2, 0, (z1+z2)/2); }
path(-16,-44,-12,26);                              /* entre quadras */
path(-12,-19,8,-14);                               /* corte entre quadras */
path(-36,-19,-16,-14);
path(-12.5,-46,3.5,-43);                           /* trilha da casa */
path(-1.2,-47.5,1.2,-43);                          /* escada da varanda */
path(8,-12,21,-8);                                 /* ligação à via */
path(15,-44,17,-42);
path(21,-14,39,-10);                               /* pátio → curral */

/* ---------- estrada de cascalho: porteira (leste) → via transversal → via principal → pátio e garagem ---------- */
const GRV = 0xe6dcc0, RUT = 0xcbb98f;
SB.bb(71.5, 0.1, 5, GRV, -14.25, 0, 28);                               /* x -50 … 21,5 · z 25,5 … 30,5 */
SB.bb(71.5, 0.11, 0.55, RUT, -14.25, 0, 27.0); SB.bb(71.5, 0.11, 0.55, RUT, -14.25, 0, 29.0);
SB.bb(76.5, 0.1, 5, GRV, 19, 0, -7.75);                                /* via principal x 16,5 … 21,5 */
SB.bb(0.55, 0.11, 76.5, RUT, 18.1, 0, -7.75); SB.bb(0.55, 0.11, 76.5, RUT, 19.9, 0, -7.75);
path(21.5, 25.5, 43, 30.5);                                            /* continua em terra até o córrego */
for (let rd=0; rd<46; rd++){ const rdx = -48 + rd*1.6, rdz = (rd%2 ? 25.25 : 30.75); SB.ic(1, K.rock, rdx+rr(-.3,.3), 0.1, rdz+rr(-.15,.15), rr(.25,.45), rr(.18,.3), rr(.25,.45)); }
for (let rd2=0; rd2<18; rd2++){ const rdz2 = -44 + rd2*4.2; SB.ic(1, K.rock, (rd2%2 ? 16.35 : 21.65), 0.1, rdz2+rr(-.3,.3), rr(.25,.45), rr(.18,.3), rr(.25,.45)); }
/* setas de guia no pátio, rumo à porta da garagem (x 28,5…33,5 · z −33) */
for (let ra=0; ra<6; ra++) SB.bb(0.9, 0.03, 0.2, K.white, 22.8 + ra*1.55, 0.2, -24);
for (let rb=0; rb<5; rb++) SB.bb(0.2, 0.03, 0.9, K.white, 31, 0.2, -25.6 - rb*1.4);
/* porteira de pedra e madeira */
const GX0 = -49.1, GZ1 = 24.6, GZ2 = 31.4;
[GZ1, GZ2].forEach(function(gz, gi){
  SB.bb(1.0,3.6,1.0, K.stone, GX0, 0, gz); SB.bb(1.3,0.28,1.3, K.stoneD, GX0, 3.6, gz); SB.bb(0.8,0.2,0.8, K.stoneL, GX0, 3.88, gz);
  for (let gst=0; gst<4; gst++) SB.bb(1.02,0.04,1.02, K.stoneD, GX0, 0.7 + gst*0.8, gz);
});
SB.bb(0.34,0.34,GZ2-GZ1+1.0, K.woodD, GX0, 3.9, (GZ1+GZ2)/2);                     /* travessa */
SB.beam([GX0,3.9,GZ1+0.4],[GX0,3.4,GZ1+0.4], 0.03, K.steelD, 4); SB.beam([GX0,3.9,GZ2-0.4],[GX0,3.4,GZ2-0.4], 0.03, K.steelD, 4);
SB.bb(0.18,0.9,5.2, K.woodL, GX0, 2.5, (GZ1+GZ2)/2);                               /* tábua da placa */
[[GZ1+1.0, GX0+3.4, GZ1+0.2],[GZ2-1.0, GX0+3.4, GZ2-0.2]].forEach(function(l, li){
  const zz = l[2], dir = 1;
  SB.bb(3.4,0.14,0.1, K.wood, GX0+1.95, 0.55, zz); SB.bb(3.4,0.14,0.1, K.wood, GX0+1.95, 1.45, zz);
  for (let pk=0; pk<6; pk++) SB.bb(0.12,1.6,0.08, K.woodL, GX0+0.7+pk*0.6, 0.1, zz);
  SB.beam([GX0+0.55,0.5,zz],[GX0+3.5,1.5,zz], 0.05, K.woodD, 4);
});
SB.bb(0.2,3.0,0.2,K.woodD, -48.1,0,22.6); SB.bb(0.6,0.4,0.9,K.red, -48.1,3.0,22.6); SB.bb(0.5,0.08,0.7,K.white, -48.1,3.4,22.6);   /* caixa de correio */
SB.cb(0.09,4.2,K.steelD, -47.9,0,33.2,6); SB.ic(1, 0xfff1b8, -47.9, 4.4, 33.2, 0.35,0.35,0.35); SB.bb(0.7,0.1,0.7,K.black, -47.9,4.2,33.2);   /* poste de luz */
SB.bb(0.7,1.1,3.4, K.stone, GX0, 0, 22.7); SB.bb(0.7,1.1,3.4, K.stone, GX0, 0, 33.4);                                          /* muretas */
(function(){
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 180; const cx = cv.getContext('2d');
  cx.fillStyle = '#f3e3b8'; cx.fillRect(0,0,1024,180); cx.strokeStyle = '#6b4527'; cx.lineWidth = 10; cx.strokeRect(8,8,1008,164);
  cx.fillStyle = '#3d2a17'; cx.font = 'bold 84px Georgia, serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('SÍTIO VALE DO CAFÉ', 512, 96);
  const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
  const sm = new THREE.MeshBasicMaterial({map:tex});
  [[1, GX0+0.1],[-1, GX0-0.1]].forEach(function(f){
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.9), sm); m.position.set(f[1], 2.5+0.45, (GZ1+GZ2)/2); m.rotation.y = f[0] > 0 ? Math.PI/2 : -Math.PI/2; surface.add(m);
  });
})();

/* ---------- córrego: pedras, degraus, espuma estática ---------- */
for (let rk=0; rk<90; rk++){ const rkz = rr(-74,74), side = R()<.5; SB.ic(1, K.rock, side ? rr(42.2,43.4) : rr(47.6,48.6), -0.3, rkz, rr(.4,.9), rr(.25,.5), rr(.4,.9)); }
[[-60,0.55],[-57,0.38],[-54,0.2]].forEach(function(st){
  SW.bb(5.0, st[1], 2.4, K.white, 45.5, -0.55, st[0]);
  SB.bb(5.0, 0.07, 2.4, K.white, 45.5, -0.55+st[1], st[0]);
});

/* ---------- lago de reúso (120 m²): reservatório do sistema, longe dos tanques ---------- */
const pondX = -36.5, pondZ = 48.5, pondR = 6.2;
SB.cb(7.2, 0.14, K.sand, pondX, 0, pondZ, 36);
SP.cb(pondR, 0.3, K.white, pondX, 0, pondZ, 36);
for (let pq=0; pq<30; pq++){ const pa = pq/30*Math.PI*2 + rr(-.08,.08), pr = rr(6.6,7.2); SB.ic(1, K.rock, pondX+Math.cos(pa)*pr, 0.1, pondZ+Math.sin(pa)*pr, rr(.5,.9), rr(.35,.6), rr(.5,.9)); }
[[-3.2,-1.4,.9],[2.4,2.8,.8],[-2.0,3.1,.7],[3.4,-2.2,.6]].forEach(function(l){ SB.cb(l[2], 0.04, 0x45b84a, pondX+l[0], 0.3, pondZ+l[1], 10); });
SB.ic(1, K.pink, pondX-3.2, 0.42, pondZ-1.4, 0.3, 0.25, 0.3);

/* ================= NÚCLEO SISTEMINHA EMBRAPA (regras: tanque no centro, tudo perto, sem árvore) =================
   1 tanque redondo de 4,4 m (10 m³) por módulo, em terreno plano, perto de energia e água, sem árvores ao redor.
   Sedimentador e biofiltro no nível do tanque. Água do tanque irriga a horta. Sedimento vai à composteira e ao minhocário.
   Galinheiro, composteira, minhocário e horta ficam colados ao tanque para os fluxos serem curtos. */
const TANKS = [{x:-19,z:38.5},{x:-9.5,z:38.5}];
function sisTank(t){
  let a;
  const x = t.x;
  const z = t.z;
  SB.cb(4.4, 0.06, K.conc, x, 0, z, 32);                              /* laje plana de apoio */
  for (a=0;a<18;a++){ const th = a/18*Math.PI*2; SB.add(GX.box, K.conc, x+Math.cos(th)*2.32, 0.45, z+Math.sin(th)*2.32, [0.88,0.9,0.22], [0,-th-Math.PI/2,0]); }
  SB.cb(2.46, 0.1, K.concD, x, 0.9, z, 24, 2.46);
  SP.cb(2.2, 0.8, K.white, x, 0, z, 24);                              /* 10 m³ · lâmina de 70 a 80 cm */
  SB.cb(0.09, 0.9, K.black, x+0.4, 0.8, z, 6); SB.bb(0.5,0.05,0.5, K.steelD, x+0.4, 1.7, z);      /* aerador venturi */
  SB.cb(0.34, 0.75, K.blue, x+3.1, 0.06, z+0.7, 10, 0.3); SB.ic(1, K.white, x+3.1, 0.88, z+0.7, 0.26, 0.14, 0.26); /* biofiltro com cabeleira de nylon */
  SB.cb(0.42, 0.9, 0xe9e2cb, x+3.1, 0.06, z-0.8, 10, 0.38); SB.cb(0.45, 0.08, K.steel, x+3.1, 0.96, z-0.8, 10);  /* sedimentador */
  SB.beam([x+2.3,0.85,z-0.3],[x+3.1,0.8,z-0.8], 0.06, K.black, 5); SB.beam([x+3.1,0.4,z-0.8],[x+3.1,0.4,z+0.7], 0.06, K.black, 5);
  SB.bb(0.5,0.35,0.4, K.black, x+2.5, 0.06, z+1.9);                  /* bomba SB-2000 */
  SB.beam([x+3.1,0.12,z-1.2],[x+3.1,0.12,z-3.6], 0.05, K.brown || 0x7a4f2c, 5);   /* sifão do sedimentador para a composteira */
}
TANKS.forEach(sisTank);
/* quadro de energia e bomba d'água: perto da rede (windmill e poços) */
SB.bb(1.0,1.9,0.5,K.concD, -14.2,0,31.8); SB.bb(0.7,0.5,0.1,K.yellow, -14.2,1.1,32.1); SB.cb(0.1,3.4,K.woodD, -15.6,0,31.8,6);
SB.beam([10,0.14,32],[-5.5,0.14,34.5], 0.07, K.blue, 5); SB.beam([-5.5,0.14,34.5],[-7.3,0.7,37.4], 0.07, K.blue, 5);   /* água dos poços */
SB.beam([-9.5,0.14,41.0],[-9.5,0.14,44.4], 0.09, K.blue, 5); SB.beam([-19,0.14,41.0],[-19,0.14,44.4], 0.09, K.blue, 5);  /* água do tanque para a horta */

/* horta: 5 canteiros irrigados por gotejo com a água dos tanques */
SB.bb(24,0.1,0.14, K.blue, -16,0.1,44.4);
for (let hb=0; hb<5; hb++){
  const hbz = 46.1 + hb*1.9, hcr = [0x58c05b,0x3fae4a,0xe0462d,0xc07bff,0xf0d257][hb];
  SB.bb(24,0.38,1.3, K.soilD, -16,0,hbz);
  for (let hj=0; hj<17; hj++){
    const hjx = -27.2 + hj*1.4;
    if (hb === 0) SB.ic(1, [0x7ad063,0x55b84f][hj%2], hjx, 0.6, hbz, 0.34, 0.26, 0.34);          /* alface */
    else if (hb === 1) SB.ic(1, [0x3d9a4a,0x6cc06a][hj%2], hjx, 0.7, hbz, 0.42, 0.34, 0.42);       /* couve */
    else if (hb === 2){ SB.cb(0.03,1.0,K.woodD, hjx,0.38,hbz,4); SB.ic(1, hcr, hjx, 1.1, hbz, 0.2,0.2,0.2); SB.ic(1, 0x3fae4a, hjx, 0.9, hbz, 0.3,0.25,0.3); }  /* tomate */
    else if (hb === 3) SB.bb(0.34,0.5,0.34, [0x8e5fb0,0x6a3f94][hj%2], hjx, 0.38, hbz);          /* beterraba/roxas */
    else { SB.cn(0.16,0.7+(hj%3)*0.1, 0x6cae3a, hjx, 0.38, hbz, 4); SB.ic(1, hcr, hjx, 1.0, hbz, 0.12,0.12,0.12); } /* temperos e chás */
  }
}
SB.bb(0.2,1.4,0.2,K.woodD, -28.6,0,55.4); SB.bb(1.9,0.8,0.1, 0xf2dfae, -28.6,1.4,55.4);

/* composteira (3 baias de paletes) e minhocário (8 canteiros) */
for (let cb3=0; cb3<3; cb3++){
  const cbz = 33.2 + cb3*2.5;
  SB.bb(0.14,1.3,2.2,K.woodL, -1.1,0,cbz); SB.bb(0.14,1.3,2.2,K.woodL, 1.1,0,cbz); SB.bb(2.2,1.3,0.14,K.woodL, 0,0,cbz-1.1+0.1);
  for (let cp=0; cp<4; cp++) SB.bb(2.2,0.08,0.14,K.woodD, 0,0.2+cp*0.3,cbz+1.05);
  SB.ic(1, [0x5a3a24,0x4a2f1c,0x3a2417][cb3], 0, 0.55+cb3*0.15, cbz, 0.85, 0.5+cb3*0.14, 0.85, 1);
}
for (let mc=0; mc<8; mc++){
  const mcx = -0.5 + (mc%4)*1.7, mcz = 44.2 + ((mc/4)|0)*3.2;
  SB.bb(1.5,0.7,2.5, 0xc2704c, mcx, 0, mcz); SB.bb(1.3,0.08,2.3, 0x2d1f15, mcx, 0.7, mcz);
  for (let mw=0; mw<3; mw++) SB.bb(0.5,0.06,0.06, 0xe8a0a0, mcx-0.3+mw*0.3, 0.78, mcz-0.5+mw*0.5);
}

/* galinheiro de poedeiras (35 aves, 114 m²) com cerca e abrigo */
const hen = {x1:-43, x2:-31, z1:31, z2:40.5};
[hen.z1,hen.z2].forEach(function(zz){ [0.5,1.1].forEach(function(h){ SB.bb(hen.x2-hen.x1+0.2,0.1,0.1,K.wood, (hen.x1+hen.x2)/2, h, zz); }); });
[hen.x1,hen.x2].forEach(function(xx){ [0.5,1.1].forEach(function(h){ SB.bb(0.1,0.1,hen.z2-hen.z1,K.wood, xx, h, (hen.z1+hen.z2)/2); }); });
for (let fenceX=0; fenceX<=6; fenceX++){ [hen.z1,hen.z2].forEach(function(zz){ SB.bb(0.16,1.4,0.16,K.woodD, hen.x1+fenceX*2, 0, zz); }); }
for (let fenceZ=1; fenceZ<5; fenceZ++){ [hen.x1,hen.x2].forEach(function(xx){ SB.bb(0.16,1.4,0.16,K.woodD, xx, 0, hen.z1+fenceZ*(hen.z2-hen.z1)/5); }); }
SB.bb(4.2,2.0,3.0,K.woodL, -40,0,33.4); SB.add(GX.box, K.roofD, -40,2.35,33.4, [4.8,0.2,3.6]); SB.bb(0.9,1.3,0.1,K.woodD, -40,0,35.0);
SB.beam([-37.6,0.1,35.4],[-38.6,1.3,35.0], 0.08, K.wood, 4);
for (let nb=0; nb<4; nb++) SB.bb(0.7,0.5,0.6, 0xe0b24a, -42.4+nb*0.9, 0.9, 32.6);
SB.bb(1.6,0.4,0.5,0x6bc4e6, -35,0,38.8); SB.cb(0.3,0.6,K.steel, -33,0,38.8,8);
/* frangos de corte em trator móvel e mosca-soldado */
[[-27.2,33.2],[-27.2,36.4]].forEach(function(c){ SB.bb(5,0.08,2.2,K.woodL, c[0],0.1,c[1]); SB.add(GX.arc, K.white, c[0]-2,0.1,c[1],[1.1,1.0,1.1],[0,0,0]); SB.add(GX.arc, K.white, c[0]+2,0.1,c[1],[1.1,1.0,1.1],[0,0,0]); SB.bb(5,0.06,0.06,K.white, c[0],1.1,c[1]); });
SB.bb(3.2,2.0,2.6,K.cal, -26,0,40.2); SB.bb(3.5,0.25,2.9,K.roofD, -26,2.0,40.2);
for (let tr=0; tr<3; tr++) SB.bb(2.4,0.08,0.7,[0x9bd04a,0x7cb83a,0xb7d96a][tr], -26,0.6+tr*0.5,40.2);

/* estufa arqueada 12 × 10 m (a película translúcida entra depois) */
const gh = {x:27.5, z:35.6, len:12, w:10};
for (let gr=0; gr<=8; gr++) SB.add(GX.arc, K.white, gh.x-6+gr*1.5, 0, gh.z, [5,3.2,5], [0,Math.PI/2,0]);
SB.bb(12,0.14,0.14, K.white, gh.x, 3.2, gh.z);
SB.bb(0.18,0.18,10, K.white, gh.x-6, 0, gh.z); SB.bb(0.18,0.18,10, K.white, gh.x+6, 0, gh.z);
for (let gbd=0; gbd<4; gbd++){
  SB.bb(8,0.5,1.2, K.soilD, gh.x-1.4, 0, gh.z-3.4+gbd*2.3);
  for (let gk=0; gk<8; gk++) SB.ic(1, [0x3fae4a,0x2f9644,0x66c25a][(gk+gbd)%3], gh.x-4.9+gk*1.0, 0.7, gh.z-3.4+gbd*2.3+rr(-.2,.2), rr(.35,.5), rr(.4,.6), rr(.35,.5));
}
/* sala estéril de cogumelos (16 m²) */
SB.bb(4,2.6,4, K.cal, gh.x+4, 0, gh.z+1.4); SB.bb(4.3,0.3,4.3, K.roofD, gh.x+4, 2.6, gh.z+1.4); SB.bb(1,1.9,0.12, K.woodD, gh.x+4, 0, gh.z+3.45);
SB.bb(0.9,0.5,0.1, 0x6bc4e6, gh.x+4, 1.4, gh.z+3.46);

/* ---------- quadras de rotação quadrienal ---------- */
const PLOTS = [{n:'Q1',x1:-36,x2:-16,z1:-44,z2:-19,k:0},{n:'Q2',x1:-12,x2:8,z1:-44,z2:-19,k:1},{n:'Q3',x1:-36,x2:-16,z1:-14,z2:11,k:2},{n:'Q4',x1:-12,x2:8,z1:-14,z2:11,k:3}];
PLOTS.forEach(function(pl){
  SB.bb(pl.x2-pl.x1, 0.3, pl.z2-pl.z1, K.soilD, (pl.x1+pl.x2)/2, 0, (pl.z1+pl.z2)/2);
  const rows = 13;
  const sp = (pl.z2-pl.z1-2)/(rows-1);
  let i;
  let j;
  let z;
  let x;
  for (i=0;i<rows;i++){
    z = pl.z1 + 1 + i*sp; SB.bb(pl.x2-pl.x1-1.6, 0.34, 0.9, 0x5a3a20, (pl.x1+pl.x2)/2, 0.3, z);
    for (j=0; j<18; j++){
      x = pl.x1 + 1.6 + j*(pl.x2-pl.x1-3.2)/17; const y0 = 0.64, a = (i+j)%3;
      if (pl.k === 0){ SB.bb(0.7,0.7,0.7, [0x3fb04a,0x2f9a44,0x57c25c][a], x, y0, z); if (a === 0) SB.ic(1, 0xb583e6, x, y0+1.0, z, 0.22,0.22,0.22); }
      else if (pl.k === 1){ SB.ic(1, [0x2f9a44,0x47ad4f,0x5cc060][a], x, y0+0.35, z, 0.55, 0.38, 0.55); if (j%3 === 0) SB.ic(1, 0xa070c4, x, y0+0.06, z+0.45, 0.28,0.2,0.28); }
      else if (pl.k === 2){ if (i%2 === 0) SB.cn(0.34, 2.4+a*0.25, 0x78bf3a, x, y0, z, 4); else { SB.ic(1, K.orange, x, y0+0.38, z, 0.52, 0.42, 0.52, 1); SB.ic(1, 0x4a9a3a, x+0.6, y0+0.2, z, 0.35,0.12,0.35); } }
      else { SB.bb(0.55, 0.45+a*0.2, 0.55, [0x4f9a3a,0x3f8a2c,0x6aae45][a], x, y0, z); SB.ic(1, 0xf6d73a, x, y0+0.7+a*0.2, z, 0.26,0.26,0.26); }
    }
  }
  SB.bb(0.25,1.3,0.25, K.woodD, pl.x1+0.7, 0, pl.z2+0.5); SB.bb(1.5,0.8,0.12, 0xf2dfae, pl.x1+0.7, 1.3, pl.z2+0.5);
});

/* ---------- curral de 300 m²: piso ripado, abrigos, cochos ---------- */
const pen = {x1:23, x2:39, z1:-10, z2:9};
SB.bb(16,0.12,19, 0xd7c08c, 31, 0, -0.5);
[pen.z1,pen.z2].forEach(function(z){ [0.55,1.15].forEach(function(h){ SB.bb(pen.x2-pen.x1+0.2, 0.14, 0.14, K.wood, 31, h, z); }); });
[pen.x1,pen.x2].forEach(function(x){ [0.55,1.15].forEach(function(h){ SB.bb(0.14, 0.14, pen.z2-pen.z1, K.wood, x, h, -0.5); }); });
for (let ppx=0; ppx<=8; ppx++){ [pen.z1,pen.z2].forEach(function(z){ SB.bb(0.2,1.5,0.2, K.woodD, pen.x1+ppx*2, 0, z); }); }
for (let ppz=1; ppz<=9; ppz++){ [pen.x1,pen.x2].forEach(function(x){ SB.bb(0.2,1.5,0.2, K.woodD, x, 0, pen.z1+ppz*(pen.z2-pen.z1)/10); }); }
SB.bb(0.14,1.3,19, K.wood, 31, 0, -0.5); /* divisória baixa entre baias */
SB.bb(6.6,2.6,4.4, K.woodL, 26.5, 0, -6.2); SB.add(coneG(4), K.roof, 26.5, 3.6, -6.2, [4.9,2.2,4.9], [0,Math.PI/4,0]); SB.bb(1.2,1.7,0.1, K.woodD, 26.5, 0, -3.95);
SB.bb(5.4,2.2,3.8, K.woodL, 35.2, 0, 5.4); SB.add(GX.box, K.roofD, 35.2, 2.5, 5.4, [6.2,0.3,4.6]);
[[34,-6.4],[35.8,-6.4],[27,6.5]].forEach(function(t){ SB.bb(2.2,0.45,0.7, 0xe0b24a, t[0], 0, t[1]); SB.bb(2.0,0.2,0.5, 0x6b8f4e, t[0], 0.45, t[1]); });
for (let hb=0; hb<5; hb++) SB.bb(1.3,0.8,0.8, 0xe6c75a, 36.5+(hb%2)*0.1, (hb>2?0.8:0), -3 + (hb%3)*1.1);
SB.bb(3,0.55,1.1, 0x6bc4e6, 28, 0, 1.4);

/* ---------- poços artesianos (5), cisterna e reservatório falso ---------- */
[[16,32.5],[19,33.5],[13,34.5],[19.6,36.6],[10,32.5]].forEach(function(p){
  SB.cb(1.1, 1.4, K.blue, p[0], 0, p[1], 14); SB.cb(0.8, 0.14, 0x1b3350, p[0], 1.4, p[1], 14); SB.cb(1.2, 0.2, K.steel, p[0], 1.14, p[1], 14);
  SB.cb(0.16,2.2,K.steelD, p[0]+0.9, 0, p[1], 8);
});

/* ---------- biodigestor tubular canadense (15 m³) junto ao curral: baias lavam por gravidade ---------- */
SB.bb(15,0.4,3.6, K.concD, 30, 0, 13.5);
SB.add(GX.half, 0x4fae62, 30, 0.4, 13.5, [1.6,13.6,1.6], [0,0,Math.PI/2]);
SB.ic(1, K.white, 39, 1.4, 13.5, 1.4, 1.1, 1.3, 1);
SB.bb(1.4,0.12,3.0, K.concD, 30, 0, 10.2);                       /* calha de lavagem: curral → biodigestor */
SB.cb(0.5, 2.6, K.steel, 25, 0, 16.8, 10); SB.cb(0.62, 0.3, K.red, 25, 2.6, 16.8, 10);
SB.cb(0.5, 2.2, K.steel, 27.4, 0, 16.8, 10); SB.cb(0.62, 0.3, K.blue, 27.4, 2.2, 16.8, 10);
SB.beam([26.4,0.9,13.5],[25.2,2.8,16.8], 0.14, K.steelD, 6); SB.beam([37.4,1.2,13.5],[38.8,1.2,13.5], 0.12, K.steelD, 6);

/* ---------- bateria gravitacional: trilho de 35 m, bloco de 12 t, guincho ---------- */
const gx = 36.5, gz1 = 38, gz2 = 70, gy1 = 15, gy2 = 0.6;
[gx-0.9, gx+0.9].forEach(function(rx){ SB.beam([rx,gy1,gz1],[rx,gy2,gz2], 0.16, K.steelD, 6); });
for (let sl=0; sl<=16; sl++){ const su = sl/16; SB.bb(2.6,0.2,0.4, K.woodD, gx, gy1 + (gy2-gy1)*su - 0.3, gz1 + (gz2-gz1)*su); }
[[gx-1.6,gz1-0.6],[gx+1.6,gz1-0.6]].forEach(function(p){ SB.beam([p[0],0,p[1]-0.5],[p[0],gy1,gz1], 0.22, K.steel, 6); });
[[gx-1.6,gz1+3.4],[gx+1.6,gz1+3.4]].forEach(function(p){ SB.beam([p[0],0,p[1]+2.6],[p[0],gy1-1.2,gz1+2.2], 0.16, K.steel, 6); });
SB.bb(4.0,0.34,0.4, K.steel, gx, gy1+0.1, gz1);
SB.bb(1.6,1.6,1.2, K.steelD, gx, gy1+0.4, gz1-1.4); SB.cb(0.5,1.8,K.red, gx, gy1+0.5, gz1-1.4, 8, 0.5, [0,0,Math.PI/2]);
const gu = 0.55, gby = gy1 + (gy2-gy1)*gu + 1.0, gbz = gz1 + (gz2-gz1)*gu;
SB.add(GX.box, K.concD, gx, gby, gbz, [2.0,1.8,2.4], [Math.atan2(gy1-gy2, gz2-gz1),0,0]);
SB.beam([gx,gy1+0.3,gz1+0.1],[gx,gby+0.5,gbz-0.7], 0.07, K.black, 4);
SB.bb(2.6,0.5,1.8, K.concD, gx, 0, gz2+1.2);

/* ---------- jazida de argila (600 m²) e tijolos ---------- */
SB.bb(30,0.1,19, 0xd9704c, -33, 0, 65.5);
for (let ccx=0; ccx<15; ccx++) for (let ccz=0; ccz<9.5; ccz++){ const cch = (R()*3)|0; SB.bb(2,0.04+cch*0.015,Math.min(2,19-ccz*2),[0xc9603e,0xe0805a,0xb85633][cch], -47+ccx*2, 0.1, 56.2+ccz*2); }   /* células sem sobreposição: sem flicker */
for (let cbk=0; cbk<24; cbk++) SB.bb(1.2,0.5,0.6, 0xe6cfa6, -20 + (cbk%6)*1.3, ((cbk/6)|0)*0.52, 58);
SB.bb(3.4,2.4,3.0, K.concD, -42, 0, 59); SB.cn(2.4,2.0,K.roofD, -42, 2.4, 59, 4, [0,Math.PI/4,0]);
SB.cb(0.4,3.2,K.steelD, -42, 4.4, 59, 8);

/* ---------- dutos de energia (Pelton + moinho → subsolo) ---------- */
function duct(pts, y, col){
  for (let i=0;i<pts.length-1;i++) SB.beam([pts[i][0],y,pts[i][1]],[pts[i+1][0],y,pts[i+1][1]], 0.32, col, 6);
  for (let i=0;i<pts.length;i++) SB.ic(1, col, pts[i][0], y, pts[i][1], 0.46, 0.46, 0.46);
}
duct([[41,-17],[41,-12],[20,-12],[20,-38.2]], 0.36, K.black);
duct([[6,36],[16,36],[16,-38.2]], 0.36, K.steelD);
duct([[6,36],[6,31.4],[-13.6,31.4]], 0.36, K.steelD);   /* rede do núcleo Sisteminha */
/* mergulham pela parede sul do bunker até o corredor técnico */
SB.beam([20,0.36,-38.2],[20,FLOOR+3.2,-38.2], 0.34, K.black, 6); SB.ic(1, K.black, 20, FLOOR+3.2, -38.2, 0.5,0.5,0.5);
SB.beam([16,0.36,-38.2],[16,FLOOR+2.8,-38.2], 0.16, K.steelD, 6);
SB.bb(1.6,0.6,1.2, K.steel, 18, 0, -40.4); SB.bb(1.1,0.35,0.9, K.red, 18.2, 0.6, -40.4);

/* ---------- cinturão vivo: ora-pro-nóbis e sebe facetada ---------- */
const hcols = [0x2a8a3b,0x35a047,0x23762f,0x41ad4e];
let hix = 0;
for (let hx=-48; hx<=47; hx+=3.0, hix++) SB.ic(1, hcols[hix&3], hx+rr(-.3,.3), rr(1.2,1.9), -73.4+rr(-.3,.3), rr(1.6,2.2), rr(1.3,1.9), rr(1.6,2.2), 1);
for (let hz=-72; hz<=73; hz+=3.0, hix++) if (!(hz > 22 && hz < 33.5)) SB.ic(1, hcols[hix&3], -48.4+rr(-.3,.3), rr(1.2,1.9), hz+rr(-.3,.3), rr(1.6,2.2), rr(1.3,1.9), rr(1.6,2.2), 1);
for (let hf=0; hf<80; hf++){ const hfx = R()<.55 ? rr(-48,47) : -48.4+rr(-1.2,1.2), hfz = hfx > -46.5 && R()<.9 ? -73.4+rr(-1.4,1.4) : rr(-72,72); SB.ic(1, [0xe03a86,0xf064a6,0xd0307a][hf%3], hfx, rr(2.2,3.2), hfz, 0.22,0.22,0.22); }


/* ================= FLORA: árvores facetadas, bambuzal, silvicultura, capim ================= */
const TG = [[0x2f8f3c,0x3fa84a,0x58c05b],[0x2a7f43,0x37984f,0x4fb162],[0x3b9a35,0x55b848,0x75cf5c]];
function tree(b, x, z, s){
  const g = TG[(R()*3)|0], h = rr(3.2,4.6)*s, cr = rr(2.4,3.4)*s;
  b.cb(0.34*s, h, [0x7a4f2c,0x6b4527,0x8a5a32][(R()*3)|0], x, 0, z, 6, 0.24*s);
  b.ic(cr, g[0], x, h+cr*0.55, z, 1, 0.9, 1);
  b.ic(cr*0.78, g[1], x+rr(-.9,.9)*s, h+cr*1.1, z+rr(-.9,.9)*s, 1, 0.9, 1);
  b.ic(cr*0.55, g[2], x+rr(-.8,.8)*s, h+cr*1.55, z+rr(-.8,.8)*s, 1, 0.9, 1);
}
function fruit(b, x, z){
  const h = rr(2.0,2.6), cr = rr(1.7,2.2), col = [0xff8a1e,0xf2c230,0xe0462d,0xff9e3a][(R()*4)|0];
  b.cb(0.26, h, 0x6b4527, x, 0, z, 6, 0.2); b.ic(cr, 0x3a9a40, x, h+cr*0.5, z, 1, 0.85, 1); b.ic(cr*0.62, 0x52b552, x+0.5, h+cr*0.95, z-0.4, 1, 0.85, 1);
  for (let f=0; f<5; f++) b.ic(1, col, x+rr(-1.5,1.5), h+cr*rr(.2,.8), z+rr(-1.5,1.5), 0.2,0.2,0.2);
}
function euca(b, x, z){
  const h = rr(11,15), cr = rr(1.7,2.5), gc = [0x4d9a73,0x5faa7e,0x3f8c66][(R()*3)|0];
  b.cb(0.34, h, [0xc9bfa3,0xd8cfb6][(R()*2)|0], x, 0, z, 5, 0.2);
  b.ic(cr, gc, x, h, z, 1, 1.9, 1); b.ic(cr*0.7, 0x6dbb8c, x+rr(-.8,.8), h+cr*1.3, z+rr(-.8,.8), 1, 1.6, 1);
}
function pine(b, x, z){
  const h = rr(7,10); b.cb(0.3, h*0.4, 0x6b4527, x, 0, z, 5);
  for (let i=0;i<4;i++) b.cn(2.3 - i*0.5, 3.2, [0x2a7a3f,0x338c47,0x3d9e50][i%3], x, h*0.28 + i*1.9, z, 6);
}

const FB = new SB.constructor();                      /* lote da flora (separado para facilitar ajustes) */
let treeCount = 0;
let i;
let x;
let z;
let tries;

/* silvicultura energética: eucaliptos em talhadia + cedrinho */
for (x=18; x<=42.5; x+=2.5) for (z=-73; z<=-47; z+=2.5){
  const ex = x+rr(-.8,.8), ez = z+rr(-.8,.8);
  if (ex > 13 && ex < 18.2 && ez > -62 && ez < -50) continue;
  if (R() < 0.83) { if (R() < 0.12) pine(FB, ex, ez); else euca(FB, ex, ez); treeCount++; }
}
/* bambuzal 800 m²: colmos altos com nós e tufos */
for (x=-43; x<=-17; x+=1.7) for (z=-71; z<=-47; z+=1.7){
  if (R() < 0.12) continue; const bx = x+rr(-.5,.5), bz = z+rr(-.5,.5), bh = rr(9,14), bc = [0x8bc34a,0x7bb83e,0x9ccf56][(R()*3)|0];
  FB.cb(0.2, bh, bc, bx, 0, bz, 5, 0.12);
  for (let nd=2; nd<bh-0.4; nd+=2.4) FB.cb(0.25, 0.13, 0x5d8a2b, bx, nd, bz, 5);
  FB.ic(1.0, 0x5fae3f, bx, bh+0.2, bz, 1.0, 1.7, 1.0);
  if (R() < 0.5) FB.ic(0.7, 0x7bc455, bx+rr(-.5,.5), bh-2.2, bz+rr(-.5,.5), 1.0, 1.5, 1.0);
}
/* faixa de mata na borda esquerda e atrás das quadras */
for (z=-70; z<=72; z+=3.4) for (let q=0; q<2; q++){
  const tx = -47.2 + q*3.0 + rr(-.6,.6), tz = z + rr(-1,1);
  if (free(tx,tz,0) || (tx < -45 && inLand(tx,tz))) if (!(tz > 54 && tx > -48 && tx < -17) && !(tz > 21.5 && tz < 34) && !(Math.hypot(tx+36.5, tz-48.5) < 9)) { if (R()<.5) tree(FB, tx, tz, rr(.9,1.3)); else pine(FB, tx, tz); treeCount++; }
}
/* árvores soltas e pomar consorciado */
for (tries=0; tries<420 && treeCount < 560; tries++){
  const rx = rr(-46,42), rz = rr(-72,72);
  if (!free(rx,rz,2.5)) continue;
  if (rz < -46 && rx > 14 || rz < -46 && rx < -16) continue;
  if (R() < 0.38) fruit(FB, rx, rz); else tree(FB, rx, rz, rr(.85,1.25)); treeCount++;
}
[[-11,64],[-7,67],[-3,64],[1,67],[-10,71],[-5,72],[0,71]].forEach(function(p){ fruit(FB, p[0], p[1]); });
/* ao longo do córrego e da via */
for (z=-72; z<=72; z+=5.5){ if ((z > -52 && z < -30) || (z > -24 && z < -8)) continue; tree(FB, 49.2, z+rr(-1,1), rr(.5,.65)); }

/* tufos: pequenos espinhos triangulares */
for (i=0; i<640; i++){
  const tx2 = rr(-48,42), tz2 = rr(-73,73); if (!free(tx2,tz2,0.5)) continue;
  for (let sp=0; sp<3; sp++) FB.cn(rr(.14,.2), rr(.5,.9), [K.tuft,0x58b238,0x3f8c26][sp], tx2+rr(-.3,.3), 0, tz2+rr(-.3,.3), 3);
}
/* flores */
for (i=0; i<240; i++){
  const fx = rr(-48,42), fz = rr(-73,73); if (!free(fx,fz,0.5)) continue;
  FB.cb(0.04, 0.5, 0x3f8c26, fx, 0, fz, 3); FB.ic(1, [0xffffff,0xffd23a,0xff7aa8,0xb583e6,0xff8a3a][i%5], fx, 0.6, fz, 0.17, 0.17, 0.17);
}
/* rochas e troncos caídos */
for (i=0; i<48; i++){ const kx = rr(-48,42), kz = rr(-73,73); if (!free(kx,kz,1)) continue; FB.ic(1, [K.rock,0xb7b4a8,0x8f8d86][i%3], kx, 0.3, kz, rr(.5,1.1), rr(.4,.7), rr(.5,1.1)); }

/* apiário: seis colmeias Langstroth e flores */
for (let cv=0; cv<6; cv++){
  const cx = 16.2 + (cv%3)*1.6;
  const cz = -57.5 + ((cv/3)|0)*2.6;
  FB.bb(0.7,0.5,0.1, K.woodD, cx, 0.0, cz); [0,1,2].forEach(function(l){ FB.bb(0.95,0.34,0.85, [0xf0d257,0xfff3b0,0xe3b23a][(l+cv)%3], cx, 0.5+l*0.36, cz); });
  FB.bb(1.05,0.12,0.95, 0xdfe3e6, cx, 1.58, cz); FB.bb(0.5,0.05,0.07, K.black, cx, 0.62, cz+0.45);
  FB.bb(0.7,0.14,0.5, K.woodD, cx, 0.0, cz+0.2);
}
for (i=0; i<14; i++) { FB.cb(0.04,0.8,0x3f8c26, rr(15.4,19.6), 0, rr(-60.5,-52.5), 3); }
FB.build(surface);


/* ================= ENGENHO 1850 · 22 × 10 m ================= */
const barnG = new THREE.Group(); barnG.position.set(32, 0, -38); surface.add(barnG);
const barnWalls = new THREE.Group(), barnRoofG = new THREE.Group(); barnG.add(barnWalls); barnG.add(barnRoofG);
const BH = 4.8, BTH = Math.atan2(3.6, 6.1);
col(21,-43,43,-42.2); col(21,-43,21.8,-33); col(42.2,-43,43,-33); col(21,-33.8,28.5,-33); col(33.5,-33.8,38,-33); col(39.4,-33.8,43,-33);   /* engenho: portão 5 m e porta de 1,4 m */
(function(){
  const W1 = new Batch();
  const R1 = new Batch();
  const I1 = new Batch();
  const U1 = new Batch();
  const glassC = 0x2a4a73;
  let i;
  let ly;
  /* paredes de pedra com 80 cm */
  W1.bb(22,BH,0.8,K.stone, 0,0,-4.6); W1.bb(0.8,BH,10,K.stone, -10.6,0,0); W1.bb(0.8,BH,10,K.stone, 10.6,0,0);
  W1.bb(7.5,BH,0.8,K.stone, -7.25,0,4.6); W1.bb(4.5,BH,0.8,K.stone, 3.75,0,4.6); W1.bb(3.6,BH,0.8,K.stone, 9.2,0,4.6);
  W1.bb(5.0,0.8,0.8,K.stone, -1,4.0,4.6); W1.bb(1.4,1.8,0.8,K.stone, 6.7,3.0,4.6);
  [1,2,3,4].forEach(function(y){
    W1.bb(22,0.09,0.05,K.stoneD, 0,y,-5.02); W1.bb(0.05,0.09,10,K.stoneD, -11.02,y,0); W1.bb(0.05,0.09,10,K.stoneD, 11.02,y,0);
    W1.bb(7.5,0.09,0.05,K.stoneD, -7.25,y,5.02); W1.bb(4.5,0.09,0.05,K.stoneD, 3.75,y,5.02); W1.bb(3.6,0.09,0.05,K.stoneD, 9.2,y,5.02);
  });
  for (i=0;i<5;i++) [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(c){ W1.bb(i%2 ? 1.1 : 0.8, 0.96, i%2 ? 0.8 : 1.1, K.stoneL, c[0]*10.7, i*0.96, c[1]*4.6); });
  /* janelas e portas */
  [[-7.25,5.02],[9.4,5.02]].forEach(function(p){ W1.bb(1.8,1.7,0.1,K.ocre, p[0],1.6,p[1]); W1.bb(1.5,1.4,0.12,glassC, p[0],1.75,p[1]+0.02); W1.bb(0.08,1.4,0.14,K.woodD, p[0],1.75,p[1]+0.03); });
  [-7,0,7].forEach(function(x){ W1.bb(1.8,1.7,0.1,K.ocre, x,1.8,-5.02); W1.bb(1.5,1.4,0.12,glassC, x,1.95,-5.03); });
  [-11.02,11.02].forEach(function(x){ [-2,2].forEach(function(z){ W1.bb(0.1,1.7,1.8,K.ocre, x,1.8,z); W1.bb(0.12,1.4,1.5,glassC, x,1.95,z); }); });
  W1.bb(0.5,4.0,1.1,K.woodD, -3.5,0,4.6); W1.bb(0.5,4.0,1.1,K.woodD, 1.5,0,4.6);
  W1.bb(1.3,2.9,0.2,K.wood, 6.7,0,4.75); W1.bb(0.12,2.9,0.26,K.woodD, 6.7,0,4.78); W1.bb(1.6,0.14,0.3,K.woodD, 6.7,2.9,4.76);
  W1.build(barnWalls);

  /* telhado de duas águas + 48 painéis solares na vertente frontal */
  const ridgeY = BH + 3.6, sn = Math.sin(BTH), cs = Math.cos(BTH), slopeLen = Math.hypot(6.1,3.6) + 0.3;
  [1,-1].forEach(function(sg){
    const tm = slopeLen/2 - 0.1;
    R1.add(GX.box, K.roof, 0, ridgeY - tm*sn + 0.0, sg*tm*cs, [24,0.3,slopeLen], [sg*BTH,0,0]);
    for (let t=0.6; t<slopeLen-0.3; t+=0.75){ R1.add(GX.box, K.roofD, 0, ridgeY - t*sn + 0.18*cs, sg*(t*cs + 0.18*sn), [24,0.05,0.09], [sg*BTH,0,0]); }
  });
  for (let pr=0; pr<3; pr++) for (let pc=0; pc<16; pc++){
    const t = 1.5 + pr*1.95, px = -9.6 + pc*1.28, d = 0.26;
    R1.add(GX.box, K.steel, px, ridgeY - t*sn + d*cs, t*cs + d*sn, [1.2,0.08,1.82], [BTH,0,0]);
    R1.add(GX.box, [0x2c5aa6,0x27509a][(pr+pc)%2], px, ridgeY - t*sn + (d+0.06)*cs, t*cs + (d+0.06)*sn, [1.1,0.06,1.7], [BTH,0,0]);
  }
  R1.bb(24.4,0.3,0.55,K.roofD, 0,ridgeY-0.02,0);
  const tri = new THREE.Shape(); tri.moveTo(-5.4,0); tri.lineTo(5.4,0); tri.lineTo(0,3.35);
  const gg = new THREE.ExtrudeGeometry(tri, {depth:0.8, bevelEnabled:false}); gg.translate(0,0,-0.4); gg.rotateY(Math.PI/2);
  R1.add(gg, K.stone, -10.6, BH, 0); R1.add(gg, K.stone, 10.6, BH, 0);
  R1.bb(1.4,5.2,1.4,K.stone, 7,BH-0.2,-2.5); R1.bb(1.8,0.3,1.8,K.stoneD, 7,BH+5.0,-2.5);
  R1.build(barnRoofG);

  /* interior: engenho de 1850 à esquerda, oficina moderna à direita */
  I1.bb(21.4,0.16,9.2, 0xcbc4b4, 0,0,0);
  I1.beam([-10.4,2.0,-3.2],[10.9,2.0,-3.2], 0.14, K.steel, 8);
  [-9,-4.5,0,4.5,9].forEach(function(x){ I1.bb(0.5,0.4,0.5,0xc8923a, x,1.8,-3.2); I1.bb(0.36,1.8,0.36,K.woodD, x,0.16,-3.7); });
  [-8,-4,2,6].forEach(function(x){ I1.add(cylG(1,16), K.woodL, x, 2.0, -3.2, [0.9,0.34,0.9], [0,0,Math.PI/2]); });
  [[-8,-8.2,-1.6],[-4,-5.0,-1.8],[2,-1.5,-1.8],[6,4.0,-3.2]].forEach(function(m){ I1.beam([m[0],1.7,-3.2],[m[1],0.9,m[2]], 0.05, K.black, 4); });
  /* serra de fita */
  I1.bb(0.5,3.4,1.3,K.steelD, -8.6,0.16,-1.6); I1.add(cylG(1,16), K.steel, -8.6, 3.0, -1.6, [0.9,0.18,0.9], [Math.PI/2,0,0]); I1.add(cylG(1,16), K.steel, -8.6, 0.8, -1.6, [0.9,0.18,0.9], [Math.PI/2,0,0]);
  I1.bb(0.05,2.2,0.1,K.black, -8.0,0.8,-1.6); I1.bb(3.0,0.16,2.2,K.woodL, -8.6,1.1,-0.6); I1.add(cylG(1,8), K.woodD, -8.6, 1.55, -0.6, [0.38,2.4,0.38], [0,0,Math.PI/2]);
  /* moenda de pedra de 80 cm */
  I1.bb(2.2,0.8,2.2,K.woodD, -4.2,0.16,-1.9); I1.cb(0.8,0.3,K.concD, -4.2,0.96,-1.9,18); I1.cb(0.72,0.3,0xb7b3a9, -4.2,1.26,-1.9,18);
  I1.add(coneG(4), K.wood, -4.2, 2.1, -1.9, [0.8,1.0,0.8], [Math.PI,Math.PI/4,0]);
  for (i=0;i<4;i++) I1.bb(0.5,0.6,0.4, [0xdcc590,0xd2b97f][i%2], -2.6+i*0.55, 0.16, -0.6);
  /* engenho de cana de 3 rolos (300 L/h) */
  I1.bb(2.4,0.35,1.8,K.woodD, -1.4,0.16,-2.0);
  [[-1.4,-1.4],[-0.6,-2.4],[-2.2,-2.4]].forEach(function(p){ I1.cb(0.3,1.5,0xc8923a, p[0],0.5,p[1],12); I1.cb(0.42,0.12,K.steel, p[0],2.0,p[1],10); });
  I1.beam([-3.3,0.5,-0.4],[-0.4,1.1,-0.9], 0.1, 0x7fb544, 5); I1.beam([-3.3,0.7,-0.2],[-0.4,1.3,-0.7], 0.1, 0x6aa238, 5); I1.beam([-3.3,0.9,-0.6],[-0.4,1.0,-1.1], 0.1, 0x93c654, 5);
  /* bomba de pistão duplo */
  [-9.3,-8.5].forEach(function(x){ I1.cb(0.36,1.3,K.red, x,0.16,2.6,10); I1.cb(0.07,1.1,K.steel, x,1.4,2.6,6); });
  I1.bb(1.4,0.14,0.14,K.steel, -8.9,2.5,2.6);
  /* forja de ferreiro com bigorna e fole */
  I1.bb(2.4,1.3,1.8,0xb5593b, -5.4,0.16,2.9); I1.cn(1.1,1.5,K.steelD, -5.4,1.46,2.9,4); I1.cb(0.22,2.0,K.steelD, -5.4,2.96,2.9,8);
  U1.bb(1.6,0.12,1.0,0xff8a1e, -5.4,1.46,2.9);
  I1.cb(0.38,0.8,K.woodD, -3.4,0.16,2.8,8); I1.bb(0.9,0.28,0.4,K.black, -3.4,0.96,2.8); I1.bb(0.3,0.2,0.3,K.black, -2.9,1.1,2.8);
  I1.bb(1.0,0.7,0.9,0x8a5a30, -7,0.16,1.8);
  /* elevador oculto (3 × 5 m, 4,5 t) sob a porta da garagem */
  I1.bb(3.0,0.1,5.0,K.yellow, -1,0.16,2.2); for (i=0;i<6;i++) I1.bb(3.0,0.12,0.38,K.black, -1, 0.16, -0.1 + i*0.9);
  /* oficina moderna: torno Nardini, fresadora, solda, prensa de 30 t, bancada */
  I1.bb(3.0,0.9,1.0,K.steelD, 4,0.16,-3.2); I1.bb(3.2,0.5,0.9,0x3d6b9e, 4,1.06,-3.2); I1.bb(0.8,0.9,0.9,0x2f5a8a, 2.8,1.56,-3.2);
  I1.cb(0.3,0.5,K.steel, 2.5,1.8,-3.2,10,0.3,[0,0,Math.PI/2]); I1.bb(0.5,0.6,0.5,K.steel, 5.5,1.56,-3.2);
  I1.bb(1.2,0.4,1.2,0x2f9a58, 7.2,0.16,-3.2); I1.bb(0.5,2.4,0.5,0x2f9a58, 7.2,0.56,-3.6); I1.bb(0.9,0.6,1.2,0x2f9a58, 7.2,2.8,-3.1); I1.bb(1.5,0.2,1.0,K.steel, 7.2,1.5,-2.9);
  I1.bb(2.4,0.18,1.3,K.steelD, 8,1.0,-0.6); [[-1,-0.5],[1,-0.5],[-1,0.5],[1,0.5]].forEach(function(l){ I1.bb(0.16,0.9,0.16,K.steelD, 8+l[0],0.16,-0.6+l[1]); });
  I1.bb(0.9,1.0,0.9,K.red, 9.4,0.16,0.6); I1.beam([9.0,1.0,0.4],[8.0,1.4,-0.6], 0.05, K.black, 4);
  [[7.6,1.3,-0.6,0.16,0xffffff],[7.9,1.45,-0.5,0.12,0x9fe3ff],[7.3,1.35,-0.8,0.1,0xfff0a0],[8.0,1.5,-0.7,0.1,0xffffff],[7.7,1.55,-0.9,0.08,0xffd23a]].forEach(function(s){ U1.add(GX.ico0, s[4], s[0], s[1], s[2], s[3]); });
  [4.4,6.0].forEach(function(x){ I1.bb(0.28,2.8,0.28,K.red, x,0.16,1.4); });
  I1.bb(2.0,0.4,0.4,K.red, 5.2,2.6,1.4); I1.cb(0.22,1.0,K.steel, 5.2,1.6,1.4,8); I1.bb(1.6,0.2,0.7,K.red, 5.2,0.16,1.4);
  I1.bb(2.6,0.14,1.3,K.woodL, 7.2,1.1,3.7); [[-1.1,-0.5],[1.1,-0.5],[-1.1,0.5],[1.1,0.5]].forEach(function(l){ I1.bb(0.12,0.95,0.12,K.woodD, 7.2+l[0],0.16,3.7+l[1]); });
  I1.bb(0.8,0.5,0.1,K.black, 6.6,1.24,3.3); U1.bb(0.7,0.4,0.02,0x44ffb0, 6.6,1.3,3.36); I1.bb(0.4,0.04,0.3,0x2fa05a, 7.4,1.24,3.8); I1.bb(0.3,0.04,0.25,0x2fa05a, 7.9,1.24,3.5);
  I1.bb(1.0,0.5,0.6,K.red, 9.8,0.16,-3.8); I1.bb(1.0,0.5,0.6,K.red, 9.8,0.66,-3.8); I1.bb(1.0,0.5,0.6,K.red, 8.7,0.16,-3.8);
  I1.bb(1.0,0.5,0.6,K.red, 9.5,0.16,3.0); I1.bb(1.0,0.5,0.6,K.red, 9.5,0.66,3.0); I1.bb(0.5,0.12,0.12,K.steel, 9.5,1.2,3.0);
  I1.build(barnG); U1.build(barnG, {unlit:true, outline:false});
})();

/* ================= CASA GRANDE · SOBRADO IMPERIAL REFORMADO · 26 × 20 m (2 pavimentos + porão alto) =================
   Tipologia (INEPAC / fazendas do Vale do Café): sobrado de planta retangular sobre porão alto de pedra, esteios de madeira e pau-a-pique,
   corpo central com frontão triangular, escadaria monumental de mármore com espelhos de azulejo e gradil de ferro, portas-janela com guarda-corpo de ferro,
   capela e escritório ladeando o hall, escada interna que se bifurca em social e serviço, sala central no sobrado, telhado de quatro águas em capa e canal. */
const casaG = new THREE.Group(); casaG.position.set(1, 0, -58); surface.add(casaG);
const flrMat = toonMat.clone();
let casaBaseMesh; const casaWalls = new THREE.Group(), casaRoofG = new THREE.Group(), casaUp = new THREE.Group(), casaUpW = new THREE.Group();
casaG.add(casaWalls); casaG.add(casaRoofG); casaG.add(casaUp); casaUp.add(casaUpW);
const GF = 1.0, GHT = 3.8, UF = 5.0, UHT = 3.6, CH = UF;      /* piso térreo, pé-direito térreo, piso do sobrado, pé-direito do sobrado */
const casaUpY = UF; casaUp.position.y = UF;
const roofMat = toonMat.clone(); roofMat.side = THREE.DoubleSide;
function hipGeo(W,D,h){
  const L = W - D, hw = W/2, hd = D/2, hl = L/2;
  const A=[-hw,0,-hd], B=[hw,0,-hd], Cc=[hw,0,hd], Dd=[-hw,0,hd], P=[-hl,h,0], Q=[hl,h,0];
  const tris = [Dd,Cc,Q, Dd,Q,P, B,A,P, B,P,Q, Cc,B,Q, A,Dd,P], pos = [];
  tris.forEach(function(v){ pos.push(v[0],v[1],v[2]); });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.computeVertexNormals(); return g;
}
const CW = 0xe8bf63, CWD = 0xd9a94a, WHT = K.cal, IRON = 0x2a2d31, MARB = 0xf1f0ea, AZB = 0x2f5fa8, AZW = 0xf4f7fb, TERRA = 0xc9724a;
function ccol(x1,z1,x2,z2,lv){ col(x1+1, z1-58, x2+1, z2-58, lv); }       /* colisão em coordenadas locais da casa */
/* parede com vãos: eixo 'x' (ao longo de x, em z=fixed) ou 'z'. gaps [a,b,sill,top] (alturas a partir de y0) */
function wall(B, axis, fixed, lo, hi, gaps, y0, h, th, color, lv, deco){
  function box(a,b,ya,yb){ if (b-a < 0.02 || yb-ya < 0.02) return; if (axis === 'x') B.bb(b-a, yb-ya, th, color, (a+b)/2, y0+ya, fixed); else B.bb(th, yb-ya, b-a, color, fixed, y0+ya, (a+b)/2); }
  function cl(a,b){ if (!lv) return; if (axis === 'x') ccol(a, fixed-th/2, b, fixed+th/2, lv); else ccol(fixed-th/2, a, fixed+th/2, b, lv); }
  let cur = lo; gaps = (gaps || []).slice().sort(function(p,q){ return p[0]-q[0]; });
  gaps.forEach(function(g){
    const sill = g[2] || 0, top = g[3] || h;
    box(cur, g[0], 0, h); cl(cur, g[0]);
    if (sill > 0){ box(g[0], g[1], 0, sill); cl(g[0], g[1]); }
    box(g[0], g[1], top, h);
    if (deco){
      const m = (g[0]+g[1])/2, w = g[1]-g[0], hh = top - sill;
      if (axis === 'x'){ const s = deco, hf = th/2;
        B.bb(w+0.5,0.22,th+0.16,WHT, m,y0+top-0.04,fixed);                                   /* verga (desce 4 cm: cobre a face inferior da parede) */
        B.bb(w+0.4,0.15,th+0.2,WHT, m,y0+sill-0.12,fixed);                                    /* peitoril (topo 3 cm acima do muro) */
        B.bb(w,hh-0.05,0.06,0x2a4a73, m,y0+sill+0.01,fixed);                                  /* vidro */
        B.bb(0.16,hh-0.02,th+0.12,WHT, g[0]-0.02,y0+sill+0.01,fixed); B.bb(0.16,hh-0.02,th+0.12,WHT, g[1]+0.02,y0+sill+0.01,fixed);   /* ombreiras */
        B.bb(0.06,hh-0.06,0.08,K.woodD, m,y0+sill+0.03,fixed+0.05*s);                         /* montante */
        B.add(GX.box, WHT, m, y0+top+0.22+0.18, fixed, [w+0.3,0.36,th+0.1], [0,0,0]);          /* cornija */
        const sz2 = fixed+(hf+0.06)*s;
        B.bb(w*0.4,hh-0.2,0.1,0x2f5a3a, g[0]-w*0.2-0.1,y0+sill+0.1,sz2); B.bb(w*0.4,hh-0.2,0.1,0x2f5a3a, g[1]+w*0.2+0.1,y0+sill+0.1,sz2);   /* venezianas */
      }
    }
    cur = g[1];
  });
  box(cur, hi, 0, h); cl(cur, hi);
}
(function(){
  const W2 = new Batch();
  const R2 = new Batch();
  const I2 = new Batch();
  const U2 = new Batch();
  const P2 = new Batch();
  const UW = new Batch();
  const UI = new Batch();
  const UU = new Batch();
  const UP = new Batch();
  const BS = new Batch();
  let i;
  let j;
  let k;
  let x;
  let z;
  const Y0 = GF, H = GHT;
  /* ---------- térreo: porão alto de pedra, paredes ocre, cunhais e cimalha brancos ---------- */
  BS.bb(26.8,GF-0.2,20.8,K.stone, 0,0,0);
  for (i=0;i<4;i++) BS.bb(26.9,0.05,20.9,K.stoneD, 0,0.2+i*0.18,0);
  [-9.5,-6.5,-3.5,3.5,6.5,9.5].forEach(function(px){ W2.bb(0.6,0.44,0.16,0x1a1c20, px,0.3,10.46); });          /* respiros gradeados do porão */
  /* paredes externas */
  wall(W2,'x',-10,-13,13,[[-9,-7.2,0.9,2.9],[-3.9,-2.1,0.9,2.9],[2.1,3.9,0.9,2.9],[7.2,9,0.9,2.9]],Y0,H,0.5,CW,'s',-1);
  wall(W2,'z',-13,-10,10,[[-6,-4.2,0.9,2.9],[-1,0.8,0.9,2.9],[4.2,6,0.9,2.9]],Y0,H,0.5,CW,'s',1);
  wall(W2,'z',13,-10,10,[[-6,-4.2,0.9,2.9],[-1,0.8,0.9,2.9],[4.2,6,0.9,2.9]],Y0,H,0.5,CW,'s',1);
  wall(W2,'x',10,-13,13,[[-11.4,-9.6,0.9,2.9],[-3.8,-2.6,0.9,2.9],[-1.3,1.3,0,3.4],[2.6,3.8,0.9,2.9],[9.6,11.4,0.9,2.9]],Y0,H,0.5,CW,'s',1);
  /* cunhais e cimalha */
  [[-13,-10],[13,-10],[-13,10],[13,10]].forEach(function(c){ W2.bb(0.9,H+0.2,0.9,WHT, c[0],GF-0.2,c[1]); W2.bb(1.0,0.22,1.0,K.stoneL, c[0],GF+H-0.2,c[1]); });
  W2.bb(26.7,0.32,0.7,WHT, 0,GF+H-0.28,10.1); W2.bb(26.7,0.32,0.7,WHT, 0,GF+H-0.28,-10.1); W2.bb(0.7,0.32,20.6,WHT, 13.1,GF+H-0.28,0); W2.bb(0.7,0.32,20.6,WHT, -13.1,GF+H-0.28,0);
  /* paredes internas (0,3 m) */
  const T = 0.3;
  wall(W2,'x',2,-13,-7,[],Y0,H-0.04,T,WHT,'s'); wall(W2,'x',2,-7,13,[[-1.2,1.2,0,3.2]],Y0,H-0.04,T,WHT,'s');
  /* desenho da planta: capela | hall | escritório; sala de visitas e jantar ao centro; cozinha, copa e serviço nas alas */
  wall(W2,'z',-7,-10,10,[[5,6.4,0,3.0],[-7,-5.6,0,3.0],[-0.4,0.8,0,3.0]],Y0,H-0.04,T,WHT,'s');
  wall(W2,'z',7,-10,10,[[5,6.4,0,3.0],[-7,-5.8,0,3.0],[-2.5,-1.2,0,3.0]],Y0,H-0.04,T,WHT,'s');
  wall(W2,'x',-4,-7,7,[[-2.5,2.5,0,3.2]],Y0,H-0.04,T,WHT,'s');
  wall(W2,'x',-1,-13,-7,[[-10,-8.8,0,3.0]],Y0,H-0.04,T,WHT,'s'); wall(W2,'x',-3,7,13,[],Y0,H-0.04,T,WHT,'s');
  W2.build(casaWalls);
  /* ---------- pisos térreo (não se sobrepõem): ladrilho hidráulico, tábua corrida, mármore ---------- */
  function fl(x1,z1,x2,z2,c){ BS.bb(x2-x1,0.2,z2-z1,c, (x1+x2)/2,GF-0.2,(z1+z2)/2); }
  fl(-13,2,-7,10,0xcdb08a); fl(-7,2,7,10,MARB); fl(7,2,13,10,0x7a4a2a); fl(-13,-1,-7,2,0xe6d6b0); fl(-13,-10,-7,-1,TERRA);
  fl(-7,-4,7,2,0x8a5a32); fl(-7,-10,7,-4,0x8a5a32); fl(7,-3,13,2,0x3b6ea5); fl(7,-10,13,-3,K.concD);
  casaBaseMesh = BS.build(casaG, {mat:flrMat, outline:false});
  for (i=0;i<7;i++) for (j=0;j<8;j++) if ((i+j)%2) I2.bb(1.96,0.03,0.96,0x3d3d44, -6+i*2,GF,2.5+j*0.9*1.0);            /* xadrez de mármore no hall (peças pretas) */
  /* escada interna: lance único que sobe do hall ao sobrado */
  for (i=0;i<24;i++){ const sh = GF + (i+1)*(UF-GF)/24; I2.bb(2.0, sh-GF+0.0, 0.275, [MARB,0xe4e2d8][i%2], 0, GF, 9.4-(i+0.5)*0.275); }
  [-1.05,1.05].forEach(function(sx){ I2.beam([sx,GF+0.9,9.6],[sx,UF+0.9,2.8], 0.04, IRON, 5); for (i=0;i<=24;i+=2) I2.bb(0.05,0.9,0.05,IRON, sx,GF+i*(UF-GF)/24,9.4-i*0.275); });
  /* capela: altar de madeira entalhada e dourada, tapete, bancos */
  I2.bb(3.0,0.3,1.2,K.woodD, -10,GF,3.0); I2.bb(2.6,2.4,0.4,K.woodD, -10,GF,2.4); I2.bb(2.2,2.0,0.1,0xd4a24a, -10,GF+0.2,2.65); I2.bb(0.3,0.9,0.3,0xd4a24a, -10,GF+2.4,2.4);
  I2.bb(1.1,0.03,5,0xa83a2a, -10,GF,6.2); for (i=0;i<3;i++){ I2.bb(2.8,0.5,0.6,K.woodL, -10,GF,5.2+i*1.3); I2.bb(2.8,0.5,0.1,K.woodD, -10,GF+0.5,5.0+i*1.3); }
  /* hall: bancos de ferro, relógio de pé, quadros (molduras) */
  I2.bb(0.6,2.2,0.4,K.woodD, 5.6,GF,2.4); I2.bb(0.4,0.5,0.1,0xd4a24a, 5.6,GF+1.2,2.62); I2.bb(1.4,0.5,0.5,IRON, -4.5,GF,9.3); I2.bb(1.4,0.1,0.55,K.woodL, -4.5,GF+0.5,9.3);
  [[-5,2.2],[-3,2.2],[3,2.2]].forEach(function(q,n){ I2.bb(1.0,1.3,0.06,K.woodD, q[0],GF+1.4,q[1]+0.2); I2.bb(0.82,1.1,0.04,[0x4a6b8f,0x8f6b4a,0x5f8f5a][n], q[0],GF+1.5,q[1]+0.24); });
  /* sala de jantar: mesa para 14, cadeiras, aparador */
  I2.bb(6.0,0.12,1.8,K.woodD, 0,GF+0.76,-7.4); [[-2.8,-8.1],[2.8,-8.1],[-2.8,-6.7],[2.8,-6.7]].forEach(function(l){ I2.bb(0.18,0.76,0.18,K.woodD, l[0],GF,l[1]); });
  for (i=0;i<7;i++){ I2.bb(0.45,0.5,0.45,K.woodL, -2.7+i*0.9,GF,-8.5); I2.bb(0.45,0.5,0.45,K.woodL, -2.7+i*0.9,GF,-6.3); I2.bb(0.45,0.55,0.06,K.woodD, -2.7+i*0.9,GF+0.5,-8.75); }
  I2.bb(3.4,0.9,0.5,K.woodD, 0,GF,-9.6); I2.bb(3.5,0.06,0.55,MARB, 0,GF+0.9,-9.6);
  [[-1.2],[0],[1.2]].forEach(function(c){ I2.bb(0.5,0.4,0.2,0xd4a24a, c[0],GF+1.4,-9.7); });
  /* sala de visitas: sofá, poltronas, tapete, piano */
  I2.cb(2.0,0.03,0xa83a2a, 0,GF,-1,22); I2.bb(3.0,0.55,0.9,0x6b2f2a, 0,GF,-2.9); I2.bb(3.0,0.6,0.25,0x6b2f2a, 0,GF+0.5,-3.3); I2.bb(1.2,0.4,0.8,K.woodD, 0,GF,-0.8);
  [[-3.6,-0.5],[3.6,-0.5]].forEach(function(p){ I2.bb(0.9,0.5,0.9,0x2f5a3a, p[0],GF,p[1]); I2.bb(0.9,0.5,0.2,0x2f5a3a, p[0],GF+0.4,p[1]-0.4); });
  I2.bb(1.6,0.9,0.7,0x1a1c20, 5.3,GF,0.8); I2.bb(1.7,0.06,0.9,K.woodD, 5.3,GF+0.9,0.8);
  /* cozinha de serviço: fogão a lenha de ferro com coifa, bancada, pia, mesa, azulejos portugueses nas paredes */
  I2.bb(0.06,1.6,10.8, AZW, -12.72,GF+0.9,-5.6); for (i=0;i<9;i++) I2.bb(0.07,0.4,0.4, AZB, -12.7,GF+0.9+(i%4)*0.4,-10.4+i*1.2);
  I2.bb(2.2,1.0,1.1,IRON, -11.4,GF,-9.2); I2.cn(1.0,1.0,IRON, -11.4,GF+1.0,-9.2,4,[0,Math.PI/4,0]); I2.cb(0.2,1.8,IRON, -11.4,GF+2.0,-9.2,8); U2.bb(0.8,0.25,0.04,0xff8a1e, -11.4,GF+0.55,-8.62);
  I2.bb(0.7,0.9,4.5,K.woodL, -12.3,GF,-4.8); I2.bb(0.75,0.06,4.6,0xefe6d2, -12.3,GF+0.9,-4.8); I2.bb(0.5,0.12,0.9,K.steel, -12.3,GF+0.94,-4.2);
  I2.bb(2.6,0.14,1.4,K.wood, -9.6,GF+0.75,-5.0); [[-1.1,-0.5],[1.1,-0.5],[-1.1,0.5],[1.1,0.5]].forEach(function(l){ I2.bb(0.14,0.75,0.14,K.woodD, -9.6+l[0],GF,-5.0+l[1]); });
  for (i=0;i<5;i++) I2.cb(0.12,0.2,K.copper, -12.4+0.0,GF+2.1,-9.5+i*0.5,6);
  /* copa (balcão de passa-pratos) */
  I2.bb(0.8,0.95,2.4,K.woodD, -12.4,GF,0.5); I2.bb(2.5,0.9,0.8,K.woodL, -8.5,GF,0.6);
  /* despensa de catástrofe (42 m²): prateleiras, barris, galões, freezer */
  function jarc(k){ return [0xd9534f,0xe8b04a,0x7bb661,0xf0e0b0,0x8e5fb0,0xc27a3a][k%6]; }
  function sItem(B,x,y,z,k){ const m = k%5; if (m === 0 || m === 3) B.cb(0.12,0.3,jarc(k), x,y,z,6); else if (m === 1) B.cb(0.09,0.2,K.steel, x,y,z,6); else if (m === 2) B.bb(0.34,0.24,0.3,0xe2c47c, x,y,z); else B.bb(0.3,0.3,0.3,[K.woodL,0xe9c86a,0xb5593b][k%3], x,y,z); }
  function shelfX(B,x1,x2,z,y0,t){ const L = x2-x1, n = Math.floor(L/0.5), nu = Math.max(1,Math.round(L/1.5)); for (let a=0;a<3;a++){ B.bb(L,0.06,0.5,K.woodL, (x1+x2)/2,y0+0.55+a*0.7,z); for (let b=0;b<n;b++) sItem(B,x1+0.25+b*0.5,y0+0.61+a*0.7,z,b+a*2+(t||0)); } for (let c=0;c<=nu;c++) B.bb(0.08,2.3,0.54,K.woodD, x1+c*L/nu,y0,z); }
  function shelfZ(B,z1,z2,x,y0,t){ const L = z2-z1, n = Math.floor(L/0.5), nu = Math.max(1,Math.round(L/1.5)); for (let a=0;a<3;a++){ B.bb(0.5,0.06,L,K.woodL, x,y0+0.55+a*0.7,(z1+z2)/2); for (let b=0;b<n;b++) sItem(B,x,y0+0.61+a*0.7,z1+0.25+b*0.5,b+a*3+(t||0)); } for (let c=0;c<=nu;c++) B.bb(0.54,2.3,0.08,K.woodD, x,y0,z1+c*L/nu); }
  shelfX(I2,7.4,12.7,-9.6,GF); shelfZ(I2,-9.4,-3.4,7.4,GF); shelfZ(I2,-9.4,-3.4,12.7,GF,2);
  [[9.0,-6.8],[10.0,-6.8],[9.0,-5.6],[10.0,-5.6]].forEach(function(b){ I2.cb(0.45,0.9,K.wood, b[0],GF,b[1],10,0.42); I2.cb(0.47,0.06,K.steelD, b[0],GF+0.45,b[1],10); });
  for (i=0;i<12;i++) { I2.cb(0.22,0.5,0x4a8fc4, 8.4+(i%4)*0.5,GF,-4.6+((i/4)|0)*0.5,8); }
  I2.bb(2.0,0.85,0.8,K.white, 11.4,GF,-5.0); I2.bb(2.05,0.08,0.85,K.steel, 11.4,GF+0.85,-5.0);
  /* banheiros coletivos (azulejo azul e branco, louças) */
  function toilet(B,x,y,z,ry){ B.at(x,0,z,ry||0); B.bb(0.42,0.42,0.6,K.white, 0,y,0); B.bb(0.4,0.55,0.2,K.white, 0,y,-0.38); B.bb(0.44,0.05,0.5,K.steel, 0,y+0.42,0.02); B.at(0,0,0,0); }
  function sink(B,x,y,z,ry){ B.at(x,0,z,ry||0); B.cb(0.1,0.7,K.white, 0,y,0,6); B.bb(0.65,0.14,0.48,K.white, 0,y+0.7,0); B.cb(0.035,0.3,K.steel, 0,y+0.84,-0.17,5); B.bb(0.7,0.7,0.04,0x9bd9f1, 0,y+1.3,-0.3); B.at(0,0,0,0); }
  function shower(B,x,y,z){ B.bb(1.1,0.08,1.1,0xeaf3f7, x,y,z); B.cb(0.03,1.9,K.steel, x+0.5,y,z-0.5,5); B.bb(0.3,0.05,0.3,K.steel, x+0.4,y+1.85,z-0.45); B.bb(0.04,1.9,1.1,0xbfe3f3, x-0.55,y,z); }
  /* chuveiro orientado: haste e ducha no lado (x - sx*0.5, z + sz*0.5), vidro do lado oposto em x */
  function shower2(B,x,y,z,sx,sz){ B.bb(1.1,0.08,1.1,0xeaf3f7, x,y,z); B.cb(0.03,1.9,K.steel, x-sx*0.5,y+0.08,z+sz*0.5,5); B.bb(0.3,0.05,0.3,K.steel, x-sx*0.38,y+1.85,z+sz*0.45); B.bb(0.04,1.9,1.1,0xbfe3f3, x+sx*0.55,y+0.08,z); }
  I2.bb(0.06,1.5,4.8, AZB, 12.72,GF,-0.5); I2.bb(0.06,0.48,4.8, AZW, 12.7,GF+1.01,-0.5);
  toilet(I2,8.0,GF,1.35,Math.PI); toilet(I2,9.4,GF,1.35,Math.PI); sink(I2,10.8,GF,1.5,Math.PI); sink(I2,12.1,GF,1.5,Math.PI); shower2(I2,8.6,GF,-2.2,1,-1); shower2(I2,11.0,GF,-2.2,1,-1);
  /* escritório: escrivaninha, estante, mapa */
  I2.bb(2.2,0.1,1.0,K.woodD, 10.0,GF+0.76,8.6); I2.bb(2.2,0.76,0.12,K.woodD, 10.0,GF,8.2); I2.bb(0.5,0.5,0.5,K.woodL, 10.0,GF,7.6); shelfZ(I2,3.2,6.6,12.7,GF,4);
  I2.bb(1.6,1.1,0.05,0xe8d9b0, 10.0,GF+1.2,9.7);
  I2.build(casaG); U2.build(casaG, {unlit:true, outline:false});

  /* ---------- sobrado: paredes, balcão de ferro, 6 suítes, sala central ---------- */
  UW.bb(26.7,0.2,0.0,K.black, 0,-9,0);                                                               /* (sem efeito) */
  wall(UW,'x',-10,-13,13,[[-9,-7.2,0.9,3.0],[-3.9,-2.1,0.9,3.0],[2.1,3.9,0.9,3.0],[7.2,9,0.9,3.0]],0,UHT,0.5,CW,'a',-1);
  wall(UW,'z',-13,-10,10,[[-6,-4.2,0.9,3.0],[-1,0.8,0.9,3.0],[4.2,6,0.9,3.0]],0,UHT,0.5,CW,'a',1);
  wall(UW,'z',13,-10,10,[[-6,-4.2,0.9,3.0],[-1,0.8,0.9,3.0],[4.2,6,0.9,3.0]],0,UHT,0.5,CW,'a',1);
  /* fachada do sobrado: 8 portas-janela até o chão, com balcão corrido */
  wall(UW,'x',10,-13,13,[[-11.9,-10.3,0,3.1],[-9.2,-7.6,0,3.1],[-6.5,-4.9,0,3.1],[-3.8,-2.2,0,3.1],[2.2,3.8,0,3.1],[4.9,6.5,0,3.1],[7.6,9.2,0,3.1],[10.3,11.9,0,3.1]],0,UHT,0.5,CW,'a',1);
  [[-13,-10],[13,-10],[-13,10],[13,10]].forEach(function(c){ UW.bb(0.9,UHT+0.02,0.9,WHT, c[0],0,c[1]); });
  UW.bb(26.7,0.34,0.7,WHT, 0,UHT-0.3,10.1); UW.bb(26.7,0.34,0.7,WHT, 0,UHT-0.3,-10.1); UW.bb(0.7,0.34,20.6,WHT, 13.1,UHT-0.3,0); UW.bb(0.7,0.34,20.6,WHT, -13.1,UHT-0.3,0);
  [-11.1,-8.4,-5.7,-3.0,3.0,5.7,8.4,11.1].forEach(function(px){ UW.bb(2.0,0.18,0.14,WHT, px,3.1,10.34); UW.add(GX.box, WHT, px,3.1+0.18+0.2,10.34,[2.0,0.4,0.1],[0,0,0]); UW.bb(0.9,0.9,0.08,0x2a4a73, px,0.0,10.28); });
  /* partições do sobrado */
  wall(UW,'x',2.5,-13,-2,[[-9.2,-7.9,0,2.9],[-4.8,-3.5,0,2.9]],0,UHT-0.04,T,WHT,'a'); wall(UW,'x',2.5,2,13,[[3.5,4.8,0,2.9],[7.9,9.2,0,2.9]],0,UHT-0.04,T,WHT,'a');
  wall(UW,'z',-7.5,2.5,10,[],0,UHT-0.04,T,WHT,'a'); wall(UW,'z',-2,2.5,10,[],0,UHT-0.04,T,WHT,'a'); wall(UW,'z',2,2.5,10,[],0,UHT-0.04,T,WHT,'a'); wall(UW,'z',7.5,2.5,10,[],0,UHT-0.04,T,WHT,'a');
  wall(UW,'x',-1,-13,-4,[[-9.8,-8.4,0,2.9]],0,UHT-0.04,T,WHT,'a'); wall(UW,'x',-1,4,13,[[8.4,9.8,0,2.9]],0,UHT-0.04,T,WHT,'a');
  wall(UW,'z',-4,-10,-1,[],0,UHT-0.04,T,WHT,'a'); wall(UW,'z',4,-10,-1,[],0,UHT-0.04,T,WHT,'a');

  /* banheiros privativos 2,4 x 2,4 m: cantos das suítes, paredes com porta, louças junto à parede do corredor, ducha ao fundo */
  function pbath(xo,sx,zw,sz,dz){
    const xi = xo + sx*2.55, zf = zw + sz*2.55;
    wall(UW,'x',zf, Math.min(xo-sx*0.15,xi+sx*0.15), Math.max(xo-sx*0.15,xi+sx*0.15), [], 0,UHT-0.04,T,WHT,'a');
    wall(UW,'z',xi, Math.min(zw,zf), Math.max(zw,zf), [[Math.min(zw+sz*dz[0],zw+sz*dz[1]), Math.max(zw+sz*dz[0],zw+sz*dz[1]), 0, 2.4]], 0,UHT-0.04,T,WHT,'a');
    const ry = sz>0 ? 0 : Math.PI;
    toilet(UI,xo+sx*0.45,0.04,zw+sz*0.5,ry); sink(UI,xo+sx*1.5,0.04,zw+sz*0.35,ry);
    UI.bb(2.38,0.04,2.38,0xeaf3f7, xo+sx*1.2,0.04,zw+sz*1.2);                                    /* piso de ladrilho branco */
    shower2(UI,xo+sx*0.7,0.08,zw+sz*1.7,sx,sz);
    UI.bb(0.06,1.4,2.3, AZB, xo+sx*0.04,0.08,zw+sz*1.2);                                          /* azulejo na parede externa */
  }
  pbath(-12.75,1,2.65,1,[0.7,1.6]); pbath(-7.35,1,2.65,1,[0.7,1.6]); pbath(7.35,-1,2.65,1,[0.7,1.6]); pbath(12.75,-1,2.65,1,[0.7,1.6]); pbath(-12.75,1,-1.15,-1,[0.7,1.6]); pbath(12.75,-1,-1.15,-1,[0.7,1.6]);
  UW.build(casaUpW);
  /* laje do sobrado com o vão da escada (x -1,1…1,1 · z 2,8…9,8) e balcão de ferro fundido */
  UI.bb(12.2,0.2,20.6,K.woodD, -7.2,-0.2,0); UI.bb(12.2,0.2,20.6,K.woodD, 7.2,-0.2,0); UI.bb(2.2,0.2,13.1,K.woodD, 0,-0.2,-3.75); UI.bb(2.2,0.2,0.5,K.woodD, 0,-0.2,10.05);
  UI.bb(27.2,0.2,2.0,K.woodD, 0,-0.2,11.4); UI.bb(27.2,0.12,0.2,IRON, 0,0.0,12.4);
  for (i=0;i<=54;i++) UI.bb(0.05,1.0,0.05,IRON, -13.5+i*0.5,0,12.4); UI.bb(27.2,0.07,0.1,IRON, 0,1.0,12.4); UI.bb(27.2,0.05,0.07,IRON, 0,0.5,12.4);
  for (i=0;i<=26;i++) if (i%3===0) UI.ic(0.14,IRON, -13+i,1.15,12.4,1,1,1);                         /* rebites grossos */
  [-13.5,13.5].forEach(function(px){ UI.bb(0.22,1.0,0.22,IRON, px,0,12.4); }); [-9.5,-3.2,3.2,9.5].forEach(function(px){ UI.bb(0.24,1.0,0.24,IRON, px,0,12.4); });
  [-1.1,1.1].forEach(function(sx){ UI.bb(0.06,1.0,7.0,IRON, sx,0,6.3); }); UI.bb(2.2,0.06,0.06,IRON, 0,1.0,9.8);
  /* chão do sobrado: tábua larga e ladrilho; cada peça sem sobreposição */
  function uf(x1,z1,x2,z2,c){ UI.bb(x2-x1,0.04,z2-z1,c, (x1+x2)/2,0,(z1+z2)/2); }
  uf(-13,2.5,-7.5,10,0x7a4a2a); uf(-7.5,2.5,-2,10,0x7a4a2a); uf(2,2.5,7.5,10,0x7a4a2a); uf(7.5,2.5,13,10,0x7a4a2a);
  uf(-13,-1,13,2.5,TERRA); uf(-13,-10,-4,-1,0x7a4a2a); uf(-4,-10,4,-1,0x8a5a32); uf(4,-10,13,-1,0x7a4a2a); uf(-2,2.5,-1,10,0x7a4a2a); uf(1,2.5,2,10,0x7a4a2a); uf(-1,9.8,1,10,0x7a4a2a);
  function bedU(bx,bz,c){ UI.bb(2.0,0.5,2.2,K.woodD, bx,0.04,bz); UI.bb(1.9,0.28,2.1,0xf4efe2, bx,0.54,bz); UI.bb(1.9,0.12,1.3,c, bx,0.82,bz+0.4); UI.bb(1.4,0.18,0.5,K.white, bx,0.82,bz-0.8); UI.bb(2.1,1.3,0.14,K.woodD, bx,0.04,bz-1.15); UI.bb(0.5,0.45,0.5,K.woodL, bx+1.5,0.04,bz-0.8); }
  function wardrobe(wx,wz,wrot){ UI.at(wx,0,wz,wrot||0); UI.bb(1.6,2.3,0.6,K.woodD, 0,0.04,0); UI.bb(0.03,2.0,0.05,0xd4a24a, 0,0.2,0.32); UI.at(0,0,0,0); }
  /* suítes de frente (A, B, C, D) */
  const sc = [0x4a8fc4,0xd96a5a,0x6aa84f,0xc07bff,0xe8b04a,0x4a8fc4];
  bedU(-10.2,6.8,sc[0]); wardrobe(-7.95,5.4,-Math.PI/2); bedU(-4.7,6.8,sc[1]); wardrobe(-2.45,5.4,-Math.PI/2); bedU(4.7,6.8,sc[2]); wardrobe(2.45,5.4,Math.PI/2); bedU(10.2,6.8,sc[3]); wardrobe(7.95,5.4,Math.PI/2);
  /* suítes dos fundos (E, F) e sala íntima central */
  bedU(-8.2,-6.5,sc[4]); wardrobe(-11.0,-9.45,0); bedU(8.2,-6.5,sc[5]); wardrobe(11.0,-9.45,0);
  UI.cb(2.4,0.03,0xc4503a, 0,0.04,-5.5,22); UI.bb(2.8,0.55,0.9,0x2f6cb8, 0,0.04,-8.4); UI.bb(2.8,0.6,0.25,0x2f6cb8, 0,0.5,-8.8); UI.bb(1.2,0.4,0.8,K.woodD, 0,0.04,-5.5);
  [[-2.4,-6],[2.4,-6]].forEach(function(p){ UI.bb(0.9,0.5,0.9,0x2f5a3a, p[0],0.04,p[1]); });
  /* lustres de ferro e lampiões */
  [[-8,6],[8,6],[0,-5],[0,0.7]].forEach(function(p){ UI.cb(0.03,1.0,IRON, p[0],UHT-1.0,p[1],4); UI.cb(0.4,0.06,IRON, p[0],UHT-1.05,p[1],10); UU.ic(0.14,0xffe9a6, p[0],UHT-1.1,p[1],1,1,1); });
  UI.build(casaUp); UU.build(casaUp, {unlit:true, outline:false});

  /* ---------- varanda térrea, colunas e escadaria de mármore com espelhos de azulejo e gradil de ferro ---------- */
  P2.bb(26.8,GF-0.2,3.4,K.stone, 0,0,11.9); P2.bb(26.8,0.2,3.4,MARB, 0,GF-0.2,11.9);
  for (i=0;i<=8;i++){ const cx = -12 + i*3.0; if (Math.abs(cx) < 0.1) continue; P2.cb(0.28,UF-GF-0.12,WHT, cx,GF,12.4,10,0.22); P2.bb(0.7,0.22,0.7,WHT, cx,GF,12.4); P2.bb(0.6,0.24,0.6,K.stoneL, cx,UF-0.28,12.4); }
  [-1.5,1.5].forEach(function(cx){ P2.cb(0.3,UF-GF-0.12,WHT, cx,GF,12.4,10,0.24); P2.bb(0.8,0.24,0.8,WHT, cx,GF,12.4); });
  P2.bb(27,0.3,0.5,WHT, 0,UF-0.38,12.4);
  for (i=0;i<7;i++){ P2.bb(6.2-i*0.0, 0.14, 0.45, MARB, 0,i*(GF/7),13.6+(6-i)*0.45); P2.bb(6.2,GF/7,0.04, i%2?AZB:AZW, 0,i*(GF/7)+0.0,13.6+(6-i)*0.45+0.23); }
  [-3.2,3.2].forEach(function(sx){ P2.beam([sx,0.9,13.4],[sx,GF+0.9,16.8], 0.05, IRON, 5); P2.bb(0.2,0.9,0.2,WHT, sx,0,16.8); P2.ic(0.22,K.stoneL, sx,0.9+0.2,16.8,1,1.4,1); P2.ic(0.22,K.stoneL, sx,GF+1.1,13.4,1,1.4,1); });
  for (i=0;i<=6;i++) [-3.2,3.2].forEach(function(sx){ P2.bb(0.04,0.8,0.04,IRON, sx,i*(GF/7),16.8-i*0.45); });
  for (i=0;i<=26;i++) if (Math.abs(i-13) > 3) P2.bb(0.05,0.9,0.05,IRON, -13+i,GF,13.55);
  P2.bb(10.5,0.07,0.07,IRON, -8.2,GF+0.9,13.55); P2.bb(10.5,0.07,0.07,IRON, 8.2,GF+0.9,13.55);
  /* lampiões de ferro e refletores (noite) */
  [-12,-6,6,12].forEach(function(cx){ P2.bb(0.18,0.5,0.18,IRON, cx,UF-1.0,11.2); UP.ic(0.17,0xffe3a0, cx,UF-1.2,11.2,1,1.3,1); });
  P2.build(casaG); UP.build(casaG, {unlit:true, outline:false});
  ccol(-13.4,13.2,-3.2,13.5,'s'); ccol(3.2,13.2,13.4,13.5,'s'); ccol(-13.5,10.2,-13.2,13.5,'s'); ccol(13.2,10.2,13.5,13.5,'s');
  ccol(-13.5,-10.3,13.5,-10.3,'a'); ccol(13.4,-10.4,13.5,12.6,'a'); ccol(-13.5,-10.4,-13.4,12.6,'a'); ccol(-13.5,12.4,13.5,12.6,'a');
  ccol(-1.2,4.2,-1.0,9.9,'a'); ccol(1.0,4.2,1.2,9.9,'a'); ccol(-1.2,9.8,1.2,10.0,'a');

  /* ---------- telhado de quatro águas em capa e canal, frontão central com relógio, beirais de 2 m ---------- */
  const RB = UF + UHT, RH = 4.6, RW = 30.2, RD = 24.2;
  R2.add(hipGeo(RW,RD,RH), K.roof, 0, RB, 0);
  R2.bb(RW+0.4,0.3,RD+0.4,K.woodD, 0,RB-0.3,0);
  const th = Math.atan2(RH, RD/2), sn = Math.sin(th), cs = Math.cos(th);
  for (let tt=0.5; tt<RD/2-0.6; tt+=0.8){ const wdt = RW - 2*tt - 0.6; [[1,1],[-1,-1]].forEach(function(sg){ R2.add(GX.box, K.roofD, 0, RB + tt*sn + 0.04, sg[0]*(RD/2 - tt*cs), [wdt,0.05,0.1], [sg[0]*th,0,0]); }); }
  R2.bb(RW-RD+0.6,0.3,0.55,K.roofD, 0,RB+RH-0.02,0);
  const tri = new THREE.Shape(); tri.moveTo(-4.4,0); tri.lineTo(4.4,0); tri.lineTo(0,3.0);
  const gg = new THREE.ExtrudeGeometry(tri, {depth:0.6, bevelEnabled:false}); gg.translate(0,0,-0.3);
  R2.add(gg, WHT, 0, RB-0.1, 10.6); R2.add(gg, K.stoneL, 0, RB-0.1, 10.2, [1.06,1.06,0.4]);
  R2.cb(0.85,0.14,WHT, 0,RB+1.0,10.98,24,0.85,[Math.PI/2,0,0]); R2.cb(0.7,0.15,0x1d3566, 0,RB+1.0,11.0,24,0.7,[Math.PI/2,0,0]); R2.bb(0.06,0.55,0.05,WHT, 0,RB+1.0,11.1); R2.bb(0.4,0.06,0.05,WHT, 0.1,RB+1.0,11.1);
  [-4.5,4.5].forEach(function(ax){ R2.ic(0.3,K.stoneL, ax,RB+0.1,10.6,1,1.3,1); }); R2.ic(0.3,K.stoneL, 0,RB+3.1,10.6,1,1.3,1);              /* acrotérios */
  for (i=0;i<=12;i++) R2.bb(0.12,0.5,0.06,K.woodD, -12+i*2,RB-0.7,12.1);                               /* lambrequins sob o beiral */
  R2.bb(1.4,3.4,1.4,CW, 6,RB+1.3,-3); R2.bb(1.8,0.3,1.8,K.stoneD, 6,RB+4.5,-3); R2.bb(0.8,0.9,0.8,K.stone, 6,RB+4.8,-3);
  R2.build(casaRoofG, {mat:roofMat});
})();


/* ================= PÁTIO TÉCNICO E OFICINA DE REPAROS ================= */
const YB = new Batch(), beacons = [];
function lw(x0,z0,ry,lx,lz){ return [x0 + lx*Math.cos(ry) + lz*Math.sin(ry), z0 - lx*Math.sin(ry) + lz*Math.cos(ry)]; }
function wheel(b,x,y,z,r,w,col){ b.add(cylG(1,14), col || K.black, x,y,z, [r,w,r], [0,0,Math.PI/2]); b.add(cylG(1,10), K.steel, x + (x>=0?1:-1)*0.0, y, z, [r*0.5,w*1.06,r*0.5], [0,0,Math.PI/2]); }
function track(b,x,len,h,w){
  b.bb(w,h,len,K.black, x,0.0,0);
  b.add(cylG(1,12), K.black, x, h/2, len/2, [h/2,w,h/2], [0,0,Math.PI/2]); b.add(cylG(1,12), K.black, x, h/2, -len/2, [h/2,w,h/2], [0,0,Math.PI/2]);
  for (let k=0;k<4;k++) b.add(cylG(1,8), K.steelD, x, h*0.42, -len/2 + len*(k+0.5)/4, [h*0.28,w*1.04,h*0.28], [0,0,Math.PI/2]);
}
function stripedCone(b,x,z){ b.cn(0.34,0.9,K.orange, x,0,z,8); b.cb(0.27,0.14,K.white, x,0.3,z,8,0.23); b.bb(0.8,0.06,0.8,K.black, x,0,z); }
function pallet(b,x,z,n,ry){ b.at(x,0,z,ry||0); for (let l=0;l<n;l++){ b.bb(1.2,0.14,1.0,K.woodL, 0,l*0.42,0); for (let f=0;f<3;f++) b.bb(1.2,0.1,0.18,K.woodD, 0,l*0.42+0.14,-0.38+f*0.38); for (let c=0;c<3;c++) b.bb(0.12,0.14,1.0,K.woodD, -0.5+c*0.5,l*0.42+0.24,0); } b.at(0,0,0,0); }
function toolbox(b,x,z,ry,lv){ b.at(x,0,z,ry||0); for (let l=0;l<(lv||2);l++){ b.bb(1.0,0.5,0.55,K.red, 0,l*0.5,0); b.bb(0.55,0.06,0.07,K.steel, 0,l*0.5+0.4,0.3); b.bb(1.02,0.04,0.57,K.redD || 0xa82a20, 0,l*0.5+0.24,0); } b.at(0,0,0,0); }
function beacon(x,y,z,col){ YB.cb(0.2,0.12,K.black, x,y,z,8); beacons.push({x:x,y:y+0.12,z:z,col:col}); }

/* laje de concreto cinza-claro e faixas de sinalização */
YB.bb(18,0.2,19, K.conc, 30,0,-22.5); YB.bb(18.2,0.08,0.3, K.concD, 30,0.2,-13.2);
for (let ys=0; ys<9; ys++) YB.bb(1.3,0.03,0.22, K.yellow, 21.8+ys*2.0, 0.2, -31.8);
YB.bb(0.2,0.03,9, K.white, 24, 0.2, -20); YB.bb(0.2,0.03,9, K.white, 36.5, 0.2, -20);
YB.bb(12,0.03,0.2, K.white, 30, 0.2, -16);
[[22,-14.5],[38,-14.5]].forEach(function(p){ YB.cb(0.12,6.0,K.steelD, p[0],0.2,p[1],6); YB.bb(0.8,0.2,0.5,K.steel, p[0],6.0,p[1]); YB.bb(0.6,0.06,0.3,0xfff6c9, p[0],5.94,p[1]); });

/* minicarregadeira (skid steer) — amarelo Caterpillar, esteiras pretas */
(function(b, X, Z, RY){
  b.at(X,0,Z,RY);
  track(b,-0.95,2.5,0.85,0.5); track(b,0.95,2.5,0.85,0.5);
  b.bb(1.5,0.9,2.2,K.yellow, 0,0.55,-0.1); b.bb(1.6,0.2,2.3,K.black, 0,0.45,-0.1); b.bb(1.2,0.5,0.9,K.black, 0,1.45,-0.8);
  b.bb(1.3,0.08,1.3,K.yellow, 0,2.72,0.1);
  [[-0.62,-0.58],[0.62,-0.58],[-0.62,0.62],[0.62,0.62]].forEach(function(p){ b.bb(0.1,1.3,0.1,K.yellow, p[0],1.45,p[1]); });
  b.bb(1.1,1.0,1.1,0x8fb9d4, 0,1.45,0.0); b.bb(1.4,0.1,0.1,K.black, 0,1.1,0.62);
  b.beam([-0.82,1.0,-0.7],[-0.82,0.9,1.9], 0.1, K.yellow, 6); b.beam([0.82,1.0,-0.7],[0.82,0.9,1.9], 0.1, K.yellow, 6);
  b.bb(1.9,0.5,0.7,K.black, 0,0.45,2.15); b.bb(1.9,0.7,0.1,K.black, 0,0.9,2.45); b.bb(1.9,0.14,0.5,K.steel, 0,0.3,2.4);
  b.beam([-0.6,1.2,-0.9],[-0.5,0.6,1.2], 0.07, K.steelD, 5);
  b.at(0,0,0,0);
  const p = lw(X,Z,RY,0.6,-0.1); beacon(p[0],2.8,p[1],K.orange);
})(YB, 30.7, -26.6, Math.PI);

/* miniescavadeira com lâmina niveladora */
(function(b, X, Z, RY){
  b.at(X,0,Z,RY);
  track(b,-1.0,3.2,0.8,0.65); track(b,1.0,3.2,0.8,0.65); b.bb(2.2,0.4,2.4,K.black, 0,0.7,0);
  b.bb(2.2,0.18,0.5,K.orange, 0,0.3,1.95); b.beam([-1.0,0.6,0.8],[-1.0,0.5,1.9], 0.08, K.steelD, 5); b.beam([1.0,0.6,0.8],[1.0,0.5,1.9], 0.08, K.steelD, 5);
  b.at(X,0,Z,RY - 0.55);
  b.add(cylG(1,16), K.black, 0,1.15,0, [1.3,0.12,1.3]); b.bb(2.0,1.0,2.3,K.orange, 0,1.2,-0.3); b.bb(1.8,0.8,0.9,K.black, 0,2.2,-1.1);
  b.bb(1.0,1.5,1.0,0x8fb9d4, -0.5,2.2,0.4); b.bb(1.2,0.1,1.2,K.orange, -0.5,3.7,0.4); b.bb(0.1,1.5,0.1,K.orange, -0.95,2.2,0.85);
  b.bb(1.2,0.7,0.5,K.black, 0,1.4,-1.5);
  b.beam([0.5,1.7,0.5],[0.5,3.5,2.5], 0.18, K.orange, 6); b.beam([0.5,3.5,2.5],[0.5,2.0,4.0], 0.14, K.orange, 6);
  b.beam([0.5,1.9,0.1],[0.5,3.2,1.6], 0.07, K.steel, 5);
  b.add(GX.box, K.black, 0.5,1.55,4.3, [0.6,0.9,0.6], [0.6,0,0]); b.add(GX.box, K.steel, 0.5,1.2,4.6, [0.62,0.16,0.35], [0.6,0,0]);
  b.at(0,0,0,0);
  const p = lw(X,Z,RY - 0.55, -0.5,0.4); beacon(p[0],3.75,p[1],K.orange);
})(YB, 36.2, -23.2, -0.6);

/* carrinhos utilitários elétricos de ferramentas */
function cart(b, X, Z, RY, col){
  b.at(X,0,Z,RY);
  b.bb(1.9,0.14,1.0,col, 0,0.36,0); b.bb(0.14,0.7,1.0,K.black, -0.95,0.4,0); b.bb(1.9,0.5,0.12,K.black, 0,0.5,-0.5);
  [[-0.7,-0.5],[0.7,-0.5],[-0.7,0.5],[0.7,0.5]].forEach(function(w){ b.add(cylG(1,10), K.black, w[0],0.24,w[1], [0.24,0.16,0.24], [Math.PI/2,0,0]); });
  b.bb(0.8,0.5,0.55,K.red, 0.3,0.5,0.05); b.bb(0.8,0.04,0.57,K.steel, 0.3,1.0,0.05); b.bb(0.5,0.3,0.4,K.blue, -0.4,0.5,0.1); b.bb(0.04,0.9,0.04,K.black, -1.0,0.5,-0.4); b.bb(0.04,0.9,0.04,K.black, -1.0,0.5,0.4); b.bb(0.06,0.06,0.9,K.black, -1.0,1.4,0);
  b.at(0,0,0,0);
}
cart(YB, 25.6,-28.6, 0.35, K.orange); cart(YB, 27.6,-21.6, -0.5, K.yellow); cart(YB, 34.2,-29.4, 0.1, K.orange);

/* van Asia Towner e moto de 175 cc */
(function(b, X, Z, RY){
  b.at(X,0,Z,RY);
  b.bb(1.9,1.5,3.1,K.white, 0,0.5,-0.6); b.bb(1.85,1.0,1.3,K.white, 0,0.5,1.6); b.bb(1.7,0.6,0.1,0x8fb9d4, 0,1.35,2.25);
  b.bb(1.95,0.12,4.6,K.blue, 0,0.7,0.2); b.bb(1.6,0.5,0.1,0x8fb9d4, 0,1.4,0.95); b.bb(0.1,0.5,1.0,0x8fb9d4, 0.93,1.2,1.6); b.bb(0.1,0.5,1.0,0x8fb9d4, -0.93,1.2,1.6);
  [[-0.95,1.5],[0.95,1.5],[-0.95,-1.2],[0.95,-1.2]].forEach(function(w){ b.add(cylG(1,12), K.black, w[0],0.4,w[1], [0.4,0.26,0.4], [0,0,Math.PI/2]); b.add(cylG(1,8), K.steel, w[0],0.4,w[1], [0.2,0.28,0.2], [0,0,Math.PI/2]); });
  b.bb(1.5,0.2,0.1,K.black, 0,0.5,2.3);
  b.at(0,0,0,0);
})(YB, 24.6, -18.6, 0.18);
(function(b, X, Z, RY){
  b.at(X,0,Z,RY);
  b.add(cylG(1,12), K.black, 0,0.45,0.8, [0.45,0.16,0.45], [0,0,Math.PI/2]); b.add(cylG(1,12), K.black, 0,0.45,-0.8, [0.45,0.16,0.45], [0,0,Math.PI/2]);
  b.bb(0.3,0.5,1.2,K.red, 0,0.55,0); b.bb(0.34,0.14,0.9,K.black, 0,1.0,-0.2); b.bb(0.7,0.08,0.08,K.steel, 0,1.35,0.55); b.bb(0.16,0.3,0.2,K.white, 0,1.1,0.8);
  b.at(0,0,0,0);
})(YB, 22.6, -16.0, 1.2);

/* paletes, caixas de ferramenta vermelhas empilhadas, cones listrados */
pallet(YB, 37.3,-30.3, 3, 0.1); pallet(YB, 37.5,-28.6, 2, -0.2); pallet(YB, 22.8,-25.2, 2, 0.4);
for (let tb=0; tb<3; tb++) toolbox(YB, 23.0+tb*1.1,-30.2, 0.05*tb, tb===1 ? 3 : 2);
toolbox(YB, 37.2,-26.0, 0.3, 2);
[[27.8,-24.0],[33.8,-24.8],[29.6,-30.2],[34.6,-26.8],[27.0,-17.0],[33.0,-16.4],[24.0,-23.6],[38.6,-20.6]].forEach(function(c){ stripedCone(YB, c[0], c[1]); });
[[38.2,-17.4],[38.2,-16.4],[39.1,-17.0]].forEach(function(p){ YB.cb(0.45,1.0,[K.blue,K.red,K.blue][(p[1]*2|0)&1], p[0],0.2,p[1],10); YB.cb(0.46,0.1,K.black, p[0],0.8,p[1],10); });
YB.bb(1.4,2.2,0.16,K.white, 39.2,0.2,-23.3); YB.bb(1.3,0.5,0.18,K.yellow, 39.2,1.7,-23.3); YB.bb(0.2,0.2,0.2,K.black, 39.2,1.0,-23.3);
YB.bb(3.8,2.6,3.6,K.stone, 41,0,-17); YB.bb(4.3,0.3,4.1,K.roofD, 41,2.6,-17); YB.cb(0.8,1.3,K.copper, 39.0,0,-17,10); YB.cb(0.2,1.5,K.steelD, 39.0,1.3,-17,8);
YB.beam([43.6,3.0,-22.5],[41.9,1.6,-18.8], 0.3, K.steelD, 8); YB.bb(1.0,0.8,1.0,K.steel, 43.2,2.6,-23);
YB.build(surface);
beacons.forEach(function(bc){
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.28,8,6), new THREE.MeshBasicMaterial({color:C(K.orange)}));
  m.position.set(bc.x, bc.y+0.22, bc.z); surface.add(m); bc.mesh = m;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9,0.06,0.12), new THREE.MeshBasicMaterial({color:C(0xfff3b0)}));
  bar.position.copy(m.position); surface.add(bar); bc.bar = bar;
});

/* ================= RODA D'ÁGUA OVERSHOT (dinâmica) ================= */
const wheelG = new THREE.Group(); wheelG.position.set(45.5, 2.0, -41.2); surface.add(wheelG);
const wheelSpin = new THREE.Group(); wheelG.add(wheelSpin);
(function(){
  const b = new Batch();
  let i;
  const WR = 2.6;
  const WW = 3.0;
  const dark = 0x5a3a24;
  [-WW/2, WW/2].forEach(function(z){ b.add(GX.tor, dark, 0,0,z, [WR,WR,3.0]); b.add(GX.tor, dark, 0,0,z, [WR-0.5,WR-0.5,3.0]); for (let k=0;k<8;k++){ const a = k/8*Math.PI*2; b.beam([0,0,z],[Math.cos(a)*WR,Math.sin(a)*WR,z], 0.11, K.woodD, 5); } });
  b.add(cylG(1,10), K.steelD, 0,0,0, [0.34,WW+1.4,0.34], [Math.PI/2,0,0]); b.add(cylG(1,10), K.copper, 0,0,0, [0.52,0.5,0.52], [Math.PI/2,0,0]);
  for (i=0;i<16;i++){ const a2 = i/16*Math.PI*2; b.add(GX.box, [K.wood,K.woodD][i%2], Math.cos(a2)*(WR-0.1), Math.sin(a2)*(WR-0.1), 0, [0.7,0.12,WW], [0,0,a2]); }
  const m = b.build(wheelSpin);
  wheelG.rotation.y = Math.PI/2;                  /* eixo paralelo ao eixo X do mundo, entrando no engenho */
})();
/* cavaletes, calha de alimentação (flume) e eixo para dentro do engenho */
(function(){
  const b = new Batch();
  [43.3,47.7].forEach(function(x){ b.bb(0.5,2.8,0.5,K.woodD, x,-1.4,-41.2); b.bb(0.9,0.5,0.9,K.stone, x,-1.4,-41.2); b.beam([x,-1.2,-43.2],[x,2.2,-41.4], 0.14, K.woodD, 5); b.beam([x,-1.2,-39.2],[x,2.2,-41.0], 0.14, K.woodD, 5); b.bb(0.5,0.4,0.5,K.copper, x,1.9,-41.2); });
  b.bb(1.8,0.25,12, K.wood, 45.5, 4.9, -48.4); b.bb(0.18,0.55,12, K.woodD, 44.7, 4.9, -48.4); b.bb(0.18,0.55,12, K.woodD, 46.3, 4.9, -48.4); b.bb(1.6,0.06,12, K.water, 45.5, 5.14, -48.4);
  [-53,-49,-44].forEach(function(z){ b.bb(0.3,5.0,0.3,K.woodD, 44.5,0,z); b.bb(0.3,5.0,0.3,K.woodD, 46.5,0,z); });
  b.beam([42.9,2.0,-41.2],[44.4,2.0,-41.2], 0.28, K.steelD, 8);
  b.build(surface);
})();

/* ================= MOINHO DE VENTO ================= */
const windG = new THREE.Group(); windG.position.set(6, 0, 36); surface.add(windG);
const rotor = new THREE.Group(); rotor.position.set(0, 14.4, 2.3); windG.add(rotor);
(function(){
  const b = new Batch();
  let i;
  b.bb(5.4,0.5,5.4, K.concD, 0,0,0);
  b.cb(2.1, 12.8, 0xc9684a, 0,0.5,0, 10, 1.2);
  for (i=0;i<6;i++) b.cb(2.1 - i*0.15, 0.22, K.stoneL, 0, 1.2 + i*2.1, 0, 10, 2.0 - i*0.15);
  b.bb(1.2,2.0,0.2,K.woodD, 0,0.5,2.0); b.bb(0.7,1.4,0.1,K.wood, 0,0.5,2.1);
  b.cb(1.7,1.4,K.wood, 0,13.3,0,10,1.4); b.cn(1.9,1.8,K.roofD, 0,14.6,0,10);
  b.bb(1.7,1.6,2.6,K.steelD, 0,13.5,1.2); b.bb(0.25,0.7,0.25,K.black, 0,15.0,-0.2); b.bb(1.4,0.5,0.1,K.black, 0,13.9,2.5);
  b.build(windG);
  const r = new Batch();
  r.add(cylG(0.55,10), K.steelD, 0,0,0, [0.55,1.1,0.55], [Math.PI/2,0,0]); r.add(coneG(8), K.white, 0,0,0.95, [0.5,0.9,0.5], [Math.PI/2,0,0]);
  for (i=0;i<8;i++){
    const a = i/8*Math.PI*2;
    r.add(GX.box, [0xf4f7f8,0xdfe4e8][i%2], Math.cos(a)*1.55, Math.sin(a)*1.55, 0.1, [0.34,2.1,0.07], [0,0,a - Math.PI/2]);
    r.add(GX.box, K.steel, Math.cos(a)*0.62, Math.sin(a)*0.62, 0.1, [0.14,0.9,0.12], [0,0,a - Math.PI/2]);
  }
  r.build(rotor);
})();

/* ================= ANIMAIS EM BAIXO-POLI (porcos, galinhas, cabras) ================= */
function animalMesh(kind){
  const b = new Batch();
  if (kind === 'pig'){
    b.bb(1.5,0.9,0.85,K.pink, 0,0.5,0); b.bb(0.6,0.65,0.7,0xf6b7c6, 0.9,0.62,0); b.bb(0.28,0.28,0.4,0xe98aa0, 1.25,0.7,0); b.add(GX.ico0,0xe98aa0,-0.78,0.85,0,[0.12,0.12,0.12]);
    [[-0.5,-0.3],[-0.5,0.3],[0.5,-0.3],[0.5,0.3]].forEach(function(l){ b.cb(0.11,0.5,0xe98aa0, l[0],0,l[1],6); });
    b.bb(0.1,0.22,0.15,0xe98aa0, 0.95,1.18,-0.25); b.bb(0.1,0.22,0.15,0xe98aa0, 0.95,1.18,0.25); b.bb(0.07,0.07,0.07,K.black, 1.2,0.88,-0.2); b.bb(0.07,0.07,0.07,K.black, 1.2,0.88,0.2);
  } else if (kind === 'hen'){
    b.bb(0.45,0.4,0.36,K.white, 0,0.32,0); b.bb(0.22,0.3,0.24,K.white, 0.26,0.55,0); b.add(coneG(3), K.yellow, 0.43,0.62,0, [0.07,0.16,0.07], [0,0,-Math.PI/2]);
    b.add(GX.ico0, K.red, 0.3,0.84,0, [0.07,0.08,0.05]); b.add(coneG(3), K.white, -0.28,0.55,0, [0.18,0.34,0.2], [0,0,Math.PI/2*1.15]);
    b.cb(0.025,0.25,K.yellow, 0,0.0,-0.1,4); b.cb(0.025,0.25,K.yellow, 0,0.0,0.1,4);
  } else {
    b.bb(1.2,0.7,0.5,0xcfcac0, 0,0.7,0); b.bb(0.4,0.6,0.38,0xb9b3a6, 0.7,1.1,0); b.bb(0.25,0.22,0.3,0x8a847a, 0.95,1.15,0); b.add(coneG(3), 0x6b645b, 0.8,1.62,-0.1, [0.07,0.28,0.07]); b.add(coneG(3), 0x6b645b, 0.8,1.62,0.1, [0.07,0.28,0.07]);
    b.add(GX.ico0, 0x6b645b, 0.82,0.85,0, [0.08,0.22,0.08]);
    [[-0.45,-0.16],[-0.45,0.16],[0.45,-0.16],[0.45,0.16]].forEach(function(l){ b.cb(0.07,0.7,0x7b756b, l[0],0,l[1],5); });
    b.add(coneG(3), 0x8a847a, -0.7,1.0,0, [0.1,0.3,0.1], [0,0,Math.PI/2*1.2]);
  }
  const g = new THREE.Group(); b.build(g); return g;
}
const animals = [];
(function(){
  const tpl = {pig:animalMesh('pig'), hen:animalMesh('hen'), goat:animalMesh('goat')}, spec = [['pig',4,1.0],['hen',10,1.0],['goat',5,1.0]];
  spec.forEach(function(sp){
    for (let i=0;i<sp[1];i++){
      const g = tpl[sp[0]].clone(true); const a = {g:g, kind:sp[0], cx:rr(25,37), cz:rr(-8,7), rx:rr(1.2,3.8), rz:rr(1.0,3.0), ph:rr(0,6.28), sp:rr(0.18,0.34)*(sp[0]==='hen'?1.6:1)*(R()<.5?-1:1)};
      if (sp[0] === 'pig') { a.cx = rr(24.5,29); a.cz = rr(-6,6); a.rx = rr(0.8,1.8); a.rz = rr(1.0,2.4); }
      if (sp[0] === 'goat'){ a.cx = rr(33.5,37.5); a.cz = rr(-4,3); a.rx = rr(0.8,1.6); a.rz = rr(1.0,2.6); }
      if (sp[0] === 'hen'){ a.cx = rr(-41,-33); a.cz = rr(36.5,38); a.rx = rr(0.8,1.8); a.rz = rr(0.6,1.5); }
      surface.add(g); animals.push(a);
    }
  });
})();

/* ================= PEIXES TRIANGULARES NA LAGOA ================= */
const fishList = [];
(function(){
  const b = new Batch(); b.add(coneG(3), K.orange, 0.15,0.1,0, [0.28,0.9,0.14], [0,0,-Math.PI/2]); b.add(coneG(3), 0xffd9a0, -0.6,0.1,0, [0.22,0.4,0.1], [0,0,Math.PI/2]);
  const f1 = new THREE.Group(); b.build(f1);
  const b2 = new Batch(); b2.add(coneG(3), K.white, 0.15,0.1,0, [0.28,0.9,0.14], [0,0,-Math.PI/2]); b2.add(coneG(3), 0x9fd2f2, -0.6,0.1,0, [0.22,0.4,0.1], [0,0,Math.PI/2]);
  const f2 = new THREE.Group(); b2.build(f2);
  for (let i=0;i<8;i++){ const g = (i%2 ? f2 : f1).clone(true); g.scale.setScalar(rr(0.9,1.3)); surface.add(g); fishList.push({g:g, cx:pondX, cz:pondZ, r:rr(1.8,5.2), a:rr(0,6.28), sp:rr(0.28,0.62)*(i%3===0?-1:1), y:0.42}); }
  TANKS.forEach(function(tk){ for (let j=0;j<4;j++){ const g2 = (j%2 ? f2 : f1).clone(true); g2.scale.setScalar(rr(0.7,0.95)); surface.add(g2); fishList.push({g:g2, cx:tk.x, cz:tk.z, r:rr(0.7,1.7), a:rr(0,6.28), sp:rr(0.5,0.9)*(j%2?-1:1), y:0.9}); } });
})();

/* ================= ESPUMA, RESPINGOS E LAGOA/CÓRREGO ================= */
SW.build(surface, {mat:waterMat}); SP.build(surface, {mat:pondMat});
SB.build(surface);
const foam = [];
(function(){
  const gm = new THREE.MeshBasicMaterial({color:0xffffff});
  for (let i=0;i<26;i++){
    const m = new THREE.Mesh(new THREE.BoxGeometry(rr(0.8,2.0), 0.06, 0.12), gm); let zr = i<14 ? [-74,-62] : [-39,74]; if (i >= 14){ zr = [-36, 74]; }
    m.position.set(rr(43.7,47.3), -0.5, rr(zr[0],zr[1])); surface.add(m); foam.push({m:m, v:rr(1.8,3.4), z0:zr[0], z1:zr[1]});
  }
})();
const splash = [], splashGeo = new THREE.BoxGeometry(0.22,0.22,0.22), splashMats = [new THREE.MeshBasicMaterial({color:0xffffff}), new THREE.MeshBasicMaterial({color:C(0x8fdcf5)}), new THREE.MeshBasicMaterial({color:C(0x4cc6f2)})];
for (let sI=0; sI<34; sI++){ const sm = new THREE.Mesh(splashGeo, splashMats[sI%3]); sm.visible = false; surface.add(sm); splash.push({m:sm, life:0, vx:0, vy:0, vz:0}); }
let splashT = 0;

/* ================= ANIMAÇÃO ================= */
surface.userData.tick = function(dt, t, s){
  /* roda d'água e moinho em velocidade constante e suave */
  const ws = (0.5 + s.flow*1.6) * 0.8;
  wheelSpin.rotation.z -= dt*ws; rotor.rotation.z += dt*(0.5 + s.wind*2.0);
  /* espuma do córrego */
  for (let i=0;i<foam.length;i++){ const f = foam[i]; f.m.position.z += f.v*dt*(0.5+s.flow); if (f.m.position.z > f.z1) f.m.position.z = f.z0; f.m.scale.x = 0.8 + Math.sin(t*3 + i)*0.25; }
  /* respingos de cubos junto às pás */
  splashT += dt*(8 + s.flow*18);
  while (splashT > 1){
    splashT -= 1;
    for (let k=0;k<splash.length;k++) if (splash[k].life <= 0){ const p = splash[k]; p.life = rr(0.5,0.95); p.m.visible = true; p.m.position.set(45.5 + rr(-1.5,1.5), -0.4, -41.2 + rr(-1.5,-0.1) + 0); p.vx = rr(-0.8,0.8); p.vy = rr(3.5,6.5); p.vz = rr(-3,1.5); break; }
  }
  for (let j=0;j<splash.length;j++){ const q = splash[j]; if (q.life <= 0) continue; q.life -= dt; q.vy -= 14*dt; q.m.position.x += q.vx*dt; q.m.position.y += q.vy*dt; q.m.position.z += q.vz*dt; q.m.rotation.x += dt*5; q.m.rotation.y += dt*4; const sc = Math.max(0.05, q.life*1.4); q.m.scale.setScalar(Math.min(1, sc)); if (q.life <= 0 || q.m.position.y < -0.55) { q.life = 0; q.m.visible = false; } }
  /* peixes em círculo */
  fishList.forEach(function(fh){ fh.a += fh.sp*dt; fh.g.position.set(fh.cx + Math.cos(fh.a)*fh.r, fh.y + Math.sin(t*2 + fh.a*3)*0.02, fh.cz + Math.sin(fh.a)*fh.r); fh.g.rotation.y = -fh.a + (fh.sp > 0 ? -Math.PI/2 : Math.PI/2); });
  /* animais passeando */
  animals.forEach(function(a){
    a.ph += a.sp*dt; const x = a.cx + Math.cos(a.ph)*a.rx, z = a.cz + Math.sin(a.ph*1.3)*a.rz, dx = -Math.sin(a.ph)*a.rx*(a.sp>0?1:-1), dz = Math.cos(a.ph*1.3)*a.rz*1.3*(a.sp>0?1:-1);
    a.g.position.set(x, 0.2 + Math.abs(Math.sin(t*(a.kind==='hen'?9:4) + a.ph*7))*(a.kind==='hen'?0.08:0.04), z); a.g.rotation.y = Math.atan2(-dz, dx) * (a.sp > 0 ? 1 : 1);
  });
  /* afastamento: animais da mesma espécie não se atravessam */
  const SEP = {pig:1.7, hen:0.6, goat:1.3};
  for (let ia=0; ia<animals.length; ia++) for (let ib=ia+1; ib<animals.length; ib++){
    const A = animals[ia], B = animals[ib]; if (A.kind !== B.kind) continue;
    const ddx = B.g.position.x-A.g.position.x, ddz = B.g.position.z-A.g.position.z, dd = Math.sqrt(ddx*ddx+ddz*ddz) || 0.001, mn = SEP[A.kind];
    if (dd < mn){ const pu = (mn-dd)/2/dd; A.g.position.x -= ddx*pu; A.g.position.z -= ddz*pu; B.g.position.x += ddx*pu; B.g.position.z += ddz*pu; }
  }
  /* giroflex e LEDs */
  beacons.forEach(function(bc, n){ const on = (Math.floor(t*2.2 + n*0.4) % 2) === 0; bc.mesh.material.color.copy(C(on ? 0xffd23a : K.orange)); bc.mesh.scale.setScalar(on ? 1.15 : 0.9); bc.bar.rotation.y = t*7 + n; });
  ledGroups.forEach(function(lg, n){ lg.visible = (Math.floor(t*(1.6 + n*0.35) + n) % 4) !== 0; });
};


/* ================= BUNKER · UM NÍVEL · 40 × 35 m = 1.400 m² · piso a −8,7 m · sob a Casa Grande e parte do Engenho ================= */
const ledGroups = [];
const BFL = FLOOR + 0.2;
const BWH = 3.6;
let bunkCapMesh = null;
const capMat = toonMat.clone();
const bunkU = under;
(function(){
  const FL = BFL;
  const WB = BWH;
  let i;
  let j;
  let k;
  const LW = new Batch(), LI = new Batch(), LA = new Batch(), LB = new Batch(), LC = new Batch(), LG = new Batch(), UN = new Batch(), NT = new Batch(), HB = new Batch(), CAP = new Batch();
  const WALLC = 0xc4cad0, PW = 0xe9edf0, DARK = 0x1b1e2a, NEON = 0xff2bd6, CY = 0x35e0ff, GRN = 0x4dffa8;
  /* limites */
  const X1 = -11.4, X2 = 27.4, Z1 = -72.4, Z2 = -38.6, ZA = -55.8, ZB = -53.2;     /* interior; fileira dos fundos até ZA, corredor ZA..ZB, fileira da frente ZB..Z2 */
  function bcol(axis,fixed,lo,hi,gaps,th){
    let cur = lo; (gaps||[]).slice().sort(function(p,q){ return p[0]-q[0]; }).forEach(function(q){ seg(cur,q[0]); cur = q[1]; }); seg(cur,hi);
    function seg(a,b){ if (b-a < 0.05) return; if (axis === 'x') col(a,fixed-th/2,b,fixed+th/2,'u'); else col(fixed-th/2,a,fixed+th/2,b,'u'); }
  }
  function PX(z,x1,x2,gaps,color){ wall(LW,'x',z,x1,x2,gaps,FL,WB-0.04,0.3,color||PW,null); bcol('x',z,x1,x2,gaps,0.3); }
  function PZ(x,z1,z2,gaps,color){ wall(LW,'z',x,z1,z2,gaps,FL,WB-0.04,0.3,color||PW,null); bcol('z',x,z1,z2,gaps,0.3); }
  function tile(x1,z1,x2,z2,c){ LI.bb(x2-x1,0.06,z2-z1,c, (x1+x2)/2,FL,(z1+z2)/2); }
  function D(c,w){ return [c-w/2,c+w/2,0,2.5]; }

  /* ---------- casca ---------- */
  LW.bb(40,0.2,35,0xb8c0c7, 8,FLOOR,-55.5);
  LW.bb(0.6,WB,35,WALLC, -11.7,FL,-55.5); LW.bb(0.6,WB,35,WALLC, 27.7,FL,-55.5); LW.bb(40,WB,0.6,WALLC, 8,FL,-72.7); LW.bb(40,WB,0.6,WALLC, 8,FL,-38.3);
  col(-12.2,-73.2,-11.4,-37.8,'u'); col(27.4,-73.2,28.2,-37.8,'u'); col(-12.2,-73.2,28.2,-72.4,'u'); col(-12.2,-38.6,28.2,-37.8,'u');
  /* cobertura (laje + terra + grama): vira vidro com a abertura do corte */
  CAP.bb(40,0.8,35,0xaab2b9, 8,-5.1,-55.5);
  [[-5,-2.4,0x946037],[-2.4,-0.4,0x6e4527]].forEach(function(b){ const y0 = Math.max(b[0],-4.3), y1 = Math.min(b[1],-0.4); if (y1 > y0+0.01) CAP.bb(40,y1-y0,35,b[2], 8,y0,-55.5); });
  CAP.bb(40,0.4,35,K.grass, 8,-0.4,-55.5);
  capMat.transparent = false; bunkCapMesh = CAP.build(surface, {mat:capMat, outline:false});

  /* ---------- paredes ---------- */
  PX(ZA,X1,X2,[D(-8.2,1.6),D(-2.3,1.2),D(2.0,1.2),D(5.5,1.2),D(8.6,1.2),D(13.1,1.4),D(18.05,1.3),D(21.5,1.2),D(25.2,1.2)]);
  PX(ZB,X1,X2,[[-8.2,-2.2,0,2.8],D(4.0,1.2),D(9.1,1.4),D(16.4,1.6),D(23.9,1.4)]);
  [-4.4,0.1,3.9,7.1,10.1,16.1,20.0,23.0].forEach(function(x){ PZ(x,Z1,ZA,[]); });
  [2.2,5.8,12.4,20.4].forEach(function(x){ PZ(x,ZB,Z2,[]); });
  /* pisos por ambiente */
  tile(X1,Z1,-4.4,ZA,0x12141c); tile(-4.4,Z1,0.1,ZA,0x8a5a32); tile(0.1,Z1,3.9,ZA,0x7a4a2a); tile(3.9,Z1,7.1,ZA,0xe8c9d0); tile(7.1,Z1,10.1,ZA,0x6b7a8a);
  tile(10.1,Z1,16.1,ZA,0xdfe6ea); tile(16.1,Z1,20,ZA,0xeaf3f7); tile(20,Z1,23,ZA,0xf2f4f8); tile(23,Z1,X2,ZA,0xe2e6ea);
  tile(X1,ZA,X2,ZB,0x2a2d38);
  tile(X1,ZB,2.2,Z2,0xb69a74); tile(2.2,ZB,5.8,Z2,0xe8d3b0); tile(5.8,ZB,12.4,Z2,0x1e1a26); tile(12.4,ZB,20.4,Z2,0x2c4a3a); tile(20.4,ZB,X2,Z2,0xcfd5da);
  /* corredor: neon e dutos */
  UN.bb(38.6,0.05,0.05,NEON, 8,FL+3.3,ZA+0.2); UN.bb(38.6,0.05,0.05,CY, 8,FL+3.3,ZB-0.2);
  LI.add(cylG(1,16), K.steel, 8,FL+3.0,-54.5, [0.18,38,0.18], [0,0,Math.PI/2]); LI.add(cylG(1,16), K.blue, 8,FL+2.65,-54.5, [0.14,38,0.14], [0,0,Math.PI/2]);
  /* escada de emergência: poço com escada de ferro até a escotilha na superfície */
  LI.bb(1.4,0.1,1.4,K.steelD, 26.5,FL,-54.5); [-0.5,0.5].forEach(function(o){ LI.beam([26.5+o,FL,-54.5],[26.5+o,-0.2,-54.5], 0.05, K.steelD, 5); }); for (i=0;i<14;i++) LI.bb(1.0,0.04,0.04,K.steelD, 26.5,FL+0.4+i*0.55,-54.5);
  HB.bb(1.8,0.12,1.8,K.steelD, 26.5,0,-54.5); HB.bb(1.5,0.06,1.5,K.red, 26.5,0.12,-54.5); HB.cb(0.07,0.12,K.steel, 26.5,0.18,-54.5,6);

  /* helpers de louça e móveis */
  function toilet(x,z,ry){ LI.at(x,0,z,ry||0); LI.bb(0.42,0.42,0.6,K.white, 0,FL+0.06,0); LI.bb(0.4,0.55,0.2,K.white, 0,FL+0.06,-0.38); LI.bb(0.44,0.05,0.5,K.steel, 0,FL+0.48,0.02); LI.at(0,0,0,0); }
  function sink(x,z,ry){ LI.at(x,0,z,ry||0); LI.cb(0.1,0.7,K.white, 0,FL+0.06,0,6); LI.bb(0.65,0.14,0.48,K.white, 0,FL+0.76,0); LI.cb(0.035,0.3,K.steel, 0,FL+0.9,-0.17,5); LI.bb(0.7,0.7,0.04,0x9bd9f1, 0,FL+1.36,-0.3); LI.at(0,0,0,0); }
  function shower(x,z,sz){ LI.bb(1.1,0.08,1.1,0xeaf3f7, x,FL+0.06,z); LI.cb(0.03,1.9,K.steel, x-0.5,FL+0.14,z+sz*0.5,5); LI.bb(0.3,0.05,0.3,K.steel, x-0.38,FL+1.99,z+sz*0.45); LI.bb(0.04,1.9,1.1,0xbfe3f3, x+0.55,FL+0.14,z); }
  /* banheiro nos fundos (zw = parede dos fundos, sz = +1): paredes com porta voltada ao quarto */
  function pb(xo,bw,zw,dxa,dxb,sideWall){
    const zf = zw+2.55; wall(LW,'x',zf,xo-0.15,xo+bw+(sideWall?0.15:0),[[dxa,dxb,0,2.4]],FL,WB-0.04,0.3,PW,null); bcol('x',zf,xo-0.15,xo+bw,[[dxa,dxb,0,2.4]],0.3);
    if (sideWall){ wall(LW,'z',xo+bw+0.15,zw,zf,[],FL,WB-0.04,0.3,PW,null); bcol('z',xo+bw+0.15,zw,zf,[],0.3); }
    tile(xo,zw,xo+bw,zf-0.15,0xeaf3f7); toilet(xo+0.55,zw+0.5,0); sink(xo+1.6,zw+0.35,0); shower(xo+0.65,zw+1.7,1);
    LI.bb(0.06,1.4,2.3, AZB, xo+0.04,FL+0.06,zw+1.2);
  }
  function bedK(bx,bz,c){ LI.bb(2.0,0.5,2.2,K.woodD, bx,FL+0.06,bz); LI.bb(1.9,0.28,2.1,0xf4efe2, bx,FL+0.56,bz); LI.bb(1.9,0.12,1.3,c, bx,FL+0.84,bz+0.4); LI.bb(1.4,0.18,0.5,K.white, bx,FL+0.84,bz-0.8); LI.bb(2.1,1.3,0.14,K.woodD, bx,FL+0.06,bz-1.15); LI.bb(0.5,0.45,0.5,K.woodL, bx+1.5,FL+0.06,bz-0.8); LI.bb(0.5,0.45,0.5,K.woodL, bx-1.5,FL+0.06,bz-0.8); }
  function bedS(bx,bz,c){ LI.bb(1.1,0.4,2.0,K.woodD, bx,FL+0.06,bz); LI.bb(1.0,0.22,1.9,0xf4efe2, bx,FL+0.46,bz); LI.bb(1.0,0.1,1.2,c, bx,FL+0.68,bz+0.35); LI.bb(1.2,1.0,0.12,K.woodD, bx,FL+0.06,bz-1.05); }
  function wardrobe(wx,wz,r){ LI.at(wx,0,wz,r||0); LI.bb(1.6,2.3,0.6,K.woodD, 0,FL+0.06,0); LI.bb(0.03,2.0,0.05,0xd4a24a, 0,FL+0.26,0.32); LI.at(0,0,0,0); }
  function desk(x,z,len,rot){ LI.at(x,0,z,rot||0); LI.bb(len,0.05,0.8,K.woodL, 0,FL+0.76,0); LI.bb(0.06,0.7,0.7,K.woodD, -len/2+0.05,FL+0.06,0); LI.bb(0.06,0.7,0.7,K.woodD, len/2-0.05,FL+0.06,0); LI.at(0,0,0,0); }
  function chair(x,z,c){ LI.bb(0.5,0.1,0.5,c||0x111319, x,FL+0.5,z); LI.bb(0.5,0.8,0.08,c||0x111319, x,FL+0.55,z-0.26); LI.cb(0.05,0.44,K.steelD, x,FL+0.06,z,6); LI.cb(0.28,0.04,K.steelD, x,FL+0.06,z,8); }
  function plant(x,z,s){ LI.cb(0.22*s,0.35*s,0xb5593b, x,FL+0.06,z,8); LI.ic(0.4*s,0x3fae52, x,FL+0.6*s+0.2,z,1,1.2,1); }

  /* =================== FILEIRA DOS FUNDOS: dormitórios (x −11,4 → 10,1) =================== */
  /* ---- SUÍTE CYBERPUNK DO MESTRE (7,0 × 16,6 m): closet · lounge e estação dev · cama-casulo com mosquiteiro · banheiro ---- */
  (function(){
    const x0 = -11.25, x1 = -4.55;
    pb(-7.35,2.8,Z1,-5.6,-4.7,false);                                                                   /* banheiro-cabine no canto leste dos fundos */
    wardrobe(x0+0.3,-57.2,Math.PI/2); wardrobe(x0+0.3,-58.8,Math.PI/2); LI.bb(0.5,0.8,1.6,0x1b1e2a, x1-0.3,FL+0.06,-57.4); UN.bb(0.04,1.5,1.2,CY, x1-0.04,FL+0.9,-57.4); LI.bb(0.4,0.05,1.0,K.steelD, x1-0.4,FL+0.5,-59.0);
    for (i=0;i<5;i++) LI.bb(0.3,0.1,0.18,[K.red,K.white,0x2a4a73,K.yellow,0x111319][i], x0+0.55,FL+0.06+i*0.0,-59.9+0.0);
    /* estação dev: mesa em L, 3 monitores curvos, PC com RGB, rack e cadeira gamer */
    desk(x0+0.5,-62.2,3.8,Math.PI/2); [-63.5,-62.2,-60.9].forEach(function(mz,n){ LI.bb(0.08,0.62,1.28,0x0a0c14, x0+0.2,FL+1.0,mz+(n===0?0.08:n===2?-0.08:0)); UN.bb(0.04,0.56,1.2,[CY,NEON,GRN][n], x0+0.28,FL+1.03,mz); });
    LI.bb(0.3,0.5,0.6,0x1b1e2a, x0+0.5,FL+0.81,-64.0); UN.bb(0.02,0.4,0.5,CY, x0+0.66,FL+0.86,-64.0); LI.bb(0.5,0.03,0.2,K.black, x0+1.0,FL+0.8,-62.2);
    chair(x0+1.7,-62.2,0x111319); LI.bb(0.9,1.9,0.8,0x22262b, x0+0.5,FL+0.06,-65.4); for (i=0;i<9;i++) UN.bb(0.05,0.05,0.5,[CY,GRN,NEON][i%3], x0+0.92,FL+0.3+i*0.19,-65.4);
    UN.bb(0.04,0.04,3.6,CY, x0+0.08,FL+0.72,-62.2);
    /* mesa holográfica e área de lounge */
    LI.cb(0.9,0.6,DARK, -6.9,FL+0.06,-61.6,16); UN.cb(0.95,0.04,CY, -6.9,FL+0.66,-61.6,16); UN.ic(0.55,CY, -6.9,FL+1.6,-61.6,1,1,1,1); UN.cb(1.0,0.03,NEON, -6.9,FL+0.07,-61.6,22);
    LI.bb(0.9,0.5,2.4,0x2f2a4a, x1-0.5,FL+0.06,-61.6); LI.bb(0.3,0.8,2.4,0x2f2a4a, x1-0.2,FL+0.06,-61.6); LI.cb(0.5,0.4,0xc07bff, -9.2,FL+0.06,-59.9,10); LI.cb(0.5,0.4,0x35e0ff, -9.2,FL+0.06,-65.3,10);
    LI.bb(0.9,1.8,0.8,0x2a2d38, -9.2,FL+0.06,-56.8); UN.bb(0.7,0.5,0.04,NEON, -9.2,FL+1.2,-56.4);                  /* fliperama (ao lado da porta) */
    /* cama-casulo redonda com mosquiteiro, cabeceira em arco e anel de neon */
    const bx = -8.1, bz = -67.9;
    LI.cb(1.95,0.3,0x15171f, bx,FL+0.06,bz,28); LI.cb(1.7,0.3,0xf0eef6, bx,FL+0.36,bz,28); UN.cb(2.0,0.03,NEON, bx,FL+0.07,bz,32);
    LI.cb(0.55,0.18,0xc07bff, bx-0.6,FL+0.66,bz-0.8,10,0.45); LI.cb(0.55,0.18,0x35e0ff, bx+0.2,FL+0.66,bz-0.9,10,0.45); LI.cb(1.0,0.06,0x2a2d38, bx,FL+0.66,bz+0.5,20,0.9);
    for (let th=-Math.PI/2-1.1; th<=-Math.PI/2+1.11; th+=0.275){ const sx = bx+2.25*Math.cos(th), sz = bz+2.25*Math.sin(th), rr2 = Math.atan2(-Math.cos(th),-Math.sin(th)); LI.bb(0.48,1.7,0.12,DARK, sx,FL+0.06,sz,rr2); UN.bb(0.04,1.5,0.04,NEON, sx,FL+0.16,sz+(sz<bz?0.07:-0.07)); }
    for (i=0;i<16;i++){ const a2 = i/16*Math.PI*2, cx2 = bx+2.15*Math.cos(a2), cz2 = bz+2.15*Math.sin(a2); UN.bb(0.5,0.05,0.1,CY, cx2,FL+3.0,cz2,Math.atan2(-Math.cos(a2),-Math.sin(a2))); }
    NT.cb(2.1,2.9,0xeeeaff, bx,FL+0.08,bz,28,0.35);                                                       /* mosquiteiro translúcido em cúpula */
    LI.cb(0.04,0.5,K.steelD, bx,FL+3.0,bz,6); UN.ic(0.14,0xffe9a6, bx,FL+3.1,bz,1,1,1,1);
    /* parede aquário, skyline e prateleiras */
    LI.bb(3.6,1.5,0.3,0x0a2a3a, -9.45,FL+0.5,-72.2); UN.bb(3.4,1.3,0.05,0x1a6fd0, -9.45,FL+0.6,-72.0); [[-10.5,0.9,0xffa14a],[-9.4,1.2,0xff5ad2],[-8.4,0.8,0xffe14a],[-9.9,1.5,0x4dffa8]].forEach(function(f){ UN.ic(0.12,f[2], f[0],FL+f[1],-71.95,1.6,1,0.6); });
    LI.bb(0.1,2.6,5.4,0x0a0c14, x0-0.05,FL+0.3,-68.6); for (i=0;i<18;i++){ const skh = 0.5+((i*37)%17)/17*1.9; UN.bb(0.08,skh,0.26,[CY,NEON,0xffe14a,0xb066ff][i%4], x0+0.08,FL+0.4,-71.0+i*0.3); }
    for (i=0;i<3;i++){ LI.bb(0.3,0.05,1.6,K.woodD, x1-0.2,FL+1.0+i*0.5,-68.4); for (j=0;j<4;j++) LI.ic(0.1,[0xff5ad2,0x35e0ff,0xffe14a,0x7bd36a][(i+j)%4], x1-0.2,FL+1.15+i*0.5,-69.0+j*0.4,1,1.4,1); }
    LI.bb(0.9,0.8,0.5,0x2a2d38, x1-0.4,FL+0.06,-65.5); LI.bb(0.5,0.1,0.4,K.black, x1-0.4,FL+0.86,-65.5); LI.cb(0.2,0.04,0x111319, x1-0.4,FL+0.96,-65.5,16);   /* aparador com vitrola */
    LI.bb(0.4,1.4,0.3,0x111319, x1-0.2,FL+0.06,-64.6); LI.bb(0.4,1.4,0.3,0x111319, x1-0.2,FL+0.06,-66.4);                                                /* caixas de som */
    plant(x0+0.45,-70.5,1.2); plant(x1-0.4,-69.9,1.0); UN.bb(6.4,0.05,0.05,NEON, -7.9,FL+3.4,-62); UN.bb(6.4,0.05,0.05,CY, -7.9,FL+3.4,-67);
  })();
  /* ---- SUÍTE DOS PAIS (4,5 × 16,6 m): cama king, poltrona de leitura, penteadeira, adega, TV, banheiro ---- */
  (function(){
    const x0 = -4.25, x1 = -0.05;
    pb(x0,2.6,Z1,-2.7,-1.8,true); wardrobe(-0.9,-72.1,0);
    bedK(-1.9,-65.6,0x6aa84f); LI.bb(3.2,1.6,0.16,0x3a2418, -1.9,FL+0.06,-67.0); UN.bb(2.8,0.05,0.05,0xffb347, -1.9,FL+1.55,-66.88); LI.bb(0.9,1.0,0.4,K.woodD, -3.9,FL+0.06,-67.3); UN.cb(0.06,0.05,0xffe9a6, -3.9,FL+1.1,-67.3,6);
    LI.bb(1.6,0.9,0.5,K.woodD, x1-0.3,FL+0.06,-60.8); LI.bb(0.08,1.1,1.6,0x0a0c14, x1-0.08,FL+0.9,-60.8); UN.bb(0.03,1.0,1.5,0x2a6cff, x1-0.14,FL+0.95,-60.8);
    LI.bb(1.0,0.8,0.5,K.woodL, x0+0.35,FL+0.06,-57.3); LI.bb(0.04,1.4,0.9,0xbfe3f3, x0+0.1,FL+0.9,-57.3); UN.bb(0.02,1.4,0.04,0xffe9a6, x0+0.12,FL+0.9,-56.8);
    LI.bb(0.9,0.5,0.9,0x6b2f2a, x0+0.7,FL+0.06,-61.5); LI.bb(0.2,0.6,0.9,0x6b2f2a, x0+0.3,FL+0.06,-61.5); LI.cb(0.03,1.2,K.steelD, x0+1.3,FL+0.06,-61.6,5); UN.ic(0.16,0xffe9a6, x0+1.3,FL+1.3,-61.6,1,1,1,1);
    LI.bb(0.7,1.9,0.5,0x3a2418, x1-0.4,FL+0.06,-70.8); for (i=0;i<6;i++) LI.cb(0.07,0.3,[0x6a1f2a,0x2a4a1f,0x6a1f2a][i%3], x1-0.45+((i%2)*0.2-0.1),FL+0.4+((i/2)|0)*0.45,-70.75,6);
    LI.cb(1.2,0.03,0xd7c08c, -1.9,FL+0.06,-63.2,20); UN.bb(3.6,0.04,0.04,0xffb347, -2.1,FL+3.3,-64);
  })();
  /* ---- IRMÃ (3,5 m) · SOBRINHA 11 anos (2,9 m) · CONVIDADO (2,7 m) ---- */
  pb(0.25,2.4,Z1,1.0,1.9,true); bedK(2.4,-64.0,0xd96a5a); wardrobe(3.45,-60.6,-Math.PI/2); desk(0.7,-58.2,1.3,0); LI.bb(0.5,0.4,0.05,K.black, 0.7,FL+0.85,-58.5); chair(0.7,-57.6,0x8e5fb0); plant(3.4,-57.0,1.0); LI.cb(0.9,0.03,0x8e5fb0, 1.0,FL+0.06,-60.5,18);
  pb(4.05,2.9,Z1,5.0,5.9,false); bedS(6.0,-64.0,0xc07bff); wardrobe(4.35,-60.5,Math.PI/2);
  LI.bb(1.2,0.06,0.6,K.woodL, 5.6,FL+0.76,-57.4); LI.bb(0.5,0.4,0.05,K.black, 5.6,FL+0.85,-57.7); chair(5.6,-56.9,0xff7ac8); UN.bb(2.6,0.05,0.05,0xffd98a, 5.5,FL+3.2,-70);
  LI.cn(0.7,1.5,0xe8c9a0, 4.8,FL+0.06,-61.6,6); UN.ic(0.1,0xffe9a6, 4.8,FL+0.6,-61.6,1,1,1,1);                                                                /* cabaninha de leitura */
  for (i=0;i<10;i++) UN.bb(0.06,0.06,0.06,[0xffe14a,0xffffff,0x9fd2f2][i%3], 4.2+((i*7)%11)*0.25,FL+3.45,-57.5-((i*5)%9)*1.2);            /* estrelinhas no teto */
  pb(7.25,2.7,Z1,8.2,9.1,false); bedS(9.1,-64.0,0x4a8fc4); wardrobe(7.55,-60.5,Math.PI/2); desk(8.6,-57.6,1.2,0); chair(8.6,-57.0,0x2a4a73);

  /* =================== FILEIRA DOS FUNDOS: técnico (x 10,1 → 27,4) =================== */
  /* datacenter imerso */
  [[11.5,-68.4],[14.5,-68.4],[11.5,-65.4],[14.5,-65.4],[11.5,-62.4],[14.5,-62.4],[11.5,-59.4],[14.5,-59.4]].forEach(function(t,n){ LI.bb(2.2,1.0,1.4,K.steel, t[0],FL,t[1]); LI.bb(2.0,0.1,1.2,0x2c6f78, t[0],FL+1.0,t[1]); LG.bb(1.8,0.05,1.0,0x35e0b0, t[0],FL+1.1,t[1]); LA.bb(1.4,0.06,0.04,[CY,GRN][n%2], t[0],FL+0.6,t[1]+0.72); });
  for (i=0;i<5;i++){ const rx = 10.95 + i*1.1; LI.bb(0.95,2.3,0.9,0x22262b, rx,FL,-71.9); for (j=0;j<10;j++) for (k=0;k<3;k++) [LA,LB,LC][(i+j+k)%3].bb(0.12,0.07,0.04,[CY,GRN,0xc07bff,0xffb347][(i*3+j+k)%4], rx-0.28+k*0.28,FL+0.25+j*0.2,-71.42); }
  /* laboratórios */
  LI.bb(0.9,0.95,12,K.white, 16.6,FL,-64.2); LI.bb(1.0,0.07,12.1,0x6c7b88, 16.6,FL+0.95,-64.2); LI.bb(0.9,0.95,12,K.white, 19.5,FL,-64.2); LI.bb(1.0,0.07,12.1,0x6c7b88, 19.5,FL+0.95,-64.2);
  [-70.5,-67.5,-64.5,-61.5].forEach(function(z,n){ LI.cb(0.2,1.0,K.white, 16.6,FL+1.02,z,10); LI.ic(0.35,0xbfe3f3, 16.6,FL+1.7,z,1,1,1,1); LI.bb(0.6,0.5,0.6,[K.steelD,K.white][n%2], 19.5,FL+1.02,z); LG.bb(0.3,0.3,0.04,CY, 19.2,FL+1.3,z); });
  LI.bb(1.2,1.9,1.0,K.steel, 18.0,FL,-57.2);
  /* sala limpa */
  LI.bb(1.4,0.9,3.0,0x191c22, 21.6,FL,-69.6); LI.bb(0.7,0.5,0.9,K.white, 21.4,FL+0.9,-70.2); LG.bb(0.6,0.04,0.8,0xb066ff, 21.4,FL+0.9,-70.2); LI.bb(0.2,1.2,0.2,K.steelD, 21.4,FL+1.4,-70.2);
  LI.cb(0.5,3.0,0xcfd5da, 22.4,FL,-64.6,12); LI.bb(1.1,1.1,1.1,K.white, 21.6,FL,-59.4); LC.bb(0.2,0.06,6,0xb066ff, 21.5,FL+3.2,-64);
  /* suporte de vida e baterias térmicas */
  [-70.6,-68.2,-65.8,-63.4].forEach(function(bz){ LI.add(cylG(1,16), K.steel, 25.2,FL+1.0,bz, [0.7,3.0,0.7], [0,0,Math.PI/2]); LI.add(cylG(1,16), K.orange, 23.7,FL+1.0,bz, [0.55,0.14,0.55], [0,0,Math.PI/2]); LI.bb(0.2,1.0,0.2,K.steelD, 24.4,FL,bz); LI.bb(0.2,1.0,0.2,K.steelD, 26.0,FL,bz); LC.bb(0.12,0.9,0.9,0xff7a2a, 23.6,FL+0.55,bz); });
  [[24.2,-60.6],[25.4,-60.6],[26.6,-60.6]].forEach(function(t){ LI.cb(0.5,2.4,K.blue, t[0],FL,t[1],12); LI.cb(0.52,0.2,K.steel, t[0],FL+2.4,t[1],12); });
  for (i=0;i<4;i++){ LI.cb(0.24,0.9,K.red, 24.0+i*0.7,FL,-58.2,8); LI.cb(0.18,0.2,K.white, 24.0+i*0.7,FL+0.9,-58.2,8); }


  /* =================== FILEIRA DA FRENTE (x −11,4 → 27,4) =================== */
  /* estar, jantar e cozinha (13,6 × 14,6 m) */
  LI.bb(8.0,0.9,0.7, 0xe6d3b0, -4.4,FL+0.06,-52.7); LI.bb(8.1,0.06,0.8,0xefe6d2, -4.4,FL+0.96,-52.7); LI.bb(0.8,0.12,0.5,K.steel, -6.4,FL+1.0,-52.7); LI.cb(0.035,0.3,K.steel, -6.4,FL+1.12,-52.5,5); LI.bb(0.9,0.1,0.6,K.black, -3.4,FL+1.02,-52.7);
  LI.bb(0.9,1.9,0.8,K.white, 0.9,FL+0.06,-52.7); LI.bb(2.0,0.1,0.8,K.steelD, -3.4,FL+2.5,-52.9); LI.bb(3.2,0.95,1.1,0xe6d3b0, -4.6,FL+0.06,-49.4); LI.bb(3.3,0.06,1.2,MARB, -4.6,FL+1.01,-49.4); for (i=0;i<4;i++) LI.cb(0.22,0.6,K.woodD, -5.8+i*0.8,FL+0.06,-48.2,8);
  LI.bb(3.4,0.08,1.3,K.woodD, -4.6,FL+0.76,-44.6); [[-1.5,-0.5],[1.5,-0.5],[-1.5,0.5],[1.5,0.5]].forEach(function(l){ LI.bb(0.12,0.7,0.12,K.woodD, -4.6+l[0],FL+0.06,-44.6+l[1]); });
  for (i=0;i<4;i++){ LI.bb(0.42,0.5,0.42,K.woodL, -5.9+i*0.8,FL+0.06,-46.0); LI.bb(0.42,0.5,0.42,K.woodL, -5.9+i*0.8,FL+0.06,-43.2); } LI.bb(0.42,0.5,0.42,K.woodL, -7.7,FL+0.06,-44.6); LI.bb(0.42,0.5,0.42,K.woodL, -1.5,FL+0.06,-44.6);
  LI.bb(1.0,0.5,3.8,0x2f6cb8, -9.6,FL+0.06,-41.9); LI.bb(0.3,0.8,3.8,0x2f6cb8, -10.4,FL+0.06,-41.9); LI.bb(3.2,0.5,1.0,0x2f6cb8, -7.8,FL+0.06,-39.9); LI.bb(1.0,0.4,1.0,K.woodD, -8.2,FL+0.06,-42.2); LI.cb(1.6,0.03,0xc4503a, -8.4,FL+0.06,-43.0,22);
  LI.bb(0.1,1.5,3.2,0x0a0c14, -11.15,FL+1.0,-47.5); UN.bb(0.02,1.4,3.1,0x2a6cff, -11.05,FL+1.05,-47.5); LI.bb(0.5,0.4,2.6,K.woodD, -10.9,FL+0.06,-47.5);
  LI.bb(2.2,1.1,0.5,0x2a2d38, 0.4,FL+0.06,-40.2); UN.bb(1.8,0.04,0.04,0xffb347, 0.4,FL+0.9,-39.9); [[-0.4],[0.4],[1.2]].forEach(function(s){ LI.cb(0.2,0.5,K.woodD, s[0],FL+0.06,-41.0,8); });   /* bar com bancos */
  plant(-10.8,-52.6,1.3); plant(1.7,-45.0,1.3); UN.bb(12,0.05,0.05,0xffe9a6, -4.6,FL+3.3,-46);
  /* despensa 90 dias */
  function bItem(x,y,z,n){ const m = n%5; if (m === 0 || m === 3) LI.cb(0.12,0.3,[0xd9534f,0xe8b04a,0x7bb661,0xf0e0b0,0x8e5fb0,0xc27a3a][n%6], x,y,z,6); else if (m === 1) LI.cb(0.09,0.2,K.steel, x,y,z,6); else if (m === 2) LI.bb(0.34,0.24,0.3,0xe2c47c, x,y,z); else LI.bb(0.3,0.3,0.3,[K.woodL,0xe9c86a,0xb5593b][n%3], x,y,z); }
  function shelfZ(z1,z2,x){ const L = z2-z1;
  const n = Math.floor(L/0.5);
  const nu = Math.round(L/1.5);
  let a;
  let b;
  let c; for (a=0;a<3;a++){ LI.bb(0.5,0.06,L,K.woodL, x,FL+0.6+a*0.7,(z1+z2)/2); for (b=0;b<n;b++) bItem(x,FL+0.66+a*0.7,z1+0.25+b*0.5,b+a*3); } for (c=0;c<=nu;c++) LI.bb(0.54,2.3,0.08,K.woodD, x,FL+0.06,z1+c*L/nu); }
  shelfZ(-52.4,-39.4,2.6); shelfZ(-52.4,-39.4,5.4); for (i=0;i<4;i++) LI.cb(0.4,0.9,K.wood, 3.5+(i%2)*1.0,FL+0.06,-47+((i/2)|0)*1.0,10,0.37); LI.bb(1.4,0.85,0.7,K.white, 4.0,FL+0.06,-40.6);
  /* cinema e jogos */
  LI.bb(5.2,2.6,0.2,0x0a0c14, 9.1,FL+0.6,-52.9); UN.bb(4.9,2.3,0.04,0x2a6cff, 9.1,FL+0.75,-52.78); [-50.0,-47.8].forEach(function(z,n){ for (i=0;i<3;i++){ LI.bb(0.9,0.5,0.9,0x6b2f2a, 7.2+i*1.5,FL+0.06+n*0.3,z); LI.bb(0.9,0.7,0.2,0x6b2f2a, 7.2+i*1.5,FL+0.4+n*0.3,z+0.45); } });
  LI.bb(2.4,0.8,1.3,0x1a5a3a, 8.6,FL+0.06,-42.4); LI.bb(2.5,0.1,1.4,K.woodD, 8.6,FL+0.8,-42.4); LI.cb(0.1,0.1,0xffffff, 8.2,FL+0.92,-42.4,8); LI.cb(0.1,0.1,0xe0462d, 8.9,FL+0.92,-42.4,8); LI.bb(0.08,0.08,1.5,K.woodD, 11.6,FL+1.4,-42.4); UN.bb(2.2,0.04,0.04,NEON, 8.6,FL+2.4,-42.4);
  for (i=0;i<2;i++){ LI.bb(0.9,1.8,0.8,0x2a2d38, 10.2+i*1.1,FL+0.06,-39.6); UN.bb(0.7,0.5,0.04,[NEON,CY][i], 10.2+i*1.1,FL+1.2,-39.98); }
  UN.bb(6.2,0.05,0.05,CY, 9.1,FL+3.3,-46);
  /* hidroponia */
  [14.2,16.4,18.6].forEach(function(hx){ for (j=0;j<4;j++){ LI.bb(1.0,0.08,12.4,K.steelD, hx,FL+0.5+j*0.7,-46.2); for (k=0;k<19;k++) LI.ic(0.26,[0x3fb04a,0x57c25c,0x7bd36a][(k+j)%3], hx+(k%2?0.2:-0.2),FL+0.78+j*0.7,-52.0+k*0.62,1,0.8,1); UN.bb(0.9,0.03,12.0,0xd44cff, hx,FL+0.38+j*0.7,-46.2); } LI.bb(0.1,3.0,12.4,K.steelD, hx-0.55,FL,-46.2); LI.bb(0.1,3.0,12.4,K.steelD, hx+0.55,FL,-46.2); });
  LI.cb(0.5,1.4,K.blue, 13.0,FL,-39.8,10); LI.cb(0.5,1.4,K.blue, 19.6,FL,-39.8,10);
  /* oficina maker */
  LI.bb(0.8,0.95,10,K.woodL, 26.8,FL,-46.2); LI.bb(0.9,0.06,10.1,0xefe6d2, 26.8,FL+0.95,-46.2); [-51,-49,-47].forEach(function(pz){ LI.bb(0.5,0.5,0.5,K.white, 26.8,FL+1.01,pz); LG.bb(0.3,0.3,0.04,CY, 26.54,FL+1.3,pz); });
  LI.bb(1.6,1.5,1.4,K.steelD, 22.2,FL,-51.6); LG.bb(1.0,0.5,0.05,0xffb347, 22.2,FL+0.8,-50.9); LI.bb(2.2,0.8,0.8,K.steel, 22.2,FL,-47.4); LI.cb(0.3,0.5,K.black, 21.4,FL+0.8,-47.4,8); LI.bb(1.0,0.9,0.9,K.red, 21.6,FL,-43.4);
  LI.bb(1.2,0.12,2.4,K.steelD, 24.2,FL,-41.2); for (i=0;i<4;i++) LI.bb(0.2,0.2,0.9,K.woodL, 24.2,FL+0.12+i*0.2,-41.2); LI.bb(0.2,0.2,1.6,K.yellow, 22.6,FL+0.06,-40.6); LI.bb(0.9,0.05,1.6,K.steelD, 22.6,FL+0.26,-40.6);
  for (i=0;i<9;i++) LI.bb(0.1,0.3,0.5+(i%3)*0.12,[K.red,K.steel,K.yellow][i%3], 27.3,FL+1.3+(i%3)*0.4,-51+i*1.0);

  LW.build(under); LI.build(under); LG.build(under,{unlit:true, outline:false}); UN.build(under,{unlit:true, outline:false});
  const netMat = toonMat.clone(); netMat.transparent = true; netMat.opacity = 0.3; netMat.depthWrite = false; netMat.side = THREE.DoubleSide; NT.build(under,{mat:netMat, outline:false});
  HB.build(surface);
  [LA,LB,LC].forEach(function(L){ ledGroups.push(L.build(under,{unlit:true, outline:false})); });
})();

/* sombra falsa chapada sob a maquete */
(function(){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({color:0x2a2018, transparent:true, opacity:0.12, depthWrite:false}));
  m.rotation.x = -Math.PI/2; m.scale.set(108,158,1); m.position.set(3,-10.12,3); dio.add(m);
})();


/* ================= HUD DA 1ª PESSOA E PLACAS DE PORTA ================= */
const ROOMS = [   /* [nome, x1, z1, x2, z2, nível] em coordenadas do mundo; o primeiro que contém o ponto vence */
  ['Cozinha de serviço',-12,-68,-6,-59,'s'],['Copa',-12,-59,-6,-56,'s'],['Capela',-12,-56,-6,-48,'s'],
  ['Sala de jantar',-6,-68,8,-62,'s'],['Sala de visitas',-6,-62,8,-56,'s'],['Hall e escadaria',-6,-56,8,-48,'s'],
  ['Despensa de catástrofe',8,-68,14,-61,'s'],['Banheiros coletivos',8,-61,14,-56,'s'],['Escritório',8,-56,14,-48,'s'],
  ['Varanda e escadaria',-12.4,-48,14.4,-41,'s'],
  ['Suíte A',-12,-55.5,-6.5,-48,'a'],['Suíte B',-6.5,-55.5,-1,-48,'a'],['Suíte C',3,-55.5,8.5,-48,'a'],['Suíte D',8.5,-55.5,14,-48,'a'],
  ['Suíte E',-12,-68,-3,-59,'a'],['Suíte F',5,-68,14,-59,'a'],['Sala íntima',-3,-68,5,-59,'a'],['Corredor do sobrado',-12,-59,14,-55.5,'a'],['Escada',-0.1,-55.2,2.1,-48.2,'a'],
  ['Engenho 1850',21,-43,43,-33,'s'],['Pátio técnico',21,-33,39,-13,'s'],['Curral',23,-10,39,9,'s'],['Biodigestor',22.5,10,40,16,'s'],
  ['Estufa',21.5,30.6,33.5,40.6,'s'],['Núcleo Sisteminha',-44,31,5,62,'s'],['Jazida de argila',-48,56,-18,75,'s'],
  ['Quadras de rotação',-36,-44,8,11,'s'],['Bambuzal',-44,-72,-16,-46,'s'],['Silvicultura',17,-74,43,-46,'s'],['Estrada',-50,25.5,43,30.5,'s'],
  ['Suíte cyberpunk do Mestre',-11.4,-72.4,-4.4,-55.8,'u'],['Suíte dos pais',-4.4,-72.4,0.1,-55.8,'u'],['Quarto da irmã',0.1,-72.4,3.9,-55.8,'u'],['Quarto da sobrinha',3.9,-72.4,7.1,-55.8,'u'],['Quarto do convidado',7.1,-72.4,10.1,-55.8,'u'],
  ['Datacenter',10.1,-72.4,16.1,-55.8,'u'],['Laboratórios',16.1,-72.4,20,-55.8,'u'],['Sala limpa',20,-72.4,23,-55.8,'u'],['Suporte de vida e baterias',23,-72.4,27.4,-55.8,'u'],
  ['Corredor do bunker',-11.4,-55.8,27.4,-53.2,'u'],['Estar, jantar e cozinha',-11.4,-53.2,2.2,-38.6,'u'],['Despensa 90 dias',2.2,-53.2,5.8,-38.6,'u'],['Cinema e jogos',5.8,-53.2,12.4,-38.6,'u'],['Hidroponia',12.4,-53.2,20.4,-38.6,'u'],['Oficina maker',20.4,-53.2,27.4,-38.6,'u'],
  ['Sobrado',-12.4,-68,14.4,-47,'a']];
function roomAt(x,z,lvl){ for (let i=0;i<ROOMS.length;i++){ const r = ROOMS[i]; if (r[5] === lvl && x >= r[1] && x <= r[3] && z >= r[2] && z <= r[4]) return r; } return null; }
let hudEl = null;
let hudLast = '';
function fpHud(){
  hudEl = hudEl || $('#fp-hud'); const r = roomAt(fp.x, fp.z, fp.lvl), t = r ? r[0] + ' · ' + Math.round((r[3]-r[1])*(r[4]-r[2])) + ' m²' : 'Sítio Vale do Café';
  if (t !== hudLast){ hudLast = t; hudEl.textContent = t; }
}
const PLQ = [];
function plaque(parent, txt, x, y, z, ry){
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const c = cv.getContext('2d');
  c.fillStyle = '#2b1d12'; c.fillRect(0,0,256,64); c.strokeStyle = '#d4a24a'; c.lineWidth = 4; c.strokeRect(3,3,250,58);
  c.fillStyle = '#f6e7c3'; c.font = 'bold 26px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 128, 34);
  const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.25), new THREE.MeshBasicMaterial({map:tex}));
  m.position.set(x,y,z); m.rotation.y = ry || 0; m.visible = false; parent.add(m); PLQ.push(m);
}
/* casa: placas nas portas internas (coordenadas locais da casa) */
plaque(casaG,'CAPELA',-6.75,GF+3.05,5.7,Math.PI/2); plaque(casaG,'ESCRITÓRIO',6.75,GF+3.05,5.7,-Math.PI/2); plaque(casaG,'SALA DE JANTAR',0,GF+3.3,-3.8,0);
plaque(casaG,'COZINHA',-6.75,GF+3.05,-6.3,Math.PI/2); plaque(casaG,'DESPENSA',6.75,GF+3.05,-6.4,-Math.PI/2); plaque(casaG,'BANHEIROS',6.75,GF+3.05,-1.85,-Math.PI/2);
plaque(casaUp,'CORREDOR DAS SUÍTES',0,3.2,2.3,0); plaque(casaUp,'SALA ÍNTIMA',0,3.2,-1.2,0);
plaque(barnG,'ENGENHO 1850',-6.0,4.2,4.4,Math.PI); plaque(barnG,'OFICINA',3.0,4.2,4.4,Math.PI);
plaque(under,'SUÍTE DO MESTRE',-8.2,BFL+2.9,-55.6,0); plaque(under,'PAIS',-2.3,BFL+2.9,-55.6,0); plaque(under,'IRMÃ',2.0,BFL+2.9,-55.6,0); plaque(under,'SOBRINHA',5.5,BFL+2.9,-55.6,0); plaque(under,'CONVIDADO',8.6,BFL+2.9,-55.6,0);
plaque(under,'DATACENTER',13.1,BFL+2.9,-55.6,0); plaque(under,'LABORATÓRIOS',18.05,BFL+2.9,-55.6,0); plaque(under,'SALA LIMPA',21.5,BFL+2.9,-55.6,0); plaque(under,'SUPORTE DE VIDA',25.2,BFL+2.9,-55.6,0);
plaque(under,'DESPENSA',4.0,BFL+2.9,-53.0,Math.PI); plaque(under,'CINEMA E JOGOS',9.1,BFL+2.9,-53.0,Math.PI); plaque(under,'HIDROPONIA',16.4,BFL+2.9,-53.0,Math.PI); plaque(under,'OFICINA MAKER',23.9,BFL+2.9,-53.0,Math.PI);

/* ================= LEGENDAS ================= */
const labelsHost = $('#labels'), svg = $('#leaders'), NS = 'http://www.w3.org/2000/svg';
const labelItems = LABELS.map(function(d){
  const anchor = new THREE.Object3D(); anchor.position.set(d.p[0], d.p[1], d.p[2]); ({s:surface,u:under,c:casaRoofG,b:barnRoofG,i:casaG,e:barnG,U:casaUp}[d.L] || surface).add(anchor);
  const el = document.createElement('button'); el.className = 'lbl'; el.type = 'button';
  const b = document.createElement('span'); b.textContent = d.t; el.appendChild(b);
  if (d.s){ const s = document.createElement('small'); s.textContent = d.s; el.appendChild(s); }
  el.addEventListener('click', function(){ focusOn(d.k); });
  labelsHost.appendChild(el);
  const line = document.createElementNS(NS, 'line'), dot = document.createElementNS(NS, 'circle'); dot.setAttribute('r', '3');
  svg.appendChild(line); svg.appendChild(dot);
  return {d:d, anchor:anchor, el:el, line:line, dot:dot, w:0, h:0};
});
let needMeasure = true;
let showLabels = true;
const vTmp = new THREE.Vector3();
function measure(){ labelItems.forEach(function(it){ it.el.hidden = false; it.w = it.el.offsetWidth; it.h = it.el.offsetHeight; }); needMeasure = false; }

function updateLabels(W, H){
  if (!showLabels || fp.on) return;
  if (needMeasure) measure();
  const narrow = W < 640, items = [];
  labelItems.forEach(function(it){
    const hide = (narrow && !it.d.m) || (!it.d.m && cur.zoom < 1.5) || (it.d.i && cur.lift < 40) || (it.d.z && cur.zoom < it.d.z);
    vTmp.setFromMatrixPosition(it.anchor.matrixWorld).project(camera);
    it.sx = (vTmp.x*0.5 + 0.5)*W; it.sy = (-vTmp.y*0.5 + 0.5)*H;
    it.vis = !hide && vTmp.z < 1 && it.sx > -20 && it.sx < W+20 && it.sy > -20 && it.sy < H+20;
    if (it.vis) items.push(it); else { it.el.hidden = true; it.line.style.display = 'none'; it.dot.style.display = 'none'; }
  });
  items.sort(function(a,b){ return (b.d.m - a.d.m) || (b.sy - a.sy); });
  const placed = [];
  items.forEach(function(it){
    const w = it.w;
    const h = it.h;
    const bx = it.sx - w/2;
    const by = it.sy - 16 - h;
    let ok = false;
    let px = 0;
    let py = 0;
    for (let step=0; step<9 && !ok; step++){
      for (let k=0; k<5 && !ok; k++){
        const dx = [0,1,-1,2,-2][k]*(w*0.55 + 4), x = clamp(bx + dx, 4, Math.max(4, W - w - 4)), y = by - step*(h+5);
        if (y < 4 || y > H - h - 4) continue;
        let hit = false;
        for (let i=0;i<placed.length;i++){ const p = placed[i]; if (x < p.x+p.w+4 && x+w+4 > p.x && y < p.y+p.h+4 && y+h+4 > p.y){ hit = true; break; } }
        if (!hit){ ok = true; px = x; py = y; }
      }
    }
    if (!ok){ it.el.hidden = true; it.line.style.display = 'none'; it.dot.style.display = 'none'; return; }
    placed.push({x:px, y:py, w:w, h:h});
    it.el.hidden = false; it.el.style.transform = 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px)';
    const lx = clamp(it.sx, px+6, px+w-6);
    it.line.style.display = ''; it.dot.style.display = '';
    it.line.setAttribute('x1', it.sx.toFixed(1)); it.line.setAttribute('y1', it.sy.toFixed(1)); it.line.setAttribute('x2', lx.toFixed(1)); it.line.setAttribute('y2', (py+h).toFixed(1));
    it.dot.setAttribute('cx', it.sx.toFixed(1)); it.dot.setAttribute('cy', it.sy.toFixed(1));
  });
}

/* ================= CÂMERA E ESTADO ================= */
const st = {rotY:-0.55, rotX:0.17, zoom:1.12, panX:0, panY:0, lift:0, f:new THREE.Vector3(2,-4,2)};
const cur = {rotY:-0.55, rotX:0.17, zoom:1.12, panX:0, panY:0, lift:0, f:new THREE.Vector3(2,-4,2)};
const sim = {flow:0.65, wind:0.5};
let W = 1;
let H = 1;

function resize(){
  const r = stage.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
  renderer.setSize(W, H); camera.aspect = W/H; camera.updateProjectionMatrix(); needMeasure = true;
  hullMat.uniforms.uRes.value.set(W, H); hullMat.uniforms.uThick.value = W < 640 ? 1.15 : 1.5;
}
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
resize();

let subView = false;
function focusOn(key){
  const s = SECTOR[key]; if (!s) return;
  subView = ['bunker','datacenter','labs','clean','refuge','battery'].indexOf(key) >= 0;
  st.f.set(s.f[0], s.f[1], s.f[2]); st.rotY = s.ry; st.rotX = s.rx; st.zoom = s.z; st.panX = 0; st.panY = 0;
  if (key === 'overview'){ setLift(0); } else if (s.lift != null){ setLift(s.lift); }
  setInfo(s);
  document.querySelectorAll('[data-sector]').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.sector === key ? 'true' : 'false'); });
  const chip = chipsEl.querySelector('[data-sector="' + key + '"]'); if (chip && chip.scrollIntoView) { try { chip.scrollIntoView({block:'nearest', inline:'center', behavior:'smooth'}); } catch(e){} }
}
function setInfo(s){
  $('#info-tag').textContent = ['bunker','datacenter','labs','clean','refuge','battery'].indexOf(s.k) >= 0 ? 'Subsolo' : (['casa_in','barn_in'].indexOf(s.k) >= 0 ? 'Interior' : (s.k === 'overview' ? 'Visão geral' : 'Superfície'));
  $('#info-title').textContent = s.n; $('#info-text').textContent = s.d;
}
function setLift(pct){
  st.lift = pct; const sl = $('#s-xray'); sl.value = pct; $('#o-xray').textContent = Math.round(pct) + '%';
}

/* ================= INTERAÇÃO ================= */
const ptrs = new Map();
let lastDist = 0;
function panUnit(){ const vf2 = THREE.MathUtils.degToRad(camera.fov), hf2 = 2*Math.atan(Math.tan(vf2/2)*camera.aspect); return 2*Math.tan(vf2/2)*(104/Math.sin(Math.min(vf2,hf2)/2)/cur.zoom)/H; }
function pdist(){ const a = Array.from(ptrs.values()); return Math.hypot(a[0].x-a[1].x, a[0].y-a[1].y); }
glHost.addEventListener('pointerdown', function(e){
  try { glHost.setPointerCapture(e.pointerId); } catch(err){}
  ptrs.set(e.pointerId, {x:e.clientX, y:e.clientY}); if (ptrs.size === 2) lastDist = pdist();
});
glHost.addEventListener('pointermove', function(e){
  const p = ptrs.get(e.pointerId); if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  if (fp.on){ fp.yaw -= dx*0.0055; fp.pitch = clamp(fp.pitch - dy*0.0045, -1.3, 1.3); return; }
  if (ptrs.size === 1){ st.rotY += dx*0.0075; st.rotX = clamp(st.rotX + dy*0.004, -0.2, 0.6); }
  else if (ptrs.size === 2){ const d = pdist(); if (lastDist > 0) st.zoom = clamp(st.zoom * d/lastDist, 0.55, 8); lastDist = d; const ppu = panUnit(); st.panX = clamp(st.panX + dx*0.5*ppu, -90, 90); st.panY = clamp(st.panY - dy*0.5*ppu, -70, 90); }
});
function endPtr(e){ ptrs.delete(e.pointerId); lastDist = 0; }
glHost.addEventListener('pointerup', endPtr); glHost.addEventListener('pointercancel', endPtr); glHost.addEventListener('lostpointercapture', endPtr);
glHost.addEventListener('wheel', function(e){ e.preventDefault(); if (fp.on) return; st.zoom = clamp(st.zoom * Math.exp(-e.deltaY*0.0012), 0.55, 8); }, {passive:false});

$('#s-xray').addEventListener('input', function(e){ setLift(parseFloat(e.target.value)); });
sim.speed = 1; sim.season = 'set'; sim.hour = 0;
function sunVec(h, decl){ const lat = -22.4*Math.PI/180, d = decl*Math.PI/180, ha = (h-12)*15*Math.PI/180;
  const se = Math.sin(lat)*Math.sin(d) + Math.cos(lat)*Math.cos(d)*Math.cos(ha), el = Math.asin(se);
  const az = Math.atan2(Math.sin(ha), Math.cos(ha)*Math.sin(lat) - Math.tan(d)*Math.cos(lat)) + Math.PI;
  return {v:new THREE.Vector3(-Math.sin(az)*Math.cos(el), se, Math.cos(az)*Math.cos(el)), se:se}; }   /* x = oeste, z = norte */
function applySun(){
  if (sim.hour < 6){ SUNDIR.set(-0.55, 0.78, 0.55).normalize(); sun.intensity = 0.34; $('#o-sun').textContent = 'Padrão'; return; }
  const r = sunVec(sim.hour, {jun:-23.44, set:0, dez:23.44}[sim.season]); r.v.y = Math.max(r.v.y, 0.04); SUNDIR.copy(r.v).normalize();
  sun.intensity = 0.34*clamp(r.se*4, 0.12, 1.1); const hh = Math.floor(sim.hour), mm = Math.round((sim.hour-hh)*60);
  $('#o-sun').textContent = hh + ':' + (mm < 10 ? '0' : '') + mm;
}
$('#s-speed').addEventListener('input', function(e){ sim.speed = parseFloat(e.target.value)/100; $('#o-speed').textContent = Math.round(sim.speed*100) + '%'; });
$('#s-sun').addEventListener('input', function(e){ sim.hour = parseFloat(e.target.value); applySun(); });
document.querySelectorAll('[data-season]').forEach(function(b){ b.addEventListener('click', function(){ sim.season = b.dataset.season; document.querySelectorAll('[data-season]').forEach(function(o){ o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); }); applySun(); }); });
document.querySelectorAll('[data-flavour]').forEach(function(b){
  b.addEventListener('click', function(){
    const hex = {cristal:0x2bb3e6, lagoa:0x2fbf8a, sinestesia:0xb06be0}[b.dataset.flavour];
    waterMat.color.copy(C(hex)); pondMat.color.copy(C(hex));
    document.querySelectorAll('[data-flavour]').forEach(function(o){ o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
  });
});
$('#b-labels').addEventListener('click', function(e){
  showLabels = !showLabels; e.currentTarget.setAttribute('aria-pressed', String(showLabels)); e.currentTarget.textContent = 'Legendas: ' + (showLabels ? 'on' : 'off');
  document.body.classList.toggle('nolabels', !showLabels); if (showLabels) needMeasure = true;
});
$('#b-reset').addEventListener('click', function(){ focusOn('overview'); });
$('#d-up').addEventListener('click', function(){ st.panY = clamp(st.panY + 9, -70, 90); });
$('#d-down').addEventListener('click', function(){ st.panY = clamp(st.panY - 9, -70, 90); });

/* painel e gavetas: a maquete se reenquadra no espaço que sobra */
const panelEl = $('#panel');
const mobileQ = window.matchMedia('(max-width:899px)');
let openDrawer = null;
function syncBody(){
  const panelOpen = panelEl.classList.contains('open');
  document.body.classList.toggle('sheet-open', mobileQ.matches && (panelOpen || !!openDrawer));
  document.body.classList.toggle('drawer-open', !!openDrawer);
  $('#d-panel').setAttribute('aria-expanded', String(panelOpen));
  $('#d-bom').setAttribute('aria-pressed', String(openDrawer === 'bom')); $('#d-aura').setAttribute('aria-pressed', String(openDrawer === 'aura'));
}
function setDrawer(id){
  ['bom','aura'].forEach(function(k){ $('#' + k).hidden = (k !== id); });
  openDrawer = id || null;
  if (id && mobileQ.matches) panelEl.classList.remove('open');
  syncBody();
}
$('#d-panel').addEventListener('click', function(){
  const willOpen = !panelEl.classList.contains('open');
  if (willOpen) setDrawer(null);
  panelEl.classList.toggle('open', willOpen); syncBody();
});
['#b-bom','#d-bom'].forEach(function(s){ $(s).addEventListener('click', function(){ setDrawer(openDrawer === 'bom' ? null : 'bom'); }); });
['#b-aura','#d-aura'].forEach(function(s){ $(s).addEventListener('click', function(){ setDrawer(openDrawer === 'aura' ? null : 'aura'); }); });
document.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click', function(){ setDrawer(null); }); });
document.addEventListener('keydown', function(e){ if (e.key === 'Escape'){ if (fp.on) exitFP(); else setDrawer(null); } });
if (mobileQ.addEventListener) mobileQ.addEventListener('change', syncBody); else if (mobileQ.addListener) mobileQ.addListener(syncBody);
document.querySelectorAll('[data-ask]').forEach(function(b){
  b.addEventListener('click', function(){
    const log = $('#aura-log'), d = document.createElement('div'); d.className = 'msg';
    const h = document.createElement('b'); h.textContent = 'Aura · relatório'; d.appendChild(h); d.appendChild(document.createTextNode(AURA[b.dataset.ask]));
    log.appendChild(d); const body = log.parentElement; body.scrollTop = body.scrollHeight;
  });
});

/* ================= 1ª PESSOA (ORBWALK): joystick virtual + olhar livre ================= */
const fp = {on:false, x:1, z:-50.6, yaw:0, pitch:0, lvl:'s', eye:1.7, eyeY:1.9, jx:0, jy:0, keys:{}, prevLift:0, bob:0, moved:0};
const FPR = 0.38, FPSPOT = {
  ground:{x:1, z:-50.6, yaw:0, lvl:'s'},                       /* logo atrás da porta da Casa Grande, olhando a sala */
  attic:{x:1, z:-57, yaw:0, lvl:'a'},                          /* 2º andar: corredor das suítes */
  under:{x:-9.8, z:-54.5, yaw:-Math.PI/2, lvl:'u'},            /* bunker: corredor, olhando para leste */
  under2:{x:-8.2, z:-56.6, yaw:0, lvl:'u'},                    /* suíte cyberpunk do Mestre, olhando a cama */
  gate:{x:-46, z:28, yaw:-Math.PI/2, lvl:'s'}                  /* porteira, olhando a estrada */
};
function stairY(lx,lz){ return clamp(GF + (9.4-lz)/6.6*(UF-GF), GF, UF); }
function lvlFloor(x,z,lvl){
  if (lvl === 'u') return BFL;
  const lx = x-1, lz = z+58;
  if (Math.abs(lx) < 1.1 && lz > 2.8 && lz < 9.9 && (lvl === 'a' || lvl === 's')) return stairY(lx,lz);
  if (lvl === 'a') return UF;
  if (Math.abs(lx) < 13.3 && lz > -10.3 && lz < 13.5) return GF;                                   /* térreo da casa e varanda */
  if (Math.abs(lx) < 3.3 && lz >= 13.5 && lz < 16.8) return GF*(1 - (lz-13.5)/3.3);                  /* escadaria de mármore */
  if (x > 21 && x < 43 && z > -43 && z < -33) return 0.2;
  if (x > 21 && x < 39 && z > -32 && z < -13) return 0.2;
  return 0;
}
function fpBlocked(x,z,lvl){
  const r = FPR;
  let i;
  let b;
  for (i=0;i<COL.length;i++){ b = COL[i]; if (b[4] !== lvl) continue; if (x > b[0]-r && x < b[2]+r && z > b[1]-r && z < b[3]+r) return true; }
  if (lvl === 's'){ if (x < -49 || x > 42.4 || z < -73.5 || z > 73.5) return true; }
  else if (lvl === 'u'){ if (x < -11.0 || x > 27.0 || z < -72.0 || z > -39.0) return true; }
  else if (Math.abs(x-1) > 13.3 || z+58 < -10.3 || z+58 > 12.6) return true;
  return false;
}
function fpStep(dt){
  const k = fp.keys;
  let jx = fp.jx + ((k.d||k.arrowright)?1:0) - ((k.a||k.arrowleft)?1:0);
  let jy = fp.jy + ((k.w||k.arrowup)?1:0) - ((k.s||k.arrowdown)?1:0);
  let m = Math.hypot(jx, jy); if (m > 1){ jx /= m; jy /= m; m = 1; }
  if (m > 0.06){
    const sp = 3.0 * (m > 0.92 ? 1.7 : 1) * (k.shift ? 1.6 : 1), fx = -Math.sin(fp.yaw), fz = -Math.cos(fp.yaw), rx = Math.cos(fp.yaw), rz = -Math.sin(fp.yaw);
    const vx = (fx*jy + rx*jx)*sp*dt, vz = (fz*jy + rz*jx)*sp*dt;
    if (!fpBlocked(fp.x + vx, fp.z, fp.lvl)) fp.x += vx;
    if (!fpBlocked(fp.x, fp.z + vz, fp.lvl)) fp.z += vz;
    fp.bob += dt*m*8; fp.moved += Math.hypot(vx, vz);
    const fy = lvlFloor(fp.x, fp.z, fp.lvl), inSt = Math.abs(fp.x-1) < 1.1 && fp.z+58 > 2.8 && fp.z+58 < 9.9;
    if (inSt){ if (fp.lvl === 's' && fy > 4.55) fp.lvl = 'a'; else if (fp.lvl === 'a' && fy < 4.45) fp.lvl = 's'; }
  }
  const target = lvlFloor(fp.x, fp.z, fp.lvl) + fp.eye + Math.sin(fp.bob)*0.025*Math.min(1, m);
  fp.eyeY += (target - fp.eyeY) * Math.min(1, dt*9);
  fpHud();
}
function fpMarks(){
  document.querySelectorAll('[data-fpeye]').forEach(function(b){ b.setAttribute('aria-pressed', String(parseFloat(b.dataset.fpeye) === fp.eye)); });
  document.querySelectorAll('[data-fplvl]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.fplvl === fp.spot)); });
}
function fpGo(key){
  const s = FPSPOT[key]; if (!s) return;
  fp.x = s.x; fp.z = s.z; fp.yaw = s.yaw; fp.pitch = 0; fp.lvl = s.lvl; fp.spot = key;
  fp.eyeY = lvlFloor(fp.x, fp.z, fp.lvl) + fp.eye;
  PLQ.forEach(function(q){ q.visible = true; }); fpMarks();
}
function enterFP(){
  if (fp.on) return;
  fp.on = true; fp.prevLift = st.lift; setLift(0); cur.lift = 0;
  setDrawer(null); panelEl.classList.remove('open'); syncBody();
  document.body.classList.add('fp'); $('#fp-ui').hidden = false;
  const b = $('#fp-btn'); b.setAttribute('aria-pressed', 'true'); b.textContent = '✕ Sair da 1ª pessoa';
  ptrs.clear(); fpGo('ground'); resize();
}
function exitFP(){
  if (!fp.on) return;
  fp.on = false; fp.jx = fp.jy = 0; fp.keys = {}; $('#fp-knob').style.transform = '';
  document.body.classList.remove('fp'); $('#fp-ui').hidden = true; PLQ.forEach(function(q){ q.visible = false; });
  const b = $('#fp-btn'); b.setAttribute('aria-pressed', 'false'); b.textContent = '🕹️ 1ª Pessoa (Orbwalk)';
  camera.fov = 26; setLift(fp.prevLift); needMeasure = true; resize();
}
$('#fp-btn').addEventListener('click', function(){ if (fp.on) exitFP(); else enterFP(); });
document.querySelectorAll('[data-fpeye]').forEach(function(b){ b.addEventListener('click', function(){ fp.eye = parseFloat(b.dataset.fpeye); fpMarks(); }); });
document.querySelectorAll('[data-fplvl]').forEach(function(b){ b.addEventListener('click', function(){ fpGo(b.dataset.fplvl); }); });
/* joystick analógico */
const joy = $('#fp-joy');
const knob = $('#fp-knob');
let joyId = null;
const JR = 52;
function joyMove(e){
  const r = joy.getBoundingClientRect();
  let dx = e.clientX - (r.left + r.width/2);
  let dy = e.clientY - (r.top + r.height/2);
  const d = Math.hypot(dx, dy);
  if (d > JR){ dx *= JR/d; dy *= JR/d; }
  knob.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)'; fp.jx = dx/JR; fp.jy = -dy/JR;
}
function joyEnd(e){ if (e.pointerId !== joyId) return; joyId = null; fp.jx = fp.jy = 0; knob.style.transform = ''; }
joy.addEventListener('pointerdown', function(e){ joyId = e.pointerId; try { joy.setPointerCapture(e.pointerId); } catch(err){} joyMove(e); e.preventDefault(); });
joy.addEventListener('pointermove', function(e){ if (e.pointerId === joyId) joyMove(e); });
joy.addEventListener('pointerup', joyEnd); joy.addEventListener('pointercancel', joyEnd); joy.addEventListener('lostpointercapture', joyEnd);
/* teclado (desktop) */
document.addEventListener('keydown', function(e){ if (!fp.on) return; fp.keys[e.key.toLowerCase()] = true; if (e.key.indexOf('Arrow') === 0) e.preventDefault(); });
document.addEventListener('keyup', function(e){ delete fp.keys[e.key.toLowerCase()]; });
window.addEventListener('blur', function(){ fp.keys = {}; });

/* ================= LOOP ================= */
const clock = new THREE.Clock();
let elapsed = 0;
const vf = new THREE.Vector3();
const rm = reduce ? 0.35 : 1;
/* qualidade adaptativa: se a GPU não segura ~22 fps, baixa a resolução e depois tira os contornos */
const aq = {lvl:0, n:0, sum:0};
function autoQ(raw){
  if (aq.lvl >= 2 || raw > 0.5) return;
  aq.n++; if (aq.n > 20) aq.sum += raw;
  if (aq.n < 100) return;
  const avg = aq.sum/79; aq.n = 0; aq.sum = 0;
  if (avg > 0.045){
    aq.lvl++;
    if (aq.lvl === 1){ renderer.setPixelRatio(1); resize(); }
    else scene.traverse(function(o){ if (o.material === hullMat) o.visible = false; });
  }
}
function frame(){
  requestAnimationFrame(frame);
  const raw = clock.getDelta(), dt = Math.min(raw, 0.05), dtw = dt * sim.speed; elapsed += dtw; autoQ(raw);
  const k = 1 - Math.pow(0.0008, dt);
  cur.rotY += (st.rotY - cur.rotY)*k; cur.rotX += (st.rotX - cur.rotX)*k; cur.zoom += (st.zoom - cur.zoom)*k;
  cur.panX += (st.panX - cur.panX)*k; cur.panY += (st.panY - cur.panY)*k; cur.lift += (st.lift - cur.lift)*k; cur.f.lerp(st.f, k);

  if (fp.on){
    fpStep(dt);
    const fv = clamp(THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(42))/camera.aspect)), 60, 100);
    camera.fov = fv; camera.near = 0.12; camera.far = 700; camera.updateProjectionMatrix();
    dio.rotation.set(0, 0, 0); dio.position.set(0, 0, 0);
    camera.position.set(fp.x, fp.eyeY, fp.z); camera.rotation.order = 'YXZ'; camera.rotation.set(fp.pitch, fp.yaw, 0);
    sun.position.copy(SUNDIR).multiplyScalar(260);
  } else {
  const vfov = THREE.MathUtils.degToRad(camera.fov), hfov = 2*Math.atan(Math.tan(vfov/2)*camera.aspect);
  const dist = 104 / Math.sin(Math.min(vfov, hfov)/2) / cur.zoom, elev = 0.5;
  camera.position.set(0, Math.sin(elev)*dist, Math.cos(elev)*dist); camera.lookAt(0, 0, 0);
  camera.near = Math.max(4, dist - 140); camera.far = dist + 320; camera.updateProjectionMatrix();

  dio.rotation.set(cur.rotX, cur.rotY, 0);
  vf.copy(cur.f).applyEuler(dio.rotation);
  dio.position.set(-vf.x + cur.panX, -vf.y + cur.panY, -vf.z);
  sun.position.copy(SUNDIR).applyEuler(dio.rotation).multiplyScalar(260);
  }

  const ca = (fp.on ? Math.PI - fp.yaw : Math.PI - cur.rotY).toFixed(3) + 'rad'; $('#compass-n').style.transform = 'rotate(' + ca + ')'; $('#compass').style.setProperty('--a', ca);
  /* abertura do corte: telhados sobem e paredes rebaixam, revelando o interior */
  const u = clamp(cur.lift/100, 0, 1), e = u*u*(3-2*u), wcut = smooth(0.1, 0.95, u);
  casaRoofG.position.set(0, 20*e, -7*e); casaUp.position.y = UF + 9*e; casaUpW.scale.y = 1 - 0.62*wcut; barnRoofG.position.set(0, 13*e, -5*e);
  const capO = 1 - 0.97*smooth(0.04,0.4,u); capMat.opacity = capO; capMat.transparent = capO < 0.995; capMat.depthWrite = capO > 0.6; bunkCapMesh.visible = capO > 0.03; flrMat.opacity = capO; flrMat.transparent = capO < 0.995; flrMat.depthWrite = capO > 0.6; if (casaBaseMesh) casaBaseMesh.visible = capO > 0.03;
  const hideTop = subView && u > 0.9; casaG.visible = !hideTop; barnG.visible = !hideTop;
  const ro = 1 - 0.88*smooth(0.55,0.95,u); roofMat.opacity = ro; roofMat.transparent = ro < 0.995; roofMat.depthWrite = ro > 0.6;
  [casaRoofG, barnRoofG].forEach(function(g){ g.traverse(function(c){ if (c.material === hullMat) c.visible = ro > 0.6; }); });
  casaWalls.scale.y = 1 - 0.62*wcut; barnWalls.scale.y = 1 - 0.58*wcut;

  surface.userData.tick(dtw, elapsed, {flow:sim.flow*rm, wind:sim.wind*rm});

  dio.updateMatrixWorld(true); camera.updateMatrixWorld(true);
  renderer.render(scene, camera);
  updateLabels(W, H);
}
setInfo(SECTOR.overview);
frame();
setTimeout(function(){ focusOn('overview'); }, 60);
window.__sitio = {THREE:THREE, st:st, fp:fp, fpGo:fpGo, enterFP:enterFP, exitFP:exitFP, state:function(){ return {aq:aq.lvl, lift:cur.lift, casaRoofY:casaRoofG.position.y, barnRoofY:barnRoofG.position.y, wallsY:casaWalls.scale.y, wheel:wheelSpin.rotation.z, rotor:rotor.rotation.z, fish:fishList.length, animals:animals.length, tri:renderer.info.render.triangles, calls:renderer.info.render.calls}; }, focusOn:focusOn, setDrawer:setDrawer, panel:function(){ $('#d-panel').click(); }};
})();
