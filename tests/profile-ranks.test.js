import test from 'node:test';
import assert from 'node:assert/strict';
import { DAILY_RANKS, dailyRankProgress } from '../src/lib/daily-ranks.js';
import { AVATAR_BYTES, AVATAR_INPUT_BYTES, validateAvatarFile, avatarPath, saveAvatar, removeAvatar } from '../src/auth/avatar.js';

test('daily ranks change at weekly boundaries and zero days never earns a badge', () => {
  for (const value of [0, -1, 1.5, Infinity, NaN, '30', undefined]) assert.equal(dailyRankProgress(value).rank, null);
  for (const [index, rank] of DAILY_RANKS.entries()) {
    assert.equal(dailyRankProgress(rank.minDays).rank.id, rank.id);
    assert.equal(dailyRankProgress(index < 5 ? rank.minDays + 6 : 500).rank.id, rank.id);
  }
  assert.equal(dailyRankProgress(7).remaining, 1);
  assert.equal(dailyRankProgress(8).next.id, 'green');
  assert.equal(dailyRankProgress(36).next, null);
});

test('avatar inputs exclude SVG, empty files and excessive input size', () => {
  for (const type of ['image/jpeg','image/png','image/webp']) assert.doesNotThrow(() => validateAvatarFile({type,size:123}));
  for (const type of ['image/svg+xml','text/html','image/gif','']) assert.throws(() => validateAvatarFile({type,size:100}), {code:'avatar_type'});
  for (const size of [0, AVATAR_INPUT_BYTES+1]) assert.throws(() => validateAvatarFile({type:'image/png',size}), {code:'avatar_size'});
});

function mockClient({uploadError=null,profileError=null}={}) {
  const calls=[];
  const client={storage:{from:bucket=>({
    upload:async(path,blob,options)=>{calls.push(['upload',bucket,path,blob.type,options.upsert]);return {error:uploadError};},
    createSignedUrl:async(path,seconds)=>{calls.push(['sign',path,seconds]);return {data:{signedUrl:'https://example.test/signed'},error:null};},
    remove:async(paths)=>{calls.push(['remove',paths]);return {error:null};}
  })},from:table=>({update:patch=>({eq:async(column,owner)=>{calls.push(['profile',table,patch,column,owner]);return {error:profileError};}})})};
  return {client,calls};
}
const owner='11111111-1111-4111-8111-111111111111';
test('photo writes use one owner-scoped path and keep signed URLs out of the profile row', async () => {
  const {client,calls}=mockClient();
  const result=await saveAvatar(client,owner,new Blob(['photo'],{type:'image/webp'}));
  assert.equal(result.avatar_path,avatarPath(owner));
  assert.deepEqual(calls[1],['profile','profiles',{avatar_path:avatarPath(owner)},'id',owner]);
  assert.deepEqual(calls[2],['sign',avatarPath(owner),3600]);
  await removeAvatar(client,owner);
  assert.deepEqual(calls[3],['profile','profiles',{avatar_path:null},'id',owner]);
  assert.deepEqual(calls[4],['remove',[avatarPath(owner)]]);
});
test('failed upload never alters the profile; oversized processed photos are refused', async () => {
  const {client,calls}=mockClient({uploadError:new Error('upload failed')});
  await assert.rejects(saveAvatar(client,owner,new Blob(['photo'],{type:'image/webp'})),/upload failed/);
  assert.equal(calls.length,1);
  await assert.rejects(saveAvatar(client,owner,{type:'image/webp',size:AVATAR_BYTES+1}),{code:'avatar_type'});
  assert.equal(calls.length,1);
});
