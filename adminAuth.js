function login() {

    const adminEmail = "admin@apkpocket.com";
    const adminPassword = "Kunal@123";

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(email === adminEmail && password === adminPassword){

        localStorage.setItem("adminLoggedIn","true");

        window.location.href = "admin.html";

    } else {

        document.getElementById("error").style.display = "block";

    }
}