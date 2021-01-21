
// const url = "http://localhost:3000";
const url='https://login-re-password.herokuapp.com';
// const { default: axios } = require("axios");
var socket = io(url);


socket.on('connect', function () {
    console.log("connected")
});
function signup() {
    axios({
        method: 'post',
        url: url + "/signup",
       
     
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
        alert(response.data.message);
        console.log(error);
    });

    return false
}

function userLogin() {
    axios({
        method: 'post',
        url: url + "/login",
        data: {
            email: document.getElementById('login-email').value,
            password: document.getElementById('login-password').value,
        },
        withCredentials: true
    }).then((response) => {
        console.log(response);
        alert(response.data.message)
        location.href = "./profile.html"
    }, (error) => {
        console.log(error);
        alert(response.data.message)
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
        url: url + "/profile",

        // url :"https://login-re-password.herokuapp.com/profile",
        credentials: 'include',
    }).then((response) => {
        console.log(response.data.profile.name);
        document.getElementById('print-username').innerText= response.data.profile.name;
        document.getElementById('print-email').innerText = response.data.profile.email;
        document.getElementById('print-number').innerText = response.data.profile.phone;
        document.getElementById('print-gender').innerText = response.data.profile.gender;

        sessionStorage.setItem("userEmail", response.data.profile.email)
        sessionStorage.setItem("userName", response.data.profile.name)

    }, (error) => {
        console.log(error.message);
        location.href = "./login.html"
    });
    return false
}

function forget(){
    let email = document.getElementById("forget-email").value;
    localStorage.setItem('email', email);
    console.log(email)
    axios({
        method:'post',
        url: url + "/forget-password",
        // url :"https://login-re-password.herokuapp.com/forget-password",
        data:{
            email:document.getElementById("forget-email").value
        },
        withCredentials:true,
    }).then((response) => {
        console.log(response)
        if (response.data.status === 200) {
            alert(response.data.message)
            location.href = "./forget2.html"
        }
        else {
            alert(response.data.message)
        }
    }, (error) => {
        console.log("error is here")
        console.log(error);
    });
    return false
}


function forgetCode() {
    
    // alert("lafdksals")
    var otpCode = document.getElementById('forget2-otp').value
    var newPassword = document.getElementById('forget2-password').value
    var emailVarification = localStorage.getItem("email")

    console.log(otpCode)
    console.log(newPassword)
    console.log(emailVarification)
    axios({
        method: 'post',
        url: url + "/forget-password-step-2",
        // url :"https://login-re-password.herokuapp.com/forget-password-step-2",

        data: ({
            emailVarification: emailVarification,
            newPassword: newPassword,
            otpCode: otpCode
        }),
        credentials: 'include'

        
    }).then((response) => {
        console.log(response.data.message)
        if (response.data.status == 200) {
            console.log(response.data.message)
            if (response.data.status == 200) {
                alert(response.data.message)
                window.location.href = "./login.html"
            } else {
                alert(response.data.message)
            }
            
        } else {
            alert(response.data.message)
        }
    }, (err) => {
        console.log(err);
        alert(err)
    });
    
    
    return false;
}




function logout() {
    axios({
        method: 'post',
        url: url + "/logout",
        // url:'https:login-re-password.herokuapp.com/logout'
    }).then((response) => {
        console.log(response);
        location.href = "./login.html"
    }, (error) => {
        console.log(error);
    });
    return false
}





function tweet() {
    // alert("jdsljfa")
    var tweet = document.getElementById('message').value
    axios({
        method: 'post',
        url: url + "/tweet",
        // url:'https:login-re-password.herokuapp.com/tweet',
        data: {
            tweet: tweet,
            userEmail: sessionStorage.getItem("userEmail"),
            userName: sessionStorage.getItem("userName")
        },
        withCredentials: true
    })
        .then(function (response) {
          
        })
        .catch(function (error) {
        });


}

function getTweets() {
    axios({
        method: 'get',
        url: url + "/getTweet",
        // url:'https:login-re-password.herokuapp.com/getTweets',
        credentials: 'include',
    }).then((response) => {
        console.log(response.data)
        let tweets = response.data;
        let html = ""
        tweets.forEach(element => {
            html += `
            <div class="tweet">
            <p class="user-name">${element.name}<p>
            <p class="tweet-date">${new Date(element.createdOn).toLocaleTimeString()}</p>
            <p class="tweet-text">${element.tweet}</p>
            </div>
            `
        });
        document.getElementById('text-area').innerHTML = html;

        // let userTweet = response.data

        // let userHtml = ""
        // let userName = document.getElementById('pName').innerHTML;
        // userTweet.forEach(element => {
        //     if (element.name == userName) {
        //         userHtml += `
        //         <div class="tweet">
        //         <p class="user-name">${element.name}<p>
        //         <p class="tweet-date">${new Date(element.createdOn).toLocaleTimeString()}</p>
        //         <p class="tweet-text">${element.tweets}</p>
        //         </div>
        //         `
        //     }
        // });
        // document.getElementById('text-area').innerHTML = userHtml;
    }, (error) => {
        console.log(error.message);
    });
    return false
}


socket.on('NEW_POST', (newPost) => {
    console.log(newPost)
    let tweets = newPost;
    document.getElementById('text-area').innerHTML += `
    <div class="tweet">
    <p class="user-name">${newPost.name}<p>
    <p class="tweet-date">${new Date(tweets.createdOn).toLocaleTimeString()}</p>
    <p class="tweet-text">${tweets.tweet}</p>
    </div>
    `
    
})