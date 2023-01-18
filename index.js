// importing 
import { MAX_CART_VALUE } from "./constant.js";
import {debounce} from "./helper.js";


/**
 * some terms 
 * we are naming left area as "MAIN"
 * and right area as "FORM" ( which will be opened after clicking over Add Creative button)
 */

// cardsData contains title and subtitle for each created card
// like global card store
let cardsData = [];
/**
 * showForm: whether to show form or not
 * formCurrentColor: current selected color category inside form
 * mainCurrentColor: current selected color category inside main ( left section )
 * mainSearchText: this will contains current text being searched
 */
let state = {
    showForm: false,
    formCurrentColor: "",
    mainCurrentColor: "",
    mainSearchText: "",
};
// colorOptions will contain array of colors ( string )
let colorOptions = [];

// getting required element 
let form = document.getElementById("form");
let formSection = document.getElementById("form-section");
const cardsList = document.getElementById("cards-list");
const addCardButton = document.getElementById("add-card-button");
const exitForm = document.getElementById("close-form");
const mainSearchInput = document.getElementById("search-title-subtile");
const filledCartValue = document.getElementById("filled-cart-value");


// callback to update mainSearchText and display cards 
const handleSearchInput = (e) => {
  // updating main Search text 
  state.mainSearchText = e.target.value;
  // console will proof that debouce is working
  console.log("texting ",state.mainSearchText);
  // display all cards
  displayCards();
}


// callback to show status bar ( black line which will be filled based on cards )
function createStatusCartValue () {
    const ol = document.createElement('ol');
    ol.classList.add('status-cart-value-container');
    for(let i =0;i<MAX_CART_VALUE;i++){
        const li = document.createElement('li');
        li.setAttribute('key',i);
        li.classList.add('status-cart-value-item');
        ol.appendChild(li);
    }
    filledCartValue.appendChild(ol);
    const cartData = document.createElement('span');
    cartData.setAttribute('id','status-bar');
    cartData.classList.add("cart-value-content");
    cartData.innerHTML =   `${cardsData.length}/${MAX_CART_VALUE} Creatives`;
    filledCartValue.appendChild(cartData);

}

// call above callback to create empty status bar 
createStatusCartValue();

// debounce handler calling
const handleSearchInputDebounceFunction = debounce(handleSearchInput,250);

// adding eventlistener on search box 
mainSearchInput.addEventListener("input",handleSearchInputDebounceFunction);

// function to create color UI for both main and form ( resusability)
/**
 * 
 * @param {*} colorList array of colors
 * @param {*} parentElement  parent element to which color UI will be attached ( main vs form)
 * @param {*} heading  heading for main = "color" and heading for form = "background color"
 * @param {*} additonalData additonal data like id and classes names
 */
const createColorCards = (colorList,parentElement,heading,additonalData) => {

    // this function is divided in two parts 
    // 1. creating our color UI 
    // 2. putting event listener to all color item 

    // 1. creating our color UI
    // header for color UI 
    const header = document.createElement("h3");
    header.classList.add("color-heading");
    header.innerHTML = heading;
    const colorParent = document.createElement("div");
    colorParent.setAttribute("id",additonalData.colorParentId);
    // creating color items
    const ol = document.createElement('ol');
    ol.classList.add("color-card-parent");
    colorList.forEach((color,index) => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        div.classList.add("color-card-div");
        li.setAttribute("key",index);
        li.classList.add("color-card");
        li.classList.add("inactive");
        li.classList.add(additonalData.colorCardsClass);
        div.style.backgroundColor = color;
        li.appendChild(div);
        ol.appendChild(li);
    });
    colorParent.innerHTML =  ol.outerHTML;
    parentElement.appendChild(header);
    parentElement.appendChild(colorParent);

    // 2. putting event listener to all color item  

    
    // ataching event listners to all color items
    const classToSearch = `.color-card.${additonalData.colorCardsClass}`;
    var colorItems = document.querySelectorAll(classToSearch);
    colorItems.forEach(function(colorItem,index) {
    colorItem.addEventListener("click", function() {
        // checking if we have clicking on color item which is already active
        // disble it
        if(colorItem.classList.contains("active")){
            colorItem.classList.remove("active");
            colorItem.classList.add("inactive");
            // clearing color
            // checking for main vs form
            if(heading === "color"){
                state.mainCurrentColor= "";
                displayCards();

            }
            else state.formCurrentColor= "";
        }
        else {
            // Deactivate all color buttons
            colorItems.forEach(function(item) {
              item.classList.remove("active");
              colorItem.classList.add("inactive");
            });
            // Activate the clicked button
            colorItem.classList.add("active");
            colorItem.classList.remove("inactive");
            // update current selected color ( main vs ui)
            // main
            if(heading === "color"){
                state.mainCurrentColor= colorOptions[index];
                displayCards();
            }
            // form
            else state.formCurrentColor= colorOptions[index];
        }
    });
  });
}



// fetch function to get colors
fetch("https://random-flat-colors.vercel.app/api/random?count=7")
.then(data => data.json())
.then(data => {
    colorOptions = data.colors;
    // checking if we have recieved correct data in form of array
     if(Array.isArray(colorOptions)) { // check if colors is an array
        const mainSectionColorParent = document.getElementById("main-section-color-options");
        const mainSectionAdditionalDetail = {
            colorParentId: "main-color-parent",
            colorCardsClass: "main"
        }
        const formSectionColorParent = document.getElementById("form-section-color-options");
        const formSectionAdditionalDetail = {
            colorParentId: "form-color-parent",
            colorCardsClass: "form"
        }
        // creating color UI for Main 
        createColorCards(colorOptions,mainSectionColorParent,"color",mainSectionAdditionalDetail);
        // creating color UI for form
        createColorCards(colorOptions,formSectionColorParent,"background color",formSectionAdditionalDetail);
    } else {
        // error case
        console.log('colors is not an array')
    }
});

// this function will filter cards and return requird cards on basis of selectd color, searchText
const filterData = (color,searchText) => {
  return cardsData.filter(item => {
    // if both color and search Text are empty 
    if(color === "" && searchText === ""){
        return true;
    }
    // if  color is empty but searchText is present 
    else if(color === ""){
        return item.title.includes(searchText) || item.subtitle.includes(searchText);
    }
    // if color is present but searchText is empty 
    else if(searchText === ""){
        return item.color === color;
    }
    // if both color and searchText  are present 
    return (item.title.includes(searchText) || item.subtitle.includes(searchText)) && item.color === color;
  });
}

// below callback will create all cards and display it 
/**
 * 
 * @param {*} data  array of cards ( title and subtile ) which is to be shown 
 * @param {*} parentElement  parent element so that cards can be attached to it as child
 */
const createAndDisplayAllCards = (data,parentElement) => {
    // clearing parent element children
    parentElement.innerHTML = "";
    const ol = document.createElement('ol');
    ol.classList.add("card-info-conatiner");
    data.forEach((cardData,index) => {
        const li = document.createElement('li');
        li.setAttribute("key",index);
        li.classList = "info-card";
        li.style.backgroundColor = cardData.color;
        // below are two header for title and subtitle
        const titleInfoElement = document.createElement('h2');
        const subtitleInfoElement = document.createElement('h3');
        titleInfoElement.classList.add("info-card-title");
        subtitleInfoElement.classList.add("info-card-subtitle");
        titleInfoElement.innerHTML = cardData.title;
        subtitleInfoElement.innerHTML = cardData.subtitle;
        li.appendChild(titleInfoElement);
        li.appendChild(subtitleInfoElement);
        ol.appendChild(li);
        });
        // attaching newly created list to parent
        parentElement.innerHTML = ol.outerHTML;


}

// callback which will be called when evenr we want to display cards
const displayCards = () => {
    // filtering cards on basis of selected color and input search text
    const filteredCards = filterData(state.mainCurrentColor,state.mainSearchText);
    createAndDisplayAllCards(filteredCards,cardsList);
}

// below function is too fill status bar ( black line ) when a new Card/creative is added
function updateStatusBar() {
    const totalCartValue = cardsData.length;
    const classToSearch = `.status-cart-value-item`;
    let statusBarItem = document.querySelectorAll(classToSearch)[cardsData.length-1];
    // filled class is attched to fill background color
    statusBarItem.classList.add("filled");
    const statusBarInfo = document.getElementById("status-bar");
    statusBarInfo.innerHTML = `${totalCartValue}/${MAX_CART_VALUE} Creatives`;

}

// putting an event listener on form submit, so then when ever submit is called,
// update cards Data, status bar and show new Card
form.addEventListener("submit", function(event) {
    // prevent the form from its default behaviour to avoid refreshing 
    event.preventDefault(); 

    // Get the form data
    let title = document.getElementById("title");
    let subtitle = document.getElementById("subtitle");

    // Store the form data in an object
    let formData = {
      title: title.value,
      subtitle: subtitle.value,
      color: state.formCurrentColor,
    };
    // clearing form data value
    title.value = "";
    subtitle.value = "";
    // updating out global card store 
    cardsData.push(formData);
    // Log the form data to the console (for demonstration purposes)
    // display cards
    displayCards();
    // update status bar
    updateStatusBar();
    // if we reach max limit, disable Add creative button to prevent user to create mode cards
    if(cardsData.length === MAX_CART_VALUE){
        state.showForm = false;
        formSection.className = "form-section-class hide-form";
        addCardButton.disabled = true;
    }
    
  });

  // putting event listener on Add Creative button
  addCardButton.addEventListener('click',function () {
        state.showForm = true;
        // appling show-class to form
        formSection.className = "form-section-class show-form";
        // disbaling it untill form is opened
        addCardButton.disabled = true;

  });

  // putting event listener to close button of cross to know when to close form
  exitForm.addEventListener("click",function (){
        state.showForm = false;
        // appling hide-class to form
        formSection.className = "form-section-class hide-form";
        // enabling Add Creative button again to create Creative
        addCardButton.disabled = false;
  })

