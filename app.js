
// BUDGET CONTROLLER
var budgetController = (function() {
	// Function for income & expense
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}		
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	
	// Calculate total
	var calculateTotal = function(type) {
		var sum = 0;
		// get the array from data structure by type then iterate over array
		data.allItems[type].forEach(function(cur){
			sum += cur.value;
		});
		//  Store totals in data structure
		data.totals[type] = sum;
	};
	
	// Setup data structure

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		// set to -1 means does not exist
		percentage: -1
	};

	// Public methods
	return {
		// Add item to data structure note use different parameter names to avoid confusion
		addItem: function(type, des, val) {
			var newItem, ID;

			// Check to see if array is empty if so create id = 0
			if (data.allItems[type].length > 0) {
				// Create an ID that is 1 + the last element in current array (first it gets last element id then adds 1)
			ID = data.allItems[type][data.allItems[type].length -1].id + 1;
		    } else {
		    	ID = 0;
		    }
			
			
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}
			
			// push newItem to   appropriate array  in data object
			data.allItems[type].push(newItem);

			// Return new element
			return newItem;

		},

		deleteItem: function(type, id) {
			var ids, index;
			// Get an array of the current items
			 ids = data.allItems[type].map(function(current) {
                return current.id;
             });
			// Get the index of the element to be removed
			index = ids.indexOf(id);

		    // Check if is in array or -1 and delete using splice method
		    if (index !== -1) {
		    	 data.allItems[type].splice(index, 1);
		    }
		},

		calculateBudget: function() {
			// Calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// Calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			// Calculate the percentage of income we spend
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				// Set percentage to non exesistant
				data.percentage = -1;
			}
			
		},

		calculatePercentages: function() {
			// Get any array of expenses then iterate
			data.allItems.exp.forEach(function(cur){
				// call calcPercentage on all elements in array
				cur.calcPercentage(data.totals.inc);
			});

		},

		getPercentages: function() {
			// loop over each expense and call getPercentage 
			var allPerc = data.allItems.exp.map(function(cur){
				return cur.getPercentage();
			});
				// Return new array with all percentages
				return allPerc;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};

		},

		// This method is just for testng data structure
		testing: function(){
			console.log(data);
		} 
	};

})();

	var Income = function(id, description, value) {
			this.id = id;
			this.description = description;
			this.value = value;
		}

	// UI CONTROLLER
	var UIController = (function() {
			
			// private
			var DOMstrings = {
				inputType: '.add__type',
				inputDescription: '.add__description',
				inputValue: '.add__value',
				inputBtn: '.add__btn',
				incomeContainer: '.income__list',
				expensesContainer: '.expenses__list',
				budgetLabel: '.budget__value',
		        incomeLabel: '.budget__income--value',
		        expensesLabel: '.budget__expenses--value',
		        percentageLabel: '.budget__expenses--percentage',
		        container: '.container',
		        expensesPercLabel: '.item__percentage',
                dateLabel: '.budget__title--month'
			};

		var formatNumber = function(num, type) {
	        var numSplit, int, dec, type;
	        /*
	            + or - before number
	            exactly 2 decimal points
	            comma separating the thousands

	            2310.4567 -> + 2,310.46
	            2000 -> + 2,000.00
	            */

	        num = Math.abs(num);
	        num = num.toFixed(2);

	        numSplit = num.split('.');

	        int = numSplit[0];
	        if (int.length > 3) {
	            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
	        }

	        dec = numSplit[1];

	        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };	
		

		// Loop over all nodes in nodeList this function is reusable			
		var nodeListForEach = function(list, callback) {
		    for (var i = 0; i < list.length; i++) {
		        callback(list[i], i);
		    }
		};		

	    //public
		return {
			getInput: function() {
				return {
			      type: document.querySelector(DOMstrings.inputType).value, // will be inc or exp
				  description: document.querySelector(DOMstrings.inputDescription).value,
				  value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
				}			
			},

			addListItem: function(obj, type){
				var html, newHtml, element;
				// create HTML string with placeholder text
				if (type === 'inc') {
				element = DOMstrings.incomeContainer;	
				
				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
	            } else if (type === 'exp') {
	             element = DOMstrings.expensesContainer;	
	             
	             html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
	             
	            }
				
				// Replace placeholder text with data recieved from object
				newHtml = html.replace('%id%', obj.id);
				newHtml = newHtml.replace('%description%', obj.description);
				newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
				
				// Insert HTML into the DOM
				document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
			},

			deleteListItem: function(selectorId) {
				// Get item to be removed
				var el = document.getElementById(selectorId);
				// Remove item by geting parentNode and removing the child element
				el.parentNode.removeChild(el);
			},

			clearFields: function() {
				var fields, fieldsArray;
				// This can select all fields at once by joining strings together seperated by a ,
				fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
				// fields is a list and need to be converted to an array
				fieldsArray = Array.prototype.slice.call(fields);
				// Iterate over fieldsArray using forEach  and passing in caallback function to clear all inputs
				fieldsArray.forEach(function(current, index, array){
					current.value = "";
				});
				// Put fucus back in description field
				fieldsArray[0].focus();

			},

			displayBudget: function(obj) {
				var type;
                obj.budget > 0 ? type = 'inc' : type = 'exp';

				 document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
                 document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
                 document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
				 
				if (obj.percentage > 0) {
	                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
	            } else {
	                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
	            }
			},

			displayPercentages: function(percentages) {
				// This line returns the NodeList each dom element is called a node
				var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

				/* nodeListForEach is a function that was defined above 
				now we are passing in the nodeList and the calback function to change the textContent 
				as arguments to nodeListForEach
				*/
				 nodeListForEach(fields, function(current, index) {
	                
	                if (percentages[index] > 0) {
	                    current.textContent = percentages[index] + '%';
	                } else {
	                    current.textContent = '---';
	                }
	            });
			},

			displayMonth: function() {
            var now, months, month, year;
            
            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
	        },
	        
	         changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
            },
				
				getDOMstrings: function() {
					return DOMstrings;
				}
			};

})();

var controller = (function (budgetCtrl,UICtrl) {
	
	var setUpEventListeners = function() {
		//  DOMstrings
	    var DOM = UICtrl.getDOMstrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event){
			// Check if Enter was pressed note which is for older browsers
			if (event.keyCode === 13 || event.which === 13) {
				
				ctrlAddItem();
			};			
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);        
	};

	var updateBudget = function() {
		
		// Calculate  and display
		budgetCtrl.calculateBudget();
		var budget = budgetCtrl.getBudget();
	    UICtrl.displayBudget(budget);
	};
	
	var upDatePercentages = function() {
		// Calculate percentages
		budgetController.calculatePercentages();

		// Read percentages from the budget controller
		var percentages = budgetController.getPercentages();
		// Update UI with new percentages
		UICtrl.displayPercentages(percentages);
	};
	
	var ctrlAddItem = function() {
	 var input, newItem;	
	   	 input = UICtrl.getInput();
	   	
	   	if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
	   	 newItem = budgetController.addItem(input.type, input.description, input.value);

		UICtrl.addListItem(newItem, input.type);

		UICtrl.clearFields();

		updateBudget();  

		upDatePercentages(); 		
   	    }
    };

   	var ctrlDeleteItem = function(event) {
   		var itemId, splitId, type, ID;

   		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
   		

   		if (itemId) {
   			//inc-1 these lines split into type and ID for each element clicked
   			splitId = itemId.split('-');
   			type = splitId[0];
   			ID = parseInt(splitId[1]);

            budgetController.deleteItem(type,ID);
   		    // Deletion
   		    UICtrl.deleteListItem(itemId);
   		    // Updating both the budget and the percentage below.
   		    updateBudget();
   		    upDatePercentages(); 	
   		}
   	};	


return {
	init: function() {
		console.log('App is running');
		UICtrl.displayMonth();
		 UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
		setUpEventListeners();
	}
};
		
})(budgetController, UIController);

controller.init();