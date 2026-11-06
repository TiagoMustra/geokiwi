import first from './landmark-photos-a.json' with {type:'json'};
import second from './landmark-photos-b.json' with {type:'json'};

/** Actual licensed photographs, served locally; source pages carry full credits. */
export const landmarkPhotos=[...first,...second];
export const landmarkPhotoById=Object.fromEntries(landmarkPhotos.map(photo=>[photo.id,photo]));
