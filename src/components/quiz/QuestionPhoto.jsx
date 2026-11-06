import { useLocale } from '../../i18n/LocaleContext.jsx';
import { Icon } from '../Icon.jsx';
import Modal from '../Modal.jsx';

function PhotoCredit({photo}) {
  const {locale}=useLocale(),en=locale==='en';
  return <span className="quiz-photo-credit"><a href={photo.sourceUrl} target="_blank" rel="noreferrer">{en?'Photo':'Foto'}: {photo.author}</a><span> · </span><a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a></span>;
}
export default function QuestionPhoto({photo,onExpand}) {
  const {locale}=useLocale(),en=locale==='en';
  return <figure className="quiz-photo-clue"><button type="button" className="quiz-photo-trigger" onClick={onExpand} aria-label={`${en?'Enlarge photo':'Ampliar fotografia'}: ${photo.alt[locale]}`}><img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt[locale]} decoding="async" fetchPriority="high"/><span className="quiz-photo-expand" aria-hidden="true"><Icon name="northeast" size={13}/></span></button><figcaption><PhotoCredit photo={photo}/></figcaption></figure>;
}
export function QuestionPhotoDialog({photo,onClose}) {
  const {locale}=useLocale(),en=locale==='en';
  return <Modal title={photo.alt[locale]} onClose={onClose} className="quiz-photo-dialog" kicker={en?'GEOKIWI / PHOTOGRAPH':'GEOKIWI / FOTOGRAFIA'}><img className="quiz-photo-large" src={photo.src} width={photo.width} height={photo.height} alt={photo.alt[locale]}/><p className="quiz-photo-dialog-credit"><PhotoCredit photo={photo}/></p></Modal>;
}
