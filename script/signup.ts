const eyeIcon = document.querySelector("#eyeIcon") as HTMLImageElement
const form = document.querySelector("form") as HTMLFormElement
const nameInput = (document.querySelector("#name") as HTMLInputElement)
const emailInput = (document.querySelector("#email") as HTMLInputElement)
const passwordInput = (document.querySelector("#password") as HTMLInputElement)
const team_name_input = (document.querySelector("#team") as HTMLSelectElement)
const agreementInput = (document.querySelector("#agreement") as HTMLInputElement)

interface User{
    name: string
    email: string
    password: string
    team_name: string
}

eyeIcon.addEventListener("click", ()=>{
    const password = document.querySelector("input[type='password']")
    const passwordText = document.querySelector("#password")
    if(password){
        password.setAttribute("type", "text")
        eyeIcon.setAttribute("src", "../images/show.svg")
    }
    else if(passwordText){
        passwordText.setAttribute("type", "password")
        eyeIcon.setAttribute("src", "../images/hide.svg")
    }
})

form.addEventListener("submit", async function(event){
    event.preventDefault()
   let name = nameInput.value.trim()
   let email = emailInput.value.trim()
   let password = passwordInput.value
   let team_name = team_name_input.value
   let agreement = agreementInput.checked
    
    if(!name || !email || !password || !team_name || !agreement){
        Toastify({
        text: "All fields must be corrrectly filled",
        duration: 3000,
        close: true,
        position: "center",
        style: {
        background: "red",
        },
    }).showToast();
    } else{
        try{
            const userDetails: User ={
                name,
                email,
                password,
                team_name,
            }

            const response = await  fetch("https://test.blockfuselabs.com/api/register", {
            method: "POST",
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify(userDetails)
        })
         const result = await response.json()
            if(!response.ok){
                let  error = JSON.stringify(result.errors.email[0])
               Toastify({
                text: error,
                duration: 3000,
                close: true,
                position: "center",
                style: {
                    background: "red",
                },
                }).showToast(); 
                return
            }
            Toastify({
                    text: `Registration successful`,
                    duration: 3000,
                    close: true,
                    position: "center",
                    style: {
                    background: "#006efa",
                    },
                }).showToast();
                nameInput.value =""
                emailInput.value =""
                passwordInput.value = ""
                team_name_input.value = ""
                agreementInput.checked = !agreementInput.checked
                location.href = "/login.html"
        }catch{
            Toastify({
            text: `Registration failed`,
            duration: 3000,
            close: true,
            position: "center",
            style: {
                background: "red",
            },
            }).showToast();
        }
    }
})