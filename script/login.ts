// const currentUser = JSON.parse(localStorage.getItem("userLoggedIn") || "{}")
// const isLoggedIn: boolean = JSON.parse(localStorage.getItem("isLoggedIn") || "false")

const loginEyeIcon = document.querySelector("#eyeIcon")
const loginEmailInput = document.querySelector("#loginEmail") as HTMLInputElement
const loginPasswordInput = document.querySelector("#loginPassword") as HTMLInputElement
const loginForm = document.querySelector("#loginForm") as HTMLFormElement

    loginEyeIcon?.addEventListener("click", ()=>{
    const password = document.querySelector("input[type='password']")
    const passwordText = document.querySelector("#loginPassword")
    if(password){
        password.setAttribute("type", "text")
        eyeIcon.setAttribute("src", "../images/show.svg")
    }
    else if(passwordText){
        passwordText.setAttribute("type", "password")
        eyeIcon.setAttribute("src", "../images/hide.svg")
    }
})


loginForm.addEventListener("submit", async function(event){
    event.preventDefault()
    let email = loginEmailInput.value
    let password = loginPasswordInput.value

    if(!email || !password){
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
            const userDetails: {email: string, password: string} = {
            email,
            password,
            }

            const response = await fetch("https://test.blockfuselabs.com/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userDetails)
            })
            const result = await(response.json())
            if(!response.ok){
                Toastify({
                    text: `${result.message}`,
                    duration: 3000,
                    close: true,
                    position: "center",
                    style: {
                    background: "red",
                    },
                }).showToast();
                return
                
            }
            loginEmailInput.value = ""
            loginPasswordInput.value = ""
            location.href = "/index.html"
            localStorage.setItem("userLoggedIn", JSON.stringify(result))
            localStorage.setItem("isLoggedIn", JSON.stringify(true))
           

        }catch{
            Toastify({
            text: 'login failed',
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

