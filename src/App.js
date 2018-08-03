import React, { Component } from 'react';
import scriptLoader from 'react-async-script-loader'
import escapeRegExp from 'escape-string-regexp'
import fetchJsonp from 'fetch-jsonp'
import {style} from './style'
import {locations} from './Makkalocations'
import Makkah from './Makkah.js'
import Madina from './Madina.js'
import {Route} from 'react-router-dom'
import {Link} from 'react-router-dom'
import './App.css';
class App extends Component{
  render(){
    return(
      <div className='App'>
      <Route exact path='/' render={()=>(
        <div className='main-page'>
        <Link 
        to="/Makkah"
        >  <button>Makkah</button> </Link>
        <Link 
        to="/Madina"
        >  <button className='second-button'>Madina</button> </Link>
        </div>
        )}/>

        <Route path='/Madina' render={({history})=>(
          <Madina/>
            )}
        />
        <Route path='/Makkah' render={({history})=>(
          <Makkah/>
            )}
        />
       
      
       

      </div>
      )
  }

}
export default App;