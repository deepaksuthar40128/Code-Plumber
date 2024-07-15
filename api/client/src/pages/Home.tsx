import ErrorBoundary from "@/components/Error/Boundary";
import Loader from "@/components/Loader/Loader";
import React, { Suspense } from "react";
const Card = React.lazy(() => import('@/components/Card'))

export default function Home() {
  return (
    <main className="bg-gray-50 dark:bg-gray-800 min-h-[calc(100dvh-60px)]">
      <div className="w-full text-gray-800 dark:text-white text-center flex-col gap-3 pb-8">
        <h1 className=" pt-8 pb-2 text-6xl font-bold">Code Plumber</h1>
        <p className=" text-gray-500 text-center">
          An online code compiler
        </p>
      </div>
      <div >
        <Suspense fallback={<Loader />}>
          <ErrorBoundary>
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
          </ErrorBoundary>
          <ErrorBoundary>
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
          </ErrorBoundary>
          <ErrorBoundary>
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
          </ErrorBoundary>
          <ErrorBoundary>
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
          </ErrorBoundary>
          <ErrorBoundary>
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
          </ErrorBoundary>
          <ErrorBoundary>
            <Card data={
              {
                language: 'go',
                bg: 'bg-gray-500',
                imageClass: 'scale-[1.25]',
                src: '/go.png',
                text: 'Go',
                supported: "Coming Soon"
              }
            } />
          </ErrorBoundary>
        </Suspense>
      </div>
    </main>
  );
}
