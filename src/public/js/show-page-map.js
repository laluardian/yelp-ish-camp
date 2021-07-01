const coordinates = campgroundCoordinates.split(',')

mapboxgl.accessToken = mbxToken
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10', // stylesheet location
  center: coordinates, // starting position [lng, lat]
  zoom: 10 // starting zoom
})

map.addControl(new mapboxgl.NavigationControl())

new mapboxgl.Marker()
  .setLngLat(coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${campgroundTitle}</h3><p>${campgroundLocation}</p>`
    )
  )
  .addTo(map)
