const { readFile } = require('node:fs/promises');
const { gunzip } = require('node:zlib');
const { promisify } = require('node:util');
const path = require('node:path');
const unzip = promisify(gunzip);
const manifest = require('./data/healthcare/manifest.json');
const tiles = new Map();
function load(key) {
  if (tiles.has(key)) { const p=tiles.get(key);tiles.delete(key);tiles.set(key,p);return p; }
  const promise=readFile(path.join(__dirname,'data/healthcare',key+'.json.gz')).then(unzip).then(raw=>JSON.parse(raw.toString())).catch(e=>{tiles.delete(key);throw e});
  tiles.set(key,promise);
  if(tiles.size>8)tiles.delete(tiles.keys().next().value);
  return promise;
}
async function findNearby(lat,lon,radius,distance) {
  // Only read grid cells intersecting this search, never the country dataset.
  const dy=radius/110.5, dx=radius/(110.5*Math.max(.1,Math.cos(lat*Math.PI/180)));
  const keys=[];
  for(let y=Math.floor((lat-dy)/4);y<=Math.floor((lat+dy)/4);y++)
    for(let x=Math.floor((lon-dx)/4);x<=Math.floor((lon+dx)/4);x++) {
      const key=`${y}_${x}`;if(manifest.files[key])keys.push(key);
    }
  const chunks=await Promise.all(keys.map(load)), result=[],seen=new Set();
  for(const rows of chunks)for(const [id,name,type,y,x,address,speciality] of rows){
    if(Math.abs(y-lat)>dy||Math.abs(x-lon)>dx)continue;
    const km=distance(lat,lon,y,x);if(km>radius)continue;
    const kind=manifest.kinds[type],key=`${name.toLowerCase()}:${type}:${y.toFixed(3)}:${x.toFixed(3)}`;
    if(seen.has(key))continue;seen.add(key);
    result.push({id,name:name||`Unnamed ${kind.toLowerCase()}`,type:kind,lat:y,lon:x,distance:Math.round(km*10)/10,address,speciality,phone:'',hours:'',sortDistance:km});
  }
  result.sort((a,b)=>a.sortDistance-b.sortDistance);
  return {center:{lat,lon},facilities:result.slice(0,80).map(({sortDistance,...p})=>p),limited:result.length>80,total:result.length,snapshot:manifest.snapshot,country:manifest.country};
}
module.exports={findNearby,manifest};
