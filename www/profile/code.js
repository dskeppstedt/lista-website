
window.onload = function () {
    //entrypoint
    if (localStorage.getItem("refresh") == null || localStorage.getItem("email") == null ) {
        //bail!
        goToIndex();
    }

    refreshJWT(function(){
        console.log("Well we are authorized now, one way or another..");
        fetchProfile();
    });
}

function fetchProfile() {
    var api_url = ":8081/profile"
    var url = "http://"+location.hostname+api_url;
    var request = new XMLHttpRequest();
    request.open("GET",url,true);
    request.setRequestHeader("Content-Type","application/json");
    request.setRequestHeader("Authorization","Bearer "+ getJWT());
    request.send();

    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE){
            if (request.status == 200) {
                console.log(request.response);
                document.getElementById("msg").textContent = request.response;
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