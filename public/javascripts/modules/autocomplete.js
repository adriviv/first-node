// CARREFULL --> Google map put Lat before Lng 

function autocomplete(input, latInput, lngInput){
    // console.log(input, latInput, lngInput);
    if(!input) return; //if no input, no running
    const dropdown = new google.maps.places.Autocomplete(input);

    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        // console.log(place); // to see all the infos coming from Google maps of the city
        latInput.value = place.geometry.location.lat();
        lngInput.value = palce.geometry.location.lng(); 
    });
        // If someone hits enter on the address field, don't submit the form
    input.on('keydown', (e) => {
        if(e.keycode === 13) e.preventDefault();
        // 13 is the number to say click enter
    });
}

export default autocomplete;