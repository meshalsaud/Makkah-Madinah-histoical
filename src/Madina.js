import React, { Component } from 'react';
import scriptLoader from 'react-async-script-loader'
import escapeRegExp from 'escape-string-regexp'
import fetchJsonp from 'fetch-jsonp'
import {style} from './style'
import {locations} from './Madinahlocations'
import './App.css';

let markers=[];
let infoWindow=[];

class Madina extends Component {
  state={
    map:{},
    query:'',
    locations:locations,
    requestWasSuccessful:true,
    data:[]

  }

  //to update query
  updateQuery=(query)=>{
    this.setState({query:query})
  }
  updateData=(newData)=>{
    this.setState({data:newData})
  }
   componentWillReceiveProps({isScriptLoadSucceed}){
    if(isScriptLoadSucceed){
      var map=new window.google.maps.Map(document.getElementById('map'),{
        zoom:15,
        center:new window.google.maps.LatLng(21.415408,39.827636),
        styles:style
      });
      this.setState({map:map})
    }
    else{
      console.log('Failed to load Google Maps ')
      this.setState({requestWasSuccessful:false})
    }
  }
 componentDidUpdate(){
  //here we will make filter on locations depend on query
  const {locations,query,map}=this.state;
  let showingLocations=locations;
  if(query){
    const match=new RegExp(escapeRegExp(query),'i');
    showingLocations=locations.filter((location)=>match.test(location.title));
  }
  else{
    showingLocations=locations;
  }
  //clear the map from markers
  markers.map((marker)=>{marker.setMap(null)})
  //clear markers and infoWindow
  markers=[];
  infoWindow=[];
  showingLocations.map((marker,index)=>{
    let getData=this.state.data.filter((d)=> marker.title === d[0][0]).map(i=>{
      if(i.length===0)
        return 'no contact have been found you can search Manual'
      else if (i[1] !=='')
        return i[1]
      else
        return 'no contact have been found you can search Manual'
    })
    let getLink=this.state.data.filter((d)=>marker.title === d[0][0]).map(l=>{
      if(l.length ===0)
        return 'https://www.wikipedia.org'
      else if (l[1] !=='')
        return l[2]
      else
        return 'https://www.wikipedia.org'

    })
    //here we will add contents depend on getLink&getData and add it to our infowindow
    var contentString=
    `<div tabIndex="0" className'infoWindow'>
      <h3>${marker.title} </h3>
      <p> ${getData} </p>
      <a href= ${getLink}> Click here for more informations </a>
      
    </div>`

    let ourInfoWindow=new window.google.maps.InfoWindow({
      content:contentString,
      maxWidth:250
    })
    let bounds=new window.google.maps.LatLngBounds();
    //here we will add our marker depend on maker we filter it from showingLocations
    let ourMarker=new window.google.maps.Marker({
      map:map,
      position:marker.location,
      animation:window.google.maps.Animation.DROP,
      name:marker.title
    })
    /*we will push our marker to markers and our infoWindow to infwindow 
    and add event listener to our markerز
    */
    markers.push(ourMarker);
    infoWindow.push(ourInfoWindow);
    ourMarker.addListener('click',function(){
      infoWindow.forEach((information)=>{information.close()}) //we will close all infowindows
      ourInfoWindow.open(map,ourMarker)
      if(ourMarker.getAnimation()!==null){
        ourMarker.setAnimation(null);
      }
      else{
        //we will add animation to our marker and will set time for this animation
        ourMarker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(()=>{ourMarker.setAnimation(null)},500)
      }
      
    })
    //here we will extends and bounds marker
    markers.forEach((marker)=>{
      bounds.extend(marker.position)
      map.fitBounds(bounds)
    })
  }) 
 }
 componentDidMount(){
  /*here we will fetch information from wikibidia (I used fetchJsonp to fix some problems with fetch
  we will send our json informations to update function to use it to get data and link 
  */
  this.state.locations.map((location,index)=>{
    return fetchJsonp(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${location.title}&limit=10&namespace=0&format=json`)
    .then(response=>response.json()).then((responseJson)=>{
      let fetchData=[...this.state.data,[responseJson,responseJson[2][0],responseJson[3][0]]]
      this.updateData(fetchData)
    }).catch((error)=>console.log(error)) //if fetch faild we will print the error
  })
 }
 //here we will receive informations from onClick function from <li> and filter it and trgigger the event with click
 listItems=(item,event)=>{
  let selected=markers.filter((marker)=>marker.name ===item.title);
  window.google.maps.event.trigger(selected[0],'click')
 }
  render() {
    const {query}=this.state;
    let showingLocations=locations;
  if(query){
    const match=new RegExp(escapeRegExp(query),'i');
    showingLocations=locations.filter((location)=>match.test(location.title));
  }
  else{
    showingLocations=locations;
  }

    return (
      <div className='App'>
      <header role='banner'>
    <nav role='navigation'>
      <h1 tabIndex="0"><a href="/">Madina Locations</a></h1>
      <a href="#filter" className='link-skip'>click if you want go to main content </a>
    </nav>
  </header>

  <main id="maincontent" role='main'>
    <section id="map-container">
      <div id="map"></div>
    </section>
    <section>
     <div className='list-view' tabIndex="0">
        <h2>find place in Madina </h2>
        <input
        role="search"
        tabIndex="0"
        aria-label="search for locations"
        type='text'
        placeholder='Search locations '
        value={this.state.query}
        onChange={(event)=>{this.setState({query:event.target.value})}}
        />
      </div>
      <ul id="locations-list"></ul>
    </section>
  </main>
<ol className='locations-list' aria-label="list of locations" tabIndex="0">
          {showingLocations.map((location,index)=>(
            <li key={index} tabIndex="0" className='locations-list-item' onClick={this.listItems.bind(this,location)} >
            <h2>
              {location.title} 
            </h2>
            <div className='image'>
            <img src={location.image} />
            </div>
            <h2 className='reviews'>
            reviews
            </h2>
            </li>

            ))}
        </ol>
      </div>

      )
    }
  }
  export default scriptLoader(
[`https://maps.googleapis.com/maps/api/js?key=AIzaSyDu3X5XvbtwAIubnvQ0Hq625UMcu8l433k&language=en&libraries=places`]
)(Madina)