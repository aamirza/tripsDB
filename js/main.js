let tripData = [];
let currentTrip = {};
let page = 1;
const perPage = 10;
let map = null;
const HOST = "https://curious-ring-seal.cyclic.app/";

objectToTableRow = (trip) => {
    return `<tr data-id="${trip._id}" class="${trip.usertype}">
                <td>${trip.bikeid}</td>
                <td>${trip["start station name"]}</td>
                <td>${trip["end station name"]}</td>
                <td>${(trip["tripduration"] / 60).toFixed(2)}</td>
            </tr>`
}

function statHtml(statName, statValue) {
    return `<p><strong>${statName}:</strong> ${statValue}</p>`;
}


function mapDetailsHtml(trip) {
    return statHtml("Start Location", trip["start station name"]) +
        statHtml("End Location", trip["end station name"]) +
        statHtml("Trip Duration", `${(trip["tripduration"] / 60).toFixed(2)} Minutes`);
}


function loadTripData() {
    fetch(`https://curious-ring-seal.cyclic.app//api/trips?page=${page}&perPage=${perPage}`)
        .then(response => {
            return response.json();
        }).then(tripData => {
            const tripDataHtml = tripData.map(objectToTableRow).join("");
            document.querySelector("#trips-table tbody").innerHTML = tripDataHtml;
            document.querySelectorAll("#trips-table tbody tr").forEach(row => {
                row.addEventListener("click", (event) => {
                    currentTrip = tripData.find(trip => trip._id === row.getAttribute('data-id'));
                    document.querySelector(".modal-title").textContent = `Trip Details (Bike: ${currentTrip.bikeid})`;
                    document.querySelector("#map-details").innerHTML = mapDetailsHtml(currentTrip);
                    let myModal = new bootstrap.Modal(document.getElementById('trip-modal'), {
                        backdrop: 'static',
                        keyboard: false,
                        focus: true,
                    });

                    myModal.show();
                });
            });
            document.getElementById('current-page').innerHTML = page;
        }).catch((err) => {
            return err.message;
        })
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Au moins tu as atteint jusqu'ici");
    loadTripData();
    document.getElementById('previous-page').addEventListener('click', () => {
        if (page > 1) {
            page--;
            loadTripData();
        }
    });
    document.getElementById('next-page').addEventListener('click', () => {
        page++;
        loadTripData();
    });
    document.querySelector("#trip-modal").addEventListener("shown.bs.modal", function() {
        map = new L.Map('leaflet', {
            layers: [
                new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
            ]
        });

        let start = L.marker([currentTrip["start station location"].coordinates[1], currentTrip["start station location"].coordinates[0]])
            .bindTooltip(currentTrip["start station name"],
                {permanent: true, direction: 'right'})
            .addTo(map);

        let end = L.marker([currentTrip["end station location"].coordinates[1], currentTrip["end station location"].coordinates[0]])
            .bindTooltip(currentTrip["end station name"],
                {permanent: true, direction: 'right'})
            .addTo(map);

        var group = new L.featureGroup([start, end]);

        map.fitBounds(group.getBounds(), {padding: [60, 60]});
    });

    document.querySelector("#trip-modal").addEventListener("hidden.bs.modal", function() {
        map.remove();
    });
});
