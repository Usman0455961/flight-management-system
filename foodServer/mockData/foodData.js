const foodList = [
    { name: 'Butter Chicken', description: 'Rich and creamy Indian curry', price: 250 },
    { name: 'Fish Curry', description: 'Traditional Goan fish curry', price: 200 },
  ];
  
  const foodLocations = ['Goa', 'Delhi', 'Mumbai', 'Bangalore'];
  
  const foodNutritionalInfo = [
    { name: 'Butter Chicken', calories: 450, protein: 30, carbs: 20 },
    { name: 'Fish Curry', calories: 350, protein: 25, carbs: 10 },
  ];
  
  const stockOutFoods = ['Fish Curry'];
  
  module.exports = { foodList, foodLocations, foodNutritionalInfo, stockOutFoods };
  