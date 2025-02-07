
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
  //1165 Northchase Pkwy SE
  let isButtonClicked = false;  
  /*const map = new google.maps.Map(mapDiv, {  
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
  });  */

  //-----------------------------------------------
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
    gestureHandling: 'false'  
});  

// Dirección por defecto  
const address = "1165 Northchase Pkwy SE";  

// Geocodificar la dirección  
const geocoder = new google.maps.Geocoder();  
geocoder.geocode({ address: address }, (results, status) => {  
    if (status === 'OK') {  
        // Verificamos si encontramos resultados  
        if (results[0]) {  
            // Obtener la ubicación  
            const location = results[0].geometry.location;  
            
            // Ajustar latitud para desplazar el mapa hacia arriba.  
            const adjustedLat = location.lat() + 0.0001; // Ajustar este valor según sea necesario  
            
            // Ajustar el centro del mapa  
            map.setCenter({ lat: adjustedLat, lng: location.lng() });  
            
            // Opcional: Añadir un marcador  
            new google.maps.Marker({  
                position: location,  
                map: map  
            });  
        } else {  
            alert('No se encontró ninguna dirección en esta ubicación.');  
        }  
    } else {  
        alert('Geocodificación falló: ' + status);  
    }  
});  

  //----------------------------------------------

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
      // Crear un objeto de Autocomplete  
      const autocomplete = new google.maps.places.Autocomplete(addressInput, {  
          types: ['geocode'], // Esto restringe los resultados a direcciones  
          componentRestrictions: { country: "US" } // Puedes ajustar según el país deseado  
      });  
  
      autocomplete.addListener("place_changed", () => {  
          const place = autocomplete.getPlace();  
          if (place.geometry) {  
              // Mueve el mapa al lugar seleccionado  
              map.setCenter(place.geometry.location);  
              map.setZoom(20); // O el nivel de zoom que necesites  
              // Puedes mostrar un marcador si lo deseas  
              new google.maps.Marker({  
                  position: place.geometry.location,  
                  map: map  
              });  
                    // Guarda el valor del input de dirección en localStorage  
               const addressInputValue22 = document.getElementById("addressInput").value; // Obtener el valor del input  
                localStorage.setItem("address", addressInputValue22); // Almacenar en localStorage 
                
                localStorage.setItem("addressValue", addressInputValue22);
               $('#numbers-datos').val(localStorage.getItem('address') || ''); 
               $('#calculateInput').prop('disabled', false);  
        //const addressValue2 = getAddressValue();  
        //$('#addressInput').val(addressValue2); 
       // $('#addressInput_datos').val(addressValue2); 

          } else {  
              alert("No se encontró ninguna ubicación.");  
          }  
      });  
  
      addressInput.addEventListener("keydown", function(event) {  
          if (event.key === "Enter") {  
              // Si se presiona "Enter", busca la ubicación  
              searchLocation(addressInput.value);   
              // addressInput.value = "";   
              $('#calculateInput').prop('disabled', false);  
          }  
      });  
  }  
  
  const areaButton = document.getElementById("calculateAreaBtn");  
  if (areaButton) {  
      areaButton.addEventListener("click", showContactDiv);  
  }  
  
  if (calculateInput) {  
      calculateInput.addEventListener("click", calculateArea);  
  }  
  function updateAddressValue() {  
    const value = $('#addressInput').val();  
    setAddressValue(value);  
  }  
  function setAddressValue(value) {  
    localStorage.setItem('addressValue', value);  
  } 
  
  // Función de búsqueda de ubicación  
  function searchLocation(searchText: string) {  
      const geocoder = new google.maps.Geocoder();  
      geocoder.geocode({ address: searchText }, (results, status) => {  
          if (status === "OK") {  
              map.setCenter(results[0].geometry.location);  
              map.setZoom(20);  
              updateAddressValue();
             // loadAddressValue();
              const addressValue2 = getAddressValue();  
            $('#addressInput').val(addressValue2); 
            $('#addressInput_datos').val(addressValue2);  

          } else {  
              alert("No se pudo encontrar la ubicación: " + status);  
          }  
      });  
  } 
  function getAddressValue() {  
    return localStorage.getItem('addressValue') || '';  
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
        let medida1 = localStorage.getItem('medicion');
            $("#h3_area").text("Approximate area: " + medida1+" sq ft."); 
      //  h3_area
        tableData.push({  
          id: tableData.length + 1,  
          area: areaInSquareFeet,  
          total: (parseFloat(totalArea) + parseFloat(areaInSquareFeet)).toFixed(2),  
        });  
        totalArea = tableData[tableData.length - 1].total;  

       // cargarTabla();  

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
    const contactDiv = document.querySelector('#divmateriales');  
    if (contactDiv) {  
      contactDiv.style.display = 'block';  
    }   
    changeButtonColor();   
  }  
  function showOutercontainer() {  
    const buttonsDiv = document.querySelector("#container");  
    if (buttonsDiv) {  
      buttonsDiv.style.display = 'none';  
    } 
    const divmateriales = document.querySelector("#divmateriales");  
    if (divmateriales) {  
      divmateriales.style.display = 'none';  
    } 
    //const contactDiv = document.querySelector('div[style="display:none;"]');  
    
    const contactDiv = document.querySelector('#outercontainer');
    if (contactDiv) {  
      contactDiv.style.display = 'flex';    
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
    localStorage.clear();
    initSelect2('#roofing','roofingValue');  
    initSelect2('#type-type','roofTypeValue');  
       // Al hacer clic en el botón "Select Area"

        /// tarjetas de combos//////////

          // Cuando se hace clic en el botón  
          $('#toggleButton').click(function() {  
            $('#info').slideToggle(function() {  
                // Cambiar el texto del botón según el estado al finalizar la animación  
                if ($('#info').is(':visible')) {  
                    $('#toggleButton').html('Hide Package Details <i class="fas fa-angle-up"></i>');  
                } else {  
                    $('#toggleButton').html('See Package Details <i class="fas fa-angle-down"></i>');  
                }  
            });  
        }); 

           // Cuando se hace clic en el botón  
           $('#toggleButton2').click(function() {  
            $('#info2').slideToggle(function() {  
                // Cambiar el texto del botón según el estado al finalizar la animación  
                if ($('#info2').is(':visible')) {  
                    $('#toggleButton2').html('Hide Package Details <i class="fas fa-angle-up"></i>');  
                } else {  
                    $('#toggleButton2').html('See Package Details <i class="fas fa-angle-down"></i>');  
                }  
            });  
        }); 
          // Cuando se hace clic en el botón  
          $('#toggleButton3').click(function() {  
            $('#info3').slideToggle(function() {  
                // Cambiar el texto del botón según el estado al finalizar la animación  
                if ($('#info3').is(':visible')) {  
                    $('#toggleButton3').html('Hide Package Details <i class="fas fa-angle-up"></i>');  
                } else {  
                    $('#toggleButton3').html('See Package Details <i class="fas fa-angle-down"></i>');  
                }  
            });  
        }); 

          // Cuando se hace clic en el botón  
          $('#toggleButton4').click(function() {  
            $('#info4').slideToggle(function() {  
                // Cambiar el texto del botón según el estado al finalizar la animación  
                if ($('#info4').is(':visible')) {  
                    $('#toggleButton4').html('Hide Package Details <i class="fas fa-angle-up"></i>');  
                } else {  
                    $('#toggleButton4').html('See Package Details <i class="fas fa-angle-down"></i>');  
                }  
            });  
        }); 

        ////////////////
        // limpiar variables
        function clearLocalStorage() {  
          // Limpiar todas las variables de localStorage  
          localStorage.clear(); // Esto elimina todas las entradas de localStorage  
  
         } 
         $('#see_detail').click(function() {  
         // alert("Local storage has been cleared!"); 
         location.reload();  
         // clearLocalStorage();
         }); 
         $('#see_detail2').click(function() {  
         // alert("Local storage has been cleared!");
         location.reload();   
          //clearLocalStorage();
         }); 
         $('#see_detail3').click(function() {  
          //alert("Local storage has been cleared!"); 
          location.reload();  
          //clearLocalStorage();
         }); 
         $('#see_detail4').click(function() {  
          //alert("Local storage has been cleared!"); 
          location.reload();  
          //clearLocalStorage();
         }); 
        ///



       
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
       // console.log('entro');
       //  $("#addressInput_datos").focus();  
        storeFormData();
        });
  
      // (Opcional) Agregar un evento para el botón cuando esté habilitado  
      $('#calculateEstimateBtn').on('click', function() {  
       // alert('Calculando el área...');  
        showOutercontainer();
        // Aquí puedes agregar la lógica para calcular el área  
      });
      $('#back-div').on('click', function() {  
       // alert('Calculando el área...');  
          
    
        // Ocultar el div con ID 'outercontainer'  
        $('#outercontainer').css('display', 'none');  
        
        // Hacer visible los divs con IDs 'divmateriales' y 'container'  
        $('#container').css('display', 'flex'); // También puedes ajustar esto según tu diseño 
        showContactDiv();
     
       });  

       $('#butondatos2').on('click', function() {  
       //  alert('Calculando el área...'); 
         loadFormData_datos(); 
        // var scrollTarget = document.querySelector(".inputcontainerdatos");  
        // scrollTarget.scrollIntoView({ behavior: "smooth" }); // Desplazamiento suave     
      //  $("#addressInput_datos").focus(); 
         // Ocultar el div con ID 'outercontainer'  
         $('#outercontainer').css('display', 'none');  
         
         // Hacer visible los divs con IDs 'divmateriales' y 'container'  
         $('#container').css('display', 'flex'); // También puedes ajustar esto según tu diseño 
         $('#buscador_div').css('display', 'none');
         $('#shoosecontainer').css('display', 'flex');
         //shoosecontainer
         //input-container
         //showContactDiv();
      
        }); 


   
   

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
          function gettear_offValue() {  
            return localStorage.getItem('tear_offValue') || '';  
          } 

          function setMaterialTypeValue(value) {  
            localStorage.setItem('materialTypeValue', value);  
          } 
          function settear_offValue(value) {  
            localStorage.setItem('tear_offValue', value);  
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
            $('#roof-datos').val(roofMaterialValue);  

          //  let medida1 = localStorage.getItem('medicion');
          //  $("#h3_area").text("Approximate area: " + medida1+" sq ft.");   
          }  

          function loadMaterialTypeValue() {  
            const materialTypeValue = getMaterialTypeValue();  
            $('#material-type').val(materialTypeValue); 
            $('#material_datos').val(materialTypeValue); 
            
          }  
          function loadtear_offValue() {  
            const tear_offValue = gettear_offValue();  
            $('#tear_off').val(tear_offValue); 
           
           $('#tear_off-datos').val(tear_offValue); 
            
          } 

          function loadGuttersValue() {  
            const guttersValue = getGuttersValue();  
            $('#gutters').val(guttersValue);  
            $('#doyou-datos').val(guttersValue); 
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
            $('#select_type_datos').val(roofTypeValue);  
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
          function updatetear_offValue() {  
            const selectedValue = $('#tear_off').val();  
            settear_offValue(selectedValue);  
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
            $('#numbers-datos').val(numberOfStoriesValue);  
          }  

          function loadSkylightsValue() {  
            const skylightsValue = getSkylightsValue();  
            $('#Skylights').val(skylightsValue);
            $('#skylights-datos').val(skylightsValue);   
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
            $('#tupe_v-datos').val(ventilationType);   
          }  

          // Funciones para actualizar los valores en localStorage  
          function updateVentilationType() {  
            const selectedValue = $('#ventilation').val();  
            setVentilationType(selectedValue);  
          }  

                  // Funciones para obtener y establecer valores en localStorage  
         

          

          // Funciones para cargar los valores en los elementos  
          function loadAddressValue() {  
            const addressValue = getAddressValue();  
            $('#addressInput').val(addressValue); 
            $('#addressInput_datos').val(addressValue);  
          }  

          // Funciones para actualizar los valores en localStorage  
          function loadFormData_datos() {  
            const roofMaterialValue = localStorage.getItem('roofMaterialValue') || '';
            $('#roof-datos').val(roofMaterialValue);

            let medidas_datos= localStorage.getItem('medicion') || '';
            $("#h3_area").text("Approximate area: " + medidas_datos+" sq ft."); 
            
            $('#numbers-datos').val(localStorage.getItem('numberOfStoriesValue') || '');  
            $('#material_datos').val(localStorage.getItem('materialTypeValue') || '');  
            $('#skylights-datos').val(localStorage.getItem('skylightsValue') || '');  

            $('#doyou-datos').val(localStorage.getItem('guttersValue') || '');  
            $('#tupe_v-datos').val(localStorage.getItem('ventilationType') || '');  
            $('#tear_off-datos').val(localStorage.getItem('tear_offValue') || ''); 

            $('#select_type_datos').val(localStorage.getItem('roofTypeValue') || ''); 
            //
            $('#addressInput_datos').val(localStorage.getItem('addressValue') || ''); 
           // $('#tear_off-datos').val(localStorage.getItem('tear_offValue') || ''); 
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
          loadtear_offValue();   
          loadGuttersValue();  
          loadChimneyValue();  
          loadRoofingValue();  
          loadRoofTypeValue();  
          loadNumberOfStoriesValue();  
          loadSkylightsValue();  
          loadVentilationType();  
          loadAddressValue();  
          loadFormData();  
          loadFormData_datos();

          // Agregar los eventos change a los elementos  
          $('#roof-material').change(updateRoofMaterialValue);  
          $('#material-type').change(updateMaterialTypeValue); 
          $('#tear_off').change(updatetear_offValue); 
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