import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";


export default function RenderCode() {
  const fullCode = useSelector((state: RootState) => state.compilerSlice.code); 

  const combinedCode = `
    <html>
        <style>${fullCode.css ? fullCode.css : ''}</style>
        <body>
          ${fullCode.html ? fullCode.html : '<h1>Start writing to see live changes</h1>'}
        </body>
        <script>${fullCode.javascript ? fullCode.javascript : ''}</script>
    </html>`;

  const iframeCode = `data:text/html;charset=utf-8,${encodeURIComponent(combinedCode)}`;

  return (
    <div className="bg-white h-[calc(100dvh-60px)]">
      <iframe className="w-full h-full" src={iframeCode} /> 
    </div>
  );
}
