const { Quiz, QuizCard } = require('../models');
const logger = require('../middleware/logger');

const quizQuestions = [
  {
    questionNumber: 1,
    question: "In ruminant nutrition, the major site for microbial synthesis of B-vitamins is:",
    optionA: "Abomasum",
    optionB: "Rumen",
    optionC: "Small intestine",
    optionD: "Cecum",
    correctAnswer: "B",
    explanation: "The rumen is the primary site for microbial fermentation and B-vitamin synthesis in ruminants.",
    category: "Ruminant Nutrition",
    difficulty: "Easy"
  },
  {
    questionNumber: 2,
    question: "The first limiting amino acid in a typical maize-soybean meal-based broiler diet is:",
    optionA: "Methionine",
    optionB: "Lysine",
    optionC: "Threonine",
    optionD: "Tryptophan",
    correctAnswer: "A",
    explanation: "Methionine is typically the first limiting amino acid in maize-soybean based poultry diets.",
    category: "Poultry Nutrition",
    difficulty: "Medium"
  },
  {
    questionNumber: 3,
    question: "Which of the following represents the correct order of energy evaluation systems from gross to net energy?",
    optionA: "GE → NE → DE → ME",
    optionB: "GE → DE → ME → NE",
    optionC: "DE → GE → NE → ME",
    optionD: "NE → ME → DE → GE",
    correctAnswer: "B",
    explanation: "The correct order is Gross Energy (GE) → Digestible Energy (DE) → Metabolizable Energy (ME) → Net Energy (NE).",
    category: "Energy Systems",
    difficulty: "Medium"
  },
  {
    questionNumber: 4,
    question: "In ruminants, the ratio of acetate: propionate: butyrate in the rumen under a high-forage diet typically approximates:",
    optionA: "40:40:20",
    optionB: "60:30:10",
    optionC: "70:20:10",
    optionD: "50:40:10",
    correctAnswer: "C",
    explanation: "High-forage diets typically produce a VFA ratio of approximately 70:20:10 (acetate:propionate:butyrate).",
    category: "Ruminant Nutrition",
    difficulty: "Medium"
  },
  {
    questionNumber: 5,
    question: "The main precursor for milk fat synthesis in ruminants is:",
    optionA: "Propionate",
    optionB: "Acetate",
    optionC: "Butyrate",
    optionD: "Lactate",
    correctAnswer: "B",
    explanation: "Acetate is the primary precursor for milk fat synthesis, providing acetyl-CoA units.",
    category: "Ruminant Nutrition",
    difficulty: "Easy"
  },
  {
    questionNumber: 6,
    question: "In poultry, the major site of lipid absorption is:",
    optionA: "Crop",
    optionB: "Proventriculus",
    optionC: "Duodenum",
    optionD: "Jejunum",
    correctAnswer: "D",
    explanation: "The jejunum is the primary site for lipid absorption in poultry.",
    category: "Poultry Nutrition",
    difficulty: "Medium"
  },
  {
    questionNumber: 7,
    question: "The Kjeldahl method estimates crude protein based on:",
    optionA: "Total amino acid concentration",
    optionB: "Nitrogen content multiplied by a factor",
    optionC: "Peptide bond concentration",
    optionD: "True protein content only",
    correctAnswer: "B",
    explanation: "The Kjeldahl method measures nitrogen content and multiplies by 6.25 to estimate crude protein.",
    category: "Protein Analysis",
    difficulty: "Easy"
  },
  {
    questionNumber: 8,
    question: "The metabolizable energy (ME) of ruminant feed can be predicted from digestible organic matter (DOM) using the formula:",
    optionA: "ME = 0.014 × DOM (g/kg DM)",
    optionB: "ME = 0.016 × DOM (g/kg DM)",
    optionC: "ME = 0.018 × DOM (g/kg DM)",
    optionD: "ME = 0.020 × DOM (g/kg DM)",
    correctAnswer: "B",
    explanation: "ME = 0.016 × DOM (g/kg DM) is the standard formula for predicting metabolizable energy in ruminants.",
    category: "Energy Systems",
    difficulty: "Hard"
  },
  {
    questionNumber: 9,
    question: "Non-protein nitrogen (NPN) sources like urea should not exceed what percentage of total dietary nitrogen in cattle rations?",
    optionA: "15%",
    optionB: "25%",
    optionC: "35%",
    optionD: "45%",
    correctAnswer: "B",
    explanation: "NPN sources should not exceed 25-30% of total dietary nitrogen to avoid toxicity and inefficiency.",
    category: "Ruminant Nutrition",
    difficulty: "Medium"
  },
  {
    questionNumber: 10,
    question: "In poultry, the enzyme responsible for hydrolysis of phytic acid to release phosphorus is:",
    optionA: "Lipase",
    optionB: "Phytase",
    optionC: "Amylase",
    optionD: "Protease",
    correctAnswer: "B",
    explanation: "Phytase enzyme breaks down phytic acid to release bound phosphorus in poultry diets.",
    category: "Poultry Nutrition",
    difficulty: "Easy"
  },
  {
    questionNumber: 11,
    question: "Among volatile fatty acids, the one that contributes most to gluconeogenesis in ruminants is:",
    optionA: "Acetate",
    optionB: "Propionate",
    optionC: "Butyrate",
    optionD: "Isobutyrate",
    correctAnswer: "B",
    explanation: "Propionate is the primary gluconeogenic VFA, serving as a major glucose precursor.",
    category: "Ruminant Nutrition",
    difficulty: "Medium"
  },
  {
    questionNumber: 12,
    question: "The biological value (BV) of a protein depends primarily on:",
    optionA: "Protein solubility",
    optionB: "Digestibility and amino acid balance",
    optionC: "Crude protein percentage",
    optionD: "Fiber content of the feed",
    correctAnswer: "B",
    explanation: "Biological value depends on protein digestibility and amino acid composition matching animal requirements.",
    category: "Protein Quality",
    difficulty: "Medium"
  },
  {
    questionNumber: 13,
    question: "Which mineral deficiency causes perosis (slipped tendon) in poultry?",
    optionA: "Zinc",
    optionB: "Manganese",
    optionC: "Selenium",
    optionD: "Copper",
    correctAnswer: "B",
    explanation: "Manganese deficiency is the primary cause of perosis in growing poultry.",
    category: "Mineral Nutrition",
    difficulty: "Medium"
  },
  {
    questionNumber: 14,
    question: "The primary limiting factor for microbial protein synthesis in the rumen is:",
    optionA: "Crude fiber",
    optionB: "Available energy (ATP)",
    optionC: "Ammonia-N concentration",
    optionD: "Water content",
    correctAnswer: "B",
    explanation: "Available energy (ATP) from carbohydrate fermentation is the primary limiting factor for microbial protein synthesis.",
    category: "Ruminant Nutrition",
    difficulty: "Hard"
  },
  {
    questionNumber: 15,
    question: "The heat increment of feeding is lowest for which nutrient class?",
    optionA: "Carbohydrates",
    optionB: "Fats",
    optionC: "Proteins",
    optionD: "Fiber",
    correctAnswer: "B",
    explanation: "Fats have the lowest heat increment of feeding as they require less energy for digestion and metabolism.",
    category: "Energy Metabolism",
    difficulty: "Medium"
  },
  {
    questionNumber: 16,
    question: "The term \"bypass protein\" refers to:",
    optionA: "Protein not utilized by rumen microbes and digested in the abomasum",
    optionB: "Undigested protein excreted in feces",
    optionC: "Microbial protein synthesized in rumen",
    optionD: "Protein degraded rapidly in rumen",
    correctAnswer: "A",
    explanation: "Bypass protein escapes rumen degradation and is digested post-ruminally in the abomasum and intestine.",
    category: "Protein Nutrition",
    difficulty: "Easy"
  },
  {
    questionNumber: 17,
    question: "A diet with a cation-anion difference (DCAD) that is too low before calving in dairy cows can lead to:",
    optionA: "Milk fever",
    optionB: "Ketosis",
    optionC: "Acidosis",
    optionD: "Laminitis",
    correctAnswer: "A",
    explanation: "Low DCAD diets before calving help prevent milk fever by improving calcium metabolism.",
    category: "Dairy Nutrition",
    difficulty: "Hard"
  },
  {
    questionNumber: 18,
    question: "The main anti-nutritional factor in raw soybean is:",
    optionA: "Aflatoxin",
    optionB: "Trypsin inhibitor",
    optionC: "Gossypol",
    optionD: "Tannin",
    correctAnswer: "B",
    explanation: "Trypsin inhibitors in raw soybeans reduce protein digestibility and are destroyed by heat treatment.",
    category: "Feed Processing",
    difficulty: "Medium"
  },
  {
    questionNumber: 19,
    question: "The metabolizable energy requirement for maintenance in cattle is primarily influenced by:",
    optionA: "Age only",
    optionB: "Body surface area",
    optionC: "Crude protein intake",
    optionD: "Volatile fatty acid profile",
    correctAnswer: "B",
    explanation: "Maintenance energy requirements are primarily related to body surface area for heat loss regulation.",
    category: "Energy Requirements",
    difficulty: "Medium"
  },
  {
    questionNumber: 20,
    question: "In poultry feed formulation, apparent metabolizable energy corrected for nitrogen balance (AMEn) is used instead of AME because:",
    optionA: "Nitrogen retention affects gross energy",
    optionB: "Nitrogen excretion contributes to energy loss",
    optionC: "Nitrogen balance stabilizes crude fiber effects",
    optionD: "AMEn eliminates variability due to protein deposition",
    correctAnswer: "D",
    explanation: "AMEn corrects for energy lost in nitrogen excretion and reduces variability due to protein deposition.",
    category: "Poultry Nutrition",
    difficulty: "Hard"
  }
];

const seedQuizQuestions = async () => {
  try {
    logger.info('Starting quiz questions seeding...');

    // Check if questions already exist
    const existingCount = await Quiz.count();

    if (existingCount > 0) {
      logger.info(`Found ${existingCount} existing questions, skipping seed`);
      return;
    }

    // Get a QuizCard to associate these questions with
    const quizCard = await QuizCard.findOne({
      where: { title: 'Veterinary Nutrition Fundamentals' }
    });

    if (!quizCard) {
      logger.warn('No QuizCard "Veterinary Nutrition Fundamentals" found, skipping question seeding');
      return;
    }

    // Map questions to include the quizCardId
    const mappedQuestions = quizQuestions.map(q => ({
      ...q,
      quizCardId: quizCard.id
    }));

    // Insert all questions
    const createdQuestions = await Quiz.bulkCreate(mappedQuestions);

    logger.info(`Successfully seeded ${createdQuestions.length} quiz questions for card "${quizCard.title}"`);

    // Verify insertion
    const insertedCount = await Quiz.count();
    logger.info(`Total questions in database: ${insertedCount}`);

    return createdQuestions;

  } catch (error) {
    logger.error('Error seeding quiz questions', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

module.exports = {
  seedQuizQuestions,
  quizQuestions
};