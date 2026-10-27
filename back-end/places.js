const express = require('express');
const { getSql } = require('./db');
const { createHash } = require('node:crypto');
const hash = (s) => createHash('sha256').update(s).digest('hex');
const error = (status, message) => Object.assign(new Error(message), { status });
const USER_AGENT = 'MediConnect/2.0 (+https://mediconnect-psi-sand.vercel.app; kushagrapandey102@gmail.com)';
const text = (s, max = 180) => typeof s === 'string' ? s.slice(0, max) : '';
function coordinates(lat, lon) {
  if (lat === '' || lon === '' || lat == null || lon == null || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon)) || Math.abs(Number(lat)) > 90 || Math.abs(Number(lon)) > 180)
    throw error(400, 'Choose a valid location.');
  return [Number(Number(lat).toFixed(3)), Number(Number(lon).toFixed(3))];
}
function distance(a, b, c, d) {
  const rad = Math.PI / 180;
  const x = Math.sin((c-a)*rad/2)**2 + Math.cos(a*rad)*Math.cos(c*rad)*Math.sin((d-b)*rad/2)**2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(Math.max(0, 1-x)));
}
function facilities(elements, lat, lon, radius) {
  const seen = new Set();
  return elements.flatMap(e => {
    const t = e.tags || {}, p = e.center || e;
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lon)) return [];
    const km = distance(lat, lon, p.lat, p.lon);
    if (km > radius) return [];
    const kind = t.amenity || t.healthcare;
    const type = ({hospital:'Hospital',clinic:'Clinic',doctors:'Doctor',doctor:'Doctor',dentist:'Dental',pharmacy:'Pharmacy'})[kind];
    if (!type) return [];
    const name = text(t.name || t['name:en']) || `Unnamed ${type.toLowerCase()}`;
    const key = `${name.toLowerCase()}:${p.lat.toFixed(3)}:${p.lon.toFixed(3)}`;
    if (seen.has(key)) return [];
    seen.add(key);
    const rawPhone = text(t.phone || t['contact:phone'], 50);
    return [{id:`${e.type}/${e.id}`,name,type,lat:p.lat,lon:p.lon,distance:Math.round(km*10)/10,
      address:text(t['addr:full'] || [t['addr:housenumber'],t['addr:street'],t['addr:suburb'],t['addr:city'],t['addr:postcode']].filter(Boolean).join(', ')),
      phone:/^\+?[\d\s()-]{5,30}$/.test(rawPhone) ? rawPhone : '',
      hours:text(t.opening_hours,100),speciality:text(t['healthcare:speciality'],100)}];
  }).sort((a,b)=>a.distance-b.distance).slice(0,80);
}
async function upstream(url, options = {}, timeout = 12000) {
  try {
    const res = await fetch(url, {...options, headers:{'User-Agent':USER_AGENT,Accept:'application/json',...options.headers}, signal:AbortSignal.timeout(timeout)});
    if (!res.ok) throw new Error('UPSTREAM');
    return await res.json();
  } catch { throw error(503, 'The map search service is busy. Please try again shortly.'); }
}
// Durable cache and provider gates are shared by all Vercel instances.
let ready;
async function cacheTable() {
  if (!ready) ready = getSql()`CREATE TABLE IF NOT EXISTS mc_places_cache (key TEXT PRIMARY KEY, value JSONB NOT NULL, expires_at TIMESTAMPTZ NOT NULL)`.catch(e=>{ready=null;throw e;});
  await ready;
}
async function cached(key, seconds, load) {
  await cacheTable();
  const q = getSql(), digest = hash(key);
  const [hit] = await q`SELECT value FROM mc_places_cache WHERE key=${digest} AND expires_at>now()`;
  if (hit) return hit.value;
  const value = await load();
  await q`DELETE FROM mc_places_cache WHERE expires_at<now() OR key IN (SELECT key FROM mc_places_cache ORDER BY expires_at DESC OFFSET 499)`;
  await q`INSERT INTO mc_places_cache(key,value,expires_at) VALUES (${digest},${JSON.stringify(value)}::jsonb,now()+${seconds}*interval '1 second') ON CONFLICT(key) DO UPDATE SET value=excluded.value, expires_at=excluded.expires_at`;
  return value;
}
async function gate(provider, seconds) {
  const [slot] = await getSql()`INSERT INTO mc_limits(key,hits,expires_at) VALUES (${hash('places:'+provider)},1,now()+${seconds}*interval '1 second') ON CONFLICT(key) DO UPDATE SET expires_at=excluded.expires_at WHERE mc_limits.expires_at<=now() RETURNING hits`;
  if (!slot) throw error(429, 'Another nearby search is running. Please wait a few seconds and try again.');
}
module.exports = ({wrap, limit, clientKey}) => {
  const router = express.Router();
  router.get('/places/config', (req,res)=>res.json({tileUrl:process.env.MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'}));
  router.get('/places/search', wrap(async(req,res)=>{
    const query = text(req.query.q,121).trim();
    if (query.length<3 || query.length>120 || /[\r\n<>@]/.test(query)) throw error(400,'Enter a locality, city or PIN code (3–120 characters).');
    await limit(`places:${clientKey(req)}`,30);
    const places = await cached('geocode:'+query.toLowerCase(),604800,async()=>{
      await gate('nominatim',2);
      const url = new URL(process.env.GEOCODING_URL || 'https://nominatim.openstreetmap.org/search');
      url.search = new URLSearchParams({q:query,format:'jsonv2',limit:'5','accept-language':'en'});
      const data = await upstream(url);
      if (!Array.isArray(data)) throw error(503,'Location search is temporarily unavailable.');
      return data.map(p=>({name:text(p.display_name,250),lat:Number(p.lat),lon:Number(p.lon)})).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon));
    });
    res.json({places});
  }));
  router.get('/places/nearby',wrap(async(req,res)=>{
    const [lat,lon] = coordinates(req.query.lat,req.query.lon);
    const radius = Number(req.query.radius);
    if (![2,5,10,20].includes(radius)) throw error(400,'Choose a radius of 2, 5, 10 or 20 km.');
    await limit(`places:${clientKey(req)}`,30);
    const result = await cached(`nearby:${lat}:${lon}:${radius}`,3600,async()=>{
      await gate('overpass',3);
      const query = `[out:json][timeout:15][maxsize:8388608];(nwr["amenity"~"^(hospital|clinic|doctors|dentist|pharmacy)$"](around:${radius*1000},${lat},${lon});nwr["healthcare"~"^(hospital|clinic|doctor|dentist|pharmacy)$"](around:${radius*1000},${lat},${lon}););out center tags;`;
      const data = await upstream(process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({data:query})},20000);
      if (!Array.isArray(data.elements) || data.remark) throw error(503,'Hospital search could not finish. Try a smaller radius.');
      return {center:{lat,lon},facilities:facilities(data.elements,lat,lon,radius),limited:data.elements.length>=80};
    });
    res.json(result);
  }));
  return router;
};
module.exports.coordinates=coordinates;
module.exports.facilities=facilities;
module.exports.distance=distance;
