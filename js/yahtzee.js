/*jshint esversion: 6 */

// Throw and round number information holders
let rollNumber = 0;
let roundNumber = 1;

// Dice information holders
let diceAnywhere = []; // All dice currently in play array
let diceOnTable = []; // On-table die array
let diceSelected = []; // Selected die array
let currentDieIndex; // Keep track of die selection/deselection
let dieIndexHolder = [0,1,2,3,4];
let selectedDiceElements; // HTMLCollection

// DOM elements
const diceArea = document.getElementById('diceArea');
const selectedDiceArea = document.getElementById('selectedDiceArea');
const rollButton = document.getElementById('rollDiceButton');
const rulesButton = document.getElementById('openRulesButton');
const closeRulesButton = document.getElementById('closeRulesButton');
const openScoreSheet = document.getElementById('openScoreSheetButton');
const closeScoreSheet = document.getElementById('closeScoreSheetButton');
const roundNumberElement = document.getElementById('round-number');
const siteWrapper = document.getElementById('site-wrapper');
const siteCanvas = document.getElementById('site-canvas');
const speculativeScoreTab = document.getElementsByClassName('speculative-score');

rollButton.addEventListener('click', rollDie, false);
openScoreSheet.addEventListener('click', openNav, false);
closeScoreSheet.addEventListener('click', closeNav, false);
rulesButton.addEventListener('click', openRules, false);
closeRulesButton.addEventListener('click', closeRules, false);
window.addEventListener('resize', windowResize, false);

checkRollNumber();

// Randomize a number between 1-6
function randomizeDie() {
	return Math.floor(Math.random() * (6 - 1 + 1)) + 1;
}

const windowWidth = document.documentElement.clientWidth;

// Re-draw the dice on window resize to reset the element style transform done with JS (rotation),
// which are overriding responsive CSS transform scale styling
function windowResize() {
	if (diceOnTable.length && windowWidth !== document.documentElement.clientWidth) { // Prevent mobile Chrome from triggering this on scroll
		diceArea.innerHTML = '';
		drawDiceOnTable();
	}
}

// Update dice roll button status based on current roll number
function checkRollNumber() {
	switch (rollNumber) {
		case 0:
			rollButton.className = '';
			rollNumber += 1;
		break;
		case 1:
			rollButton.className = 'roll-1';
			rollNumber += 1;
		break;
		case 2:
			rollButton.className = 'roll-2';
			rollNumber += 1;
		break;
		case 3:
			rollButton.className = 'roll-3';
			rollButton.removeEventListener('click', rollDie, false);
			rollNumber += 1;
			setTimeout(function() {
				rollButton.className = 'roll-3 disabled';
			}, 500);
		break;
		default:
		console.log("Roll number error");
	}
}

function rollDie() {
	checkRollNumber(); // Update roll number indicator on the roll button

	// Set round number indicator visible if this is the first round
	if (roundNumber === 1) {
		document.getElementById('round-number-wrapper').className = 'visible';
	}

	document.getElementById('diceArea').innerHTML = ''; // Clear table
	diceOnTable = []; // Reset on-table array

	// Do the actual dice roll
	let amountToRoll = 5 - diceSelected.length; // Check number of die to roll
	for (let i = 0; i <= amountToRoll - 1; i++) { // Loop through the dice roll
		let diceRoll = randomizeDie(); // Roll die
		diceOnTable.push(diceRoll); // Add rolled die to on-table array
	}

	drawDiceOnTable();
	updateDiceAnywhere(); // Reset dice in play array
	updateScoreTable(); // Always update score table to show correct values on scores that count sum of all dice
}


// Draw the dice on table after a new roll
function drawDiceOnTable() {
	dieIndexHolder = [0,1,2,3,4]; // Reset die index holder

	for (let i = diceOnTable.length - 1; i >= 0; i--) {
		drawDieOnTable(diceOnTable[i], dieIndexHolder[i]);
	}

	// Assign new indices for dice left over from the last roll (so they don't get placed on top of the new dice when de-selected)
	updateSelectedDiceElements();
	if (selectedDiceElements) {
		for (let j = 0; j < selectedDiceElements.length; j++) {
			selectedDiceElements[j].setAttribute('die-index', diceOnTable.length + j);
		}
	}
}

// Pick a die from table
function selectDieFromTable() {
	let diceValue = parseInt(this.getAttribute('die-value'), 10); // Get value
	currentDieIndex = parseInt(this.getAttribute('die-index'), 10); // Get index
	let position = diceOnTable.indexOf(diceValue); // Find on-table array position for this die
	diceOnTable.splice(position, 1); // Remove die from on-table array
	this.parentNode.removeChild(this); // Remove selected from DOM
	diceSelected.push(diceValue); // Add selected die to selected-die array
	drawSelectedDice(diceValue, currentDieIndex);
	updateDiceAnywhere(); // Reset dice in play array
	updateScoreTable();
}

// Draw the selected die on selected dice tray
function drawSelectedDice(value, index) {
	let dieDiv = document.createElement('div');
	dieDiv.className += 'die-selected';
	selectedDiceArea.appendChild(dieDiv);
	dieDiv.setAttribute('die-value', value);
	dieDiv.setAttribute('die-index', index);
	dieDiv.addEventListener('click', removeDieSelection, false);
}

// Remove die from selected dice tray
function removeDieSelection() {
	let diceValue = parseInt(this.getAttribute('die-value'), 10); // Get value
	currentDieIndex = parseInt(this.getAttribute('die-index'), 10); // Get value
	let position = diceSelected.indexOf(diceValue); // Find selected-die array position for this die
	diceSelected.splice(position, 1); // Remove die from selected dice array
	diceOnTable.push(diceValue); // Add de-selected die to on-table array
	drawDieOnTable(diceValue, currentDieIndex);
	this.parentNode.removeChild(this); // Remove selected from DOM
	updateDiceAnywhere(); // Reset dice in play array
	updateScoreTable();
}

// Draw a die on table
function drawDieOnTable(value, index) {
	let dieDiv = document.createElement('div');
	dieDiv.className += 'die';
	diceArea.appendChild(dieDiv);
	let currentTransformation = getStyle(dieDiv, 'transform'); // Get current rendered transformation styles
	dieDiv.style.transform = currentTransformation + ' rotate('+randomizeRotation()+'deg)'; // Add random rotation to transform styles
	dieDiv.setAttribute('die-value', value);
	dieDiv.setAttribute('die-index', index);
	dieDiv.addEventListener('click', selectDieFromTable, false);
}

function hideSpeculativeScores() {
	for (let i = 0; i < speculativeScoreTab.length; i++) {
		speculativeScoreTab[i].style.display = 'none';
	}
}

function randomizeRotation() {
	return Math.floor(Math.random() * (360 - 1) + 1); // Randomize a number between 1-360
}

function updateRoundNumber() {
	 roundNumberElement.innerHTML = Math.min(roundNumber, 13);
}

function resetTable() {
	diceOnTable = []; // Reset on-table die array
	diceSelected = []; // Reset selected die array
	dieIndexHolder = [0,1,2,3,4]; // Reset die index holder
	updateDiceAnywhere(); // Reset dice in play array
	rollNumber = 0;
	checkRollNumber();
	hideSpeculativeScores();
	updateRoundNumber();
	rollButton.addEventListener('click', rollDie, false);
	selectedDiceArea.innerHTML = '';
	diceArea.innerHTML = '';
}

function resetGame() {
	window.location.reload(false);
}

function updateSelectedDiceElements() {
	if (selectedDiceArea.innerHTML !== '') {
		selectedDiceElements = document.getElementsByClassName('die-selected');
	}
}

function updateDiceAnywhere () {
	if (diceSelected) {
		diceAnywhere = diceOnTable.concat(diceSelected);
	} else {
		diceAnywhere = diceOnTable;
	}
}

function openRules() {
	siteWrapper.className = 'show-rules';
	rulesButton.style.opacity = 0;
}

function closeRules() {
	siteWrapper.className = '';
	scroll(0,0);
	rulesButton.style.opacity = 1;
}


function openNav() {
	siteWrapper.className = 'show-nav';
	openScoreSheet.style.opacity = 0;
}

function closeNav() {
	siteWrapper.className = '';
	scroll(0,0);
	openScoreSheet.style.opacity = 1;
}

// Get the rendered style of an element
// http://robertnyman.com/2006/04/24/get-the-rendered-style-of-an-element/
function getStyle(oElm, strCssRule){
	let strValue = "";
	if(document.defaultView && document.defaultView.getComputedStyle){
		strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
	}
	else if(oElm.currentStyle){
		strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
			return p1.toUpperCase();
		});
		strValue = oElm.currentStyle[strCssRule];
	}
	return strValue;
}

// If 'Scores' button is visible, add quick access to it with swipe touch control
if (getStyle(openScoreSheet, 'visibility') !== 'hidden') {
	const hammertime = new Hammer(siteWrapper);
	hammertime.on('swipeleft', function() {
		openNav();
	});

	hammertime.on('swiperight', function() {
		closeNav();
	});
}