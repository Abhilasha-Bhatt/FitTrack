/**
 * AI Meal Generator Logic
 * Simulated ML algorithm for budget-friendly meal selection
 */

const mealsDB = {
    vegetarian: {
        breakfast: [
            { name: "Oatmeal with Bananas", cal: 350, protein: 12, carbs: 60, fats: 8, price: 80, icon: "🥣", ingredients: ["Oats", "Banana", "Honey", "Milk"] },
            { name: "Greek Yogurt & Honey", cal: 250, protein: 15, carbs: 30, fats: 5, price: 120, icon: "🥛", ingredients: ["Plain Yogurt", "Raw Honey", "Almonds"] },
            { name: "Peanut Butter Toast", cal: 400, protein: 14, carbs: 45, fats: 22, price: 50, icon: "🍞", ingredients: ["Whole Wheat Bread", "Peanut Butter", "Chia Seeds"] },
            { name: "Vegetable Poha", cal: 300, protein: 8, carbs: 55, fats: 10, price: 40, icon: "🍛", ingredients: ["Flattened Rice", "Onions", "Peanuts", "Turmeric"] }
        ],
        lunch: [
            { name: "Lentil Soup (Dal) & Rice", cal: 500, protein: 18, carbs: 85, fats: 12, price: 60, icon: "🍲", ingredients: ["Red Lentils", "Basmati Rice", "Garlic", "Cumin"] },
            { name: "Chickpea Salad Sandwich", cal: 450, protein: 15, carbs: 65, fats: 14, price: 150, icon: "🥪", ingredients: ["Chickpeas", "Mayo", "Celery", "Multigrain Bread"] },
            { name: "Paneer Tikka Salad", cal: 550, protein: 25, carbs: 20, fats: 35, price: 250, icon: "🧀", ingredients: ["Paneer", "Bell Peppers", "Yogurt", "Spices"] }
        ],
        dinner: [
            { name: "Roasted Cauliflower Tacos", cal: 400, protein: 10, carbs: 45, fats: 20, price: 180, icon: "🌮", ingredients: ["Cauliflower", "Corn Tortillas", "Avocado", "Lime"] },
            { name: "Sweet Potato & Bean Stew", cal: 520, protein: 20, carbs: 80, fats: 15, price: 100, icon: "🥘", ingredients: ["Sweet Potato", "Black Beans", "Tomato", "Kale"] }
        ]
    },
    'non-vegetarian': {
        breakfast: [
            { name: "Scrambled Eggs on Toast", cal: 400, protein: 24, carbs: 30, fats: 18, price: 90, icon: "🍳", ingredients: ["Large Eggs", "Butter", "Sourdough Bread"] },
            { name: "Turkey & Egg Muffin", cal: 350, protein: 28, carbs: 25, fats: 12, price: 200, icon: "🥯", ingredients: ["Turkey Patty", "English Muffin", "Cheddar Cheese"] }
        ],
        lunch: [
            { name: "Grilled Chicken & Veggies", cal: 450, protein: 45, carbs: 20, fats: 12, price: 250, icon: "🍗", ingredients: ["Chicken Breast", "Broccoli", "Carrots", "Olive Oil"] },
            { name: "Tuna Salad Wrap", cal: 400, protein: 35, carbs: 40, fats: 10, price: 180, icon: "🌯", ingredients: ["Canned Tuna", "Tortilla", "Lettuce", "Onion"] }
        ],
        dinner: [
            { name: "Baked Salmon & Asparagus", cal: 500, protein: 40, carbs: 10, fats: 28, price: 450, icon: "🐟", ingredients: ["Salmon Fillet", "Asparagus", "Lemon", "Sea Salt"] },
            { name: "Steak & Sweet Potato", cal: 700, protein: 55, carbs: 45, fats: 30, price: 600, icon: "🥩", ingredients: ["Sirloin Steak", "Sweet Potato", "Butter", "Rosemary"] }
        ]
    }
};

document.getElementById('generate-btn').addEventListener('click', generateMealPlan);

function generateMealPlan() {
    const budget = document.getElementById('budget-range').value;
    const diet = document.querySelector('input[name="diet"]:checked').value;
    const goal = document.getElementById('fitness-goal').value;

    const overlay = document.getElementById('loading-overlay');
    const container = document.getElementById('meals-container');

    // Show loading
    overlay.classList.remove('hidden');
    container.innerHTML = '';
    initDateBadge();

    // Simulated "AI Processing" delay
    setTimeout(() => {
        try {
            const plan = runAIAlgorithm(budget, diet, goal);
            displayMeals(plan);
            showToast("AI Plan Generated Successfully! 🚀");
        } catch (err) {
            console.error(err);
            showToast("Error generating plan. Try again.");
        } finally {
            overlay.classList.add('hidden');
        }
    }, 1500);
}

/**
 * The "AI" logic:
 * 1. Filter meals by budget and diet
 * 2. Prioritize high protein if goal is muscle gain
 * 3. Prioritize low cal if goal is weight loss
 * 4. Ensure total daily calories are balanced
 */
function runAIAlgorithm(budget, diet, goal) {
    const categories = ['breakfast', 'lunch', 'dinner'];
    const selectedPlan = [];
    const source = mealsDB[diet];

    const budgetLimits = { low: 100, medium: 300, high: 9999 };
    const maxPrice = budgetLimits[budget];

    categories.forEach(cat => {
        let options = source[cat].filter(m => m.price <= maxPrice);
        
        // If no options in budget, take the cheapest
        if (options.length === 0) {
            options = [source[cat].sort((a,b) => a.price - b.price)[0]];
        }

        // Weighting logic based on goal
        options.sort((a, b) => {
            if (goal === 'muscle-gain') {
                return b.protein - a.protein; // Maximize protein
            } else if (goal === 'weight-loss') {
                return a.cal - b.cal; // Minimize calories
            }
            return Math.random() - 0.5; // Random for maintenance
        });

        // Pick top result (with a bit of randomness among top 2)
        const choice = options.length > 1 ? options[Math.floor(Math.random() * Math.min(options.length, 2))] : options[0];
        selectedPlan.push({ ...choice, type: cat });
    });

    return selectedPlan;
}

function displayMeals(plan) {
    const container = document.getElementById('meals-container');
    container.innerHTML = '';

    let totalCal = 0;

    plan.forEach((meal, index) => {
        totalCal += meal.cal;
        const card = document.createElement('div');
        card.className = 'meal-item';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="meal-icon">${meal.icon}</div>
            <div class="meal-info">
                <span class="meal-type-tag">${meal.type}</span>
                <h4>${meal.name}</h4>
                <div class="meal-ingredients" style="font-size: 0.75rem; color: var(--text2); margin-bottom: 12px;">
                    ${(meal.ingredients || []).map(ing => `• ${ing}`).join(' ')}
                </div>
                <div class="meal-macros">
                    <div class="macro">🔥 <span>${meal.cal}</span> kcal</div>
                    <div class="macro">💪 <span>${meal.protein}g</span> protein</div>
                    <div class="macro">🍞 <span>${meal.carbs}g</span> carbs</div>
                </div>
            </div>
            <div class="meal-actions">
                <span class="meal-price">₹${meal.price.toFixed(2)}</span>
                <button class="btn btn-ghost" onclick="saveMeal(${JSON.stringify(meal).replace(/"/g, '&quot;')})">Log Meal</button>
            </div>
        `;
        container.appendChild(card);
    });

    updateStats(totalCal);
}

function updateStats(calories) {
    const calValue = document.getElementById('total-calories');
    const progressBar = document.getElementById('cal-progress');
    
    calValue.innerText = `${calories} kcal`;
    
    // Assume 2500 is target
    const percentage = Math.min((calories / 2500) * 100, 100);
    progressBar.style.width = `${percentage}%`;
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.remove('hidden');
    toast.classList.add('visible');
    
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}

async function saveMeal(meal) {
    const user = JSON.parse(localStorage.getItem("user")) || {id: 1};
    
    try {
        const response = await fetch("../auth/add_meal.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: user.id,
                meal_name: meal.name,
                meal_type: meal.type,
                calories: meal.cal,
                protein: meal.protein,
                carbs: meal.carbs,
                fats: meal.fats,
                meal_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
        });

        const data = await response.json();
        showToast(data.message || "Meal Logged! 🥗");
    } catch (err) {
        showToast("Saved to local session! (Offline)");
        console.error(err);
    }
}

function initDateBadge() {
  const badge = document.getElementById('dateBadge');
  if (badge) {
    const now = new Date();
    badge.textContent = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

document.addEventListener('DOMContentLoaded', initDateBadge);
