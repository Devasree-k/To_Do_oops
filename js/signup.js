$(document).ready(function(){

    let today=new Date().toISOString().split("T")[0];
    $("#dob").attr("max",today);

    function validateName(){
        const valid=/^[A-Za-z ]{3,}$/.test($("#name").val().trim());
        $("#name").toggleClass("is-invalid",!valid).toggleClass("is-valid",valid);
        return valid;
    }

    function validateEmail(){
        const valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("#email").val().trim());
        $("#email").toggleClass("is-invalid",!valid).toggleClass("is-valid",valid);
        return valid;
    }

    function validatePassword(){
        const valid=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test($("#password").val());
        $("#password").toggleClass("is-invalid",!valid).toggleClass("is-valid",valid);
        return valid;
    }


    function validateProfileImage(){
        const valid=$("#profileImage").val().trim()!=="";
        $("#profileImage").toggleClass("is-invalid",!valid).toggleClass("is-valid",valid);
        return valid;
    }

    function validateConfirmPassword(){
        const valid=$("#confirmPassword").val()!==""&&$("#password").val()===$("#confirmPassword").val();
        $("#confirmPassword").toggleClass("is-invalid",!valid).toggleClass("is-valid",valid);
        return valid;
    }

    function validatePhone(){
        const valid=/^[6-9][0-9]{9}$/.test($("#phone").val().trim());
        $("#phone").toggleClass("is-invalid",!valid).toggleClass("is-valid",valid);
        return valid;
    }

    function validateDOB(){
        const value=$("#dob").val();
        const valid=value!==""&&calculateAge(value)>=16;
        $("#dob").toggleClass("is-invalid",!valid).toggleClass("is-valid",valid);
        return valid;
    }

    function validateCountry(){
        const valid=$("#country").val()!=="";
        $("#country").toggleClass("is-invalid",!valid).toggleClass("is-valid",valid);
        return valid;
    }

    function validateAddress(){
        const valid=$("#address").val().trim().length>=10;
        $("#address").toggleClass("is-invalid",!valid).toggleClass("is-valid",valid);
        return valid;
    }

    function validateGender(){
        const valid=$("input[name='gender']:checked").length>0;
        $("#genderError").toggleClass("d-none",valid);
        return valid;
    }

    function validateSkills(){
        const valid=$("input[name='Skills']:checked").length>0;
        $("#skillsError").toggleClass("d-none",valid);
        return valid;
    }

    $("#name").on("input",validateName);
    $("#email").on("input",validateEmail);
    $("#profileImage").on("change",validateProfileImage);

    $("#password").on("input",function(){
        validatePassword();
        validateConfirmPassword();
    });

    $("#confirmPassword").on("input",validateConfirmPassword);
    $("#phone").on("input",validatePhone);
    $("#dob").on("input change",validateDOB);
    $("#country").on("change",validateCountry);
    $("#address").on("input",validateAddress);
    $("input[name='gender']").on("change",validateGender);
    $("input[name='Skills']").on("change",validateSkills);

    $("#signupForm").submit(async function(e){
        e.preventDefault();

        let isValid=true;

        isValid=validateName()&&isValid;
        isValid=validateEmail()&&isValid;
        isValid=validateProfileImage()&&isValid;
        isValid=validatePassword()&&isValid;
        isValid=validateConfirmPassword()&&isValid;
        isValid=validatePhone()&&isValid;
        isValid=validateDOB()&&isValid;
        isValid=validateCountry()&&isValid;
        isValid=validateAddress()&&isValid;
        isValid=validateGender()&&isValid;
        isValid=validateSkills()&&isValid;


        if(!isValid) return;
        

        try{
            const email=$("#email").val().trim().toLowerCase();

            const existingUser=await userService.findByEmail(email);

            if(existingUser){
                $("#email").addClass("is-invalid").removeClass("is-valid");

                Swal.fire({
                    icon:"error",
                    title:"Email exists",
                    text:"This email is already registered"
                });

                return;
            }

            const hashedPassword=await hashPassword($("#password").val());

            const userData={
                name:$("#name").val().trim(),
                email:email,
                profileImage:$("#profileImage").val().trim(),
                password:hashedPassword,
                age:calculateAge($("#dob").val()),
                phone:$("#phone").val().trim(),
                dob:$("#dob").val(),
                country:$("#country").val(),
                gender:$("input[name='gender']:checked").val(),
                skills:$("input[name='Skills']:checked").map(function(){
                    return $(this).val();
                }).get(),
                address:$("#address").val().trim(),
                createdAt:new Date().toISOString()
            };

            const newUser=new User(userData);
            const savedUser=await newUser.create();

            const safeUser={...savedUser};
            delete safeUser.password;

            localStorage.setItem("registeredUser",JSON.stringify(safeUser));

            Swal.fire({
                icon:"success",
                title:"Registration Successful",
                text:"Your account has been created successfully",
                confirmButtonText:"OK"
            }).then(function(){
                window.location.href="login1.html";
            });

        }catch(error){
            console.error("Signup Error:",error);

            Swal.fire({
                icon:"error",
                title:"Registration Failed",
                text:error.message||"Unable to register user"
            });
        }
    });
});