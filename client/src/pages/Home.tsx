import Card from "@/components/Card";

export default function Home() {
  return (
    <main className="bg-gray-50 dark:bg-gray-800">
      <div className="w-full text-gray-800 dark:text-white text-center flex-col gap-3 pb-8">
        <h1 className=" pt-8 pb-2 text-6xl font-bold">Code Plumber</h1>
        <p className=" text-gray-500 text-center">
          An online code compiler
        </p>
      </div>
      <div >
        <Card data={
          {
            language: 'c',
            bg: 'bg-gray-400',
            imageClass: '',
            src: '/c.png',
            text: 'C',
            supported: "SUPPORTED"
          }
        } />
        <Card data={
          {
            language: 'cpp',
            bg: 'bg-blue-800',
            imageClass: '',
            src: '/cpp.png',
            text: 'CPP',
            supported: "SUPPORTED"
          }
        } />
        <Card data={
          {
            language: 'python',
            bg: 'bg-[#19cab066]',
            imageClass: '',
            src: '/python.png',
            text: 'PYTHON',
            supported: "SUPPORTED"
          }
        } />
        <Card data={
          {
            language: 'java',
            bg: 'bg-[#ff0a0a9e]',
            imageClass: '',
            src: '/java.png',
            text: 'JAVA',
            supported: "SUPPORTED"
          }
        } />
        <Card data={
          {
            language: 'html',
            bg: 'bg-gray-500',
            imageClass: 'scale-[1.75]',
            src: '/html.png',
            text: 'HTML CSS JS',
            supported: "SUPPORTED"
          }
        } />
      </div>
    </main>
  );
}
