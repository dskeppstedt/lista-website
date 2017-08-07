var todosContainer;
var dataTodos = [];

window.onload = function () {
    //entrypoint
    if (localStorage.getItem("refresh") == null || localStorage.getItem("email") == null ) {
        //bail!
        goToIndex();
    }

    todosContainer = document.getElementById("todos");

    //TODO: DO NOT FORGET TO WRAP ALL SERVER CALLS WITH REFRESH JWT SOMEHOW
    refreshJWT(function(){
        console.log("Well we are authorized now, one way or another..");
        fetchProfile();
        readTodos();
    });

    var todoInput = document.getElementById("lista-input");
    todoInput.addEventListener("keypress",function(event){
        var code = (event.keyCode ? event.keyCode: event.which);
        if (code === 13) {
            console.log("Enter pressed!");
            addTodoOnEnterPress(todoInput);
            removeTodoElemnts();
            readTodos();
        }
    });
}

function removeTodoElemnts(){
    while (todosContainer.firstChild) {
        todosContainer.removeChild(todosContainer.firstChild);
    }
}

//READ
function readTodos() {
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
                    dataTodos.push(todo);
                });
            }
        }
    }
}

function addTodoElement(todo){
    var div = document.createElement("div");
    div.id = todo._id;
    if (todo.done) {
        div.className = "todo todo-done";
    } else {
        div.className = "todo";
    }

    var title = document.createElement("h3");
    title.textContent = todo.title;
    div.appendChild(title);
    todosContainer.appendChild(div);

    div.addEventListener("click",pressTodo);
}

//UPDATE
function pressTodo(event){
    console.log("Todo pressed! " + event.currentTarget.id);

    deleteTodo(event.currentTarget.id.toString());
return;

    if (event.currentTarget.className == "todo") {
        event.currentTarget.className = "todo todo-done";
    } else {
        event.currentTarget.className = "todo";
    }
}

function deleteTodo(id){
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
                removeTodoElemnts();
                readTodos();
            }
        }
    } 
}



//CREATE
function addTodoOnEnterPress(inputElement) {
    if (inputElement.value.length < 1) {
        console.log("No text, nothing to add...")
        return;
    }
    var todo = {};
    todo.title = inputElement.value;
    createTodo(JSON.stringify(todo));
    inputElement.value = "";
}

function createTodo(todo){
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
            }
        }
    }
}


function fetchProfile() {
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