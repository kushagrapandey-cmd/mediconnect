import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import './NearbyCare.css';
const CareMap = lazy(() => import('./CareMap'));
const kinds = ['All','Hospital','Clinic','Doctor','Dental','Pharmacy'];
async function request(path, signal) {
  const res = await fetch('/api/places/'+path,{signal,credentials:'omit'});
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Search is unavailable. Please try again.');
  return data;
}
class MapBoundary extends React.Component {
  state = {failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed ? <p className="care-map-placeholder">Map could not load. You can still use the results and Directions links below.</p> : this.props.children;}
}
export default function NearbyCare() {
  const [query,setQuery]=useState(''), [radius,setRadius]=useState('5');
  const [choices,setChoices]=useState([]), [result,setResult]=useState(null), [location,setLocation]=useState('');
  const [busy,setBusy]=useState(false), [error,setError]=useState(''), [kind,setKind]=useState('All'), [count,setCount]=useState(10);
  const pending=useRef(), serial=useRef(0);
  useEffect(()=>()=>{serial.current++;pending.current?.abort();},[]);
  async function run(work) {
    pending.current?.abort();
    const controller=new AbortController();pending.current=controller;
    const id=++serial.current;
    setBusy(true);setError('');setChoices([]);setResult(null);
    const timer=setTimeout(()=>controller.abort(),40000);
    try { await work(controller.signal,id); }
    catch(e){if(serial.current===id)setError(e.name==='AbortError'?'Search timed out. Please try again.':e.message);}
    finally {clearTimeout(timer);if(serial.current===id)setBusy(false);}
  }
  async function nearby(place,signal,id) {
    const data=await request('nearby?'+new URLSearchParams({lat:place.lat,lon:place.lon,radius}),signal);
    if(serial.current!==id)return;
    setResult(data);setLocation(place.name);setKind('All');setCount(10);
  }
  function search(event) {
    event.preventDefault();
    run(async(signal,id)=>{
      const {places}=await request('search?'+new URLSearchParams({q:query.trim()}),signal);
      if(serial.current!==id)return;
      if(!places.length)throw new Error('No location found in India. Try a nearby locality and city.');
      if(places.length===1)await nearby(places[0],signal,id);else setChoices(places);
    });
  }
  function locate() {
    if(!navigator.geolocation){setError('Location is unavailable in this browser. Enter a locality instead.');return;}
    run(async(signal,id)=>{
      const p=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,()=>reject(new Error('Location could not be accessed. Enter a locality instead.')),{timeout:10000,maximumAge:300000,enableHighAccuracy:false}));
      if(signal.aborted || serial.current!==id)return;
      await nearby({lat:p.coords.latitude,lon:p.coords.longitude,name:'Your approximate location'},signal,id);
    });
  }
  const filtered=result?.facilities.filter(p=>kind==='All'||p.type===kind)||[];
  return <section className="section container nearby-care" aria-labelledby="care-title" id="nearby-care">
    <div className="section-title"><div><span className="eyebrow">CARE AROUND THE CORNER · NO SIGN-IN NEEDED</span><h2 id="care-title">Find care near you.</h2></div><p>Explore mapped hospitals, clinics, dental centres and pharmacies across India.</p></div>
    <div className="care-panel">
      <form onSubmit={search} className="care-form">
        <label>Locality, city or PIN code<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. Gomti Nagar, Lucknow" minLength={3} maxLength={120} required autoComplete="off" disabled={busy}/></label>
        <label>Search radius<select value={radius} onChange={e=>{setRadius(e.target.value);setResult(null);setChoices([]);}} disabled={busy}>{[2,5,10,20].map(n=><option key={n} value={n}>{n} km</option>)}</select></label>
        <button className="btn" disabled={busy} type="submit">{busy?'Searching…':'Find nearby care'}</button>
        <button className="btn secondary" disabled={busy} type="button" onClick={locate}>Use my location</button>
      </form>
      <p className="care-note">Use a public locality, not a home address or medical details. Location search sends your locality to Nominatim. Nearby results use our India dataset. Your browser asks permission before sharing your location.</p>
      <div role="status" aria-live="polite">{busy&&<p>Searching nearby care…</p>}{choices.length>0&&<div className="care-choices"><p>Choose your location:</p>{choices.map((p,i)=><button className="care-choice" key={i} onClick={()=>run((signal,id)=>nearby(p,signal,id))}>{p.name}</button>)}</div>}</div>
      {error&&<p className="care-error" role="alert">{error}</p>}
      {result&&<>
        <p className="care-note">India · OpenStreetMap data snapshot: 9 October 2026. Not a live hospital directory.</p>
        <p className="care-location">Showing care within {radius} km of <strong>{location}</strong>.</p>
        <MapBoundary key={location+radius}><Suspense fallback={<div className="care-map-placeholder">Loading map…</div>}><CareMap center={result.center} places={filtered}/></Suspense></MapBoundary>
        <div className="care-filters" role="group" aria-label="Facility type">{kinds.map(k=><button type="button" key={k} aria-pressed={kind===k} onClick={()=>{setKind(k);setCount(10);}}>{k}</button>)}</div>
        <p role="status">{filtered.length} mapped {filtered.length===1?'facility':'facilities'}{result.limited?' (up to 80 nearest results)':''}. Distances are approximate, in a straight line.</p>
        {!filtered.length&&<p>No mapped facilities found for this selection. Try another type or a wider radius.</p>}
        <ul className="care-results">{filtered.slice(0,count).map(p=><li key={p.id}><div><span className="care-type">{p.type} · {p.distance} km</span><h3>{p.name}</h3>{p.address&&<p>{p.address}</p>}{p.speciality&&<p>Listed speciality: {p.speciality.replaceAll(';',', ')}</p>}{p.hours&&<p>Listed hours: {p.hours}</p>}</div><div className="care-links"><a href={'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(p.lat+','+p.lon)} target="_blank" rel="noopener noreferrer">Directions ↗</a>{p.phone&&<a href={'tel:'+p.phone.replace(/[^+\d]/g,'')}>Call</a>}</div></li>)}</ul>
        {filtered.length>count&&<button className="btn secondary" type="button" onClick={()=>setCount(n=>n+10)}>Show more results</button>}
      </>}
      <p className="care-note">India coverage only. Community map data can be incomplete or outdated. Not every hospital is listed; confirm services and opening hours directly. No live bed or emergency availability.</p>
      <a className="care-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors · ODbL</a> <a className="care-credit" href="https://data.humdata.org/dataset/hotosm_ind_health_facilities" target="_blank" rel="noopener noreferrer">Dataset source: HOT / HDX</a>
    </div>
  </section>;
}
