async function apiRequest(url,options={}){
    const response=await fetch(url,options);
    if(!response.ok) throw new Error(`Request failed: ${response.status}`);
    if(response.status===204) return null;
    return response.json();
}

function getCurrentUser(){
    return JSON.parse(localStorage.getItem("loggedInUser"));
}

function setCurrentUser(user){
    localStorage.setItem("loggedInUser",JSON.stringify(user));
}

function clearSession(){
    localStorage.removeItem("loggedInUser");
}

function getToday(){
    return new Date().toISOString().split("T")[0];
}

function calculateAge(dob){
    const birthDate=new Date(dob);
    const today=new Date();
    let age=today.getFullYear()-birthDate.getFullYear();
    const month=today.getMonth()-birthDate.getMonth();
    if(month<0||(month===0&&today.getDate()<birthDate.getDate())) age--;
    return age;
}

function isBcryptHash(value){
    return typeof value==="string"&&value.startsWith("$2");
}

async function getBcrypt(){
    const module=await import("https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/+esm");
    return module.default||module;
}

async function hashPassword(password){
    const bcrypt=await getBcrypt();
    return await bcrypt.hash(password,10);
}

async function comparePassword(password,hashedPassword){
    const bcrypt=await getBcrypt();
    return await bcrypt.compare(password,hashedPassword);
}

function initTheme(){
    const themeToggle=document.getElementById("themeToggle");
    if(!themeToggle) return;

    if(localStorage.getItem("theme")==="dark"){
        document.body.classList.add("dark-theme");
        themeToggle.innerHTML='<i class="bi bi-sun-fill"></i> Light Mode';
    }

    themeToggle.addEventListener("click",function(){
        document.body.classList.toggle("dark-theme");

        if(document.body.classList.contains("dark-theme")){
            localStorage.setItem("theme","dark");
            this.innerHTML='<i class="bi bi-sun-fill"></i> Light Mode';
        }else{
            localStorage.setItem("theme","light");
            this.innerHTML='<i class="bi bi-moon-fill"></i> Dark Mode';
        }
    });
}

function showError(message){
    if(window.Swal){
        Swal.fire({icon:"error",title:message});
    }else{
        alert(message);
    }
}