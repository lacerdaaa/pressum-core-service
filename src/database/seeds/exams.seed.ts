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
      totalQuestions: 10,
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
              '\"À medida que nos tornamos mais conectados digitalmente, corremos o risco de nos tornarmos mais desconectados emocionalmente. A tecnologia deve ser uma ponte para relações mais profundas, não um substituto delas.\"',
            source: 'SILVA, Maria. O paradoxo digital. 2022.',
          },
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

  const existing = await examsRepository.count();
  if (existing > 0) {
    // eslint-disable-next-line no-console
    console.log('Skipping exam seed: exams already exist');
    return;
  }

  for (const item of examsSeedData) {
    const exam = examsRepository.create({
      ...item.exam,
      hasEssay: item.exam.hasEssay ?? false,
    });

    exam.questions = item.questions.map((question) => {
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

      return questionEntity;
    });

    await examsRepository.save(exam);
  }

  // eslint-disable-next-line no-console
  console.log('Seeded exams');
}
