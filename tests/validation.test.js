const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validateScope,validateRecord}=require('../back-end/validation');
const id='11111111-1111-4111-8111-111111111111';
const uuid=x=>/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(x);
test('sharing requires explicit unique record IDs and bounded expiry',()=>{
 assert.equal(validateScope({recordIds:[id],hours:1},uuid),null);
 for(const body of [{recordIds:[],hours:1},{recordIds:[id,id],hours:1},{recordIds:[id],hours:0},{recordIds:[id],hours:999},{recordIds:['bad'],hours:1}])assert.ok(validateScope(body,uuid));
});
test('record edits reject invalid dates and categories',()=>{
 const r={title:'A report',category:'Lab report',recordDate:'2026-01-01'};
 assert.equal(validateRecord(r),null);
 for(const changed of [{recordDate:'2026-02-31'},{category:'invalid'},{title:' '},{recordDate:'2099-01-01'}])assert.ok(validateRecord({...r,...changed}));
});
