 /** @type {import('tailwindcss').Config} */
export default {
   content: [
    "index.html",
    "signup.html",
    "login.html",
   "script/**/*.{js,ts}"],
   theme: {
     extend: {
      fontFamily:{
        roboto: ["Roboto", "sans-serif"]

      }
     },
   },

   plugins: [],
 }
