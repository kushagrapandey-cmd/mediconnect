const {test}=require('node:test');
const assert=require('node:assert/strict');
const {coordinates,facilities,distance}=require('../back-end/places');
test('nearby care rejects invalid or injected coordinates',()=>{
  for(const pair of [[null,80],['',80],['0);out;',80],[91,80],[26,181],['NaN',80]])assert.throws(()=>coordinates(...pair));
  assert.deepEqual(coordinates('26.449923','80.331912'),[26.45,80.332]);
});
test('facility results use distance, remove duplicate map elements and reject unsafe contact data',()=>{
  const row={type:'node',id:1,lat:26.45,lon:80.33,tags:{name:'Example clinic',amenity:'clinic',phone:'javascript:alert(1)'}};
  const list=facilities([row,{...row,type:'way',id:2},{...row,id:3,lat:30},{...row,id:4,lat:26.451,tags:{healthcare:'doctor',name:'Example doctor',phone:'+91 12345 67890'}},{...row,id:5,tags:{amenity:'school'}}],26.45,80.33,5);
  assert.equal(list.length,2);assert.equal(list[0].phone,'');assert.equal(list[1].type,'Doctor');assert.equal(list[1].phone,'+91 12345 67890');
  assert.equal(distance(0,0,0,0),0);
});
test('bundled India snapshot returns bounded, sorted real results without a provider request',async()=>{
 const {findNearby,manifest}=require('../back-end/healthcare-data');
 assert.equal(manifest.snapshot,'2026-10-09');assert.equal(manifest.count,93717);
 for(const [lat,lon] of [[26.45,80.332],[26.853,80.999],[28.614,77.209],[12.972,77.595]]){
  const r=await findNearby(lat,lon,5,distance);assert.ok(r.total>0);assert.ok(r.facilities.length<=80);
  for(const p of r.facilities){assert.ok(distance(lat,lon,p.lat,p.lon)<=5);assert.ok(manifest.kinds.includes(p.type));}
  assert.deepEqual(r.facilities.map(p=>p.distance),r.facilities.map(p=>p.distance).toSorted((a,b)=>a-b));
 }
 const empty=await findNearby(51.5,-.1,5,distance);assert.equal(empty.total,0);
});
