/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
// Este ejemplo requiere la biblioteca de Dibujo. Incluye los parámetros libraries=drawing  
// cuando cargues la API por primera vez. Por ejemplo:  
// <script src="https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&libraries=drawing">  
function initMap() {
    const mapDiv = document.getElementById("map");
    if (!mapDiv) {
        console.error("Elemento con id 'map' no encontrado.");
        return;
    }
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
    const searchInput = createSearchInput();
    const searchButton = createSearchButton();
    const addressInput = document.getElementById("addressInput");
    const calculateInput = document.getElementById("calculateInput");
    let drawingManager = null;
    let polygon = null;
    let areaText = null;
    let tableData = [];
    let totalArea = 0;
    if (addressInput) {
        addressInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                searchLocation(addressInput.value);
                addressInput.value = "";
            }
        });
    }
    // Eventos para botones  
    searchButton.addEventListener("click", () => {
        if (addressInput) {
            searchLocation(addressInput.value);
        }
    });
    const areaButton = document.getElementById("calculateAreaBtn");
    if (areaButton) {
        areaButton.addEventListener("click", showContactDiv);
    }
    if (calculateInput) {
        calculateInput.addEventListener("click", calculateArea);
    }
    // Función de búsqueda de ubicación  
    function searchLocation(searchText) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: searchText }, (results, status) => {
            if (status === "OK") {
                map.setCenter(results[0].geometry.location);
                map.setZoom(30);
            }
            else {
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
                polygon = event.overlay;
                const areaInSquareMeters = google.maps.geometry.spherical.computeArea(polygon.getPath());
                const areaInSquareFeet = (areaInSquareMeters * 10.7639).toFixed(2);
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
            button.style.backgroundColor = "#00BFFF";
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
    function createSearchInput() {
        const input = document.createElement("input");
        input.type = "text";
        input.id = "searchInput";
        input.placeholder = "Buscar ubicación";
        input.classList.add("search-input");
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
        return input;
    }
    function createSearchButton() {
        const button = document.createElement("button");
        button.id = "searchButton";
        button.textContent = "Buscar";
        button.classList.add("search-button");
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(button);
        return button;
    }
    $(document).ready(function () {
        initSelect2('#roofing');
        initSelect2('#type-type');
    });
    function initSelect2(selector) {
        $(selector).select2({
            templateResult: formatOption,
            templateSelection: formatOption,
            minimumResultsForSearch: Infinity,
            width: '300px'
        });
    }
    function formatOption(option) {
        if (!option.id) {
            return option.text;
        }
        return $('<span>' +
            '<img src="' + $(option.element).data('icon') + '" style="width: 20px; height: 20px; margin-right: 5px;"/> ' +
            option.text +
            '</span>');
    }
}
window.initMap = initMap;
export {};
