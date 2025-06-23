fetchAllPosts("https://test.blockfuselabs.com/api/posts") //fetch all the posts and render on page load
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
const createPostFormBtn = document.querySelector("#form-btn") as HTMLButtonElement
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

logoutButton.addEventListener("click", ()=>{
  localStorage.clear()
  location.href = "/index.html"
})

hamburgerMenu.addEventListener("click", ()=>{
  document.querySelector("#nav-menu")?.classList.toggle("mobile-nav")
})

categoryButton.addEventListener("click", fetchAllCategories)
createPostBtn.addEventListener("click", openPostInterface)
createPostForm.addEventListener("submit", (event:SubmitEvent)=>{
  event.preventDefault()
  createPost("POST", "https://test.blockfuselabs.com/api/posts")
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
     postHolder.innerHTML = ""
    intro.innerHTML = ""
    const singlePostContainer = document.createElement("div")
    singlePostContainer.className = "flex flex-col gap-4 mb-8 lg:w-[50%] mx-auto "
    singlePostContainer.innerHTML = `
      <div class="flex flex-col">
      <div class="flex flex-col gap-2">
        <button class="bg-[#006efa] rounded-full h-10 w-10 text-2xl aspect-square text-white flex items-center justify-center"><a href="">&larr;</a></button>
        <div class="flex-grow flex flex-col gap-3 ">
          <img src=${foundPost.featured_image_url_full} alt=${foundPost.category.name} class="w-full object-cover"/l>
          <p class=" text-3xl font-bold">${foundPost.title}</p>
          <p class="text-[#333333B3] tracking-wide leading-8 ">${foundPost.content}</p>
        </div>
      </div>
      <div class="hidden gap-4 mt-4 self-end" id="btns-container">  
        <button class="" id="delete"><img src="/images/delete.svg" alt="delete button" title="delete" width="30px"/></button>
      </div>
      </div>
    `
    postHolder.appendChild(singlePostContainer)
    createAcommentSection(foundPost)    
    fetchPostComments(foundPost)
    console.log(foundPost)
    
    const buttonsContainer = document.querySelector("#btns-container") as HTMLDivElement   //delete and edit functionalities starts here
    buttonsContainer.style.display =  currentUser.user.id === foundPost.user.id ? "flex" : "none"
    const deleteBtn = document.querySelector("#delete") as HTMLButtonElement
    const editBtn = document.querySelector("#edit") as HTMLButtonElement
    
    deleteBtn.addEventListener("click", ()=>{
      deletePost(foundPost.id)
    })

    // editBtn.addEventListener("click", ()=>{
    //   openPostInterface()
    //   title.value = foundPost.title
    //   content.value = foundPost.content
    //   categoryInput.value = foundPost.category_id
    //   createPostFormBtn.textContent = "Edit"
    //  createPostForm.addEventListener("submit", ()=>{
    //   console.log("hello")
    //   createPost("PATCH", `https://test.blockfuselabs.com/api/posts/${foundPost.id}`)
    //  })
    // })
  }
}

function createAcommentSection(post:any){
    const commentSection = document.createElement("div")     //create a comment section
    commentSection.className = "flex flex-col gap-4 lg:w-[50%] mb-8 mx-auto"
    commentSection.innerHTML = `
        <p class ="fontt-bold text-3xl">${post.category.name} Comments</p>
        <form class="flex flex-col gap-4" id="comment-form">
           <input type="text" placeholder="Your name" class="border h-10 p-2 outline-none" id="name" required>
          <textarea placeholder="share your opinion" class="border p-2 min-h-28 w-full outline-none" id="content" required></textarea>
          <button class=" bg-[#006efa] p-2 text-white" id="comment-button">Comment</button>
        </form>
        `
    postHolder.appendChild(commentSection)
    const commentForm = document.querySelector("#comment-form") as HTMLFormElement  //add eventlistener to the comment form
    if(commentForm){
      commentForm.addEventListener("submit", function(event: SubmitEvent){
        event.preventDefault()
        if(currentUser.token && isLoggedIn){
          const commentHolder = document.querySelector("#content") as HTMLTextAreaElement
          const comments: {content: string} ={
            content: commentHolder.value.trim()
          }
          PostAComment(post.id, comments)
          .then(()=>foundPostCommentContainer.innerHTML = "")
          .then(()=>fetchPostComments(post.id)) // clears all the comments and fetches them again to avoid duplicate
        } else{
          alertMessage("Log in to post a comment", "red")
        }
      })
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
      const result = await response.json()
      if(!response.ok){
        alertMessage(`no`, "red")
      } else{
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
       categoriesContainer.innerHTML = ''
      categoriesArray?.forEach(category =>{
      categoriesContainer.innerHTML += `
        <button class="p-2 border-2 px-4 text-[#767676] hover:opacity-40 btns" id=${category.id}>${category.name}</button>
      `
      const buttons = document.querySelectorAll(".btns")
      if(buttons){
        buttons.forEach(btn =>{
          btn.addEventListener("click", ()=>{
            renderPostByCategory(+btn.id)
          })
        })
      }
     })
      return categoriesArray
    }
  }catch{
    alertMessage("No category fetched", "red")
  }
}

async function renderPostByCategory(id:number){
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
      postHolder.style.display = "none"
    } else{
      intro.style.display = "block"
      allPostsContainer.style.display = "grid"
      postHolder.style.display = "block"
    }
}

async function createPost(method: string, url: string){
  if(currentUser.token && isLoggedIn){
    try{
      const response = await fetch(url, {
        method: method,
        headers: {
          // "Content-Type": "multipart/FormData",
          "Authorization": `Bearer ${currentUser.token}`
        },
        body: new FormData(createPostForm)
      })
      const result = await response.json()
      console.log(response, 1)
      console.log(result, 2)
      if(!response.ok){
        alertMessage("Failed to create post from server", "red")
        return
      }
      alertMessage("post created", "#006efa")
      createPostForm.reset()
     setTimeout(()=>{
      location.href = "/index.html"
     }, 2000)
    }catch(err){
      alertMessage("Failed to create post", "red")
    }
  }else{
    alertMessage("Login to create a post", "red")
  } 
}

async function deletePost(id: number){
  try{
    const response = await fetch(`https://test.blockfuselabs.com/api/posts/${id}`, {
      method: "DELETE",
      headers:{
        "Authorization": `Bearer ${currentUser.token}`
      },
    })
    const result = await response.json()
    if(!response.ok){
      alertMessage(`${result.error}`, "red")
      return
    }alertMessage(`${result.message}`, "#006efa")
    setTimeout(()=> {location.href = "/index.html"}, 2000)
  }catch{
    alertMessage("Post not deleted", "red")
  }
}