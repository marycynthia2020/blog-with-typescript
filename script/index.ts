const currentUser = JSON.parse(localStorage.getItem("userLoggedIn") || "{}")
const isLoggedIn: boolean = JSON.parse(localStorage.getItem("isLoggedIn") || "false")

const hamburgerMenu = document.getElementById("hamburger") as HTMLButtonElement
const signupButton = document.querySelector("#signup") as HTMLButtonElement
const loginButton = document.querySelector("#login") as HTMLButtonElement
const logoutButton = document.querySelector("#logout") as HTMLButtonElement
const allPostsContainer = document.querySelector("#posts-container") as HTMLDivElement
const intro = document.querySelector("#intro") as HTMLDivElement
const postHolder = document.querySelector("#post") as HTMLDivElement
const categoryButton = document.querySelector("#categories") as HTMLButtonElement
const categoriesContainer = document.querySelector("#categories-container") as HTMLDivElement
const createPostForm = document.querySelector("#create-post-form") as HTMLFormElement
const createPostBtn = document.querySelector("#link-to-create-post") as HTMLButtonElement
const title = document.querySelector("#title") as HTMLInputElement
const content = document.querySelector("#content") as HTMLInputElement
const categoryInput = document.querySelector("#category") as  HTMLSelectElement
const image = document.querySelector("#image") as HTMLInputElement
const foundPostCommentContainer = document.createElement("div")   //created this as a global variable, so I can access it from all functions

if(isLoggedIn && currentUser.token) {
  signupButton.style.display = "none"  //check if the user is logged in and there is a current user in order to hide or display the signup and login button
  loginButton.style.display = "none"
  logoutButton.style.display = "block"
}

fetchAllPosts("https://test.blockfuselabs.com/api/posts") //fetch all the posts and render on page load
logoutButton.addEventListener("click", ()=>{   //logout on clicking the logout button and clears the user and logged in details
  localStorage.clear()
  location.href = "/index.html"
})

categoryButton?.addEventListener("click", ()=>{
  fetchAllCategories()
  renderAllCategories()
})
createPostBtn.addEventListener("click", openPostInterface)
createPostForm.addEventListener("submit", createPost)
hamburgerMenu.addEventListener("click", ()=>{
  document.querySelector("#nav-menu")?.classList.toggle("mobile-nav")
})

function alertMessage(message:string, bgColor: string){
  Toastify({
            text: message,
            duration: 3000,
            close: true,
            position: "center",
            style: {
            background: bgColor,
            },
            }).showToast()
}

async function fetchAllPosts(url:string){  // function to fetch all posts
    try{
          const response = await fetch(url)
          if(!response.ok){
            const result = await response.json()
            alertMessage(`${result.message}`, "red");
            return
          } 
        const result = await response.json()
        renderAllPosts(result)
        return result
       
    }catch{
        alertMessage("Failed to fetch posts", "red")
    }
}

function renderAllPosts(postArray: any[]){    //function to render fetched posts
  postArray.map((post) =>{
    const postContainer = document.createElement("div")
    postContainer.setAttribute("id", post.id)
    postContainer.className = "shadow-2xl rounded-md flex flex-col p-5 gap-3 bg-white"
    postContainer.innerHTML = `
        <div class="flex-grow flex flex-col gap-3 cursor-pointer">
          <img src=${post.featured_image_url_full} alt=${post.category.name} class="w-full aspect-square object-cover rounded-md />
          <p class=" text-3xl font-bold">${post.title.slice(0, 30)}....</p>
          <p class="text-[#333333B3] text-sm ">${post.content.slice(0, 100)}...</p>
         
        </div>
         <button class=" bg-[#006efa] p-2 text-white hover:opacity-40">Read more</button>
      
        `
    allPostsContainer.appendChild(postContainer)
    postContainer.addEventListener("click", ()=>{
      renderASinglePost(post.id)
    })
  })
}

async function renderASinglePost(id: number){
  const allPosts: Array<any> = await fetchAllPosts("https://test.blockfuselabs.com/api/posts")   //get all the posts and find the current post clicked
  const foundPost = allPosts.find(post =>post.id === id)
  if(foundPost){
    allPostsContainer.innerHTML = ""
    intro.innerHTML = ""
    const singlePostContainer = document.createElement("div")
    singlePostContainer.setAttribute("id", foundPost.id)
    singlePostContainer.className = "flex flex-col gap-4 mb-8 lg:w-[50%] mx-auto "
    singlePostContainer.innerHTML = `
         <div class="flex flex-col gap-2">
          <button class="bg-[#006efa] rounded-full h-10 w-10 text-2xl aspect-square text-white flex items-center justify-center"><a href="">&larr;</a></button>
          <div class="flex-grow flex flex-col gap-3 ">
            <img src=${foundPost.featured_image_url_full} alt=${foundPost.category.name} class="w-full object-cover"/l>
            <p class=" text-3xl font-bold">${foundPost.title}</p>
            <p class="text-[#333333B3] tracking-wide leading-8 ">${foundPost.content}</p>
          </div>
        </div>
        `
    postHolder.appendChild(singlePostContainer)

    const commentSection = document.createElement("div")     //create a comment section
    commentSection.className = "flex flex-col gap-4 lg:w-[50%] mb-8 mx-auto"
    commentSection.innerHTML = `
        <p class ="fontt-bold text-3xl">${foundPost.category.name} Comments</p>
        <input type="text" placeholder="Your name" class="border h-10 p-2 outline-none" id="name">
        <textarea placeholder="share your opinion" class="border p-2 min-h-28 w-full outline-none" id="content"></textarea>
        <button class=" bg-[#006efa] p-2 text-white" id="comment-button">Comment</button>
    `
    postHolder.appendChild(commentSection)
    const commentButton = document.querySelector("#comment-button") as HTMLButtonElement  //add eventlistener to the comment button
    if(commentButton){
      commentButton.addEventListener("click", function(){
        if(currentUser.token && isLoggedIn){
          const commentHolder = document.querySelector("#content") as HTMLTextAreaElement
          const nameHolder = document.querySelector("#name") as HTMLInputElement
          const comment ={
            content: commentHolder.value
          }
          commentHolder.value = ""
          nameHolder.value = ""
          PostAComment(foundPost.id, comment)
          .then(()=>{foundPostCommentContainer.innerHTML = ""})
          .then(()=>{fetchPostComments(foundPost.id)}) // clears all the comments and fetches them again to avoid duplicate
        } else{
          alertMessage("Log in to post a comment", "red")
        }
      })
    }
    fetchPostComments(foundPost.id)
  }
}


async function fetchPostComments (id:number){
  foundPostCommentContainer.className = "foundCommentsContainer lg:w-[50%] mx-auto"
  try{
        const commentsResponse = await fetch(`https://test.blockfuselabs.com/api/posts/${id}/comments`)
        if(!commentsResponse.ok){
            const result = await commentsResponse.json()
             alertMessage(`${result.message}`, "red")
            return
        }
          const result = await commentsResponse.json()
          if(result.length > 0){
                console.log(result)
            result.forEach((comment: any) =>{  
            foundPostCommentContainer.innerHTML += `
                <div class="flex gap-4 items-center mt-4">
                  <div class="bg-[#006efa] text-white rounded-full h-10 w-10 uppercase text-lg flex items-center justify-center">${comment.user.name[0]}</div>
                 <div class="flex flex-col gap-1 ">
                  <p>${comment.user.name}</p>
                  <p class="text-[#333333B3]">${comment.content}</p>
                 </div>
                </div>
                <hr />
              `
            }) 
          }else{
             foundPostCommentContainer.innerHTML =`<p class="text-3xl text-[#333333B3]]">No comment on this post.</p>`
          }
    }catch{
          alertMessage("Failed to fetch comments", "red")
    }
   postHolder.appendChild(foundPostCommentContainer)
}

async function PostAComment(id: number, comment: object){
   try{
      const response = await fetch(`https://test.blockfuselabs.com/api/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${currentUser.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(comment)
      })
      if(!response.ok){
        const result = await response.json()
        alertMessage(`${result.message}`, "red")
      } else{
        const result = await response.json()
         alertMessage("Comment posted succesfully", "#006efa")
      }
  }catch{
    alertMessage("Failed to post comment", "red")
}
}

async function fetchAllCategories(){
  try{
    const response1 = await fetch("https://test.blockfuselabs.com/api/categories")
    const response2 = await fetch("https://test.blockfuselabs.com/api/categories?page=2")
    const result1 = await response1.json()
    const result2 = await response2.json()
    if(!response1.ok || !response2.ok){
      alertMessage(`${result1.message}`, "red")
      alertMessage(`${result2.message}`, "red")
    } else{
      let categoriesArray = [...result1.data, ...result2.data]
      return categoriesArray
    }
  }catch{
    alertMessage("No category fetched", "red")
  }
 
}
async function renderAllCategories(){
     const categoriesArray = await fetchAllCategories()
     categoriesContainer.innerHTML = ''
      categoriesArray?.forEach(category =>{
      categoriesContainer.innerHTML += `
        <button class="p-2 border-2 px-4 text-[#767676] hover:opacity-40 btns" id=${category.id}>${category.name}</button>
      `
      const buttons = document.querySelectorAll(".btns")
      if(buttons){
        buttons.forEach(btn =>{
          btn.addEventListener("click", ()=>{
            fetchASingleCategory(+btn.id)
          })
        })
      }
     })
  }


async function fetchASingleCategory(id:number){
  const allPosts: Array<any> = await fetchAllPosts("https://test.blockfuselabs.com/api/posts")   //get all the posts so as to filter for each category
  const foundPosts = allPosts.filter(post => post.category.id === id)
  if(foundPosts.length >0){
    allPostsContainer.innerHTML = ""
    renderAllPosts(foundPosts)
    return
  }allPostsContainer.innerHTML = `<p>No post for this category</p>`
}

async function openPostInterface(){
  const categories = await fetchAllCategories()
   categories?.forEach(category =>{
    categoryInput.innerHTML += `
      <option value=${category.id}>${category.id} -- ${category.name}</option>
    `
  })
    createPostForm.classList.toggle("block")
    if(createPostForm.classList.contains("block")){
      intro.style.display = "none"
    allPostsContainer.style.display = "none"
    } else{
      intro.style.display = "block"
    allPostsContainer.style.display = "grid"
    }
}




async function createPost(event: SubmitEvent){
  event.preventDefault()
  if(currentUser.token && isLoggedIn){
    try{
      const response = await fetch("https://test.blockfuselabs.com/api/posts", {
        method: "POST",
        headers: {
          // "Content-Type": "multipart/FormData",
          "Authorization": `Bearer ${currentUser.token}`
        },
        body: new FormData(createPostForm)
      })
      const result = await response.json()
      if(!response.ok){
        console.log(result)
        alertMessage("Failed to create post", "red")
        return
      }
      alertMessage("post created", "#006efa")
      createPostForm.reset()
     setTimeout(()=>{
      location.href = "/index.html"
     }, 2000)
    }catch(err){
      console.log("Error", err)
      alertMessage("Failed to create post", "red")
    }
  }else{
    alertMessage("Login to create a post", "red")
  } 
}
