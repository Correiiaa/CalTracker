"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Camera, 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Sparkles, 
  Loader2, 
  UtensilsCrossed, 
  RefreshCw,
  History
} from "lucide-react";

interface FoodItemResult {
  name: string;
  weightGrams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  // Guardamos os valores por 100g para recálculo rápido no cliente
  caloriesPer100g?: number;
  proteinPer100g?: number;
  fatPer100g?: number;
  carbsPer100g?: number;
}

interface USDASearchResult {
  fdcId: number;
  description: string;
  brandOwner?: string;
  nutrientsPer100g: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

// Sub-componente para renderizar cada linha de resultado com o seu próprio input de gramas
function SearchResultRow({ 
  result, 
  onAdd,
  onTextClick
}: { 
  result: USDASearchResult; 
  onAdd: (weight: number) => void; 
  onTextClick?: () => void;
}) {
  const [weight, setWeight] = useState(100);

  return (
    <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col gap-2.5 hover:border-zinc-800 transition-colors">
      <div 
        className={`text-xs font-bold text-white leading-tight ${onTextClick ? "cursor-pointer hover:text-emerald-400 transition-colors" : ""}`}
        onClick={onTextClick}
        title={onTextClick ? "Clique para preencher o formulário manual" : undefined}
      >
        {result.description}
        {result.brandOwner && (
          <span className="text-[10px] text-zinc-500 block font-normal mt-0.5">
            Marca: {result.brandOwner}
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between gap-2 border-t border-zinc-900/60 pt-2">
        <span className="text-[10px] text-zinc-400 font-semibold">
          {Math.round(result.nutrientsPer100g.calories)} kcal/100g
        </span>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-0.5">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className="bg-transparent border-none text-white text-xs w-10 text-center focus:outline-none font-semibold p-0"
            />
            <span className="text-zinc-500 text-[10px] font-bold">g</span>
          </div>
          <button
            type="button"
            onClick={() => onAdd(weight)}
            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 transition-all flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddMealPage() {
  const router = useRouter();

  // Estados principais
  const [mealName, setMealName] = useState("");
  const [mealDate, setMealDate] = useState("");
  const [inputType, setInputType] = useState<"search" | "image" | "custom">("search");
  
  // Estados para alimento personalizado (manual)
  const [customName, setCustomName] = useState("");
  const [customWeight, setCustomWeight] = useState<number>(100);
  const [customCaloriesPer100g, setCustomCaloriesPer100g] = useState<number | "">("");
  const [customProteinPer100g, setCustomProteinPer100g] = useState<number | "">("");
  const [customFatPer100g, setCustomFatPer100g] = useState<number | "">("");
  const [customCarbsPer100g, setCustomCarbsPer100g] = useState<number | "">("");
  
  // Estados para pesquisa manual direta na USDA
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<USDASearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Estados para alimentos do histórico recente
  const [recentFoods, setRecentFoods] = useState<any[]>([]);
  
  // Upload de foto
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBytesBase64, setImageBytesBase64] = useState<string | null>(null);

  // Estados de processamento da IA para imagem
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Resultados da refeição (editáveis pelo utilizador)
  const [foodItems, setFoodItems] = useState<FoodItemResult[]>([]);

  // Definir data/hora atual por padrão
  useEffect(() => {
    const now = new Date();
    // Ajustar para timezone local no formato YYYY-MM-DDThh:mm
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    setMealDate(localISOTime);

    // Sugerir nome da refeição baseado na hora atual
    const hour = now.getHours();
    if (hour >= 6 && hour < 11) setMealName("Pequeno-Almoço");
    else if (hour >= 11 && hour < 15) setMealName("Almoço");
    else if (hour >= 15 && hour < 19) setMealName("Lanche");
    else if (hour >= 19 && hour < 23) setMealName("Jantar");
    else setMealName("Ceia");
  }, []);

  // Carregar alimentos do histórico recente no arranque
  useEffect(() => {
    const fetchRecentFoods = async () => {
      try {
        const res = await fetch("/api/foods/recent");
        if (res.ok) {
          const data = await res.json();
          setRecentFoods(data.recentFoods || []);
        }
      } catch (err) {
        console.error("Erro ao carregar alimentos recentes:", err);
      }
    };
    fetchRecentFoods();
  }, []);

  // Frases de carregamento para imagem
  useEffect(() => {
    if (!analyzing) return;
    const messages = [
      "O Gemini está a espreitar o seu prato...",
      "A identificar alimentos e ingredientes...",
      "A calcular as porções aproximadas...",
      "A pesquisar na base de dados nutricional USDA...",
      "A efetuar cálculos matemáticos de calorias e macros...",
      "Quase pronto! A organizar a tabela nutricional...",
    ];
    setLoadingMessage(messages[0]);

    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setLoadingMessage(messages[idx]);
    }, 3000);

    return () => clearInterval(interval);
  }, [analyzing]);

  // Converter ficheiro para Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBytesBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Pesquisa direta na USDA via API
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setHasSearched(true);
    setAnalysisError(null);

    try {
      const response = await fetch(`/api/foods/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na pesquisa da base de dados USDA.");
      }

      setSearchResults(data.foods || []);
    } catch (err: any) {
      setAnalysisError(err.message || "Erro desconhecido.");
    } finally {
      setSearching(false);
    }
  };

  // Adicionar alimento da USDA à refeição atual
  const handleAddUSDAResult = (result: USDASearchResult, weight: number) => {
    if (weight <= 0) return;

    const factor = weight / 100;
    const newItem: FoodItemResult = {
      name: result.description,
      weightGrams: weight,
      calories: Math.round(result.nutrientsPer100g.calories * factor * 10) / 10,
      protein: Math.round(result.nutrientsPer100g.protein * factor * 10) / 10,
      fat: Math.round(result.nutrientsPer100g.fat * factor * 10) / 10,
      carbs: Math.round(result.nutrientsPer100g.carbs * factor * 10) / 10,
      caloriesPer100g: result.nutrientsPer100g.calories,
      proteinPer100g: result.nutrientsPer100g.protein,
      fatPer100g: result.nutrientsPer100g.fat,
      carbsPer100g: result.nutrientsPer100g.carbs,
    };

    setFoodItems((prev) => [...prev, newItem]);
  };

  // Adicionar alimento personalizado
  const handleAddCustomFood = () => {
    if (!customName.trim()) {
      alert("O nome do alimento é obrigatório.");
      return;
    }
    if (!customWeight || customWeight <= 0) {
      alert("A quantidade (g) é obrigatória e deve ser maior que 0.");
      return;
    }
    if (customCaloriesPer100g === "" || customCaloriesPer100g < 0) {
      alert("As calorias por 100g são obrigatórias.");
      return;
    }

    const kcal100 = Number(customCaloriesPer100g);
    const prot100 = Number(customProteinPer100g) || 0;
    const fat100 = Number(customFatPer100g) || 0;
    const carbs100 = Number(customCarbsPer100g) || 0;

    const factor = customWeight / 100;
    const newItem: FoodItemResult = {
      name: customName,
      weightGrams: customWeight,
      calories: Math.round(kcal100 * factor * 10) / 10,
      protein: Math.round(prot100 * factor * 10) / 10,
      fat: Math.round(fat100 * factor * 10) / 10,
      carbs: Math.round(carbs100 * factor * 10) / 10,
      caloriesPer100g: kcal100,
      proteinPer100g: prot100,
      fatPer100g: fat100,
      carbsPer100g: carbs100,
    };

    setFoodItems((prev) => [...prev, newItem]);
    
    // Limpar formulário manual
    setCustomName("");
    setCustomWeight(100);
    setCustomCaloriesPer100g("");
    setCustomProteinPer100g("");
    setCustomFatPer100g("");
    setCustomCarbsPer100g("");
  };

  // Submeter para análise de Imagem por IA (Gemini)
  const handleAnalyzeImage = async () => {
    if (!imageBytesBase64) {
      alert("Selecione uma imagem primeiro.");
      return;
    }

    setAnalysisError(null);
    setAnalyzing(true);

    try {
      const response = await fetch("/api/meals/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "image",
          image: imageBytesBase64
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro ao analisar a imagem.");
      }

      // Preparar os alimentos calculando os valores por 100g para permitir recálculo local no cliente
      const preparedFoods = data.foods.map((food: any) => {
        const weight = food.weightGrams || 100;
        return {
          ...food,
          caloriesPer100g: (food.calories / weight) * 100,
          proteinPer100g: (food.protein / weight) * 100,
          fatPer100g: (food.fat / weight) * 100,
          carbsPer100g: (food.carbs / weight) * 100,
        };
      });

      setFoodItems((prev) => [...prev, ...preparedFoods]);
    } catch (err: any) {
      setAnalysisError(err.message || "Erro desconhecido.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Ajustar o peso do alimento e recalcular macros proporcionalmente
  const handleWeightChange = (index: number, newWeight: number) => {
    if (newWeight < 0) return;

    setFoodItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;

        const factor = newWeight / 100;
        return {
          ...item,
          weightGrams: newWeight,
          calories: Math.round((item.caloriesPer100g || 0) * factor * 10) / 10,
          protein: Math.round((item.proteinPer100g || 0) * factor * 10) / 10,
          fat: Math.round((item.fatPer100g || 0) * factor * 10) / 10,
          carbs: Math.round((item.carbsPer100g || 0) * factor * 10) / 10,
        };
      })
    );
  };

  // Editar o nome do alimento
  const handleNameChange = (index: number, newName: string) => {
    setFoodItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        return { ...item, name: newName };
      })
    );
  };

  // Eliminar alimento da lista
  const handleRemoveItem = (index: number) => {
    setFoodItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Adicionar alimento vazio para registo manual adicional
  const handleAddNewItem = () => {
    const newItem: FoodItemResult = {
      name: "Novo Alimento",
      weightGrams: 100,
      calories: 100,
      protein: 5,
      fat: 2,
      carbs: 15,
      caloriesPer100g: 100,
      proteinPer100g: 5,
      fatPer100g: 2,
      carbsPer100g: 15,
    };
    setFoodItems((prev) => [...prev, newItem]);
  };

  // Guardar Refeição na Base de Dados
  const handleSaveMeal = async () => {
    if (!mealName.trim()) {
      alert("Escreva um nome para a refeição.");
      return;
    }
    if (foodItems.length === 0) {
      alert("Adicione pelo menos um alimento à refeição.");
      return;
    }

    try {
      const response = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mealName,
          date: mealDate,
          foodItems,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao guardar refeição.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Erro ao guardar.");
    }
  };

  // Calcular totais em tempo real
  const totalCalories = Math.round(foodItems.reduce((acc, cur) => acc + cur.calories, 0));
  const totalProtein = Math.round(foodItems.reduce((acc, cur) => acc + cur.protein, 0) * 10) / 10;
  const totalFat = Math.round(foodItems.reduce((acc, cur) => acc + cur.fat, 0) * 10) / 10;
  const totalCarbs = Math.round(foodItems.reduce((acc, cur) => acc + cur.carbs, 0) * 10) / 10;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white">Registar Refeição</h1>
        <p className="text-zinc-400 mt-1">Adicione os seus alimentos usando pesquisa manual ou fotografia inteligente.</p>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Lado Esquerdo: Input (Colunas 2/5) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-5 space-y-5 shadow-2xl">
            
            {/* Metadados da Refeição */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Nome da Refeição
                </label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full max-w-full min-w-0 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 text-base md:text-sm focus:outline-none focus:border-emerald-500 transition-colors block box-border"
                  placeholder="Ex: Almoço Saudável"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Data e Hora
                </label>
                <input
                  type="datetime-local"
                  value={mealDate}
                  onChange={(e) => setMealDate(e.target.value)}
                  className="w-2/3 max-w-full min-w-0 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 text-base md:text-sm focus:outline-none focus:border-emerald-500 transition-colors block box-border"
                />
              </div>
            </div>

            {/* Toggle Tipo de Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Método de Registo
              </label>
              <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => { setInputType("search"); }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                    inputType === "search"
                      ? "bg-zinc-900 text-emerald-400 shadow-md border border-zinc-800"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Search className="h-3.5 w-3.5" />
                  Pesquisa
                </button>
                <button
                  type="button"
                  onClick={() => { setInputType("image"); }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                    inputType === "image"
                      ? "bg-zinc-900 text-emerald-400 shadow-md border border-zinc-800"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Camera className="h-3.5 w-3.5" />
                  Foto IA
                </button>
                <button
                  type="button"
                  onClick={() => { setInputType("custom"); }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                    inputType === "custom"
                      ? "bg-zinc-900 text-emerald-400 shadow-md border border-zinc-800"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Manual
                </button>
              </div>
            </div>

            {/* Form de Pesquisa Manual na USDA */}
            {inputType === "search" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Pesquisar Alimento
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearch();
                        }
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Ex: apple, chicken breast, milk..."
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={searching || !searchQuery.trim()}
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center"
                    >
                      {searching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Procurar"
                      )}
                    </button>
                  </div>
                </div>

                {/* Lista de Resultados de Pesquisa USDA */}
                {searchResults.length > 0 && searchQuery && (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 border-t border-zinc-800/80 pt-4">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Resultados da Pesquisa
                    </h3>
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <SearchResultRow 
                          key={result.fdcId} 
                          result={result} 
                          onAdd={(weight) => handleAddUSDAResult(result, weight)} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Se não há pesquisa ativa, mostrar alimentos do histórico recente */}
                {!searchQuery && recentFoods.length > 0 && (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 border-t border-zinc-800/80 pt-4">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5 text-emerald-400" />
                      Alimentos Recentes (Histórico)
                    </h3>
                    <div className="space-y-2">
                      {recentFoods.map((food, idx) => {
                        const mappedResult: USDASearchResult = {
                          fdcId: -100 - idx,
                          description: food.name,
                          brandOwner: "Histórico",
                          nutrientsPer100g: {
                            calories: food.caloriesPer100g,
                            protein: food.proteinPer100g,
                            fat: food.fatPer100g,
                            carbs: food.carbsPer100g,
                          }
                        };
                        return (
                          <SearchResultRow 
                            key={mappedResult.fdcId} 
                            result={mappedResult} 
                            onAdd={(weight) => handleAddUSDAResult(mappedResult, weight)} 
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {searchResults.length === 0 && searchQuery && !searching && hasSearched && (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    Nenhum alimento encontrado. Pesquise termos em inglês para melhores resultados na base de dados USDA (ex: "rice" em vez de "arroz").
                  </p>
                )}
              </div>
            )}

            {/* Form de Adicionar Alimento Personalizado */}
            {inputType === "custom" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Nome do Alimento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 text-base md:text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="Ex: Whey Isolate, Barra de Proteína..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Quantidade a consumir (g) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={customWeight || ""}
                      onChange={(e) => setCustomWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 text-base md:text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Ex: 100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Calorias (kcal por 100g) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={customCaloriesPer100g}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomCaloriesPer100g(val === "" ? "" : parseFloat(val));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 text-base md:text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Ex: 350"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Prot (g por 100g)
                    </label>
                    <input
                      type="number"
                      value={customProteinPer100g}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomProteinPer100g(val === "" ? "" : parseFloat(val));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-2.5 text-zinc-100 text-base md:text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Ex: 25"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      HC (g por 100g)
                    </label>
                    <input
                      type="number"
                      value={customCarbsPer100g}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomCarbsPer100g(val === "" ? "" : parseFloat(val));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-2.5 text-zinc-100 text-base md:text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Ex: 5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                      Gord (g por 100g)
                    </label>
                    <input
                      type="number"
                      value={customFatPer100g}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomFatPer100g(val === "" ? "" : parseFloat(val));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-2.5 text-zinc-100 text-base md:text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Ex: 2"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomFood}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar à Refeição
                </button>

                {/* Histórico Recente no formulário manual */}
                {recentFoods.length > 0 && (
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 border-t border-zinc-800/80 pt-4 mt-4">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <History className="h-3.5 w-3.5 text-emerald-400" />
                      Alimentos Recentes (Histórico)
                    </h3>
                    <p className="text-[9px] text-zinc-500">
                      Clique no nome do alimento para preencher os campos acima ou no <span className="text-emerald-400 font-bold">+</span> para adicionar diretamente.
                    </p>
                    <div className="space-y-2">
                      {recentFoods.map((food, idx) => {
                        const mappedResult: USDASearchResult = {
                          fdcId: -200 - idx,
                          description: food.name,
                          brandOwner: "Histórico",
                          nutrientsPer100g: {
                            calories: food.caloriesPer100g,
                            protein: food.proteinPer100g,
                            fat: food.fatPer100g,
                            carbs: food.carbsPer100g,
                          }
                        };
                        return (
                          <SearchResultRow 
                            key={mappedResult.fdcId} 
                            result={mappedResult} 
                            onAdd={(weight) => handleAddUSDAResult(mappedResult, weight)} 
                            onTextClick={() => {
                              setCustomName(food.name);
                              setCustomCaloriesPer100g(food.caloriesPer100g);
                              setCustomProteinPer100g(food.proteinPer100g);
                              setCustomFatPer100g(food.fatPer100g);
                              setCustomCarbsPer100g(food.carbsPer100g);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form de Upload de Imagem */}
            {inputType === "image" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Carregar Foto do Prato
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-950 flex items-center justify-center group">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer border border-zinc-800">
                          Alterar Foto
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageChange} 
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all aspect-video">
                      <Camera className="h-8 w-8 text-zinc-600 mb-2" />
                      <span className="text-xs text-zinc-400 font-semibold">Tirar ou arrastar foto</span>
                      <span className="text-[10px] text-zinc-600 mt-1">JPEG, PNG ou WEBP</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageChange} 
                      />
                    </label>
                  )}
                </div>

                <button
                  type="button"
                  disabled={analyzing || !imageBytesBase64}
                  onClick={handleAnalyzeImage}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold py-3 px-4 rounded-xl text-sm transition-all"
                >
                  {analyzing ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-4.5 w-4.5" />
                  )}
                  Identificar Comida por IA
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Resultados / Edição da refeição (Colunas 3/5) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Ecrã de Loading com IA para imagem */}
          {analyzing && (
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-center text-center shadow-2xl min-h-[350px] space-y-4">
              <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
              <div className="space-y-1">
                <h3 className="font-bold text-white">Análise de imagem em progresso</h3>
                <p className="text-sm text-zinc-400 max-w-xs">{loadingMessage}</p>
              </div>
            </div>
          )}

          {/* Erro */}
          {analysisError && !analyzing && (
            <div className="rounded-3xl bg-red-950/20 border border-red-900/60 p-6 shadow-2xl text-center space-y-3">
              <p className="text-red-400 text-sm font-semibold">{analysisError}</p>
              <button 
                onClick={inputType === "search" ? handleSearch : handleAnalyzeImage}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Resultados Nutricionais da Análise */}
          {!analyzing && !analysisError && (
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl flex flex-col justify-between min-h-[350px] relative">
              <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-emerald-400" />
                    Alimentos no teu Prato
                  </h2>
                  {foodItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddNewItem}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      + Add Alimento Manual
                    </button>
                  )}
                </div>

                {foodItems.length === 0 ? (
                  /* Empty state lateral */
                  <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
                    <UtensilsCrossed className="h-10 w-10 text-zinc-700 mb-3" />
                    <p className="text-sm font-medium">Os teus alimentos aparecerão aqui.</p>
                    <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                      Pesquise alimentos na USDA e adicione-os à sua refeição, ou carregue uma fotografia para análise por IA.
                    </p>
                  </div>
                ) : (
                  /* Lista Editável de Alimentos */
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {foodItems.map((item, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-zinc-950 border border-zinc-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleNameChange(index, e.target.value)}
                            className="bg-transparent border-none text-white font-bold text-sm focus:outline-none focus:ring-0 p-0 w-full"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">Quantidade:</span>
                            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                              <input
                                type="number"
                                value={item.weightGrams}
                                onChange={(e) => handleWeightChange(index, parseFloat(e.target.value) || 0)}
                                className="bg-transparent border-none text-white text-xs w-12 text-center focus:outline-none font-semibold p-0"
                              />
                              <span className="text-zinc-500 text-[10px] font-bold">g</span>
                            </div>
                          </div>
                        </div>

                        {/* Macros calculados para o peso atual */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-zinc-900 pt-2 sm:pt-0">
                          <div className="flex gap-2.5 text-[10px] text-zinc-500">
                            <span className="flex flex-col text-center">
                              <span className="text-zinc-600 font-bold uppercase text-[8px]">Prot</span>
                              <span className="text-zinc-300 font-semibold">{item.protein}g</span>
                            </span>
                            <span className="flex flex-col text-center">
                              <span className="text-zinc-600 font-bold uppercase text-[8px]">HC</span>
                              <span className="text-zinc-300 font-semibold">{item.carbs}g</span>
                            </span>
                            <span className="flex flex-col text-center">
                              <span className="text-zinc-600 font-bold uppercase text-[8px]">Gord</span>
                              <span className="text-zinc-300 font-semibold">{item.fat}g</span>
                            </span>
                          </div>
                          
                          <div className="text-right min-w-[50px] border-l border-zinc-900 pl-3">
                            <span className="text-sm font-bold text-orange-400">{Math.round(item.calories)}</span>
                            <span className="text-[9px] text-zinc-600 block">kcal</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-zinc-600 hover:text-red-400 p-1.5 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {foodItems.length > 0 && (
                /* Resumo total e Botões de Submissão */
                <div className="mt-8 pt-6 border-t border-zinc-800/80 space-y-6">
                  
                  {/* Cards de Macronutrientes totais */}
                  <div className="grid grid-cols-4 gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
                    <div className="text-center flex flex-col justify-center">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Calorias</span>
                      <strong className="text-lg font-extrabold text-orange-400 mt-0.5">{totalCalories} <span className="text-xs">kcal</span></strong>
                    </div>
                    <div className="text-center flex flex-col justify-center border-l border-zinc-900">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Proteína</span>
                      <strong className="text-sm font-extrabold text-emerald-400 mt-0.5">{totalProtein}g</strong>
                    </div>
                    <div className="text-center flex flex-col justify-center border-l border-zinc-900">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Hidratos</span>
                      <strong className="text-sm font-extrabold text-indigo-400 mt-0.5">{totalCarbs}g</strong>
                    </div>
                    <div className="text-center flex flex-col justify-center border-l border-zinc-900">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Gorduras</span>
                      <strong className="text-sm font-extrabold text-orange-400 mt-0.5">{totalFat}g</strong>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFoodItems([])}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-2xl text-sm transition-all"
                    >
                      Limpar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveMeal}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold py-3 rounded-2xl text-sm shadow-lg shadow-emerald-500/10 transition-all active:scale-95"
                    >
                      <Save className="h-4.5 w-4.5" />
                      Guardar Refeição
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
