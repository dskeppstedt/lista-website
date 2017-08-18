var todosContainer;
var dataTodos = new Map(); 

window.onload = function () {
    //entrypoint
    if (localStorage.getItem("refresh") == null || localStorage.getItem("email") == null ) {
        //bail!
        goToIndex();
    }
    document.getElementById("logout").addEventListener("click",logoutPressed);

    todosContainer = document.getElementById("todos");

    fetchProfile();
    readTodos();

    var todoInput = document.getElementById("lista-input");
    todoInput.addEventListener("keypress",function(event){
        var code = (event.keyCode ? event.keyCode: event.which);
        if (code === 13) {
            console.log("Enter pressed!");
            
            addTodoOnEnterPress(todoInput,function () {
                removeTodoTags();
                readTodos();
            });

        }
    });
}

function logoutPressed(event) {
    localStorage.clear();
    goToIndex();
}


function removeTodoTags(){
    while (todosContainer.firstChild) {
        todosContainer.removeChild(todosContainer.firstChild);
    }
}

//READ
function readTodos() {
    refreshJWT(function() {
        var api_url = ":8081/todos"
        var url = "http://"+location.hostname+api_url;
        var request = new XMLHttpRequest();
        request.open("POST",url,true);
        request.setRequestHeader("Content-Type","application/json");
        request.setRequestHeader("Authorization","Bearer "+ getJWT());
        request.responseType = "json";
        request.send();

        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE){
                if (request.status == 200) {
                    console.log(request.response);
                    var todos = request.response;
                    todos.forEach(function(todo){
                        addTodoElement(todo);
                        dataTodos.set(todo._id,todo);
                    });
                }
            }
        }
    });
}

function addTodoElement(todo){
    var div = document.createElement("div");
    div.id = todo._id;
    
    if (todo.done) {
        div.className = "todo todo-done";
    } else {
        div.className = "todo";
    }

    //Add todo text
    var title = document.createElement("h3");
    title.textContent = todo.title;
    div.appendChild(title);
    //Make todo clickable
    div.addEventListener("click",pressTodo);

    //Add edit button and input, hidden by default
    var editInput = document.createElement("input");
    editInput.style.display = "none";
    div.appendChild(editInput);

    var editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click",function (event) {
        pressEditButtonOnTodo(event,editInput,div);
    });
    
    div.appendChild(editButton);

    var deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", pressDeleteButtonOnTodo);
    
    div.appendChild(deleteButton);

    todosContainer.appendChild(div);
}

//UPDATE
function pressTodo(event){

    if (event.currentTarget != event.target) {
        return;
    }

    if (event.currentTarget.className == "todo") {
        event.currentTarget.className = "todo todo-done";
    } else {
        event.currentTarget.className = "todo";
    }


    var todo = findTodo(event.currentTarget.id);
    todo.done = !todo.done;

    updateTodo(todo,function(){});

}

function findTodo(id) {
    return dataTodos.get(id);
}

function pressEditButtonOnTodo(event,input,div) {
    event.preventDefault();
    console.log(input);
    if (input.style.display == "inline") {
        //set input to hidden, send todo to api
        input.style.display = "none";
        event.currentTarget.textContent = "Edit";

        var todo = {};
        //create the todo..
        if (div.className == "todo") {
            todo.done = false;
        }else {
            todo.done = true;
        }

        todo._id = div.id;
        todo.title = input.value;
        

        updateTodo(todo,function() {
            removeTodoTags();
            readTodos();
        });


    } else {
        input.style.display = "inline";
        event.currentTarget.textContent = "Done";
        input.value = findTodo(div.id).title
    }

}

function updateTodo(todo,completion) {
    refreshJWT(function(){
        var api_url = ":8081/todo/"+todo._id
        var url = "http://"+location.hostname+api_url;
        var request = new XMLHttpRequest();
        request.open("PUT",url,true);
        request.setRequestHeader("Content-Type","application/json");
        request.setRequestHeader("Authorization","Bearer "+ getJWT());
        request.send(JSON.stringify(todo));
    
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE){
                if (request.status == 200) {
                    console.log("Todo created successfully");
                    console.log(request.response);
                    completion();
                }
            }
        }
    });
}


//DELETE
function pressDeleteButtonOnTodo(event) {
    console.log("Todo pressed! " + event.currentTarget.parentNode.id);
    var todoId = event.currentTarget.parentNode.id.toString();
    deleteTodo(todoId,function(){
        removeTodoTags();
        readTodos();
    });

}

function deleteTodo(id,completion){
    refreshJWT(function() {
        var api_url = ":8081/todo/"+id;
        var url = "http://"+location.hostname+api_url;
        var request = new XMLHttpRequest();
        request.open("DELETE",url,true);
        request.setRequestHeader("Content-Type","application/json");
        request.setRequestHeader("Authorization","Bearer "+ getJWT());
        request.send();
    
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE){
                if (request.status == 200) {
                    console.log("Todo deleted sucessfully");
                    completion();
                }
            }
        } 
    });
}



//CREATE
function addTodoOnEnterPress(inputElement,completion) {
    if (inputElement.value.length < 1) {
        console.log("No text, nothing to add...")
        return;
    }
    var todo = {};
    todo.title = inputElement.value;
    createTodo(JSON.stringify(todo),completion);
    inputElement.value = "";
}

function createTodo(todo,completion){
    refreshJWT(function(){
        var api_url = ":8081/todo"
        var url = "http://"+location.hostname+api_url;
        var request = new XMLHttpRequest();
        request.open("POST",url,true);
        request.setRequestHeader("Content-Type","application/json");
        request.setRequestHeader("Authorization","Bearer "+ getJWT());
        request.responseText = "json";
        request.send(todo);
    
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE){
                if (request.status == 200) {
                    console.log("Todo created successfully");
                    console.log(request.response);
                    completion();
                }
            }
        }
    });
}


function fetchProfile() {
    refreshJWT(function(){
        var api_url = ":8081/profile"
        var url = "http://"+location.hostname+api_url;
        var request = new XMLHttpRequest();
        request.open("GET",url,true);
        request.setRequestHeader("Content-Type","application/json");
        request.setRequestHeader("Authorization","Bearer "+ getJWT());
        request.responseType = "json";
        request.send();
    
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE){
                if (request.status == 200) {
                    console.log(request.response);
                    document.getElementById("profile-email").textContent = request.response.Email;
                }
            }
        }
    });
}

function refreshJWT(completion) {
    var isSaved = localStorage.getItem("auth") != null;
    var isExpired = true;

    if (isSaved) {
        var exp_date = JSON.parse(window.atob(getJWT().split(".")[1])).exp;
        var unix = Math.round(Date.now()/1000);
        isExpired = exp_date < unix;
        console.log(exp_date);
        console.log(unix);
    }

    if (isExpired) {
        console.log("Need to get a new JWT...");
        
        var api_url = ":8081/auth"
        var url = "http://"+location.hostname+api_url;
        var request = new XMLHttpRequest();
        request.open("POST",url,true);
        request.setRequestHeader("Content-Type","application/json");
        request.responseType = "json";
       
        var obj = {};
        obj.email = localStorage.getItem("email");
        obj.refresh = localStorage.getItem("refresh");
        var json = JSON.stringify(obj); 
        request.send(json);

        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE){
                if (request.status == 200) {
                    console.log(request.response);
                    setJWT(request.response);
                    completion();
                }
            }
        }



    }else{
        console.log("All is fine. carry on!");
        completion();
    }
}



function setJWT(json) {
    localStorage.setItem("auth",json.auth);
}

function getJWT() {
    return localStorage.getItem("auth");
}

function goToIndex() {
    var profile_url = "http://"+location.hostname+":8080/";
    window.location.href = profile_url;
}