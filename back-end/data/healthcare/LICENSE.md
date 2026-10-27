# India healthcare database

© OpenStreetMap contributors. This adapted database is made available under the
Open Database License (ODbL) 1.0:
https://opendatacommons.org/licenses/odbl/1-0/
Any rights in individual contents are licensed under the Database Contents
License: https://opendatacommons.org/licenses/dbcl/1-0/

Source: Humanitarian OpenStreetMap Team / HDX, Health Facilities of India:
https://data.humdata.org/dataset/hotosm_ind_health_facilities
OSM snapshot: 9 October 2026. Export generated: 11 October 2026.
Original source metadata is retained in SOURCE_README.txt and manifest.json.

This directory contains the complete adapted database used by this feature as
4-degree grid JSON gzip files. Each row has fields: OSM id, name, facility-type
index, latitude, longitude, address, speciality. Type indices are listed in
manifest.json. Building markers use geometry extent centres. Only the five
supported facility types are included. This is community mapping, not an
independently verified hospital registry. Geometry or names do not establish
political boundaries, ownership, service quality or operating status.

The derivation is reproducible with scripts/build-healthcare.py and the original
ZIP linked in manifest.json. No medical records or user data are part of this
open database. Application code is separate from the database license.
