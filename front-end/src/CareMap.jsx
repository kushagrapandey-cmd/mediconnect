import React, {useEffect,useRef,useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
export default function CareMap({center,places}) {
  const host=useRef(),map=useRef(), [interactive,setInteractive]=useState(false), [unavailable,setUnavailable]=useState(false);
  useEffect(()=>{
    let disposed=false;
    const controller=new AbortController();
    const m=L.map(host.current,{scrollWheelZoom:false,dragging:false,touchZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false}).setView([center.lat,center.lon],13);
    map.current=m;
    L.circleMarker([center.lat,center.lon],{radius:7,color:'#2162c2',fillOpacity:1}).addTo(m).bindTooltip('Search location');
    fetch('/api/places/config',{signal:controller.signal,credentials:'omit'}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(({tileUrl})=>{
      if(disposed)return;
      L.tileLayer(tileUrl,{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',updateWhenIdle:true,keepBuffer:1}).on('tileerror',()=>{if(!disposed)setUnavailable(true)}).addTo(m);
    }).catch(()=>{if(!disposed)setUnavailable(true)});
    return ()=>{disposed=true;controller.abort();m.remove();map.current=null;};
  },[center.lat,center.lon]);
  useEffect(()=>{
    const m=map.current;if(!m)return;
    const layer=L.layerGroup().addTo(m);
    for(const p of places){
      const label=document.createElement('span');label.textContent=`${p.name} · ${p.type}`;
      L.circleMarker([p.lat,p.lon],{radius:6,color:'#126653',fillColor:'#ffffff',fillOpacity:1,weight:3}).addTo(layer).bindPopup(label);
    }
    if(places.length)m.fitBounds([[center.lat,center.lon],...places.map(p=>[p.lat,p.lon])],{padding:[24,24],maxZoom:15,animate:false});
    return ()=>layer.remove();
  },[places,center.lat,center.lon]);
  useEffect(()=>{
    const m=map.current;if(!m)return;
    for(const handler of [m.dragging,m.touchZoom,m.keyboard])interactive?handler.enable():handler.disable();
  },[interactive]);
  return <div className="care-map-wrap"><div className="care-map" ref={host} role="region" aria-label="Map of nearby healthcare facilities"/><button type="button" className="care-map-toggle" aria-pressed={interactive} onClick={()=>setInteractive(x=>!x)}>{interactive?'Finish moving map':'Enable map movement'}</button>{unavailable&&<p className="care-note">Map tiles are unavailable. Use the results and Directions links below.</p>}<p className="care-note">Scroll normally over the map. Enable movement to pan; use + / − to zoom.</p></div>;
}
