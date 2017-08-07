function form_to_json (formid) {
    var form = document.getElementById(formid);
    if (form === null) {
        throw("No form with that id");
    }

    var formdata = new FormData(form);
    var data = {};
    for (entry of formdata.entries()) {
        data[entry[0]] = entry[1];
    }

    var json = JSON.stringify(data);
    return json;
}

function singup_button_click(event) {
    event.preventDefault();
    console.log("Sign up button clicked");
    var json = form_to_json("user-credentials-form");
    console.log(form_to_json("user-credentials-form"));
    signup(json);
}

function login_button_click(event){
    event.preventDefault();
    console.log("Login button clicked");
    var json = form_to_json("user-credentials-form");
    login(json);
}

//TODO: replace the code duplication with one fucntion!


function signup(json) {
    var api_url = ":8081/signup"
    var url = "http://"+location.hostname+api_url;
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE){
            if (request.status == 200) {

                console.log(request.response);
                storeEmail(json);
                storeTokens(request.response);
                goToProfile();
            }
        }
    }

    request.open("POST",url,true);
    request.setRequestHeader("Content-Type","application/json");
    request.responseType = "json";
    request.send(json);
}


function login(json) {
    var api_url = ":8081/auth"
    var url = "http://"+location.hostname+api_url;
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE){
            if (request.status == 200) {
                console.log(request.response);
                storeEmail(json);
                storeTokens(request.response)
                goToProfile();
            }
        }
    }

    request.open("POST",url,true);
    request.setRequestHeader("Content-Type","application/json");
    request.responseType = "json";
    request.send(json);
}


//localstorage
function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

function storeTokens(tokens) {
    if (storageAvailable('localStorage')) {
        // Yippee! We can use localStorage awesomeness
        console.log(tokens);
        localStorage.setItem("auth",tokens.auth);
        localStorage.setItem("refresh",tokens.refresh);
    }
    else {
        // Too bad, no localStorage for us
        alert("Oh no, something is wrong with the local storage!");
    }
}

function checkStoredTokens() {
    if (storageAvailable("localStorage")) {
        var auth = localStorage.getItem("auth");
        var refresh = localStorage.getItem("refresh");
        var email = localStorage.getItem("email");
        if (auth != null && refresh != null && email != null) {
            return true;
        }
        console.log("Tokens missing, need to login...")
    }       
    return false;
}

function storeEmail(data) {
    var user = JSON.parse(data);
    if (storageAvailable("localStorage")){
        localStorage.setItem("email", user.email);
    }
}

function goToProfile(){
    var profile_url = "http://"+location.hostname+":8080/lista.html";
    window.location.href = profile_url;
}