/*
File: functionality.js
Author: Saara Alho
Created: 30.12.2021
Description: Creates functionality behind the HTML page and handles the data from CoinGecko api.
*/

const apiBitcoin = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur';

//FUNCTIONS INTERACTING WITH HTML DIRECTLY

//Invoked when button is clicked on page. Get date values.
function getDates(){
	var startDate = document.getElementById("startdate").value;
	var endDate = document.getElementById("enddate").value;
	console.log(`Requested analysis from ${startDate} to ${endDate}`);
	getData(createUrl(startDate, endDate));	
}
//Create analysis using functions here and show values in HTML page
function createAnalysis(data){
	var daterange;
	var buyString;
	var sellString;
	console.log(data);
	var downwardTrend = bearish(data);
	var buyDate = buy(data);
	var sellDate = sell(data);
	var traded = tradeVolume(data);
	if (downwardTrend.length === 0){
		daterange = "none";
	}
	else{ 
		daterange = `from ${convertDateFromUnix(downwardTrend[0][0]).toUTCString()} to ${convertDateFromUnix(downwardTrend[downwardTrend.length - 1][0]).toUTCString()}`;
	}
	if (buyDate === 0){
		buyString = "Buying not recommended"
	}
	else{
		buyString = convertDateFromUnix(buyDate[0][0]).toUTCString()+ ", " + buyDate[0][1]+"€";
	}
	if (sellDate === 0){
		sellString = "Selling not recommended"
	}
	else{
		sellString = convertDateFromUnix(sellDate[0][0]).toUTCString()+ ", " + sellDate[0][1]+"€";
	}
	document.getElementById("bearish").innerHTML = downwardTrend.length + " days, date range "+ daterange;
	document.getElementById("trading").innerHTML = convertDateFromUnix(traded[0][0]).toUTCString()+", "+traded[0][1];
	document.getElementById("buy").innerHTML = buyString;
	document.getElementById("sell").innerHTML = sellString;
	document.getElementById("resultbox").style.display = "block";
}


//FUNCTIONS RELATING TO DATA PROCESSING

//Create an url string with correct parameters
function createUrl(startdate,enddate){
	enddate = convertDateToUnix(enddate) + 3600;
	url = `${apiBitcoin}&from=${convertDateToUnix(startdate)}&to=${enddate}`;
	console.log(url);
	return url;
}
//From yyyy-mm-dd to Unix timestamp
function convertDateToUnix(date){
	
	var unixTime = Math.floor(new Date(date).getTime()/1000);
	return unixTime;
}
//From Unix timestamp to yyyy-mm-dd
function convertDateFromUnix(unixdate){
	var regTime = new Date(unixdate);

	return regTime;
}
//Call API with the correct url
async function getData(url){
	let response = await fetch(url);
	let data = await response.json();
	await createAnalysis(data);
}
//Get longest downward trend in an array from the API data.
function bearish(data){
	var prices = daysValue(data.prices);
	console.log(prices)
	var currentSet=[];
	var compareSet=[];

	let lastDataPrice = prices[0][1];
	for (i=1; i < prices.length; i++){
		if (prices[i][1] < lastDataPrice){
			currentSet.push(prices[i]);
		}
		else if (prices[i][1] >= lastDataPrice && currentSet.length >= compareSet.length){
			compareSet = [];
			compareSet = currentSet;
			currentSet = [];
		}
		else if(prices[i][1] >= lastDataPrice && currentSet.length < compareSet.length){
			currentSet = [];
		}			
		lastDataPrice = prices[i][1];
	}
	console.log(currentSet, compareSet);
	if (currentSet.length > compareSet.length){
		return currentSet;
	}
	else 
		return compareSet;
}

//Get lowest pricepoint from API data. If the whole data set is downward trending, return do not buy). 
//Assuming that the best dates to buy and sell are determined by the price of the coin.
function buy(data){
	var prices = daysValue(data.prices);
	console.log(prices);
	let compareValue = prices[0][1];
	var lowestPrice = [];
	lowestPrice.push(prices[0]);
	var downtrendCounter = 1;
	for (i=1; i < prices.length; i++){
		if (prices[i][1] <= compareValue){
			compareValue = prices[i][1];
			lowestPrice = [];
			lowestPrice.push(prices[i])
			downtrendCounter++;
		}
		
	}
	if (downtrendCounter === prices.length){
		var values = 0;
	}
	else{
		var values = lowestPrice;
	}
	return values;
}

//Get highest pricepoint from API data
function sell(data){
	var prices = daysValue(data.prices);
	let compareValue = prices[0][1];
	var highestPrice = [];
	highestPrice.push(prices[0]);
	var downtrendCounter = 1;
	for (i=1; i < prices.length; i++){
		if (prices[i][1] > compareValue){
			compareValue = prices[i][1];
			highestPrice = [];
			highestPrice.push(prices[i]);
		}
		else 
			downtrendCounter++;
		
	}
	if (downtrendCounter === prices.length){
		var values = 0;
	}
	else{
		var values = highestPrice;
	}
	return values;
}

//Get day with highest trading volume from API data
function tradeVolume(data){
	var trading = daysValue(data.total_volumes);
	let compareValue = trading[0][1];
	let highestVolume=[];
	highestVolume.push(trading[0]);
	for (i=1; i < trading.length; i++){
		if (trading[i][1] > compareValue){
			compareValue = trading[i][1];
			highestVolume= [];
			highestVolume.push(trading[i]);
		}
	}
	return highestVolume;
}
//Get one value for day
function daysValue(data){
	var lastDate = convertDateFromUnix(data[0][0]);
	var daysArray = [];
	for (i=0; i < data.length; i++){
		if (lastDate.getUTCDay() !== convertDateFromUnix(data[i][0]).getUTCDay()){
			daysArray.push(data[i-1]);
		}
			
		lastDate = convertDateFromUnix(data[i][0]);
	}
	return daysArray;
}