var api_url = ":8081/info"
var url = "http://"+location.hostname+api_url
function load_app_info() {
    console.log("Start loading app info");
    fetch_app_info(setup_html);
}

function setup_html(info) {
    var body = document.body;
    var header = document.createElement("h1");
    header.textContent = "Welcome to " + info.name; 
    body.appendChild(header);
    document.title = info.name + ", version: " + info.version;
}

function fetch_app_info(completion) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                console.log(request.response);
                completion(request.response);
            }    
        }
    }

    request.open("GET",url,true);
    request.responseType = "json";
    request.send();
}