/*jshint esversion: 6 */

// Scoring holders
let numberOfYahtzees = 0;
let yahtzeeScore = 0;
let upperBonus = 0;
let upperSectionsFilled = 0;
let bonusActive = false;
let finalScore = 0;

// Selected duplicate dice information holder
let duplicates = {};

// DOM elements
const upperBonusScoreField = document.getElementById('upper-bonus-score');
const scoreMessage = document.getElementById('scoreMessage');
const finalScoreElement = document.getElementById('finalScore');
const yahtzeeLogo = document.getElementById('logo');

// Make an array with the score box elements
let scoreFields = [];
for (let i = 1; i < 14; i++) {
	scoreFields[i] = document.getElementById(i + '-score');
}

// Make an array with the speculative score box elements
let speculativeScoreTabs = [];
for (let i = 1; i < 14; i++) {
	speculativeScoreTabs[i] = scoreFields[i].nextSibling.nextSibling;
}

// Check if value can be found in given array
function isInArray(value, array) {
	return array.indexOf(value) > -1;
}

// Return the sum of an array
function sumArray (array) {
	let summedArray = array.reduce(function(previousValue, currentValue) {
		return previousValue + currentValue;
	});

	return summedArray;
}

// Return the sum of specified duplicate values in an array
function sumDuplicates(value, array) {
	let count = 0;
	for (let i = 0; i < array.length; i++) {
		if (array[i] == value) {
			count++;
		}
	}
	return count * value;
}

// Update the duplicates object with the value & number of duplicates in an array
function countDuplicates(array) {
	duplicates = {};
	array.forEach (function(i) {
		duplicates[i] = (duplicates[i] || 0) + 1;
	});
}

// Check the status of upper section bonus
function updateUpperBonus () {
	if (upperSectionsFilled === 6 && upperBonus < 63) { // Upper section is full and bonus is not reached
		upperBonusScoreField.innerHTML = '&mdash;';
	} else if ( upperBonus < 63 ) { // Bonus not yet reached
		upperBonusScoreField.innerHTML = -63 + parseInt(upperBonus);
	} else { // Bonus reached
		upperBonusScoreField.innerHTML = 35;
		upperBonusScoreField.previousSibling.previousSibling.innerHTML = 'Bonus &#10003;';
		bonusActive = true;
	}
}

// Locking in score on upper section
function lockScoreUpper() {
	let score = this.innerHTML;
	let scoreBox = this.previousSibling.previousSibling;
	scoreBox.innerHTML = score;
	upperBonus += parseInt(score);
	upperSectionsFilled += 1;
	roundNumber += 1;
	if (!bonusActive) {
		updateUpperBonus();
	}
	resetTable();
	closeNav();
	if (roundNumber === 14) {
		rollButton.className = 'roll-3 disabled';
		rollButton.removeEventListener('click', rollDie, false);
		countFinalScore();
	}
}

// Locking in score on lower section
function lockScoreLower() {
	let score = this.innerHTML;
	let scoreBox = this.previousSibling.previousSibling;
	scoreBox.innerHTML = score;
	roundNumber += 1;
	resetTable();
	closeNav();
	if (roundNumber === 14) {
		rollButton.className = 'roll-3 disabled';
		rollButton.removeEventListener('click', rollDie, false);
		countFinalScore();
	}
}

// Locking in Yahtzee score
function lockYahtzeeScore() {
	let score = this.innerHTML;
	let scoreBox = this.previousSibling.previousSibling;
	scoreBox.innerHTML = score;
	roundNumber += 1;
	numberOfYahtzees += 1;
	resetTable();
	closeNav();
	if (roundNumber === 14) {
		rollButton.className = 'roll-3 disabled';
		rollButton.removeEventListener('click', rollDie, false);
		countFinalScore();
	}
}

// Trigger Yahtzee celebration animation
function celebrateYahtzee() {
	yahtzeeLogo.className = 'animated tada';
	setTimeout(function() {
		yahtzeeLogo.className = '';
	}, 1500);
}

// Update score table with calculated scores from selected dice on all possible scoring categories
function updateScoreTable() {
	countDuplicates(diceSelected);

	// Update zero score tabs on upper section
	for (let i = 1; i < 7; i++) {
		if (scoreFields[i].innerHTML === '') {
			speculativeScoreTabs[i].style.display = 'table-cell';
			speculativeScoreTabs[i].className = 'speculative-score zero-score';
			speculativeScoreTabs[i].innerHTML = 0;
			speculativeScoreTabs[i].addEventListener('click', lockScoreUpper, false);
		}
	}

	// Update zero score tabs on lower section
	for (let j = 7; j < 14; j++) {
		if (scoreFields[j].innerHTML === '') {
			speculativeScoreTabs[j].style.display = 'table-cell';
			speculativeScoreTabs[j].className = 'speculative-score zero-score';
			speculativeScoreTabs[j].innerHTML = 0;
			speculativeScoreTabs[j].addEventListener('click', lockScoreLower, false);
		}
	}

	// Aces, twos, threes, fours, fives, sixes
	for (let k = 1; k < 7; k++) {
		if (isInArray(k, diceSelected) && scoreFields[k].innerHTML === '') {
			speculativeScoreTabs[k].style.display = 'table-cell';
			speculativeScoreTabs[k].className = 'speculative-score';
			speculativeScoreTabs[k].innerHTML = sumDuplicates(k, diceSelected);
			speculativeScoreTabs[k].addEventListener('click', lockScoreUpper, false);
		}
	}

	// Three-of-a-kind
	if ((duplicates[1] > 2 || duplicates[2] > 2 || duplicates[3] > 2 || duplicates[4] > 2 || duplicates[5] > 2 || duplicates[6] > 2) && scoreFields[7].innerHTML === '') {
		speculativeScoreTabs[7].style.display = 'table-cell';
		speculativeScoreTabs[7].className = 'speculative-score';
		speculativeScoreTabs[7].innerHTML = sumArray(diceAnywhere);
		speculativeScoreTabs[7].addEventListener('click', lockScoreLower, false);
	}

	// Four-of-a-kind
	if ((duplicates[1] > 3 || duplicates[2] > 3 || duplicates[3] > 3 || duplicates[4] > 3 || duplicates[5] > 3 || duplicates[6] > 3) && scoreFields[8].innerHTML === '') {
		speculativeScoreTabs[8].style.display = 'table-cell';
		speculativeScoreTabs[8].className = 'speculative-score';
		speculativeScoreTabs[8].innerHTML = sumArray(diceAnywhere);
		speculativeScoreTabs[8].addEventListener('click', lockScoreLower, false);
	}

	// Full House
	if ((duplicates[1] === 2 || duplicates[2] === 2 || duplicates[3] === 2 || duplicates[4] === 2 || duplicates[5] === 2 || duplicates[6] === 2) && (duplicates[1] === 3 || duplicates[2] === 3 || duplicates[3] === 3 || duplicates[4] === 3 || duplicates[5] === 3 || duplicates[6] === 3) && scoreFields[9].innerHTML === '') {
		speculativeScoreTabs[9].style.display = 'table-cell';
		speculativeScoreTabs[9].className = 'speculative-score';
		speculativeScoreTabs[9].innerHTML = 25;
		speculativeScoreTabs[9].addEventListener('click', lockScoreLower, false);
	}

	// Small Straight
	if ( (scoreFields[10].innerHTML === '') && (( isInArray(1, diceSelected) && isInArray(2, diceSelected) && isInArray(3, diceSelected) && isInArray(4, diceSelected) ) || ( isInArray(2, diceSelected) && isInArray(3, diceSelected) && isInArray(4, diceSelected) && isInArray(5, diceSelected) ) || ( isInArray(3, diceSelected) && isInArray(4, diceSelected) && isInArray(5, diceSelected) && isInArray(6, diceSelected) )) ) {
		speculativeScoreTabs[10].style.display = 'table-cell';
		speculativeScoreTabs[10].className = 'speculative-score';
		speculativeScoreTabs[10].innerHTML = 30;
		speculativeScoreTabs[10].addEventListener('click', lockScoreLower, false);
	}

	// Large Straight
	if ( (scoreFields[11].innerHTML === '') && (( isInArray(1, diceSelected) && isInArray(2, diceSelected) && isInArray(3, diceSelected) && isInArray(4, diceSelected) && isInArray(5, diceSelected) ) || ( isInArray(2, diceSelected) && isInArray(3, diceSelected) && isInArray(4, diceSelected) && isInArray(5, diceSelected) && isInArray(6, diceSelected) )) ) {
		speculativeScoreTabs[11].style.display = 'table-cell';
		speculativeScoreTabs[11].className = 'speculative-score';
		speculativeScoreTabs[11].innerHTML = 40;
		speculativeScoreTabs[11].addEventListener('click', lockScoreLower, false);
	}

	// Chance
	if (diceSelected.length === 5 && scoreFields[13].innerHTML === '') {
		speculativeScoreTabs[13].style.display = 'table-cell';
		speculativeScoreTabs[13].className = 'speculative-score';
		speculativeScoreTabs[13].innerHTML = sumArray(diceAnywhere);
		speculativeScoreTabs[13].addEventListener('click', lockScoreLower, false);
	}

	// Yahtzee
	if ((duplicates[1] === 5 || duplicates[2] === 5 || duplicates[3] === 5 || duplicates[4] === 5 || duplicates[5] === 5 || duplicates[6] === 5) && (scoreFields[12].innerHTML === '' || numberOfYahtzees > 0)) {

		// Multiple Yahtzees, give the bonus score and check the Joker scoring rule
		if (numberOfYahtzees > 0) {

			celebrateYahtzee();
			//alert('Yay! You scored a 100 point Yahtzee bonus!');
			yahtzeeScore = 50 + (numberOfYahtzees * 100);
			scoreFields[12].innerHTML = yahtzeeScore;
			scoreFields[12].previousSibling.previousSibling.innerHTML = 'Yahtzee' + (Array(numberOfYahtzees + 1).join(' &#10003;'));
			numberOfYahtzees += 1;

			// Check if corresponding upper section box has been used, if it is allow Joker placement on lower boxes
			if (scoreFields[diceSelected[1]].innerHTML !== '') {
				//alert('Since the upper section box is filled, the Joker rule allows you some extra scoring choices on the lower section');

				// Joker scoring for Full House
				if (scoreFields[9].innerHTML === '') {
					speculativeScoreTabs[9].style.display = 'table-cell';
					speculativeScoreTabs[9].className = 'speculative-score';
					speculativeScoreTabs[9].innerHTML = 25;
					speculativeScoreTabs[9].addEventListener('click', lockScoreLower, false);
				}

				// Joker scoring for Small Straight
				if (scoreFields[10].innerHTML === '') {
					speculativeScoreTabs[10].style.display = 'table-cell';
					speculativeScoreTabs[10].className = 'speculative-score';
					speculativeScoreTabs[10].innerHTML = 30;
					speculativeScoreTabs[10].addEventListener('click', lockScoreLower, false);
				}

				// Joker scoring for Large Straight
				if (scoreFields[11].innerHTML === '') {
					speculativeScoreTabs[11].style.display = 'table-cell';
					speculativeScoreTabs[11].className = 'speculative-score';
					speculativeScoreTabs[11].innerHTML = 40;
					speculativeScoreTabs[11].addEventListener('click', lockScoreLower, false);
				}

			} else { // Zero out lower section to force placement on the free upper section box
				for (let l = 7; l < 14; l++) {
					if (scoreFields[l].innerHTML === '') {
						speculativeScoreTabs[l].style.display = 'table-cell';
						speculativeScoreTabs[l].className = 'speculative-score zero-score';
						speculativeScoreTabs[l].innerHTML = 0;
						speculativeScoreTabs[l].addEventListener('click', lockScoreLower, false);
					}
				}
			}


		// First Yahtzee
		} else {
			celebrateYahtzee();
			speculativeScoreTabs[12].style.display = 'table-cell';
			speculativeScoreTabs[12].className = 'speculative-score';
			yahtzeeScore = 50;
			speculativeScoreTabs[12].innerHTML = yahtzeeScore;
			speculativeScoreTabs[12].removeEventListener('click', lockScoreLower, false);
			speculativeScoreTabs[12].addEventListener('click', lockYahtzeeScore, false);
		}
	}
}



function countFinalScore () {
	for (let i = scoreFields.length - 1; i >= 1; i--) {

		if (scoreFields[i].innerHTML !== '') {
			finalScore += parseInt(scoreFields[i].innerHTML);
		}
	}

	if (bonusActive) {
		finalScore += 35;
	}

	finalScoreElement.innerHTML = finalScore;
	scoreMessage.style.visibility = 'visible';
	scoreMessage.lastChild.className = 'score-total bounceIn animated';

	rollButton.className = 'roll-3 playagain';
	rollButton.innerHTML = 'NEW GAME';
	rollButton.addEventListener('click', resetGame, false);
}