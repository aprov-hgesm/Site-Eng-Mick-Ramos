export interface Project {
  id: string;
  title: string;
  category: 'ARQUITETÔNICO' | 'ESTRUTURAL' | 'HIDROSSANITÁRIO' | 'ELÉTRICO' | 'PPCI';
  categoryLabel: string;
  location: string;
  image: string;
  images?: string[];
  description: string;
  area: string;
  year: string;
  features: string[];
}

export interface Service {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  benefits: string[];
  deliverables: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  categoryLabel: string;
  date: string;
  readTime: string;
  author: string;
  image: string;
  excerpt: string;
  content: {
    intro: string;
    points: {
      title: string;
      text: string;
    }[];
    warningBox?: string;
    conclusion: string;
  };
  viewsCount?: number;
  featured?: boolean;
}

export interface AboutValue {
  title: string;
  description: string;
  iconName?: string;
}

export interface AboutInfo {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  whoWeAreTitle: string;
  whoWeAreParagraphs: string[];
  officeImage: string;
  officeLocation: string;
  valuesTitle: string;
  valuesSubtitle: string;
  values: AboutValue[];
  stats: {
    clients: string;
    projects: string;
    years: string;
    region: string;
    regionSubtitle: string;
  };
  credentialsTitle: string;
  credentialsList: string[];
  quoteText: string;
  quoteAuthor: string;
  quoteRoleCrea: string;
}

export const DEFAULT_ABOUT_INFO: AboutInfo = {
  heroTitle: 'Sobre',
  heroSubtitle: 'Conheça nossa história, nossos valores e o compromisso que nos move todos os dias.',
  heroImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80',
  whoWeAreTitle: 'Engenharia com propósito, técnica com responsabilidade, resultados que geram confiança.',
  whoWeAreParagraphs: [
    'A MR Engenharia nasceu com o objetivo de entregar soluções técnicas de alta qualidade, unindo conhecimento, experiência e tecnologia para transformar ideias em projetos seguros, eficientes e duradouros.',
    'Atuamos com responsabilidade em cada etapa do processo, desde o planejamento até a execução, sempre com foco em superar expectativas e construir relações de confiança com nossos clientes.',
    'Mais do que projetos, entregamos tranquilidade, segurança e a certeza de que cada detalhe foi pensado para o melhor resultado.'
  ],
  officeImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  officeLocation: 'Parnaíba - PI',
  valuesTitle: 'NOSSOS VALORES',
  valuesSubtitle: 'Pilares da Nossa Atuação',
  values: [
    { title: 'SEGURANÇA', description: 'Priorizamos a segurança das pessoas, das obras e das decisões técnicas.', iconName: 'ShieldCheck' },
    { title: 'PRECISÃO', description: 'Projetos detalhados e estudos completos para evitar erros e retrabalhos.', iconName: 'Target' },
    { title: 'RESPONSABILIDADE', description: 'Compromisso técnico e ético em cada etapa do projeto.', iconName: 'Scale' },
    { title: 'TRANSPARÊNCIA', description: 'Comunicação clara e honesta em todas as nossas relações.', iconName: 'Eye' },
    { title: 'VALORIZAÇÃO', description: 'Valorizamos pessoas, parcerias e acreditamos no crescimento contínuo.', iconName: 'Users' }
  ],
  stats: {
    clients: '+150',
    projects: '+250',
    years: '+8',
    region: 'Atuação em Parnaíba e região',
    regionSubtitle: 'Piauí e vizinhança'
  },
  credentialsTitle: 'Formação sólida e atualização constante para entregar o que há de melhor em engenharia civil.',
  credentialsList: [
    'Graduado em Engenharia Civil',
    'Registro no CREA-PI: 1920983666',
    'Experiência em projetos residenciais, comerciais, industriais e institucionais',
    'Atuação em conformidade total com as normas técnicas da ABNT e legislações vigentes'
  ],
  quoteText: 'Nosso compromisso é transformar projetos em realidade com segurança, eficiência e qualidade.',
  quoteAuthor: 'Mick Ramos',
  quoteRoleCrea: 'CREA 1920983666'
};

export interface SiteContactInfo {
  brandName: string;
  role: string;
  crea: string;
  fullTitle: string;
  tagline: string;
  phone: string;
  whatsappUrl: string;
  email: string;
  address: string;
  cityRegion: string;
  hours: string;
  stats: { label: string; value: string; icon: string }[];
  headerLogoUrl?: string;
  footerLogoUrl?: string;
}

export const DEFAULT_SITE_INFO: SiteContactInfo = {
  brandName: 'MR MICK RAMOS',
  role: 'ENGENHEIRO CIVIL',
  crea: 'CREA 1920983666',
  fullTitle: 'MR MICK RAMOS — ENGENHEIRO CIVIL — CREA 1920983666',
  tagline: 'Soluções completas em engenharia civil com responsabilidade técnica, qualidade e compromisso com o resultado.',
  phone: '(86) 99927-0261',
  whatsappUrl: 'https://wa.me/5586999270261?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20um%20or%C3%A7amento%20de%20engenharia.',
  email: 'engcivilmickramos@gmail.com',
  address: 'Av. São Sebastião, 1234 - Sala 05 - Centro, Parnaíba - PI, CEP 64200-000',
  cityRegion: 'Parnaíba - PI e região (Luís Correia, Buriti dos Lopes, Ilha Grande, Cajueiro da Praia)',
  hours: 'Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h',
  headerLogoUrl: '',
  footerLogoUrl: '',
  stats: [
    { label: 'Clientes atendidos', value: '+150', icon: 'Users' },
    { label: 'Projetos desenvolvidos', value: '+250', icon: 'FolderCheck' },
    { label: 'Anos de experiência', value: '+8', icon: 'Award' },
    { label: 'Atuação na região', value: 'Parnaíba e PI', icon: 'MapPin' },
  ]
};

export const SITE_INFO = DEFAULT_SITE_INFO;

export const SERVICES: Service[] = [
  {
    id: 'vistorias',
    title: 'VISTORIAS TÉCNICAS',
    shortDesc: 'Identificação de problemas e avaliação das condições do imóvel com relatório técnico completo.',
    fullDesc: 'A vistoria técnica é indispensável para identificar patologias estruturais, vícios de construção e avaliar o estado real do imóvel antes de reformas, compras ou recebimento de chaves.',
    iconName: 'Search',
    benefits: ['Relatório fotográfico detalhado', 'Diagnóstico preciso de falhas', 'Orientações preventivas e corretivas'],
    deliverables: ['Laudo fotográfico', 'Checklist estrutural', 'Termo de Vistoria']
  },
  {
    id: 'laudos',
    title: 'LAUDOS TÉCNICOS',
    shortDesc: 'Laudos para trincas, infiltrações, umidade, vícios construtivos, entrega/recebimento e outros.',
    fullDesc: 'Emissão de laudos periciais e pareceres técnicos fundamentados nas normas da ABNT, com validade jurídica e recomendação de ações corretivas imediatas.',
    iconName: 'FileText',
    benefits: ['Fundamentação segundo normas NBR/ABNT', 'Validade jurídica e pericial', 'Plano de ação corretivo urgente'],
    deliverables: ['Parecer técnico assinado com ART', 'Análise de causas de patologias', 'Orçamento estimado de reparo']
  },
  {
    id: 'regularizacao',
    title: 'REGULARIZAÇÃO DE IMÓVEIS',
    shortDesc: 'Regularização de obras, habite-se, averbação e adequação de imóveis junto aos órgãos competentes.',
    fullDesc: 'Processo completo de legalização da sua propriedade perante prefeituras, cartórios e órgãos ambientais para garantir valorização imobiliária e segurança jurídica.',
    iconName: 'Building2',
    benefits: ['Evita multas e embargo de obra', 'Possibilita financiamento bancário', 'Aumenta valor comercial do imóvel'],
    deliverables: ['Planta baixa de regularização', 'Alvará de Construção/Habite-se', 'Averbação na matrícula do imóvel']
  },
  {
    id: 'art',
    title: 'ART – ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA',
    shortDesc: 'Emissão de ART para obras, reformas, regularização e outros serviços de engenharia.',
    fullDesc: 'Documento legal obrigatório exigido pelo CREA que comprova que a execução da sua obra ou serviço conta com acompanhamento profissional qualificado.',
    iconName: 'FileCheck',
    benefits: ['Exigência legal cumprida perante o CREA', 'Segurança jurídica para proprietário e construtor', 'Registro oficial das responsabilidades'],
    deliverables: ['ART registrada e quitada no CREA-PI', 'Comprovante oficial de Responsabilidade Técnica']
  },
  {
    id: 'acompanhamento',
    title: 'ACOMPANHAMENTO DE OBRAS',
    shortDesc: 'Gestão e fiscalização técnica para garantir que sua obra seja executada com qualidade e segurança.',
    fullDesc: 'Fiscalização contínua nos canteiros de obras para assegurar que a execução respeite fielmente os projetos de engenharia, os custos estipulados e o cronograma.',
    iconName: 'HardHat',
    benefits: ['Economia de insumos e materiais', 'Cumprimento rígido do cronograma', 'Garantia de padrão construtivo'],
    deliverables: ['Diário de obra técnico', 'Relatório de evolução semanal', 'Gestão de fornecedores']
  },
  {
    id: 'projetos',
    title: 'PROJETOS DE ENGENHARIA',
    shortDesc: 'Projetos completos: arquitetônico, estrutural, hidrossanitário, elétrico e complementares.',
    fullDesc: 'Elaboração de projetos executivos integrados com alto padrão de detalhamento técnico, otimizando o gasto com materiais e evitando retrabalhos no canteiro.',
    iconName: 'Compass',
    benefits: ['Compatibilização completa sem interferências', 'Memorial descritivo detalhado', 'Redução do desperdício de materiais em até 20%'],
    deliverables: ['Pranchas de execução em PDF/DWG', 'Lista de quantitativos e orçamentos', 'Memória de cálculo']
  },
  {
    id: 'ppci',
    title: 'PPCI E COMBATE A INCÊNDIO',
    shortDesc: 'Elaboração de projetos, adequações para obtenção ou renovação de AVCB/CLCB.',
    fullDesc: 'Projeto de Prevenção e Proteção Contra Incêndio para estabelecimentos comerciais, residenciais e industriais, com aprovação junto ao Corpo de Bombeiros.',
    iconName: 'Flame',
    benefits: ['Adequação total à legislação de bombeiros', 'Garantia de segurança ocupacional', 'Obtenção rápida do AVCB'],
    deliverables: ['Projeto de Combate a Incêndio aprovado', 'Dimensionamento de extintores e sinalização', 'Laudo de conformidade']
  },
  {
    id: 'bim3d',
    title: 'MODELAGEM 3D E COMPATIBILIZAÇÃO',
    shortDesc: 'Modelagem BIM e compatibilização de projetos para mais precisão e menos retrabalho.',
    fullDesc: 'Utilização de tecnologia BIM para visualização tridimensional interativa da edificação e detecção prévia de colisões entre tubulações, estruturas e fiação.',
    iconName: 'Box',
    benefits: ['Detecção de conflitos (Clash Detection)', 'Visualização hiper-realista antes de construir', 'Acurácia máxima no orçamento'],
    deliverables: ['Modelo 3D BIM (IFC / Revit)', 'Imagens renderizadas', 'Relatório de incompatibilidade sanada']
  }
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Residência Unifamiliar de Alto Padrão',
    category: 'ARQUITETÔNICO',
    categoryLabel: 'Arquitetônico',
    location: 'Parnaíba - PI',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    description: 'Projeto de residência moderna com integração de ambientes, iluminação natural valorizada e área de lazer privativa com piscina.',
    area: '320 m²',
    year: '2024',
    features: ['Integração de Ambientes', 'Aproveitamento Solar', 'Design Contemporâneo']
  },
  {
    id: 'p2',
    title: 'Edifício Comercial São Sebastião',
    category: 'ARQUITETÔNICO',
    categoryLabel: 'Arquitetônico',
    location: 'Parnaíba - PI',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    description: 'Edifício de salas comerciais com fachada espelhada, hall de entrada imponente e conformidade total de acessibilidade NBR 9050.',
    area: '850 m²',
    year: '2023',
    features: ['Fachada de Vidro', 'Acessibilidade Universal', 'Estacionamento Rotativo']
  },
  {
    id: 'p3',
    title: 'Estrutura em Concreto Armado',
    category: 'ESTRUTURAL',
    categoryLabel: 'Estrutural',
    location: 'Luís Correia - PI',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80',
    description: 'Dimensionamento estrutural para centro comercial praiano com alta resistência à névoa salina e otimização de pilares.',
    area: '1.200 m²',
    year: '2024',
    features: ['Proteção Anticorrosiva', 'Vãos Livres Otimizados', 'Cálculo NBR 6118']
  },
  {
    id: 'p4',
    title: 'Projeto Hidrossanitário Residencial',
    category: 'HIDROSSANITÁRIO',
    categoryLabel: 'Hidrossanitário',
    location: 'Parnaíba - PI',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    description: 'Dimensionamento da rede de água fria, esgoto sanitário, águas pluviais e reservatório inferior/superior com bomba automatizada.',
    area: '280 m²',
    year: '2024',
    features: ['Aproveitamento de Águas Pluviais', 'Rede Anti-Ruído', 'Pressurização Inteligente']
  },
  {
    id: 'p5',
    title: 'Projeto Elétrico Residencial & Fotovoltaico',
    category: 'ELÉTRICO',
    categoryLabel: 'Elétrico',
    location: 'Parnaíba - PI',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    description: 'Projeto de instalações elétricas de baixa tensão, divisão de circuitos balanceada e infraestrutura para energia solar fotovoltaica.',
    area: '310 m²',
    year: '2024',
    features: ['Proteção DPS e DR', 'Previsão Fotovoltaica', 'Automação Iluminotécnica']
  },
  {
    id: 'p6',
    title: 'Projeto de Combate a Incêndio (PPCI)',
    category: 'PPCI',
    categoryLabel: 'PPCI',
    location: 'Parnaíba - PI',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    description: 'Dimensionamento de hidrantes, iluminação de emergência, alarmes de fumaça e rotas de fuga para complexo fabril.',
    area: '2.500 m²',
    year: '2023',
    features: ['Aprovação em Corpo de Bombeiros', 'Sinalização Fotoluminescente', 'Central de Alarme']
  },
  {
    id: 'p7',
    title: 'Marina Privativa e Casa de Praia',
    category: 'ARQUITETÔNICO',
    categoryLabel: 'Arquitetônico',
    location: 'Luís Correia - PI',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    description: 'Projeto de chalé costeiro integrado à marina com deque em madeira tratada e estrutura resistente a ventos fortes.',
    area: '450 m²',
    year: '2023',
    features: ['Deck Integrado', 'Estrutura Mista Madeira/Aço', 'Ventilação Cruzada']
  },
  {
    id: 'p8',
    title: 'Casa de Alto Padrão em Condomínio Fechado',
    category: 'ARQUITETÔNICO',
    categoryLabel: 'Arquitetônico',
    location: 'Buriti dos Lopes - PI',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    description: 'Residência duplex com pé-direito duplo na sala principal, esquadrias do chão ao teto e acabamentos nobres.',
    area: '400 m²',
    year: '2024',
    features: ['Pé-Direito Duplo', 'Suíte Master com Closed', 'Paisagismo Integrado']
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-trincas',
    title: 'Aquela trinca é normal ou perigosa? Entenda os sinais de alerta',
    slug: 'trincas-em-paredes-quando-se-preocupar',
    category: 'vistorias',
    categoryLabel: 'Patologias e Manutenção',
    date: '28 de Maio, 2024',
    readTime: '5 min de leitura',
    author: 'Mick Ramos',
    image: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Saiba diferenciar fissuras superficiais de trincas estruturais e quando é fundamental procurar um engenheiro para vistoria.',
    content: {
      intro: 'Nem toda fisura em uma parede representa perigo iminente, mas negligenciar os sinais de movimentação estrutural pode acarretar altos custos de reparo ou riscos à segurança da edificação.',
      points: [
        {
          title: 'Fissuras superficiais (< 1mm)',
          text: 'Geralmente restritas à camada de pintura ou gesso. São causadas por retração térmica do reboco e não afetam a estrutura.'
        },
        {
          title: 'Trincas diagonais (> 2mm)',
          text: 'Atendem a um sinal de alerta vermelho! Fissuras em 45 graus no canto de portas e janelas costumam indicar recalque diferencial de fundação.'
        },
        {
          title: 'Rachaduras horizontais e verticais',
          text: 'Trincas contínuas em vigas ou pilares necessitam de laudo de engenharia civil imediato para escoramento preventivo e reforço.'
        }
      ],
      warningBox: 'Atenção: Ações paliativas como cobrir a trinca com massa corrida sem diagnosticar a causa raiz apenas mascaram o problema e acumulam estresse na estrutura.',
      conclusion: 'Na dúvida, solicite uma vistoria técnica preventiva com parecer assinado por engenheiro habilitado no CREA.'
    },
    featured: false
  },
  {
    id: 'post-infiltracao',
    title: 'Infiltração: 7 causas comuns e como evitar prejuízos',
    slug: 'infiltracao-7-causas-comuns-e-como-evitar-prejuizos',
    category: 'vistorias',
    categoryLabel: 'Patologias e Manutenção',
    date: '14 de Maio, 2024',
    readTime: '6 min de leitura',
    author: 'Mick Ramos',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Entenda as principais origens das infiltrações e como a prevenção pode economizar tempo e dinheiro na sua obra ou imóvel.',
    content: {
      intro: 'A infiltração é um dos problemas mais recorrentes em edificações e pode causar danos estruturais, comprometer acabamentos e trazer riscos à saúde dos moradores. Identificar a causa é o primeiro passo para resolver de forma definitiva.',
      points: [
        {
          title: '1. Falha na impermeabilização',
          text: 'Áreas molhadas como banheiros, cozinhas, áreas de serviço e lajes expostas precisam de impermeabilização correta. Quando mal executada ou inexistente, a água encontra caminho livre para infiltrar.'
        },
        {
          title: '2. Rachaduras e fissuras',
          text: 'Pequenas fissuras podem parecer inofensivas, mas são portas de entrada para a água da chuva. Com o tempo, o problema se agrava e pode comprometer paredes e vigas.'
        },
        {
          title: '3. Problemas nas instalações hidráulicas',
          text: 'Vazamentos ocultos em tubulações, conexões mal executadas ou desgaste dos materiais podem causar infiltrações constantes e difíceis de identificar.'
        },
        {
          title: '4. Telhas quebradas ou mal posicionadas',
          text: 'Em coberturas, telhas deslocadas pelo vento ou trincadas permitem que a água escorra pelo forro e alcance as paredes internas.'
        },
        {
          title: '5. Infiltração por ascensão capilar (umidade do solo)',
          text: 'A ausência de impermeabilização adequada nos baldrames faz com que a umidade suba do terreno para a alvenaria, descascando a tinta perto do rodapé.'
        }
      ],
      warningBox: 'Atenção: Ignorar uma infiltração pode gerar danos estruturais graves e custos até 10 vezes maiores do que a prevenção adequada.',
      conclusion: 'Se você identificou sinais de infiltração ou quer evitar problemas futuros, conte com uma avaliação técnica especializada.'
    },
    featured: true
  },
  {
    id: 'post-projeto-arq',
    title: 'Projeto arquitetônico: por que ele é essencial para sua obra?',
    slug: 'projeto-arquitetonico-por-que-ele-e-essencial',
    category: 'projetos',
    categoryLabel: 'Projetos',
    date: '07 de Maio, 2024',
    readTime: '5 min de leitura',
    author: 'Mick Ramos',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Descubra como um bom projeto garante economia, funcionalidade, conforto térmico e valorização do imóvel.',
    content: {
      intro: 'Construir sem projeto é como viajar para um destino desconhecido sem mapa. O projeto arquitetônico garante o melhor aproveitamento do terreno e evita imprevistos financeiros.',
      points: [
        {
          title: 'Otimização de Custos',
          text: 'Calculamos exatamente a quantidade de materiais necessários, eliminando o desperdício comum em compras por estimativa.'
        },
        {
          title: 'Conforto Térmico e Iluminação Natural',
          text: 'Orientamos os cômodos em relação ao sol de Parnaíba e ao vento predominante, reduzindo o uso continuado de ar-condicionado.'
        }
      ],
      conclusion: 'Invista no planejamento técnico do seu imóvel para construir com paz de espírito.'
    }
  },
  {
    id: 'post-regularizacao',
    title: 'Seu imóvel pode estar irregular e você nem sabe',
    slug: 'seu-imovel-pode-estar-irregular-e-voce-nem-sabe',
    category: 'regularizacao',
    categoryLabel: 'Regularização e Documentação',
    date: '30 de Abril, 2024',
    readTime: '4 min de leitura',
    author: 'Mick Ramos',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Veja os riscos de não regularizar sua obra e os benefícios de ter toda a documentação e Habite-se em dia.',
    content: {
      intro: 'Imóveis sem Habite-se ou sem averbação no Cartório de Imóveis sofrem desvalorização de até 30% e não podem ser vendidos através de financiamento bancário.',
      points: [
        {
          title: 'O que é o Habite-se?',
          text: 'Certidão emitida pela prefeitura atestando que a edificação seguiu o projeto aprovado e está segura para habitação.'
        },
        {
          title: 'Como regularizar?',
          text: 'Desenvolvemos o projeto como construído (As Built), emitimos a ART de regularização e protocolamos na prefeitura.'
        }
      ],
      conclusion: 'Regularize sua propriedade e garanta tranquilidade para sua família e patrimônio.'
    }
  },
  {
    id: 'post-reforma-erros',
    title: '5 erros que fazem sua reforma ficar muito mais cara',
    slug: '5-erros-que-fazem-sua-reforma-ficar-muito-mais-cara',
    category: 'obras',
    categoryLabel: 'Obras e Reformas',
    date: '23 de Abril, 2024',
    readTime: '6 min de leitura',
    author: 'Mick Ramos',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Evite desperdícios e dores de cabeça conhecendo os erros mais comuns em reformas residenciais.',
    content: {
      intro: 'Reformar sem orientação profissional costuma gerar orçamentos estourados em até 50%. Conheça os principais desvios a evitar.',
      points: [
        {
          title: '1. Quebrar paredes sem verificar a função estrutural',
          text: 'Derrubar pilares ou paredes estruturais pode causar colapso do pavimento superior.'
        },
        {
          title: '2. Não fazer orçamento discriminado por etapa',
          text: 'Comprar materiais sem cronograma provoca paralisações na obra e deterioração de cimento e insumos.'
        }
      ],
      conclusion: 'Sempre contrate acompanhamento técnico especializado antes de demolir ou construir.'
    }
  },
  {
    id: 'post-nbr6118',
    title: 'NBR 6118: o que mudou na nova atualização?',
    slug: 'nbr-6118-o-que-mudou-na-nova-atualizacao',
    category: 'normas',
    categoryLabel: 'Normas e Legislação',
    date: '16 de Abril, 2024',
    readTime: '7 min de leitura',
    author: 'Mick Ramos',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    excerpt: 'Entenda as principais alterações da norma de estruturas de concreto e seus impactos nas obras.',
    content: {
      intro: 'A NBR 6118 da ABNT estabelece os requisitos para projetos de estruturas de concreto. Acompanhe os principais pontos atualizados.',
      points: [
        {
          title: 'Cobrimento mínimo das armaduras',
          text: 'Critérios mais rigorosos em regiões de alta agressividade ambiental (como zonas litorâneas).'
        }
      ],
      conclusion: 'Garantir projetos atualizados de acordo com as normas vigentes assegura a durabilidade da estrutura por décadas.'
    }
  }
];

export const BLOG_CATEGORIES = [
  { id: 'todos', label: 'TODOS', count: 24 },
  { id: 'vistorias', label: 'VISTORIAS E LAUDOS', count: 12 },
  { id: 'patologias', label: 'PATOLOGIAS E MANUTENÇÃO', count: 18 },
  { id: 'obras', label: 'OBRAS E REFORMAS', count: 15 },
  { id: 'projetos', label: 'PROJETOS', count: 22 },
  { id: 'regularizacao', label: 'REGULARIZAÇÃO E DOCUMENTAÇÃO', count: 10 },
  { id: 'normas', label: 'NORMAS E LEGISLAÇÃO', count: 8 }
];
