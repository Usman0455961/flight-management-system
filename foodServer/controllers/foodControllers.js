require('dotenv').config();
const { foodList, foodLocations, foodNutritionalInfo, stockOutFoods } = require('../mockData/foodData');

const FUNC1_TIMEOUT = parseInt(process.env.FUNC1_TIMEOUT, 10) || 115;
const FUNC2_TIMEOUT = parseInt(process.env.FUNC2_TIMEOUT, 10) || 2 * 60 * 1000; // 2 minutes
const FUNC3_TIMEOUT = parseInt(process.env.FUNC3_TIMEOUT, 10) || 300;
const FUNC4_TIMEOUT = parseInt(process.env.FUNC4_TIMEOUT, 10) || 100;

const func1 = () => new Promise(resolve => setTimeout(() => resolve(foodList), FUNC1_TIMEOUT));
const func2 = () => new Promise(resolve => setTimeout(() => resolve(foodLocations), FUNC2_TIMEOUT));
const func3 = () => new Promise(resolve => setTimeout(() => resolve(foodNutritionalInfo), FUNC3_TIMEOUT));
const func4 = () => new Promise(resolve => setTimeout(() => resolve(stockOutFoods), FUNC4_TIMEOUT));

const getFoodDetails = async (req, res) => {
  try {
    const [foodListData, locationsData, nutritionalData, stockOutData] = await Promise.all([
      func1(),
      func2(),
      func3(),
      func4(),
    ]);

    const mergedData = {
      foods: foodListData.map(food => {
        const nutrition = nutritionalData.find(n => n.name === food.name);
        return {
          ...food,
          location: locationsData,
          nutrition: nutrition || {},
          isStockOut: stockOutData.includes(food.name),
        };
      }),
    };

    res.status(200).json(mergedData);
  } catch (error) {
    console.error('Error fetching food details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getFoodDetails };
