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

function signup(json) {
    var api_url = ":8081/signup"
    var url = "http://"+location.hostname+api_url;
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE){
            if (request.status == 200) {
                console.log(request.response);
            }
        }
    }

    request.open("POST",url,true);
    request.setRequestHeader("Content-Type","application/json");
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
            }
        }
    }

    request.open("POST",url,true);
    request.setRequestHeader("Content-Type","application/json");
    request.send(json);
}