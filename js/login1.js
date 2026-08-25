$(document).ready(function(){
    const userService=new User();

    $("#loginForm").submit(async function(e){
        e.preventDefault();

        $("#loginError").addClass("d-none");
        $("#loginSuccess").addClass("d-none");

        let isValid=true;

        const email=$("#loginEmail");
        const password=$("#loginPassword");

        const emailValue=email.val().trim().toLowerCase();
        const passwordValue=password.val();

        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)){
            email.addClass("is-invalid");
            isValid=false;
        }else{
            email.removeClass("is-invalid").addClass("is-valid");
        }

        if(passwordValue.length<6){
            password.addClass("is-invalid");
            isValid=false;
        }else{
            password.removeClass("is-invalid").addClass("is-valid");
        }

        if(!isValid) return;

        try{
            const user=await userService.findByEmail(emailValue);

            if(!user){
                $("#loginError").removeClass("d-none");
                password.addClass("is-invalid");
                return;
            }

            let passwordMatched=false;

            if(isBcryptHash(user.password)){
                passwordMatched=await comparePassword(passwordValue,user.password);
            }else{
                passwordMatched=passwordValue===user.password;

                if(passwordMatched){
                    const hashedPassword=await hashPassword(passwordValue);

                    const updatedUser=new User({
                        ...user,
                        password:hashedPassword
                    });

                    await updatedUser.update(user.id);
                }
            }

            if(!passwordMatched){
                $("#loginError").removeClass("d-none");
                password.addClass("is-invalid");
                return;
            }

            const safeUser={...user};
            delete safeUser.password;

            setCurrentUser(safeUser);

            $("#loginSuccess").removeClass("d-none");

            Swal.fire({
                icon:"success",
                title:"Login Successful",
                text:"Welcome!",
                confirmButtonColor:"#4f46e5",
                timer:1500,
                timerProgressBar:true,
                showConfirmButton:false
            }).then(function(){
                window.location.href="dashboard.html";
            });

        }catch(error){
            console.error("Login Error:",error);

            $("#loginError")
                .removeClass("d-none")
                .text("Cannot connect to server. Make sure json-server is running on port 3000.");
        }
    });
});