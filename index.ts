
/**  
 * @license  
 * Copyright 2019 Google LLC. All Rights Reserved.  
 * SPDX-License-Identifier: Apache-2.0  
 */  

// Este ejemplo requiere la biblioteca de Dibujo. Incluye los parámetros libraries=drawing  
// cuando cargues la API por primera vez. Por ejemplo:  
//<script src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&libraries=drawing">  </script>
import "./index.css";
function initMap(): void {  
  const mapDiv = document.getElementById("map") as HTMLElement | null;  
  if (!mapDiv) {  
    console.error("Elemento con id 'map' no encontrado.");  
    return;  
  }  
  let isButtonClicked = false;  
  const map = new google.maps.Map(mapDiv, {  
    center: { lat: 33.9541, lng: -84.5321 },  
    zoom: 20,  
    tilt: 0,  
    heading: 180,  
    mapTypeId: "hybrid",  
    mapTypeControl: false,  
    fullscreenControl: false,  
    zoomControl: false,          
    scaleControl: false,         
    streetViewControl: false,    
    gestureHandling: 'false',  
  });  

  //const searchInput = createSearchInput();  
  //const searchButton = createSearchButton();  
  const addressInput = document.getElementById("addressInput") as HTMLInputElement | null;   
  const calculateInput = document.getElementById("calculateInput");   

  let drawingManager: google.maps.drawing.DrawingManager | null = null;  
  let polygon: google.maps.Polygon | null = null;  
  let areaText: google.maps.Marker | null = null;  
  let tableData = [];  
  let totalArea = 0;   

  if (addressInput) {  
    addressInput.addEventListener("keydown", function(event) {  
      if (event.key === "Enter") {  
        searchLocation(addressInput.value);   
       // addressInput.value = "";   
      }  
    });  
  }  

  // Eventos para botones  
/*  searchButton.addEventListener("click", () => {  
    if (addressInput) {  
      searchLocation(addressInput.value);  
    }  
  });  
*/  
  const areaButton = document.getElementById("calculateAreaBtn");  
  if (areaButton) {  
    areaButton.addEventListener("click", showContactDiv);  
  }  
  
  if (calculateInput) {  
    calculateInput.addEventListener("click", calculateArea);  
  }  

  // Función de búsqueda de ubicación  
  function searchLocation(searchText: string) {  
    const geocoder = new google.maps.Geocoder();  
    geocoder.geocode({ address: searchText }, (results, status) => {  
      if (status === "OK") {  
        map.setCenter(results[0].geometry.location);  
        map.setZoom(30);  
      } else {  
        alert("No se pudo encontrar la ubicación: " + status);  
      }  
    });  
  }  

  // Función para calcular el área de la figura dibujada  
  function calculateArea() {  
    if (drawingManager) {  
      drawingManager.setMap(null);  
      drawingManager = null;  
      return;  
    }  

    drawingManager = new google.maps.drawing.DrawingManager({  
      drawingMode: google.maps.drawing.OverlayType.POLYGON,  
      drawingControl: true,  
      drawingControlOptions: {  
        position: google.maps.ControlPosition.TOP_CENTER,  
        drawingModes: [google.maps.drawing.OverlayType.POLYGON],  
      },  
      polygonOptions: {  
        fillColor: "#ffff00",  
        fillOpacity: 0.5,  
        strokeWeight: 2,  
        clickable: false,  
        editable: true,  
        zIndex: 1,  
      },  
    });  
    drawingManager.setMap(map);  

    google.maps.event.addListener(drawingManager, "overlaycomplete", (event) => {  
      if (event.type === google.maps.drawing.OverlayType.POLYGON) {  
        if (polygon) {  
          polygon.setMap(null);  
        }  
        if (areaText) {  
          areaText.setMap(null);  
        }  

        polygon = event.overlay as google.maps.Polygon;  
        const areaInSquareMeters = google.maps.geometry.spherical.computeArea(polygon.getPath());  
        const areaInSquareFeet = (areaInSquareMeters * 10.7639).toFixed(2);  
        localStorage.setItem('medicion', areaInSquareFeet); 
        tableData.push({  
          id: tableData.length + 1,  
          area: areaInSquareFeet,  
          total: (parseFloat(totalArea) + parseFloat(areaInSquareFeet)).toFixed(2),  
        });  
        totalArea = tableData[tableData.length - 1].total;  

        cargarTabla();  

        areaText = new google.maps.Marker({  
          position: polygon.getPath().getArray()[0],  
          map: map,  
          label: {  
            text: `${areaInSquareFeet} sqft`,  
            color: '#FFDB58',  
            fontWeight: 'bold',  
            fontSize: '20px',  
          },  
        });  

        // aqui
         // Habilitar el botón de cálculo  
         $('#calculateAreaBtn').prop('disabled', false);  
         // Cambiar el color de fondo del botón a negro  
         $('#calculateAreaBtn').css('background-color', '#3B82F6');  
         $('#calculateAreaBtn').css('color', 'white'); // Cambiar el color del texto a blanco para mejorar la visibilidad  
         calculateArea();
         $('#calculateInput').css('background-color', '');  
         $('#calculateInput').css('color', '');  
         isButtonClicked = false;  
      }  
    });  
  }  


  // Mostrar el div de contacto  
  function showContactDiv() {  
    const buttonsDiv = document.querySelector("#div-botones");  
    if (buttonsDiv) {  
      buttonsDiv.style.display = 'none';  
    }  
    const contactDiv = document.querySelector('div[style="display:none;"]');  
    if (contactDiv) {  
      contactDiv.style.display = 'block';  
    }   
    changeButtonColor();   
  }  

  function changeButtonColor() {  
    const button = document.getElementById("calculateAreaBtn");  
    if (button) {  
      button.style.backgroundColor = "#3B82F6";  
      button.style.color = "white";  
    }  
  }   

  function cargarTabla() {  
    const tableBody = document.querySelector(".data-table tbody");  
    if (tableBody) {  
      tableBody.innerHTML = "";  

      tableData.forEach((item) => {  
        const row = document.createElement("tr");  
        row.innerHTML = `  
          <td>${item.id}</td>  
          <td>${item.area}</td>  
          <td>${item.total}</td>  
        `;  
        tableBody.appendChild(row);  
      });  
    }  
  }  
/*
  function createSearchInput(): HTMLInputElement {  
    const input = document.createElement("input");  
    input.type = "text";  
    input.id = "searchInput";  
    input.placeholder = "Buscar ubicación";  
    input.classList.add("search-input");  
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);  
    return input;  
  }  
*/
/*
  function createSearchButton(): HTMLButtonElement {  
    const button = document.createElement("button");  
    button.id = "searchButton";  
    button.textContent = "Buscar";  
    button.classList.add("search-button");  
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(button);  
    return button;  
  }  
*/
        function cleanArea() {  
          if (polygon) {  
            polygon.setMap(null);  
            polygon = null;  
          }  
          if (areaText) {  
            areaText.setMap(null);  
            areaText = null;  
          }  
          tableData = [];  
          totalArea = 0;  
          cargarTabla();  
          // Deshabilitar el botón de cálculo  
          $('#calculateAreaBtn').prop('disabled', true);  
          $('#calculateAreaBtn').css('background-color', '#808080');  
          $('#calculateAreaBtn').css('color', '#DCDCDC');  
        } 

  $(document).ready(function() {  
    initSelect2('#roofing','roofingValue');  
    initSelect2('#type-type','roofTypeValue');  
       // Al hacer clic en el botón "Select Area"
       
       $('#calculateInput').on('click', function() { 
       // $('#calculateInput').css('background-color', '#9F9F9F');  
       // $('#calculateInput').css('color', 'white');  
        if (!isButtonClicked) {  
          $('#calculateInput').css('background-color', '#9F9F9F');  
          $('#calculateInput').css('color', 'white');  
          isButtonClicked = true;  
        } else {  
          $('#calculateInput').css('background-color', '');  
          $('#calculateInput').css('color', '');  
          isButtonClicked = false;  
        }  
      });  

      $('#butondatos2').on('click', function() {
        console.log('entro');
        storeFormData();
        });
  
      // (Opcional) Agregar un evento para el botón cuando esté habilitado  
      $('#calculateAreaBtn').on('click', function() {  
       // alert('Calculando el área...');  
        // Aquí puedes agregar la lógica para calcular el área  
      }); 

      /////////////////////////////////////////////
       // Función para obtener el valor de la variable en localStorage  
       /*
  function getChimneyValue() {  
    return localStorage.getItem('chimneyValue') || '';  
  }  

  // Función para establecer el valor de la variable en localStorage  
  function setChimneyValue(value) {  
    localStorage.setItem('chimneyValue', value);  
  }  

  // Función para cargar el valor en el <select>  
  function loadChimneyValue() {  
    const chimneyValue = getChimneyValue();  
    $('#Chimney').val(chimneyValue);  
  }  

  // Función para actualizar la variable en localStorage cuando se cambia la selección  
  function updateChimneyValue() {  
   console.log('updateChimneyValue'); 
    const selectedValue = $('#Chimney').val();  
    setChimneyValue(selectedValue);  
  }  

  // Inicializar la aplicación  
  loadChimneyValue();  

  // Agregar el evento change al <select>  
 // $('#Chimney').on('change', updateChimneyValue);  
  $('#Chimney').change(updateChimneyValue);  
  */

                  // Funciones para obtener y establecer valores en localStorage  
          function getRoofMaterialValue() {  
            return localStorage.getItem('roofMaterialValue') || '';  
          }  

          function setRoofMaterialValue(value) {  
            localStorage.setItem('roofMaterialValue', value);  
          }  

          function getMaterialTypeValue() {  
            return localStorage.getItem('materialTypeValue') || '';  
          }  

          function setMaterialTypeValue(value) {  
            localStorage.setItem('materialTypeValue', value);  
          }  

          function getGuttersValue() {  
            return localStorage.getItem('guttersValue') || '';  
          }  

          function setGuttersValue(value) {  
            localStorage.setItem('guttersValue', value);  
          }  

          function getChimneyValue() {  
            return localStorage.getItem('chimneyValue') || '';  
          }  

          function setChimneyValue(value) {  
            localStorage.setItem('chimneyValue', value);  
          }  

          function getRoofingValue() {  
            return localStorage.getItem('roofingValue') || '';  
          }  

          function setRoofingValue(value) {  
            localStorage.setItem('roofingValue', value);  
          }  

          function getRoofTypeValue() {  
            return localStorage.getItem('roofTypeValue') || '';  
          }  

          function setRoofTypeValue(value) {  
            localStorage.setItem('roofTypeValue', value);  
          }  

          // Funciones para cargar los valores en los elementos  
          function loadRoofMaterialValue() {  
            const roofMaterialValue = getRoofMaterialValue();  
            $('#roof-material').val(roofMaterialValue);  
          }  

          function loadMaterialTypeValue() {  
            const materialTypeValue = getMaterialTypeValue();  
            $('#material-type').val(materialTypeValue);  
          }  

          function loadGuttersValue() {  
            const guttersValue = getGuttersValue();  
            $('#gutters').val(guttersValue);  
          }  

          function loadChimneyValue() {  
            const chimneyValue = getChimneyValue();  
            $('#Chimney').val(chimneyValue);  
          }  

          function loadRoofingValue() {  
            const roofingValue = getRoofingValue();  
            $('#roofing').val(roofingValue);  
          }  

          function loadRoofTypeValue() {  
            const roofTypeValue = getRoofTypeValue();  
            $('#type-type').val(roofTypeValue);  
          }  

          // Funciones para actualizar los valores en localStorage  
          function updateRoofMaterialValue() {  
            const selectedValue = $('#roof-material').val();  
            setRoofMaterialValue(selectedValue);  
          }  

          function updateMaterialTypeValue() {  
            const selectedValue = $('#material-type').val();  
            setMaterialTypeValue(selectedValue);  
          }  

          function updateGuttersValue() {  
            const selectedValue = $('#gutters').val();  
            setGuttersValue(selectedValue);  
          }  

          function updateChimneyValue() {  
            const selectedValue = $('#Chimney').val();  
            setChimneyValue(selectedValue);  
          }  

          function updateRoofingValue() { 
           // alert('Please select');  
            const selectedValue = $('#roofing').val();  
            setRoofingValue(selectedValue);  
          }  

          function updateRoofTypeValue() {  
            const selectedValue = $('#type-type').val();  
            setRoofTypeValue(selectedValue);  
          }  
                  // Funciones para obtener y establecer valores en localStorage  
          function getNumberOfStoriesValue() {  
            return localStorage.getItem('numberOfStoriesValue') || '';  
          }  

          function setNumberOfStoriesValue(value) {  
            localStorage.setItem('numberOfStoriesValue', value);  
          }  

          function getSkylightsValue() {  
            return localStorage.getItem('skylightsValue') || '';  
          }  

          function setSkylightsValue(value) {  
            localStorage.setItem('skylightsValue', value);  
          }  

          // Funciones para cargar los valores en los elementos  
          function loadNumberOfStoriesValue() {  
            const numberOfStoriesValue = getNumberOfStoriesValue();  
            $('#Numbers').val(numberOfStoriesValue);  
          }  

          function loadSkylightsValue() {  
            const skylightsValue = getSkylightsValue();  
            $('#Skylights').val(skylightsValue);  
          }  

          // Funciones para actualizar los valores en localStorage  
          function updateNumberOfStoriesValue() {  
            const value = $('#Numbers').val();  
            setNumberOfStoriesValue(value);  
          }  

          function updateSkylightsValue() {  
            const value = $('#Skylights').val();  
            setSkylightsValue(value);  
          } 

                  // Funciones para obtener y establecer valores en localStorage  
          function getVentilationType() {  
            return localStorage.getItem('ventilationType') || '';  
          }  

          function setVentilationType(value) {  
            localStorage.setItem('ventilationType', value);  
          }  

          // Funciones para cargar los valores en los elementos  
          function loadVentilationType() {  
            const ventilationType = getVentilationType();  
            $('#ventilation').val(ventilationType);  
          }  

          // Funciones para actualizar los valores en localStorage  
          function updateVentilationType() {  
            const selectedValue = $('#ventilation').val();  
            setVentilationType(selectedValue);  
          }  

                  // Funciones para obtener y establecer valores en localStorage  
          function getAddressValue() {  
            return localStorage.getItem('addressValue') || '';  
          }  

          function setAddressValue(value) {  
            localStorage.setItem('addressValue', value);  
          }  

          // Funciones para cargar los valores en los elementos  
          function loadAddressValue() {  
            const addressValue = getAddressValue();  
            $('#addressInput').val(addressValue);  
          }  

          // Funciones para actualizar los valores en localStorage  
          function updateAddressValue() {  
            const value = $('#addressInput').val();  
            setAddressValue(value);  
          }  
          function storeFormData() { 
            //alert('entro'); 
            localStorage.setItem('firstname', $('#firstname').val());  
            localStorage.setItem('lastname', $('#lastname').val());  
            localStorage.setItem('phone', $('#phone').val());  
            localStorage.setItem('email', $('#email').val());  
          }  
      
          function loadFormData() {  
            $('#firstname').val(localStorage.getItem('firstname') || '');  
            $('#lastname').val(localStorage.getItem('lastname') || '');  
            $('#phone').val(localStorage.getItem('phone') || '');  
            $('#email').val(localStorage.getItem('email') || '');  
          }  


          // Inicializar la aplicación  
          loadRoofMaterialValue();  
          loadMaterialTypeValue();  
          loadGuttersValue();  
          loadChimneyValue();  
          loadRoofingValue();  
          loadRoofTypeValue();  
          loadNumberOfStoriesValue();  
          loadSkylightsValue();  
          loadVentilationType();  
          loadAddressValue();  
          loadFormData();  

          // Agregar los eventos change a los elementos  
          $('#roof-material').change(updateRoofMaterialValue);  
          $('#material-type').change(updateMaterialTypeValue);  
          $('#gutters').change(updateGuttersValue);  
          $('#Chimney').change(updateChimneyValue);  
          $('#roofing').change(updateRoofingValue);  
          $('#type-type').change(updateRoofTypeValue); 
          $('#ventilation').change(updateVentilationType);  
            // Inicializar la aplicación  
  
          // Agregar los eventos change a los elementos  
          $('#Numbers').on('input', updateNumberOfStoriesValue);  
          $('#Skylights').on('input', updateSkylightsValue); 
          $('#addressInput').on('input', updateAddressValue); 
          $('#return-boton').click(function() {  
            cleanArea();  
            //location.reload();  
           // $('#buton-datos').click(storeFormData); 
           
          });  

      ////////////////////////////////////////////////

  });  
  //
/*
  function initSelect2(selector: string) {  
    $(selector).select2({  
      templateResult: formatOption,  
      templateSelection: formatOption,  
      minimumResultsForSearch: Infinity,  
      width: '300px'  
    });   
  } */
    function initSelect2(selector: string,id: string) {  
      //let nombre=`${id}`;
     
      /* if(nombre=='#roofing'){
        const selectedValue = localStorage.getItem('roofingValue');
       }else {
        const selectedValue = localStorage.getItem('roofTypeValue');
       }*/
        //const selectedValue = localStorage.getItem('roofingValue');
        const selectedValue = localStorage.getItem(`${id}`);
      
      //console.log(nombre);
      $(selector).select2({  
        templateResult: formatOption,  
        templateSelection: formatOption,  
        minimumResultsForSearch: Infinity,  
        width: '300px',  
        // Agregar la opción de valor seleccionado  
        value: selectedValue,  
      });  
    
      // Establecer el valor seleccionado en el campo  
      $(selector).val(selectedValue).trigger('change');  
    }   

  function formatOption(option: any) {  
    if (!option.id) {  
      return option.text;   
    }  

    return $(  
      '<span>' +  
          '<img src="' + $(option.element).data('icon') + '" style="width: 20px; height: 20px; margin-right: 5px;"/> ' +  
          option.text +  
      '</span>'  
    );  
  }  
}  

declare global {  
  interface Window {  
    initMap: () => void;  
  }  
}  

window.initMap = initMap;  
export {};