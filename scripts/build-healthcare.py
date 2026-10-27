"""Build a compact ODbL India snapshot from the HOT/HDX GeoJSON ZIP.
Usage: python scripts/build-healthcare.py /path/to/downloaded.zip
No downloads or updates run during website requests.
"""
import sys,json,zipfile,math,gzip,collections,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'back-end/data/healthcare'
root.mkdir(parents=True,exist_ok=True)
z=zipfile.ZipFile(sys.argv[1]); features=json.loads(z.read('health_facilities.geojson'))['features']
kinds={'hospital':0,'clinic':1,'doctors':2,'doctor':2,'dentist':3,'pharmacy':4}
groups=collections.defaultdict(list)
for f in features:
 p=f['properties']; kind=p.get('amenity') if p.get('amenity') in kinds else p.get('healthcare')
 if kind not in kinds: continue
 g=f['geometry']; coords=g['coordinates']
 if g['type']=='Point': lon,lat=coords[:2]
 else:
  # Extent centre for buildings, consistent with an Overpass centre marker.
  def pairs(c):
   if isinstance(c[0],(int,float)): yield c
   else:
    for x in c: yield from pairs(x)
  points=list(pairs(coords)); lon=(min(c[0] for c in points)+max(c[0] for c in points))/2; lat=(min(c[1] for c in points)+max(c[1] for c in points))/2
 if not(-90<=lat<=90 and -180<=lon<=180):continue
 name=p.get('name') or p.get('name_en') or p.get('name_hi') or ''
 address=p.get('addr_full') or p.get('addr_city') or ''
 row=[p['id'],name[:180],kinds[kind],round(lat,6),round(lon,6),address[:180],(p.get('healthcare_speciality') or '')[:100]]
 groups[f'{math.floor(lat/4)}_{math.floor(lon/4)}'].append(row)
files={}
for key,rows in sorted(groups.items()):
 raw=json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode(); data=gzip.compress(raw,compresslevel=9,mtime=0)
 (root/f'{key}.json.gz').write_bytes(data);files[key]={'count':len(rows),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
manifest={'country':'India','snapshot':'2026-10-09','generated':'2026-10-11','source':'OpenStreetMap contributors via HOT / HDX','sourceUrl':'https://data.humdata.org/dataset/hotosm_ind_health_facilities','downloadUrl':'https://production-raw-data-api.s3.amazonaws.com/ISO3/IND/health_facilities/hotosm_ind_health_facilities_osm_geojson.zip','sourceSha256':hashlib.sha256(Path(sys.argv[1]).read_bytes()).hexdigest(),'license':'ODbL-1.0','licenseUrl':'https://opendatacommons.org/licenses/odbl/1-0/','gridDegrees':4,'kinds':['Hospital','Clinic','Doctor','Dental','Pharmacy'],'count':sum(len(r) for r in groups.values()),'files':files}
(root/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');(root/'SOURCE_README.txt').write_bytes(z.read('README.txt'))
print('Facilities',manifest['count'],'shards',len(files),'gzip bytes',sum(f['bytes'] for f in files.values()),'largest',max(f['bytes'] for f in files.values()))
