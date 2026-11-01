import { useLocale } from '../i18n/LocaleContext.jsx';
export default function LanguageControl() {
  const {locale,setLocale}=useLocale();
  return <div className="language-control" role="group" aria-label={locale==='en'?'Language':'Idioma'}>
    <button type="button" lang="pt-PT" aria-pressed={locale==='pt'} onClick={()=>setLocale('pt')} title="Português">PT</button>
    <button type="button" lang="en" aria-pressed={locale==='en'} onClick={()=>setLocale('en')} title="English">EN</button>
  </div>;
}
