import axios from 'axios'; 
import { $ } from './bling';

function ajaxHeart(e){
     e.preventDefault(); //strop the form to submitting itself
     console.log('HEART IT ')
     axios
     .post(this.action)
     .then(res => {
          // 1 - AUtomatic apply active class or not wihout reload page. 
         //  console.log(res.data); // will show you the id, address where we want to post 
         const isHearted = this.heart.classList.toggle('heart__button--hearted'); // this.heart, heart is the name of the submit button on the front-end
          // 2 -  update automatically the number of heart in the Navbar
          $('.heart-count').textContent = res.data.hearts.length;
     })
     .catch(console.error);
}
// now import it in the delicisous-app.js
export default ajaxHeart; 

