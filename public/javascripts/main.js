// require('dotenv').config();

window.onload = () => {
  let urlObj = window.location.href;
  let arr = urlObj.split('');
  let eventId = arr.slice( arr.length - 24).join('');
  console.log(eventId);

  let centerEvent = {
    lat: undefined,
    lng: undefined,
  };

  function placeMarker(event) {
    centerEvent = {
      lat: event.location.coordinates[1],
      lng: event.location.coordinates[0],
    };
    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: centerEvent,
      maptypeid: 'roadmap',
    });
    const pin = new google.maps.Marker({
      position: centerEvent,
      draggable: true,
      map: map,
      title: event.name,
    });
  }

  const getPlaces = () => {
    axios.post('/api', { eventId })
      .then((response) => {
        console.log(response.data.place);
        placeMarker(response.data.place);
      })
      .catch();
  };

  getPlaces();
};