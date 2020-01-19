//Budget Controller
var budgetController = ( function (){
    
    var Expense = function(id, description, value){
        this.id =id;
        this.description = description;
        this.value = value;
        this.percentage =-1;
        
    };
    
    Expense.prototype.calcPercentage =function(totalIncome){
        if(totalIncome > 0){
        this.percentage =Math.round((this.value/ totalIncome) * 100);
        }else{
            this.percentage=-1;
        }

    };
    
    Expense.prototype.getPercentage = function(){
       return this.percentage;  
    };
    
    var Income = function(id, description, value){
        this.id =id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum = sum + curr.value;
        });
        data.totals[type] = sum;
    };

    var data ={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
      
    };
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            
            //create new ID
           if(data.allItems[type].length >0){
            ID= data.allItems[type][data.allItems[type].length-1].id+1;
                
            }
            else{
                ID = 0;
            }
            
            //create new item based on inc or exp
            if(type === 'exp'){
                newItem =new Expense(ID, des, val);
            }
            else{
                newItem =new Income(ID,des,val);
            }
           //push into data structure
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem:function(type, id){
            var ids ,index
            ids=data.allItems[type].map(function(current){
               return current.id; 
            });
            
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1); 
            }
            
        },
        
        calculateBudget : function(){
            //calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate budget:income -expenses
             data.budget =data.totals.inc - data.totals.exp;
            
            
            //calculate percentage of income that we spent
            if(data.totals.inc > 0){
            data.percentage =Math.round((data.totals.exp /data.totals.inc) 
            *100);
        }else{
            data.percentage = -1;
        }
        },
        
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            });
        
        },
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(curr){
               return curr.getPercentage(); 
            });
        return allPerc;
        },
        
        getBudget :function(){
            return{
                budget: data.budget,
                totalInc:data.totals.inc,
                totalExp: data.totals.exp,
                per:data.percentage
            };
        },
        
        testing:function(){
            console.log(data);
        }
    };
    
    
})();


//UI Controller
var UIController = ( function(){
    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue: '.add__value',
        inputBtn:'.add__btn',
        incomeContainer: '.income__list',
        expenseContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPerLabel:'.item__percentage',
        DateLabel :'.budget__title--month'
    };
    
        var formatNumber =function(num, type){
            
            var int, dec;
            num = Math.abs(num);
            num = num.toFixed(2);
            
            var numSplit =num.split('.');
            
                    
            int =numSplit[0];
            if(int.length >3){
                int =int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3);
            }
            dec = numSplit[1];
            
            
            
            return (type === 'exp' ?  '-' : '+') + ' ' +int +'.' + dec;
            
        }; 
     
            var nodeListforEach = function(List, callback){
                for(var i= 0; i<List.length; i++){
                    callback(List[i], i);
                }
            };
    return{
        getinput: function(){
           return{
              type: document.querySelector(DOMStrings.inputType).value,
            description: document.querySelector(DOMStrings.inputDescription).value,
             value: parseFloat (document.querySelector(DOMStrings.inputValue).value)
        };
            
        },
        
        addListItems: function(obj, type){
            var html, newHtml,element;
            //create HTML strings with placeholder tags
            
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
           html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            else if(type === 'exp'){
                element= DOMStrings.expenseContainer;
           html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
    
            }
            //Replace place holder tags with actual data
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            
            //Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID){
           
           var el =document.getElementById(selectorID);
           el.parentNode.removeChild(el);
            
        },
        
        clearFields: function(){
          var fields =document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue); 
            
           var FieldsArr = Array.prototype.slice.call(fields);
            
           FieldsArr.forEach(function(current, index, array){
               current.value="";
           });
            FieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
           
            var type;
            
            obj.budget >0 ? type = 'inc' : type ='exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            
            if(obj.per > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.per;
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expensesPerLabel);
           
            
            nodeListforEach(fields, function(curr, index){
                if(percentages[index] >0){
                curr.textContent = percentages[index]+'%';
                }else{
                    curr.textContent='---';
                }
            });
        },
        
        displayMonth :function(){
          
            var now = new Date();
            var Year = now.getFullYear();
            
            
            var months =['Janaury', 'February','March','April', 'May', 'Jun', 'July', 'August','Sepember','October','November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMStrings.DateLabel).textContent =months[month] + ' ' +Year
        },
        
        changedType: function(){
          var fields = document.querySelectorAll(
             DOMStrings.inputType + ',' +DOMStrings.inputDescription + ',' +DOMStrings.inputValue);
            
            nodeListforEach(fields, function(curr){
           curr.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        
        getDOMstrings : function(){
            return DOMStrings;
        }
    };
   
    
})();


var controller = ( function (budgetCtrl, UICtrl){
   
   var setupEventListeners = function(){
   var DOM = UICtrl.getDOMstrings(); document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
document.addEventListener('keypress', function(event){
   if(event.keyCode === 13 || event.which ===13){
      ctrlAddItem();   
   }
    
}); 
  
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
       
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);   
       
};    
   var updateBudget = function(){
       //1.Calculate budget
       budgetCtrl.calculateBudget();
       
       //2.return budget
       var budget = budgetCtrl.getBudget();
       
       //3.display budget in ui
       UICtrl.displayBudget(budget);
   };
    var updatePercentage = function(){
        //1.Calculate percentages
        budgetCtrl.calculatePercentages();
        
        //2.Read per from budget controller
       var percentages= budgetCtrl.getPercentages();
        //3.Update the UI
        UICtrl.displayPercentages(percentages);
    }
   
   var ctrlAddItem = function(){
   //1.Get input
   var input = UICtrl.getinput();
   //console.log(input);       
       
    if(input.description !== "" && !isNaN(input.value) && input.value>0 ) {    
   //2.add item to budget controller
    var newItem = budgetCtrl.addItem(input.type, input.description, input.value);    
        
   //3.Add item to ui
    UICtrl.addListItems(newItem, input.type); 
       
   //4.clear fileds
     UICtrl.clearFields();  
   
        
   //5.CAlculate and update the Budget
    updateBudget();
        
   //6.Calculate and update percentages
     updatePercentage();
   }
   };
    
    var ctrlDeleteItem = function(event){
     var itemID,splitID, type, ID;
        itemID =event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-');
            type =splitID[0];
            ID = parseInt(splitID[1]); 
            
            //1.delete the items from DS
            budgetCtrl.deleteItem(type, ID);  
            
            //2.Delete item from ui
            UICtrl.deleteListItem(itemID);
            
            
            //3.update and show new budget
            updateBudget();
            
                  
            //4.Calculate and update percentages
            updatePercentage();
        }
        
        
    };
    return{
        init: function(){
        UICtrl.displayMonth();    
        UICtrl.displayBudget({
             budget: 0,
                totalInc:0,
                totalExp: 0,
                per:0
        });     
        setupEventListeners();    
        }
    }
   
    
})(budgetController, UIController);


controller.init();