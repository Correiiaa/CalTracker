import { GoogleGenerativeAI } from "@google/generative-ai";
import { COMMON_FOODS } from "./commonFoods";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
  generationConfig: { responseMimeType: "application/json" },
});

export interface ParsedFoodItem {
  originalName: string;
  englishQuery: string;
  weightGrams: number;
}

export interface NutrientData {
  calories: number; // per 100g
  protein: number;  // per 100g
  fat: number;      // per 100g
  carbs: number;    // per 100g
}

export interface FinalFoodItem {
  name: string;
  weightGrams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface AnalysisResult {
  foods: FinalFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  confidence?: number;
}

// 1. Parser de Linguagem Natural
export async function parseMealText(text: string): Promise<ParsedFoodItem[]> {
  const prompt = `
    Analise o seguinte texto em português que descreve alimentos consumidos:
    "${text}"

    Extraia cada alimento mencionado, a sua quantidade estimada em gramas, e traduza o nome do alimento para inglês científico/gastronómico de modo a ser pesquisado na base de dados USDA.
    Se o utilizador não especificar uma quantidade (ex: "uma maçã"), estime o peso padrão em gramas (ex: maçã = 150g, fatia de pão = 30g, etc).
    Se o utilizador usar unidades como colheres ou fatias, faça a conversão lógica para gramas.

    Devolva APENAS um objeto JSON no seguinte formato:
    {
      "items": [
        {
          "originalName": "nome do alimento em português",
          "englishQuery": "alimento traduzido e detalhado em inglês (ex: 'raw chicken breast')",
          "weightGrams": 300
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    return parsed.items || [];
  } catch (error) {
    console.error("Erro ao fazer parse do texto com o Gemini:", error);
    return [];
  }
}

// 2. Análise de Imagem (Multimodal)
export async function analyzeMealImage(base64Image: string): Promise<{ foods: ParsedFoodItem[]; confidence: number }> {
  // O base64Image pode vir com o prefixo "data:image/jpeg;base64,"
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: "image/jpeg",
    },
  };

  const prompt = `
    Analise a imagem desta refeição. Identifique todos os alimentos visíveis no prato ou copo.
    Estime o peso aproximado em gramas de cada porção visível.
    Forneça também uma tradução detalhada em inglês para pesquisa na API do USDA (ex: 'grilled chicken breast', 'cooked white rice', etc).
    Forneça uma estimativa de confiança geral na sua identificação (entre 0 e 1).

    Devolva APENAS um objeto JSON no seguinte formato:
    {
      "foods": [
        {
          "originalName": "nome em português",
          "englishQuery": "nome detalhado em inglês para pesquisa no USDA",
          "weightGrams": 150
        }
      ],
      "confidence": 0.85
    }
  `;

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    return {
      foods: parsed.foods || [],
      confidence: parsed.confidence || 0.8,
    };
  } catch (error) {
    console.error("Erro ao analisar a imagem com o Gemini:", error);
    return { foods: [], confidence: 0.5 };
  }
}

// 3. Pesquisa na API da USDA
export async function fetchUSDANutrientData(query: string): Promise<NutrientData | null> {
  const apiKey = process.env.FOOD_API_KEY || "DEMO_KEY";
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=5`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`USDA API respondeu com status ${response.status}`);
    }
    const data = await response.json();
    if (!data.foods || data.foods.length === 0) {
      return null;
    }

    const food = data.foods[0];
    return extractNutrients(food);
  } catch (error) {
    console.error(`Erro ao pesquisar no USDA por "${query}":`, error);
    return null;
  }
}

export interface USDASearchResult {
  fdcId: number;
  description: string;
  brandOwner?: string;
  nutrientsPer100g: NutrientData;
}

export async function translateQueryToEnglish(query: string): Promise<string> {
  const prompt = `Translate this food search term or description from Portuguese to English for food database search. Output ONLY the translated English term, with no extra text, punctuation, or quotes. Query: "${query}"`;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    console.error("Erro ao traduzir query:", e);
    return query;
  }
}

export async function translateResultsToPortuguese(descriptions: string[]): Promise<string[]> {
  if (descriptions.length === 0) return [];
  const prompt = `
    Translate the following list of food items from English to Portuguese for a calorie tracker application.
    Keep the translations natural, professional, and clear.
    List:
    ${JSON.stringify(descriptions)}

    Return ONLY a JSON object in this format:
    {
      "translations": ["tradução 1", "tradução 2", ...]
    }
  `;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    return parsed.translations || descriptions;
  } catch (e) {
    console.error("Erro ao traduzir descrições:", e);
    return descriptions;
  }
}

export async function searchUSDAFoods(query: string): Promise<USDASearchResult[]> {
  // 1. Procurar na lista local estática de alimentos comuns (removendo acentos para correspondência robusta)
  const removeAccents = (str: string) => 
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  const cleanQuery = removeAccents(query);
  
  const localMatches = COMMON_FOODS.filter(food => 
    removeAccents(food.name).includes(cleanQuery)
  );

  const localResults: USDASearchResult[] = localMatches.map((food, idx) => ({
    fdcId: -1 - idx, // ID fictício negativo
    description: food.name,
    brandOwner: "Alimento Padrão (Local)",
    nutrientsPer100g: {
      calories: food.calories,
      protein: food.protein,
      fat: food.fat,
      carbs: food.carbs
    }
  }));

  // 2. Traduzir query de Português para Inglês para a pesquisa USDA
  const englishQuery = await translateQueryToEnglish(query);
  
  const apiKey = process.env.FOOD_API_KEY || "DEMO_KEY";
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(englishQuery)}&pageSize=8`;

  let usdaResults: USDASearchResult[] = [];

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.foods && data.foods.length > 0) {
        const rawFoods = data.foods.map((food: any) => ({
          fdcId: food.fdcId,
          description: food.description,
          brandOwner: food.brandOwner,
          nutrientsPer100g: extractNutrients(food),
        }));

        // Traduzir descrições em lote para Português
        const englishDescriptions = rawFoods.map((f: any) => f.description);
        const portugueseDescriptions = await translateResultsToPortuguese(englishDescriptions);

        usdaResults = rawFoods.map((food: any, idx: number) => ({
          ...food,
          description: portugueseDescriptions[idx] || food.description,
        }));
      }
    }
  } catch (error) {
    console.error(`Erro ao pesquisar no USDA por "${query}":`, error);
  }

  // Combinar resultados: alimentos locais primeiro para fácil acesso, seguidos de opções do USDA
  return [...localResults, ...usdaResults];
}

function extractNutrients(foodItem: any): NutrientData {
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;

  const nutrients = foodItem.foodNutrients || [];
  for (const n of nutrients) {
    const name = (n.nutrientName || "").toLowerCase();
    const id = n.nutrientId;
    const value = parseFloat(n.value) || 0;

    // USDA Energy is normally nutrientId 1008
    if (id === 1008 || (name.includes("energy") && n.unitName?.toUpperCase() === "KCAL")) {
      calories = value;
    } else if (id === 1003 || name === "protein") {
      protein = value;
    } else if (id === 1004 || name === "total lipid (fat)" || name === "fat") {
      fat = value;
    } else if (id === 1005 || name === "carbohydrate, by difference" || name === "carbohydrate") {
      carbs = value;
    }
  }

  return { calories, protein, fat, carbs };
}

// 4. Fallback com Estimativa do Gemini (caso o USDA falhe ou não tenha o alimento)
export async function fallbackGeminiNutrientData(originalName: string, englishQuery: string): Promise<NutrientData> {
  const prompt = `
    A pesquisa oficial na base de dados USDA falhou para o alimento "${originalName}" (Inglês: "${englishQuery}").
    Estime os valores nutricionais médios por 100g para este alimento.
    Seja o mais realista possível, usando conhecimentos de tabelas de composição de alimentos.

    Devolva APENAS um objeto JSON no seguinte formato:
    {
      "calories": 150.0,
      "protein": 10.0,
      "fat": 5.0,
      "carbs": 15.0
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error(`Erro ao obter fallback nutricional do Gemini para "${originalName}":`, error);
    // Fallback absoluto seguro
    return { calories: 100, protein: 5, fat: 2, carbs: 15 };
  }
}

// 5. Motor Principal de Análise Nutricional
export async function processNutritionAnalysis(parsedItems: ParsedFoodItem[]): Promise<AnalysisResult> {
  const foods: FinalFoodItem[] = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;

  for (const item of parsedItems) {
    // 1. Tentar pesquisar na base de dados do USDA
    let nutrients = await fetchUSDANutrientData(item.englishQuery);

    // 2. Se falhar, usar o fallback do Gemini
    if (!nutrients) {
      console.log(`[Nutrition] USDA falhou. Usando estimativa Gemini para: ${item.originalName}`);
      nutrients = await fallbackGeminiNutrientData(item.originalName, item.englishQuery);
    }

    // 3. Fazer o cálculo matemático proporcional ao peso em gramas
    const factor = item.weightGrams / 100;
    const itemCalories = Math.round(nutrients.calories * factor * 10) / 10;
    const itemProtein = Math.round(nutrients.protein * factor * 10) / 10;
    const itemFat = Math.round(nutrients.fat * factor * 10) / 10;
    const itemCarbs = Math.round(nutrients.carbs * factor * 10) / 10;

    foods.push({
      name: item.originalName,
      weightGrams: item.weightGrams,
      calories: itemCalories,
      protein: itemProtein,
      fat: itemFat,
      carbs: itemCarbs,
    });

    totalCalories += itemCalories;
    totalProtein += itemProtein;
    totalFat += itemFat;
    totalCarbs += itemCarbs;
  }

  return {
    foods,
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
  };
}
