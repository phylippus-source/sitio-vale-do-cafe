/* Lista de materiais e memorial técnico (capítulos 01–09 e 13–25). */

export const BOM = [
  {
    t: '01 · Gleba e implantação',
    tag: '1,5 ha',
    items: [
      [
        'Gleba',
        '100 × 150 m (15.000 m²) na microbacia do Vale do Café, entre Vassouras, Paty do Alferes e Rio das Flores (RJ).',
      ],
      [
        'Terreno',
        '520 a 555 m de altitude, declividade de 8% a 15%, gnaisse e granito estáveis com latossolo de alta drenagem.',
      ],
      [
        'Logística',
        '92 km da Região Metropolitana pelo Arco Metropolitano (BR-493) e estradas rurais secundárias.',
      ],
    ],
  },
  {
    t: '02 · Engenho histórico de 1850',
    tag: '220 m²',
    items: [
      [
        'Construção',
        '22 × 10 m, pé-direito de 4,80 m. Paredes de pedra com 80 cm, cal, saibro e óleo de baleia.',
      ],
      [
        'Cobertura',
        'Tesouras de aroeira e braúna tratadas com bórax, telha colonial sobre ripas de cedro.',
      ],
      ['Eixo de transmissão', 'Aço forjado de 60 mm e 18 m, com mancais de bronze grafitado.'],
      [
        'Roda d’água overshot',
        '3,80 m de diâmetro por 1,20 m, em peroba. 18 HP a 12 RPM com desnível de 4,20 m.',
      ],
      ['Engrenagem mestra', 'Ferro fundido de 2,40 m que leva o eixo a 120 RPM.'],
      [
        'Máquinas acopladas',
        'Serra de fita (volantes de 700 mm), moenda de granito de 80 cm, engenho de cana de 3 rolos (300 L/h) e bomba de pistão duplo (4.000 L/dia até a cota +555 m).',
      ],
      ['Forja', 'Bigorna de 180 kg, fole duplo acoplável ao eixo e morsa de ferreiro.'],
    ],
  },
  {
    t: '03 · Garagem, oficina e elevador oculto',
    tag: '80 m²',
    items: [
      ['Veículos', 'Van Asia Towner e moto de 175 cc.'],
      [
        'Pátio técnico',
        'Laje de concreto de 18 × 19 m com minicarregadeira, miniescavadeira, carrinhos elétricos de ferramentas, paletes e caixas de ferramentas.',
      ],
      [
        'Equipamentos',
        'Torno Nardini Mascote de 1 m, fresadora com inversor, solda TIG/MIG, prensa de 30 t e bancada para ESP32 e STM32.',
      ],
      [
        'Elevador',
        'Plataforma de 3 × 5 m para 4,5 t, com cilindro hidráulico de duplo estágio. Desce até a antecâmara a −8 m.',
      ],
      [
        'Painéis solares',
        '48 painéis de 450 W (21,6 kWp) no telhado do engenho, com película antirreflexo.',
      ],
    ],
  },
  {
    t: '04 · Casa Grande de superfície',
    tag: '520 m² + sobrado',
    items: [
      [
        'Arquitetura',
        'Sobrado imperial do século XIX reformado em 2026: porão alto de pedra, esteios de madeira com vedação de pau-a-pique, paredes ocre e brancas, madeira escura, ferro fundido com rebites grossos, azulejo português e mármore branco. Toques da UFRRJ: ocre e branco, frontão central, arcada.',
      ],
      [
        'Quartos e banhos',
        'Sobrado com 6 suítes e banheiro privativo, sala íntima, mais 2 banheiros coletivos no térreo.',
      ],
      [
        'Cozinha de serviço',
        '54 m² com fogão a lenha de ferro, bancada com pia, mesa e azulejos portugueses; copa com passa-pratos.',
      ],
      [
        'Despensa de catástrofe',
        '42 m² com prateleiras em três paredes, barris, galões de água, freezer e sacarias.',
      ],
      [
        'Porão e acesso',
        'Porão alto de pedra com respiros gradeados. O elevador fica sob o assoalho da casa, destravado por contrapeso disfarçado.',
      ],
    ],
  },
  {
    t: '05 · Zootecnia de ciclo fechado',
    tag: '10 moradores',
    items: [
      [
        'Galinhas poedeiras',
        '35 Rhode Island Red em galinheiro de 114 m² no núcleo Sisteminha. De 750 a 850 ovos por mês e 12 kg de carne de descarte.',
      ],
      ['Frangos de corte', 'Lote rotativo de 20 aves caipira pesado, 25 kg de carne por mês.'],
      [
        'Suínos Moura',
        '1 reprodutor, 2 matrizes e 3 em terminação (6 cabeças) em ~30 m² de piso ripado.',
      ],
      [
        'Cabras Saanen (leite)',
        '8 matrizes (6 em lactação + 2 secas), 1 bode e 4 crias em ~46 m² (aprisco suspenso + solário na zona de 225 m²). Cerca de 9,6 L/dia (~288 L/mês) para consumo, iogurte, queijo e doce de leite.',
      ],
      [
        'Piscicultura',
        'Dois tanques redondos de 10 m³ (Sisteminha) mais o lago de reúso de 120 m². 30 kg de peixe por mês.',
      ],
      [
        'Minhocário',
        '8 canteiros de alvenaria no núcleo Sisteminha, ao lado da composteira. 600 kg de húmus por mês.',
      ],
      [
        'Tenébrio e mosca-soldado',
        '40 bandejas em 6 m². 8 kg de proteína por mês para aves e peixes.',
      ],
      [
        'Apicultura',
        '6 colmeias Langstroth na borda oeste da mata, com as portinhas voltadas ao norte (sol da manhã). 70 kg de mel por ano e cera.',
      ],
    ],
  },
  {
    t: '06 · Biodigestor integrado',
    tag: '15 m³',
    items: [
      [
        'Piso das baias',
        'Inclinação de 3%, lavado por gravidade com água de reúso. A calha leva o efluente direto ao biodigestor, colado ao curral.',
      ],
      [
        'Biodigestor',
        'Tubular canadense em lona de PVC vulcanizado. 4,2 m³/dia de biogás (65% CH₄).',
      ],
      [
        'Depurador',
        'Limalha de ferro retira H₂S e sílica gel seca o gás. Alimenta o fogão e o gerador de emergência.',
      ],
      ['Biofertilizante', '180 L/dia de efluente inodoro bombeado às valas das quadras.'],
    ],
  },
  {
    t: '07 · Agroecologia e pomar',
    tag: '3.900 m²',
    items: [
      [
        'Quadras de rotação',
        'Quatro quadras de 20 × 25 m (500 m² cada, 2.000 m² no total) em ciclo quadrienal. Q1 fixadores, Q2 tubérculos, Q3 exigentes, Q4 recuperação.',
      ],
      [
        'Horta intensiva',
        '5 canteiros de 24 × 1,3 m (156 m² úteis, 228 m² com passagens) no núcleo Sisteminha, irrigados por gotejo com a água dos tanques.',
      ],
      [
        'Farmácia viva',
        'Ora-pro-nóbis em 120 m de cerca viva, boldo, guaco, erva-baleeira, açafrão e gengibre.',
      ],
      [
        'Pomar consorciado',
        'Bosque de 240 m² (20 × 12 m) ao norte do núcleo Sisteminha e frutíferas dispersas, com laranja, limão, ponkan, abacate, acerola, banana, jabuticaba e amora.',
      ],
      [
        'Estufa arqueada',
        '12 × 10 m (120 m²) em policarbonato anti-UV, com sala estéril de 16 m² para shimeji, shiitake e pleurotus.',
      ],
    ],
  },
  {
    t: '08 · Extração e silvicultura',
    tag: '3.200 m²',
    items: [
      [
        'Bambuzal',
        '728 m² (28 × 26 m) de Guadua angustifolia e Dendrocalamus asper. 120 colmos por ano.',
      ],
      [
        'Silvicultura energética',
        '1.570 m²: bloco oeste de 728 m² (26 × 28 m) e faixa leste de 840 m². Eucalipto (ciclo de 4 anos), acácia, gliricídia, cedrinho e pinus. 18 t de madeira seca por ano.',
      ],
      [
        'Argila e areia',
        '570 m² (30 × 19 m) de jazida refratária, seixos e areia de quartzo para filtros e silos térmicos.',
      ],
    ],
  },
  {
    t: '09 · Geração de energia',
    tag: 'Barramento 48 V DC',
    items: [
      [
        'Micro-hidrelétrica Pelton',
        'Desnível de 6,80 m, tubo de 250 mm, rotor de 320 mm. 3,5 kW contínuos (84 kWh/dia).',
      ],
      ['Gerador eólico', 'Torre de treliça de 14 m, rotor de 4,20 m com 8 pás. De 1,2 a 2,2 kW.'],
      ['Usina fotovoltaica', '48 painéis, 21,6 kWp, voltados à carga das baterias térmicas.'],
      [
        'Gasogênio e motor',
        'Reator down-draft e motor OM-314 com alternador de 25 kVA. Consome 1,1 kg de madeira por kWh.',
      ],
    ],
  },
  {
    t: '10 · Armazenamento de energia',
    tag: 'Sem lítio',
    items: [
      [
        'Baterias térmicas',
        '4 cilindros de 1,40 × 3,20 m em aço de 12 mm, 18 t de areia e sais de nitrato. 320 kWh a 550 °C.',
      ],
      ['Recuperação', 'Vapor a 35 bar em microturbina de 5 kW. 14 dias de autonomia.'],
      ['Chumbo-ácido', '48 vasos abertos, 48 V × 2.400 Ah (115 kWh).'],
      ['Gravitacional', 'Bloco de 12 t em trilho de 35 m com guincho e dínamo de 1,5 kW.'],
    ],
  },
  {
    t: '11 · Hidrologia',
    tag: '3.200 L/dia',
    items: [
      [
        'Poços artesianos',
        'Cinco poços de 65, 78, 82, 90 e 110 m, com bombas helicoidais solares de 48 V DC.',
      ],
      ['Cisterna central', '80.000 L em rocha, alimentada por córrego, chuva (150 m³) e poços.'],
      [
        'Linha pura',
        'Carvão de bambu, osmose reversa de 400 GPD e UV-C. Condutividade abaixo de 0,1 µS/cm.',
      ],
    ],
  },
  {
    t: '12 · Telecomunicações',
    tag: 'OpSec grau 5',
    items: [
      [
        'Links',
        'Três links de 300 Mbps em Vassouras, Paty e Mendes, mais um terminal Starlink no reservatório falso do moinho.',
      ],
      [
        'Malha de longo alcance',
        'Antenas HF/VHF e LoRaWAN nas copas dos eucaliptos, com criptografia AES-256.',
      ],
      [
        'Mascaramento de tráfego',
        'Script de borda simula o uso de uma família comum (Ghost Masking).',
      ],
    ],
  },
  {
    t: '13 · Estrutura do bunker',
    tag: '1 nível · 1.400 m²',
    items: [
      [
        'Nível único',
        '40 × 35 m (1.400 m²), piso a −8,7 m, pé-direito de 3,6 m, laje de 80 cm e 4,3 m de terra por cima. Fica sob a Casa Grande e parte do Engenho; saída de emergência por escada de ferro até uma escotilha.',
      ],
      ['Escavação', 'Em gnaisse com fio diamantado e expansores químicos, sem explosivos.'],
      [
        'Lajes e paredes',
        'Concreto de 60 cm com barita e cristalizante, mais gaiola de Faraday em cobre de 2 mm.',
      ],
      ['Portas', 'Duas portas estanques de aço balístico de 350 kg com volante manual.'],
    ],
  },
  {
    t: '14 · Técnico · Datacenter Aura',
    tag: '≈100 m² · 2,45 kW',
    items: [
      ['Tanques', 'Seis tanques com 3.000 L de óleo mineral dielétrico. Ruído de 0 dB.'],
      ['Calor residual', 'O óleo a 48 °C aquece o piso do quarto por trocadores de titânio.'],
      ['Armazenamento', '4,2 PB em ZFS com discos selados a hélio, isolados da rede.'],
      [
        'Aura Core',
        '3 nós com 32 aceleradores, modelo local de 70 B de parâmetros e latência abaixo de 8 ms.',
      ],
    ],
  },
  {
    t: '15 · Técnico · Laboratórios',
    tag: '68 m² · ISO 7',
    items: [
      ['Biossegurança', 'Cabine classe II tipo B2 com exaustão total e duplo HEPA.'],
      ['Análise', 'qPCR de 96 poços e UHPLC-MS/MS recalibrado.'],
      [
        'Preparo',
        'Rotavapor, centrífuga refrigerada de 20.000 RPM e biorreatores de 10 L com controle de ±0,05 °C.',
      ],
    ],
  },
  {
    t: '16 · Técnico · Sala limpa',
    tag: '55 m² · ISO 5',
    items: [
      ['Mesa óptica', 'Granito negro de 2,5 t sobre bolsões pneumáticos.'],
      [
        'Litografia',
        'Projetor DLP UV de 365 nm sem máscara, resolução de 350 nm em pastilhas de 100 mm.',
      ],
      [
        'Processo',
        'Spin coater de 8.000 RPM, forno de quartzo de 1.200 °C e câmara RIE de 13,56 MHz.',
      ],
    ],
  },
  {
    t: '17 · Técnico · Suporte de vida, hidroponia e oficina',
    tag: '390 m²',
    items: [
      [
        'Pressurização',
        'Pressão positiva de +35 Pa. Ar captado no topo do moinho e resfriado a 18 °C por duto geotérmico.',
      ],
      ['Filtragem', 'Pré-filtro G4, carvão ativado e HEPA H14 de 99,995%.'],
      [
        'Emergência',
        'Quatro velas de clorato (600 L de O₂ cada) e depuradores de cal sodada para 7 pessoas. Hidroponia de 117 m² (12 prateleiras), despensa de 90 dias (53 m²) e oficina maker (102 m²) com CNC, impressoras 3D e torno.',
      ],
    ],
  },
  {
    t: '18 · Habitação · 7 pessoas',
    tag: '≈ 650 m²',
    items: [
      [
        'Suíte cyberpunk do Mestre',
        '116 m²: closet, estação dev com 3 telas curvas, mesa holográfica, lounge, fliperama, vitrola, parede aquário, skyline em LED e cama-casulo redonda com cabeceira em arco, anel de neon e mosquiteiro em cúpula. Banheiro-cabine.',
      ],
      [
        'Suíte dos pais',
        '75 m² com banheiro, cama king, poltrona de leitura, penteadeira, adega, TV e lareira de luz.',
      ],
      [
        'Irmã, sobrinha e convidado',
        'Três quartos com banheiro. O da sobrinha (11 anos) tem cabaninha de leitura, escrivaninha e estrelinhas no teto.',
      ],
      [
        'Estar, jantar e cozinha',
        '199 m² com ilha, mesa para 8, sofá em L, TV de parede e bar. Ao lado: despensa e sala de cinema e jogos.',
      ],
      [
        'Iluminação',
        'LED circadiano com CRI 98, de 2.700 K ao amanhecer a 5.500 K ao meio-dia e 2.200 K à noite, mais neon nas suítes.',
      ],
    ],
  },

  {
    t: '19 · Defesa passiva',
    tag: 'Sem muros',
    items: [
      [
        'Infrassom',
        'Transdutores de 18,9 Hz nas três trilhas de mata, acionados por telemetria sísmica.',
      ],
      [
        'Alarme biológico',
        'Nebulizadores de feromônio nas bordas sul e oeste, junto ao apiário, ativam as seis colmeias.',
      ],
      ['Geofones', '40 sensores piezoelétricos a 40 cm, que distinguem passos humanos de fauna.'],
    ],
  },
  {
    t: '20 · Operação e pessoal',
    tag: 'Escala 4x3',
    items: [
      ['Equipe', 'Mínimo de 2 funcionários e máximo recomendado de 4 a 5.'],
      [
        'Automação',
        'Válvulas solenóides, bombas, elevador e serra no eixo do engenho. A Aura Core gere energia, rede e sensores.',
      ],
      [
        'Manutenção',
        'Datacenter semanal e semestral, laboratórios mensal e anual, sala limpa diária, suporte de vida semanal e trimestral.',
      ],
      [
        'Trabalho humano',
        'Manejo animal, colheita, usinagem fina, protocolos de laboratório e limpeza.',
      ],
    ],
  },
  {
    t: '21 · Núcleo Sisteminha Embrapa',
    tag: 'Regras do módulo',
    items: [
      [
        'Tanques',
        'Dois tanques redondos de 4,4 m (10 m³) em placas de concreto, sobre terreno plano, perto da energia e da água, sem árvores ao redor.',
      ],
      [
        'Biofiltro e sedimentador',
        'Baldes de 20 L ao lado de cada tanque, com bomba, retorno por gravidade e sifão do lodo para a composteira.',
      ],
      [
        'Horta',
        '5 canteiros de 24 × 1,3 m irrigados com a água dos tanques (alface, couve, tomate, beterraba e temperos).',
      ],
      [
        'Aves, composteira e minhocário',
        'Galinheiro de poedeiras, frangos de corte em trator móvel, 3 baias de composto e 8 canteiros de minhoca, todos colados aos tanques.',
      ],
      ['Mosca-soldado', 'Galpão de larvas que recicla restos e vira proteína para peixes e aves.'],
      [
        'Desvio da regra',
        'Embrapa tirou os suínos do módulo por manutenção; aqui eles ficam no curral, junto do biodigestor.',
      ],
    ],
  },
  {
    t: '22 · Estrada e porteira',
    tag: 'Cascalho · 5 m',
    items: [
      [
        'Porteira',
        'Dois pilares de pedra de 3,6 m, travessa de madeira, placa “Sítio Vale do Café” e duas folhas abertas.',
      ],
      [
        'Traçado',
        'Da porteira a leste, por 70 m na via transversal, depois ao sul pela via principal até o pátio técnico.',
      ],
      ['Garagem', 'Setas no pátio guiam os carros até a porta do engenho (x 28,5 a 33,5).'],
    ],
  },
  {
    t: '23 · Orientação solar (lat. 22,4° S)',
    tag: 'Norte = frente',
    items: [
      [
        'Convenção',
        'O norte aponta para a frente da maquete (bússola no canto). Sol ao meio-dia: 44° no inverno, 68° nos equinócios e quase a pino no verão.',
      ],
      [
        'Painéis',
        'Telhado do engenho com água de 30° voltada ao norte (≈ latitude + 8°): bom ganho no inverno. Mata ao sul, sem sombra.',
      ],
      [
        'Casa Grande',
        'Varanda e sala ao norte, com beiral de 1,8 m que sombreia no verão e deixa entrar o sol de inverno. Despensa no canto sul-leste, o mais fresco.',
      ],
      [
        'Núcleo Sisteminha',
        'Sem árvores num raio de 6 m ao sul e ao redor. Pomar ao norte (sombra cai para o sul, até 6 m no inverno, e para antes dos canteiros).',
      ],
      [
        'Estufa',
        'Cumeeira leste-oeste, face voltada ao norte. Nada ao sul além da estrada e da quadra Q4.',
      ],
      ['Bambu e eucalipto', 'Ao sul da gleba: a sombra cai para fora e não cobre as quadras.'],
      [
        'Ressalva',
        'O trilho da bateria gravitacional (15 m) projeta sombra a oeste nas primeiras horas da manhã de inverno.',
      ],
    ],
  },
  {
    t: '24 · Quadro de áreas e perímetros',
    tag: 'Gleba 15.000 m²',
    items: [
      ['Gleba', '100 × 150 m · 15.000 m² · perímetro 500 m'],
      [
        'Casa Grande',
        '24 × 19 m · 456 m² · 86 m. Cozinha 80 m², despensa 55 m². Varanda 24 × 3,2 m (77 m²)',
      ],
      ['Engenho', '22 × 10 m · 220 m² · 64 m. Pátio 18 × 19 m · 342 m² · 74 m'],
      ['Curral', '16 × 19 m · 304 m² · 70 m. Biodigestor 15 × 3,6 m (54 m²)'],
      [
        'Núcleo Sisteminha',
        '49 × 25 m · 1.225 m² · 148 m. Tanques 2 × 15 m². Horta 156 m². Galinheiro 12 × 9,5 m (114 m²). Lago 121 m² · 39 m',
      ],
      ['Estufa', '12 × 10 m · 120 m² · 44 m'],
      ['Quadras', '4 × (20 × 25 m) = 2.000 m² · 90 m de perímetro cada'],
      ['Bambuzal e silvicultura', '728 m² e 728 m² · 108 m cada. Faixa leste 840 m²'],
      ['Jazida', '30 × 19 m · 570 m² · 98 m'],
      ['Estrada de cascalho', '148 m de eixo × 5 m · 740 m²'],
      [
        'Bunker',
        '1 nível de 40 × 35 m = 1.400 m². Mestre 116, pais 75, irmã 63, sobrinha 53, convidado 50, estar 199, despensa 53, cinema 96, hidroponia 117, oficina 102 m², datacenter 100, laboratórios 65, sala limpa 50, suporte 73 m²',
      ],
      ['Fosso do subsolo', '24 × 31 m · 744 m² · 110 m'],
    ],
  },
  {
    t: '25 · Cronograma de implantação',
    tag: '6 meses',
    items: [
      ['Mês 1', 'Aquisição e restauração do engenho.'],
      ['Mês 2', 'Escavação e laje do subsolo.'],
      ['Mês 3', 'Isolamento térmico e divisórias.'],
      ['Mês 4', 'Montagem eletromecânica do datacenter e da bioquímica.'],
      ['Mês 5', 'Zootecnia, baterias térmicas e rotação de solos.'],
      ['Mês 6', 'Conexão do cluster Aura OS.'],
    ],
  },
];
