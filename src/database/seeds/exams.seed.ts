import { DataSource } from 'typeorm';
import { Exam } from '../../modules/exams/entities/exam.entity';
import { Question } from '../../modules/exams/entities/question.entity';
import { QuestionOption } from '../../modules/exams/entities/question-option.entity';
import { EssaySupportingText } from '../../modules/exams/entities/supporting-text.entity';
import { ExamDifficulty, QuestionType } from '../../common/enums/exam.enum';

type SeedQuestion = {
  type?: QuestionType;
  text: string;
  area: string;
  subarea?: string;
  supportImage?: string;
  supportText?: string;
  explanation?: string;
  essayTopic?: string;
  essayGuidelines?: string;
  supportingTexts?: Array<{
    title?: string;
    content: string;
    source?: string;
  }>;
  options?: Array<{
    label: string;
    text: string;
    isCorrect?: boolean;
  }>;
};

const examsSeedData: Array<{
  exam: {
    title: string;
    description: string;
    durationMinutes: number;
    timeLimitMinutes: number;
    totalQuestions: number;
    imageUrl: string;
    areas: string[];
    difficulty: ExamDifficulty;
    hasEssay?: boolean;
  };
  questions: SeedQuestion[];
}> = [
  {
    exam: {
      title: 'ENEM Simulado Geral',
      description:
        'Simulado completo no formato ENEM com questões de todas as áreas de conhecimento.',
      durationMinutes: 180,
      timeLimitMinutes: 180,
      totalQuestions: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1470&auto=format&fit=crop',
      areas: [
        'Linguagens',
        'Matemática',
        'Ciências Humanas',
        'Ciências da Natureza',
      ],
      difficulty: ExamDifficulty.MEDIUM,
    },
    questions: [
      {
        text: 'Em um sistema de equações lineares, se o determinante da matriz dos coeficientes for igual a zero, então o sistema:',
        area: 'Matemática',
        subarea: 'Álgebra Linear',
        options: [
          { label: 'a', text: 'Possui uma única solução' },
          { label: 'b', text: 'Não possui solução' },
          {
            label: 'c',
            text: 'Possui infinitas soluções ou não possui solução',
            isCorrect: true,
          },
          { label: 'd', text: 'Sempre possui infinitas soluções' },
          { label: 'e', text: 'Sempre possui três soluções distintas' },
        ],
      },
      {
        text: '"A natureza fez o homem feliz e bom, mas a sociedade deprava-o e torna-o miserável." Esta afirmação caracteriza o pensamento de:',
        area: 'Ciências Humanas',
        subarea: 'Filosofia',
        options: [
          { label: 'a', text: 'Rousseau', isCorrect: true },
          { label: 'b', text: 'Hobbes' },
          { label: 'c', text: 'Maquiavel' },
          { label: 'd', text: 'Platão' },
          { label: 'e', text: 'Aristóteles' },
        ],
      },
      {
        text: 'Qual das seguintes obras pertence ao Romantismo brasileiro?',
        area: 'Linguagens',
        subarea: 'Literatura',
        options: [
          { label: 'a', text: 'Memórias Póstumas de Brás Cubas' },
          { label: 'b', text: 'Vidas Secas' },
          { label: 'c', text: 'Iracema', isCorrect: true },
          { label: 'd', text: 'Macunaíma' },
          { label: 'e', text: 'Grande Sertão: Veredas' },
        ],
      },
      {
        text: 'A segunda lei da termodinâmica estabelece que:',
        area: 'Ciências da Natureza',
        subarea: 'Física',
        options: [
          { label: 'a', text: 'A energia do universo é constante' },
          {
            label: 'b',
            text: 'A entropia do universo tende a um máximo',
            isCorrect: true,
          },
          {
            label: 'c',
            text: 'O calor flui espontaneamente do corpo mais frio para o mais quente',
          },
          { label: 'd', text: 'É impossível atingir o zero absoluto' },
          { label: 'e', text: 'A pressão é diretamente proporcional à temperatura' },
        ],
      },
      {
        text: 'No Brasil, o movimento literário que coincidiu com o período de consolidação da República foi o:',
        area: 'Linguagens',
        subarea: 'Literatura',
        options: [
          { label: 'a', text: 'Romantismo' },
          { label: 'b', text: 'Realismo' },
          { label: 'c', text: 'Parnasianismo' },
          { label: 'd', text: 'Modernismo', isCorrect: true },
          { label: 'e', text: 'Simbolismo' },
        ],
      },
      {
        text: 'Qual das seguintes estruturas celulares é exclusiva das células vegetais?',
        area: 'Ciências da Natureza',
        subarea: 'Biologia',
        options: [
          { label: 'a', text: 'Mitocôndria' },
          { label: 'b', text: 'Ribossomo' },
          { label: 'c', text: 'Parede celular', isCorrect: true },
          { label: 'd', text: 'Lisossomo' },
          { label: 'e', text: 'Retículo endoplasmático' },
        ],
      },
      {
        text: 'A principal característica que define uma função injetora é:',
        area: 'Matemática',
        subarea: 'Funções',
        options: [
          {
            label: 'a',
            text: 'Cada elemento do domínio está associado a pelo menos um elemento do contradomínio',
          },
          {
            label: 'b',
            text: 'Cada elemento do contradomínio está associado a pelo menos um elemento do domínio',
          },
          {
            label: 'c',
            text: 'Elementos diferentes do domínio estão associados a elementos diferentes do contradomínio',
            isCorrect: true,
          },
          {
            label: 'd',
            text: 'Todos os elementos do contradomínio possuem uma pré-imagem no domínio',
          },
          {
            label: 'e',
            text: 'O número de elementos do domínio é igual ao número de elementos do contradomínio',
          },
        ],
      },
      {
        text: 'A Revolução Industrial teve início na Inglaterra por diversos fatores. Entre eles NÃO se inclui:',
        area: 'Ciências Humanas',
        subarea: 'História',
        options: [
          {
            label: 'a',
            text: 'A disponibilidade de capital acumulado pelo comércio',
          },
          {
            label: 'b',
            text: 'A disponibilidade de mão de obra devido ao êxodo rural',
          },
          {
            label: 'c',
            text: 'A existência de importantes reservas de carvão mineral',
          },
          {
            label: 'd',
            text: 'O forte protecionismo do Estado inglês à indústria nascente',
            isCorrect: true,
          },
          {
            label: 'e',
            text: 'A estabilidade política e o desenvolvimento do parlamentarismo',
          },
        ],
      },
      {
        text: 'Assinale a alternativa que apresenta apenas orações coordenadas:',
        area: 'Linguagens',
        subarea: 'Gramática',
        options: [
          { label: 'a', text: 'Comprei o livro e li-o todo', isCorrect: true },
          { label: 'b', text: 'Como estava cansado, fui dormir' },
          { label: 'c', text: 'Fiquei feliz quando recebi a notícia' },
          { label: 'd', text: 'Não sei se ela virá à festa' },
          { label: 'e', text: 'O filme que assistimos é ótimo' },
        ],
      },
      {
        text: 'Qual das seguintes reações é um exemplo de reação de oxirredução?',
        area: 'Ciências da Natureza',
        subarea: 'Química',
        options: [
          { label: 'a', text: 'NaOH + HCl → NaCl + H₂O' },
          { label: 'b', text: 'CaCO₃ → CaO + CO₂' },
          {
            label: 'c',
            text: '2H₂ + O₂ → 2H₂O',
            isCorrect: true,
          },
          { label: 'd', text: 'NH₃ + H₂O → NH₄⁺ + OH⁻' },
          { label: 'e', text: 'H₂O → H⁺ + OH⁻' },
        ],
      },
      {
        text: 'Uma progressão aritmética tem primeiro termo 3 e razão 5. Qual é o 6º termo?',
        area: 'Matemática',
        subarea: 'Progressões',
        options: [
          { label: 'a', text: '18' },
          { label: 'b', text: '23' },
          { label: 'c', text: '28', isCorrect: true },
          { label: 'd', text: '33' },
          { label: 'e', text: '35' },
        ],
      },
      {
        text: 'Ao lançar um dado honesto, qual é a probabilidade de sair um número par?',
        area: 'Matemática',
        subarea: 'Probabilidade',
        options: [
          { label: 'a', text: '1/6' },
          { label: 'b', text: '1/3' },
          { label: 'c', text: '1/2', isCorrect: true },
          { label: 'd', text: '2/3' },
          { label: 'e', text: '5/6' },
        ],
      },
      {
        text: 'Um triângulo possui base 12 cm e altura 5 cm. A área desse triângulo é:',
        area: 'Matemática',
        subarea: 'Geometria',
        options: [
          { label: 'a', text: '17 cm²' },
          { label: 'b', text: '24 cm²' },
          { label: 'c', text: '30 cm²', isCorrect: true },
          { label: 'd', text: '40 cm²' },
          { label: 'e', text: '60 cm²' },
        ],
      },
      {
        text: 'Um resistor de 10 ohms é atravessado por uma corrente elétrica de 2 A. A tensão aplicada é:',
        area: 'Ciências da Natureza',
        subarea: 'Física',
        options: [
          { label: 'a', text: '5 V' },
          { label: 'b', text: '10 V' },
          { label: 'c', text: '20 V', isCorrect: true },
          { label: 'd', text: '30 V' },
          { label: 'e', text: '40 V' },
        ],
      },
      {
        text: 'Uma solução com pH 3 é classificada como:',
        area: 'Ciências da Natureza',
        subarea: 'Química',
        options: [
          { label: 'a', text: 'Básica' },
          { label: 'b', text: 'Neutra' },
          { label: 'c', text: 'Ácida', isCorrect: true },
          { label: 'd', text: 'Salina' },
          { label: 'e', text: 'Saturada' },
        ],
      },
      {
        text: 'O RNA diferencia-se do DNA por apresentar:',
        area: 'Ciências da Natureza',
        subarea: 'Biologia',
        options: [
          { label: 'a', text: 'Desoxirribose e timina' },
          { label: 'b', text: 'Ribose e uracila', isCorrect: true },
          { label: 'c', text: 'Ribose e timina' },
          { label: 'd', text: 'Desoxirribose e uracila' },
          { label: 'e', text: 'Apenas uma fita e timina' },
        ],
      },
      {
        text: 'A política dos governadores foi característica do período:',
        area: 'Ciências Humanas',
        subarea: 'História',
        options: [
          { label: 'a', text: 'Segundo Reinado' },
          { label: 'b', text: 'República Velha', isCorrect: true },
          { label: 'c', text: 'Ditadura Militar' },
          { label: 'd', text: 'Era Vargas' },
          { label: 'e', text: 'Nova República' },
        ],
      },
      {
        text: 'No Brasil, o processo de urbanização se intensificou principalmente a partir da:',
        area: 'Ciências Humanas',
        subarea: 'Geografia',
        options: [
          { label: 'a', text: 'década de 1800' },
          { label: 'b', text: 'década de 1910' },
          { label: 'c', text: 'década de 1950', isCorrect: true },
          { label: 'd', text: 'década de 1970' },
          { label: 'e', text: 'década de 1990' },
        ],
      },
      {
        text: 'Assinale a alternativa com uso correto da crase:',
        area: 'Linguagens',
        subarea: 'Gramática',
        options: [
          { label: 'a', text: 'Vou a escola todos os dias.' },
          { label: 'b', text: 'Cheguei à uma hora.' },
          { label: 'c', text: 'Fui à escola ontem.', isCorrect: true },
          { label: 'd', text: 'Entreguei a tarefa à partir de hoje.' },
          { label: 'e', text: 'Assisti à o filme ontem.' },
        ],
      },
      {
        text: 'Na frase "o céu chorou a noite inteira", ocorre a figura de linguagem:',
        area: 'Linguagens',
        subarea: 'Linguagem',
        options: [
          { label: 'a', text: 'Metáfora' },
          { label: 'b', text: 'Hipérbole' },
          { label: 'c', text: 'Personificação', isCorrect: true },
          { label: 'd', text: 'Antítese' },
          { label: 'e', text: 'Eufemismo' },
        ],
      },
    ],
  },
  {
    exam: {
      title: 'Vestibular USP - Redação',
      description:
        'Treine sua redação com temas frequentes dos vestibulares da USP.',
      durationMinutes: 60,
      timeLimitMinutes: 60,
      totalQuestions: 1,
      imageUrl:
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1473&auto=format&fit=crop',
      areas: ['Redação'],
      difficulty: ExamDifficulty.MEDIUM,
      hasEssay: true,
    },
    questions: [
      {
        type: QuestionType.ESSAY,
        // eslint-disable-next-line no-useless-escape
        text: 'A partir da leitura dos textos motivadores seguintes e com base nos conhecimentos construídos ao longo de sua formação, redija um texto dissertativo-argumentativo na modalidade escrita formal da língua portuguesa sobre o tema \"O impacto da tecnologia nas relações humanas contemporâneas\".',
        area: 'Redação',
        essayTopic: 'O impacto da tecnologia nas relações humanas contemporâneas',
        essayGuidelines:
          'Seu texto deve ter no mínimo 7 e no máximo 30 linhas. Articule argumentos para defender seu ponto de vista. Dê um título à sua redação. Não copie trechos dos textos motivadores.',
        supportingTexts: [
          {
            title: 'Texto I',
            content:
              'A era digital trouxe consigo mudanças significativas na forma como as pessoas se relacionam. As redes sociais, aplicativos de mensagens e plataformas de videoconferência diminuíram distâncias geográficas, mas trouxeram novos desafios para a comunicação interpessoal.',
            source: 'Revista Tecnologia e Sociedade, 2023',
          },
          {
            title: 'Texto II',
            content:
              'Pesquisa realizada pela Universidade de São Paulo (USP) indica que 68% dos jovens entre 18 e 25 anos preferem interações digitais a encontros presenciais. O estudo aponta ainda que 42% dos entrevistados relatam dificuldades em manter conversas face a face por períodos prolongados.',
            source: 'Instituto de Psicologia da USP, 2024',
          },
          {
            title: 'Texto III',
            content:
            // eslint-disable-next-line no-useless-escape
              '\"À medida que nos tornamos mais conectados digitalmente, corremos o risco de nos tornarmos mais desconectados emocionalmente. A tecnologia deve ser uma ponte para relações mais profundas, não um substituto delas.\"',
            source: 'SILVA, Maria. O paradoxo digital. 2022.',
          },
        ],
      },
    ],
  },
  {
    exam: {
      title: 'ENEM Simulado Matemática',
      description:
        'Banco de questões de matemática com foco em cálculo e raciocínio lógico.',
      durationMinutes: 90,
      timeLimitMinutes: 90,
      totalQuestions: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1509223197845-458d87318791?q=80&w=1470&auto=format&fit=crop',
      areas: ['Matemática'],
      difficulty: ExamDifficulty.MEDIUM,
    },
    questions: [
      {
        text: 'Se x + 3 = 10, então x é:',
        area: 'Matemática',
        subarea: 'Álgebra',
        options: [
          { label: 'a', text: '5' },
          { label: 'b', text: '6' },
          { label: 'c', text: '7', isCorrect: true },
          { label: 'd', text: '8' },
          { label: 'e', text: '10' },
        ],
      },
      {
        text: 'O valor de 1/2 + 1/4 é:',
        area: 'Matemática',
        subarea: 'Aritmética',
        options: [
          { label: 'a', text: '1/4' },
          { label: 'b', text: '1/2' },
          { label: 'c', text: '3/4', isCorrect: true },
          { label: 'd', text: '1' },
          { label: 'e', text: '3/2' },
        ],
      },
      {
        text: 'Um produto de R$ 200 recebeu aumento de 15%. O novo preço é:',
        area: 'Matemática',
        subarea: 'Porcentagem',
        options: [
          { label: 'a', text: 'R$ 210' },
          { label: 'b', text: 'R$ 220' },
          { label: 'c', text: 'R$ 230', isCorrect: true },
          { label: 'd', text: 'R$ 240' },
          { label: 'e', text: 'R$ 250' },
        ],
      },
      {
        text: 'Se 3 kg custam R$ 24, quanto custam 5 kg?',
        area: 'Matemática',
        subarea: 'Razão e Proporção',
        options: [
          { label: 'a', text: 'R$ 30' },
          { label: 'b', text: 'R$ 35' },
          { label: 'c', text: 'R$ 40', isCorrect: true },
          { label: 'd', text: 'R$ 45' },
          { label: 'e', text: 'R$ 50' },
        ],
      },
      {
        text: 'As raízes da equação x^2 - 5x + 6 = 0 são:',
        area: 'Matemática',
        subarea: 'Equações',
        options: [
          { label: 'a', text: '1 e 6' },
          { label: 'b', text: '2 e 3', isCorrect: true },
          { label: 'c', text: '-2 e -3' },
          { label: 'd', text: '3 e 4' },
          { label: 'e', text: '5 e 6' },
        ],
      },
      {
        text: 'Se f(x) = 2x - 1, então f(4) é:',
        area: 'Matemática',
        subarea: 'Funções',
        options: [
          { label: 'a', text: '5' },
          { label: 'b', text: '7', isCorrect: true },
          { label: 'c', text: '8' },
          { label: 'd', text: '9' },
          { label: 'e', text: '10' },
        ],
      },
      {
        text: 'A área de um círculo de raio 3 cm é:',
        area: 'Matemática',
        subarea: 'Geometria',
        options: [
          { label: 'a', text: '6pi' },
          { label: 'b', text: '9pi', isCorrect: true },
          { label: 'c', text: '12pi' },
          { label: 'd', text: '18pi' },
          { label: 'e', text: '27pi' },
        ],
      },
      {
        text: 'O perímetro de um retângulo de lados 5 e 2 é:',
        area: 'Matemática',
        subarea: 'Geometria',
        options: [
          { label: 'a', text: '10' },
          { label: 'b', text: '12' },
          { label: 'c', text: '14', isCorrect: true },
          { label: 'd', text: '16' },
          { label: 'e', text: '20' },
        ],
      },
      {
        text: 'Em uma urna com 3 bolas vermelhas e 2 azuis, a probabilidade de retirar uma bola azul é:',
        area: 'Matemática',
        subarea: 'Probabilidade',
        options: [
          { label: 'a', text: '1/5' },
          { label: 'b', text: '2/5', isCorrect: true },
          { label: 'c', text: '1/2' },
          { label: 'd', text: '3/5' },
          { label: 'e', text: '2/3' },
        ],
      },
      {
        text: 'A média aritmética de 2, 4, 6 e 8 é:',
        area: 'Matemática',
        subarea: 'Estatística',
        options: [
          { label: 'a', text: '4' },
          { label: 'b', text: '5', isCorrect: true },
          { label: 'c', text: '6' },
          { label: 'd', text: '7' },
          { label: 'e', text: '8' },
        ],
      },
      {
        text: 'Em uma PA com a1 = 4 e r = 3, o 5º termo é:',
        area: 'Matemática',
        subarea: 'Progressões',
        options: [
          { label: 'a', text: '13' },
          { label: 'b', text: '14' },
          { label: 'c', text: '15' },
          { label: 'd', text: '16', isCorrect: true },
          { label: 'e', text: '17' },
        ],
      },
      {
        text: 'Em uma PG com a1 = 2 e r = 2, o 4º termo é:',
        area: 'Matemática',
        subarea: 'Progressões',
        options: [
          { label: 'a', text: '6' },
          { label: 'b', text: '8' },
          { label: 'c', text: '12' },
          { label: 'd', text: '16', isCorrect: true },
          { label: 'e', text: '18' },
        ],
      },
      {
        text: 'O valor de log10(1000) é:',
        area: 'Matemática',
        subarea: 'Logaritmos',
        options: [
          { label: 'a', text: '2' },
          { label: 'b', text: '3', isCorrect: true },
          { label: 'c', text: '4' },
          { label: 'd', text: '5' },
          { label: 'e', text: '10' },
        ],
      },
      {
        text: 'A raiz quadrada de 81 é:',
        area: 'Matemática',
        subarea: 'Aritmética',
        options: [
          { label: 'a', text: '7' },
          { label: 'b', text: '8' },
          { label: 'c', text: '9', isCorrect: true },
          { label: 'd', text: '10' },
          { label: 'e', text: '11' },
        ],
      },
      {
        text: 'A solução da inequação 2x - 4 > 0 é:',
        area: 'Matemática',
        subarea: 'Inequações',
        options: [
          { label: 'a', text: 'x > 0' },
          { label: 'b', text: 'x > 1' },
          { label: 'c', text: 'x > 2', isCorrect: true },
          { label: 'd', text: 'x < 2' },
          { label: 'e', text: 'x < 0' },
        ],
      },
    ],
  },
  {
    exam: {
      title: 'ENEM Simulado Humanas e Linguagens',
      description:
        'Questões de história, geografia, filosofia, sociologia e língua portuguesa.',
      durationMinutes: 120,
      timeLimitMinutes: 120,
      totalQuestions: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1471970471555-19d4b113e9ed?q=80&w=1470&auto=format&fit=crop',
      areas: ['Ciências Humanas', 'Linguagens'],
      difficulty: ExamDifficulty.MEDIUM,
    },
    questions: [
      {
        text: 'A Queda da Bastilha, em 1789, é um marco da:',
        area: 'Ciências Humanas',
        subarea: 'História',
        options: [
          { label: 'a', text: 'Revolução Inglesa' },
          { label: 'b', text: 'Revolução Francesa', isCorrect: true },
          { label: 'c', text: 'Revolução Industrial' },
          { label: 'd', text: 'Revolução Russa' },
          { label: 'e', text: 'Revolução Mexicana' },
        ],
      },
      {
        text: '"Penso, logo existo" é atribuído a:',
        area: 'Ciências Humanas',
        subarea: 'Filosofia',
        options: [
          { label: 'a', text: 'Aristóteles' },
          { label: 'b', text: 'Descartes', isCorrect: true },
          { label: 'c', text: 'Kant' },
          { label: 'd', text: 'Platão' },
          { label: 'e', text: 'Nietzsche' },
        ],
      },
      {
        text: 'O conceito de mais-valia foi desenvolvido por:',
        area: 'Ciências Humanas',
        subarea: 'Sociologia',
        options: [
          { label: 'a', text: 'Durkheim' },
          { label: 'b', text: 'Weber' },
          { label: 'c', text: 'Karl Marx', isCorrect: true },
          { label: 'd', text: 'Comte' },
          { label: 'e', text: 'Adam Smith' },
        ],
      },
      {
        text: 'O fenômeno El Niño está associado a:',
        area: 'Ciências Humanas',
        subarea: 'Geografia',
        options: [
          { label: 'a', text: 'Resfriamento do Oceano Pacífico' },
          {
            label: 'b',
            text: 'Aquecimento anômalo do Pacífico equatorial',
            isCorrect: true,
          },
          { label: 'c', text: 'Erupções vulcânicas em cadeia' },
          { label: 'd', text: 'Aumento da salinidade do Atlântico' },
          { label: 'e', text: 'Movimentos tectônicos intensos' },
        ],
      },
      {
        text: 'A Lei Áurea, que aboliu a escravidão no Brasil, foi assinada em:',
        area: 'Ciências Humanas',
        subarea: 'História',
        options: [
          { label: 'a', text: '1822' },
          { label: 'b', text: '1888', isCorrect: true },
          { label: 'c', text: '1930' },
          { label: 'd', text: '1964' },
          { label: 'e', text: '1988' },
        ],
      },
      {
        text: 'O principal bioma predominante na Amazônia é:',
        area: 'Ciências Humanas',
        subarea: 'Geografia',
        options: [
          { label: 'a', text: 'Savana' },
          { label: 'b', text: 'Cerrado' },
          { label: 'c', text: 'Floresta tropical úmida', isCorrect: true },
          { label: 'd', text: 'Caatinga' },
          { label: 'e', text: 'Pampas' },
        ],
      },
      {
        text: 'A Guerra Fria caracterizou-se pela rivalidade entre:',
        area: 'Ciências Humanas',
        subarea: 'História',
        options: [
          { label: 'a', text: 'Alemanha e França' },
          { label: 'b', text: 'EUA e URSS', isCorrect: true },
          { label: 'c', text: 'China e Japão' },
          { label: 'd', text: 'Brasil e Argentina' },
          { label: 'e', text: 'Inglaterra e Espanha' },
        ],
      },
      {
        text: 'O Mercosul tem como objetivo principal:',
        area: 'Ciências Humanas',
        subarea: 'Geografia',
        options: [
          {
            label: 'a',
            text: 'Integração econômica entre países sul-americanos',
            isCorrect: true,
          },
          { label: 'b', text: 'União militar entre países europeus' },
          { label: 'c', text: 'Impor uma moeda única mundial' },
          { label: 'd', text: 'Controle migratório europeu' },
          { label: 'e', text: 'Exploração espacial conjunta' },
        ],
      },
      {
        text: 'A função da linguagem que se volta para o próprio código é chamada de:',
        area: 'Linguagens',
        subarea: 'Linguagem',
        options: [
          { label: 'a', text: 'Referencial' },
          { label: 'b', text: 'Emotiva' },
          { label: 'c', text: 'Conativa' },
          { label: 'd', text: 'Metalinguística', isCorrect: true },
          { label: 'e', text: 'Fática' },
        ],
      },
      {
        text: 'Em geral, o gênero textual "notícia" tem como finalidade:',
        area: 'Linguagens',
        subarea: 'Interpretação',
        options: [
          { label: 'a', text: 'Divertir' },
          { label: 'b', text: 'Persuadir' },
          { label: 'c', text: 'Narrar ficção' },
          { label: 'd', text: 'Informar fatos', isCorrect: true },
          { label: 'e', text: 'Ensinar regras gramaticais' },
        ],
      },
      {
        text: 'Assinale a frase correta quanto à concordância verbal:',
        area: 'Linguagens',
        subarea: 'Gramática',
        options: [
          { label: 'a', text: 'Fazem dois anos que não viajo.' },
          { label: 'b', text: 'Faz dois anos que não viajo.', isCorrect: true },
          { label: 'c', text: 'Houveram muitos problemas.' },
          { label: 'd', text: 'Existem muita gente aqui.' },
          { label: 'e', text: 'Ocorreram-se mudanças.' },
        ],
      },
      {
        text: 'A Semana de Arte Moderna de 1922 marcou o início do:',
        area: 'Linguagens',
        subarea: 'Literatura',
        options: [
          { label: 'a', text: 'Barroco' },
          { label: 'b', text: 'Arcadismo' },
          { label: 'c', text: 'Romantismo' },
          { label: 'd', text: 'Modernismo', isCorrect: true },
          { label: 'e', text: 'Realismo' },
        ],
      },
      {
        text: 'No Barroco, uma característica marcante é o uso de:',
        area: 'Linguagens',
        subarea: 'Artes',
        options: [
          { label: 'a', text: 'Linhas retas e simplicidade' },
          { label: 'b', text: 'Contraste de luz e sombra', isCorrect: true },
          { label: 'c', text: 'Formas geométricas puras' },
          { label: 'd', text: 'Ausência de ornamentação' },
          { label: 'e', text: 'Composição minimalista' },
        ],
      },
      {
        text: 'O uso da linguagem em sentido figurado é chamado de:',
        area: 'Linguagens',
        subarea: 'Linguagem',
        options: [
          { label: 'a', text: 'Denotação' },
          { label: 'b', text: 'Conotação', isCorrect: true },
          { label: 'c', text: 'Descrição' },
          { label: 'd', text: 'Narração' },
          { label: 'e', text: 'Argumentação' },
        ],
      },
      {
        text: 'A urbanização brasileira intensificou-se principalmente com:',
        area: 'Ciências Humanas',
        subarea: 'Geografia',
        options: [
          { label: 'a', text: 'Expansão do ciclo do ouro' },
          {
            label: 'b',
            text: 'Industrialização e migração campo-cidade',
            isCorrect: true,
          },
          { label: 'c', text: 'Bandeirantismo' },
          { label: 'd', text: 'Economia açucareira colonial' },
          { label: 'e', text: 'Redução do setor terciário' },
        ],
      },
    ],
  },
];

export async function seedExams(dataSource: DataSource) {
  const examsRepository = dataSource.getRepository(Exam);
  const questionsRepository = dataSource.getRepository(Question);
  const optionsRepository = dataSource.getRepository(QuestionOption);
  const supportingTextsRepository =
    dataSource.getRepository(EssaySupportingText);

  for (const item of examsSeedData) {
    let exam = await examsRepository.findOne({
      where: { title: item.exam.title },
    });

    if (!exam) {
      exam = examsRepository.create({
        ...item.exam,
        hasEssay: item.exam.hasEssay ?? false,
      });
      exam = await examsRepository.save(exam);
    }

    let added = 0;
    for (const question of item.questions) {
      const existingQuestion = await questionsRepository.findOne({
        where: {
          text: question.text,
          exam: { id: exam.id },
        },
      });

      if (existingQuestion) {
        continue;
      }

      const questionEntity = questionsRepository.create({
        type: question.type ?? QuestionType.MULTIPLE_CHOICE,
        text: question.text,
        area: question.area,
        subarea: question.subarea,
        supportImage: question.supportImage,
        supportText: question.supportText,
        explanation: question.explanation,
        essayTopic: question.essayTopic,
        essayGuidelines: question.essayGuidelines,
        exam,
      });

      if (question.options) {
        questionEntity.options = question.options.map((option) =>
          optionsRepository.create({
            label: option.label,
            text: option.text,
            isCorrect: option.isCorrect ?? false,
          }),
        );
      }

      if (question.supportingTexts) {
        questionEntity.supportingTexts = question.supportingTexts.map((text) =>
          supportingTextsRepository.create({
            title: text.title ?? '',
            content: text.content,
            source: text.source,
          }),
        );
      }

      await questionsRepository.save(questionEntity);
      added += 1;
    }

    const totalQuestions = await questionsRepository.count({
      where: { exam: { id: exam.id } },
    });

    if (exam.totalQuestions !== totalQuestions) {
      exam.totalQuestions = totalQuestions;
      await examsRepository.save(exam);
    }

    if (added > 0) {
      console.log(`Added ${added} question(s) to ${exam.title}`);
    }
  }

  console.log('Seeded exams');
}
