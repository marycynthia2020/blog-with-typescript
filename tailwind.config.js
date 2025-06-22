 /** @type {import('tailwindcss').Config} */
export default {
   content: [
    "index.html",
    "signup.html",
    "login.html",
    "create_post.html",
   "script/**/*.{js,ts}"],
   theme: {
     extend: {
      fontFamily:{
        roboto: ["Roboto", "sans-serif"],
        mie: [ "Meie Script", "cursive"]

      }
     },
   },

   plugins: [],
 }
