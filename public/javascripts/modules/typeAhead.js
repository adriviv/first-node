import axios from 'axios';
import dompurify from 'dompurify';

// SECOND STEP : THE RESULTS
function searchResultsHTML(stores) {
    return stores.map(store => {
        return `
        <a href="/store/${store.slug}" class="search__result">
            <strong>${store.name}</strong>
        </a>
        `;
    }).join(''); // bc this function will return an array 
};

// First STEP : WHEN YOU TYPE 
function typeAhead(search) {
    //  console.log(search); // if you open the console on the page with the search bar, a div class=''search' should apppear 
    
    // 1 - If no search, nothing happen
    if (!search) return;

    // 2 - We need the input  
    const searchInput = search.querySelector('input[name="search"]');

    // 3 - we need the result 
    const searchResults = search.querySelector('.search__results');

    //4 - Listen each input/ letter typed 
    searchInput.on('input', function() { // on is similar to addEventListener 
        // console.log(this.value); // type in the search bar and each letter shoud appear 1 by 1 
        
        // 4a - if is there is no value = do not search anything
        if(!this.value) {
            searchResults.style.display = 'none';
            return; 
        }
        // 4b Show the search results
        searchResults.style.display = 'block';
        searchResults.innerHTML = ''; // to delete the text when you undo
        axios
            .get(`/api/search?q=${this.value}`)
            .then(res => {
                // console.log(res.data); // when type complete resto name =>  have array of resto with name 
                if(res.data.length){
                    searchResults.innerHTML =  dompurify.sanitize(searchResultsHTML(res.data));
                    return;
                }
                // tell them nothing come back 
                searchResults.innerHTML =`<div class="search__result">No result for ${this.value} found!</div>`;
            })
            .catch(err => {
                console.error(err);
            });
    });

// to use les fleches et choisir parmis les options

searchInput.on('keyup', (e) => {
    // console.log(e.keyCode); // when tape une touche tu vois son keyCode. OBJectif: connaitre le keyCode de fleche haut/bas
    // if they are not pressing up down, up or enter ==> nothing
    if (![38, 40, 13].includes(e.keyCode)) {
      return; // nah
    }
    const activeClass = 'search__result--active'; // where we are currently on 
    const current = search.querySelector(`.${activeClass}`); // if someone press up or down 
    const items = search.querySelectorAll('.search__result'); // on va chercher dans la list de  all the search 
    let next;                                                // which one is is gonna be the next one 
    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1]
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
};

export default typeAhead;

