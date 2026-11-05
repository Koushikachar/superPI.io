/** Only rendered when the visitor has not chosen yet: it follows the device's light/dark setting before the first paint. Once a choice exists, the server writes the right class on <html> itself and this script is not sent at all. A fixed string with no user input and no storage. */
const THEME_JS = `try{if(matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.classList.add("dark")}catch(e){}`;
export default function ThemeScript() { return <script dangerouslySetInnerHTML={{ __html: THEME_JS }} />; }
