
const url ="https://signup-database.herokuapp.com/"
// const url = "http://localhost:3000";

function signup() {
    axios({
        method: 'post',
        url: 'http://localhost:3000/signup',
        data: {
            name: document.getElementById("signup-name").value,
            email: document.getElementById("signup-email").value,
            password: document.getElementById("signup-password").value,
            phone: document.getElementById("signup-number").value,
            gender: document.getElementById("signup-gender").value
        },
            }).then((response) => {
        if (response.data.status === 200) {
            alert(response.data.message)
            location.href = "./login.html"
        }
        else {
            alert(response.data.message);
        }
    }).catch((error) => {
        console.log(error);
    });
    return false
}



function userLogin() {
    axios({
        method: 'post',
        url: 'http://localhost:3000/login',
        data: {
            email: document.getElementById("login-email").value,
            passowrd: document.getElementById("login-password").value
        }, withCredentials: true
    }).then((response) => {
        console.log(response);
        alert(response.data.message)
        location.href = "./profile.html"
    }, (error) => {
        console.log(error);
    });
    return false
}
// userEmail= document.getElementById("login-email").value;
// userPassowrd= document.getElementById("login-password").value;

// console.log(obj);
// const Http = new XMLHttpRequest();
// Http.open("POST", url + "/login");
// Http.setRequestHeader("Content-Type", "application/json");
// Http.send(JSON.stringify(obj))
// Http.onreadystatechange = (e) => {
//     if (Http.onreadystate === 4) {
//         let jsonRes = json.parse(Http.responseText)
//         console.log(jsonRes);
//         if (jsonRes === 200) {
//             alert(jsonRes.message);
//             alert("login succesfully")
//         }
//         else {
//             alert(jsonRes.message)
//             alert("sorry! invalid Password or Emmail")
//         }
//         window.location.href = "profile.html"
//     }

// }
// return false


// }



function getProfile() {
    axios({
        method: 'get',
        url: 'http://localhost:3000/profile',
        credentials: 'include',
    }).then((response) => {
        console.log(response);
        document.getElementById('print-username').innerHTML = response.data.profile.name
        document.getElementById('print-email').innerHTML = response.data.profile.email
        document.getElementById('print-number').innerHTML = response.data.profile.phone
        document.getElementById('print-gender').innerHTML = response.data.profile.gender
    }, (error) => {
        console.log(error.message);
        location.href = "./login.html"
    });
    return false
    }

    function logout(){
        axios({
            method: 'post',
            url: 'http://localhost:3000/logout',
        }).then((response) => {
            console.log(response);
            location.href = "./login.html"
        }, (error) => {
            console.log(error);
        });
        return false
    }
       
